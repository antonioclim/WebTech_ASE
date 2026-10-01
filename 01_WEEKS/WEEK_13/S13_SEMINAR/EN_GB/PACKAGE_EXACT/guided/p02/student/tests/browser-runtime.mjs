import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startServer({ cwd, env = {}, readyPattern }) {
  const child = spawn(process.execPath, ["server.mjs"], { cwd, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
  const match = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server_start_timeout")), 10_000);
    let output = "";
    child.once("error", reject);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { output += chunk; const found = output.match(readyPattern); if (found) { clearTimeout(timer); resolve(found); } });
  });
  return Object.freeze({ match, async stop() { child.kill("SIGTERM"); await new Promise((resolve) => { if (child.exitCode !== null) resolve(); else child.once("exit", resolve); }); } });
}

export async function launchBrowser(url) {
  const profile = await mkdtemp(join(tmpdir(), "course-browser-"));
  const child = spawn(process.env.CHROME_BIN ?? "google-chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, url], { stdio: "ignore" });
  let debugPort;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try { debugPort = Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); break; } catch { await delay(25); }
  }
  if (!debugPort) throw new Error("browser_start_timeout");
  let target;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
    target = targets.find((item) => item.type === "page" && item.url.startsWith(url.split("?")[0]));
    if (target) break;
    await delay(25);
  }
  if (!target) throw new Error("page_target_timeout");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); if (!message.id) return; const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params })); });
  return Object.freeze({
    async evaluate(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true }); return result.result.value; },
    async waitFor(expression, expected = "pass", timeoutMs = 30_000) { const deadline = Date.now() + timeoutMs; while (Date.now() < deadline) { if (await this.evaluate(expression) === expected) return; await delay(50); } throw new Error("browser_assertion_timeout"); },
    async close() { socket.close(); child.kill("SIGTERM"); await new Promise((resolve) => { if (child.exitCode !== null) resolve(); else child.once("exit", resolve); }); for (let attempt = 0; attempt < 5; attempt += 1) { try { await rm(profile, { recursive: true, force: true }); break; } catch (error) { if (attempt === 4) throw error; await delay(50); } } }
  });
}
