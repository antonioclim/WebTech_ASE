import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStaticServer, listen } from "../src/static-server.js";

import { findBrowser, browserObservations } from "../../../90_AUDIT/tools/browser-discovery.mjs";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(1500)
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(1500)
  ]);
}

async function waitForPort(profile, child) {
  const path = join(profile, "DevToolsActivePort");
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error(`browser exited with code ${child.exitCode}`);
    try {
      const lines = (await readFile(path, "utf8")).trim().split(/\r?\n/);
      const port = Number(lines[0]);
      if (Number.isInteger(port) && port > 0) return port;
    } catch {}
    await sleep(100);
  }
  throw new Error("remote debugging port was not ready within 8 seconds");
}

async function openCdpPage(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: "PUT" });
  if (!response.ok) throw new Error(`DevTools target creation returned HTTP ${response.status}`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error("DevTools target did not expose a WebSocket URL");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("DevTools WebSocket open timeout")), 5000);
    socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("DevTools WebSocket error")); }, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const item = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(item.timer);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const commandId = ++id;
    const timer = setTimeout(() => {
      pending.delete(commandId);
      reject(new Error(`DevTools command timeout: ${method}`));
    }, 6000);
    pending.set(commandId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
  return { socket, command };
}

async function probe(browser, url, width, reducedMotion) {
  const profile = await mkdtemp(join(tmpdir(), `tw-s02-${width}-`));
  let child = null;
  let cdp = null;
  try {
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "about:blank"
    ];
    if (process.platform === "linux") args.unshift("--no-sandbox");
    child = spawn(browser, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); if (stderr.length > 16000) stderr = stderr.slice(-16000); });
    const port = await waitForPort(profile, child);
    cdp = await openCdpPage(port);
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await cdp.command("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }] });
    const navigation = await cdp.command("Page.navigate", { url });
    if (navigation.errorText) {
      return { kind: "blocked", width, browser, errorText: navigation.errorText, stderrTail: stderr.slice(-1200) };
    }
    let observed = null;
    for (let attempt = 0; attempt < 80; attempt++) {
      const evaluated = await cdp.command("Runtime.evaluate", {
        expression: `({href:location.href, ready:document.readyState, status:document.documentElement.dataset.browserSmoke, columns:Number(document.documentElement.dataset.columns), viewport:Number(document.documentElement.dataset.viewport), checks:document.documentElement.dataset.checks})`,
        returnByValue: true,
        awaitPromise: true
      });
      observed = evaluated?.result?.value ?? null;
      if (observed?.status) break;
      await sleep(100);
    }
    return { kind: "result", width, browser, ...observed, stderrTail: stderr.slice(-1200) };
  } finally {
    if (cdp?.socket?.readyState === WebSocket.OPEN) cdp.socket.close();
    await stopProcess(child);
    await rm(profile, { recursive: true, force: true });
  }
}

const discovered = findBrowser();
const browser = discovered?.path;
if (!browser) {
  const unsupported = browserObservations().filter(x => x.available && !x.supported);
  console.log(JSON.stringify({ verdict: unsupported.length ? "BROWSER_UNSUPPORTED_ENGINE" : "BROWSER_NOT_FOUND", code: 3, unsupported, manualRoute: "Use your installed browser for the named manual evidence; automation requires Chromium-based Chrome or Edge." }));
  process.exit(3);
}

const server = createStaticServer();
let finalCode = 0;
let gate = "executed";
const records = [];
try {
  const base = await listen(server);
  for (const [width, expectedColumns, longToken, reducedMotion] of [[320, 1, false, false], [768, 2, false, false], [1280, 4, false, false], [320, 1, true, true], [1280, 4, true, true]]) {
    let record;
    try {
      record = await Promise.race([
        probe(browser, `${base}/?browser-smoke=1${longToken ? "&long-token=1" : ""}`, width, reducedMotion),
        sleep(20000).then(() => { throw new Error("browser probe exceeded 20 seconds"); })
      ]);
    } catch (error) {
      console.error(JSON.stringify({ verdict: "PROCESS_TIMEOUT_OR_CRASH", width, message: String(error?.message ?? error) }));
      finalCode = 4;
      break;
    }
    records.push({ expectedColumns, longToken, reducedMotion, ...record });
    if (record.kind === "blocked") {
      gate = "blocked";
      finalCode = 3;
      break;
    }
    try {
      assert.equal(record.status, "pass");
      assert.equal(record.columns, expectedColumns);
      assert.equal(record.viewport, width);
    } catch (error) {
      console.error(JSON.stringify({ verdict: "BROWSER_CONTRACT_FAIL", width, message: String(error?.message ?? error), record }));
      finalCode = 5;
      break;
    }
  }
} finally {
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}
const verdict = finalCode === 0 ? "PASS_BROWSER_SMOKE" : finalCode === 3 && gate === "blocked" ? "BROWSER_BLOCKED" : "FAIL_BROWSER_SMOKE";
console.log(JSON.stringify({ verdict, code: finalCode, browser, browserVersion: discovered.version, gate, manualGates: ["Tab order and native key activation", "native browser zoom at 200%"], records }, null, 2));
process.exit(finalCode);
