import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyPackage } from "./package-integrity.mjs";
import { runtimeStatus } from "./runtime.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const project = join(root, "02_PROJECTS", "RESPONSIVE_CARD_GRID");
const fallback = join(root, "04_OFFLINE_FALLBACK", "OFFLINE_VIEWPORT_LAB_S02_v2.3_EN_GB.html");
const packageId = (await readFile(join(root, "90_AUDIT", "PACKAGE_ID.txt"), "utf8")).trim();
const control = join(tmpdir(), `tw2026-s02-${packageId.slice(0, 16)}.json`);
const pendingControl = `${control}.${process.pid}.tmp`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openTarget(target) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "start", "", target] : [target];
  return await new Promise((resolve) => {
    let settled = false;
    const finish = (value) => { if (!settled) { settled = true; resolve(value); } };
    try {
      const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
      child.once("spawn", () => { child.unref(); finish(true); });
      child.once("error", (error) => {
        console.error(`INFO: automatic opening was unavailable (${error.message}). Copy the printed path or URL manually.`);
        finish(false);
      });
      setTimeout(() => finish(false), 2500).unref();
    } catch (error) {
      console.error(`INFO: automatic opening was unavailable (${error.message}). Copy the printed path or URL manually.`);
      finish(false);
    }
  });
}

async function probeExisting() {
  try {
    const data = JSON.parse(await readFile(control, "utf8"));
    if (data.root !== root || data.packageId !== packageId || typeof data.url !== "string" || typeof data.token !== "string") {
      throw new Error("stale or foreign control record");
    }
    const response = await fetch(`${data.url}/__tw2026_control`, { signal: AbortSignal.timeout(1200), cache: "no-store" });
    const observed = response.ok ? await response.json() : null;
    if (observed?.token === data.token && observed?.packageId === packageId) {
      throw new Error(`another verified S02 server is already running at ${data.url}`);
    }
    throw new Error("stale control record");
  } catch (error) {
    if (String(error.message).includes("another verified")) throw error;
    await rm(control, { force: true });
  }
}

let server = null;
let cleaning = false;
async function cleanup(exitCode = 0) {
  if (cleaning) return;
  cleaning = true;
  try {
    if (server) {
      server.closeAllConnections?.();
      await Promise.race([
        new Promise((resolve) => server.close(resolve)),
        sleep(2500)
      ]);
    }
  } finally {
    await rm(control, { force: true });
    await rm(pendingControl, { force: true });
    process.exit(exitCode);
  }
}

try {
  await verifyPackage(root);
  const runtime = runtimeStatus();
  if (!runtime.acceptedForExecution) {
    console.error(`STOP: expected Node.js v24.21.0 and npm 11.19.0; found ${runtime.node} and ${runtime.npm}.`);
    console.error("The offline fallback will open. It is not a live browser acceptance result.");
    console.error(`Manual fallback path: ${fallback}`);
    await openTarget(pathToFileURL(fallback).href);
    process.exit(2);
  }
  if (!runtime.exact) console.log("DOCUMENTED_RUNTIME_MISMATCH: QA override active; this is not exact-runtime acceptance.");
  await probeExisting();
  const token = randomUUID();
  const { createStaticServer, listen } = await import(pathToFileURL(join(project, "src", "static-server.js")));
  server = createStaticServer({ controlToken: token, packageId });
  const url = await listen(server);
  const record = { schema: "tw2026.s02.control.v2", pid: process.pid, url, root, packageId, token, startedAt: new Date().toISOString() };
  await writeFile(pendingControl, `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  await rename(pendingControl, control);
  console.log(`PASS: local project started at ${url}`);
  console.log("Edit only 02_PROJECTS/RESPONSIVE_CARD_GRID/public/styles.css.");
  console.log("Return to this terminal and press Ctrl+C when finished.");
  const opened = await openTarget(url);
  if (!opened) console.log(`Open this URL manually: ${url}`);
  process.once("SIGINT", () => { void cleanup(0); });
  process.once("SIGTERM", () => { void cleanup(0); });
  process.once("uncaughtException", (error) => { console.error(`STOP: ${error.message}`); void cleanup(2); });
  process.once("unhandledRejection", (error) => { console.error(`STOP: ${error?.message ?? error}`); void cleanup(2); });
} catch (error) {
  console.error(`STOP: ${error.message}`);
  if (server) await cleanup(2);
  await rm(pendingControl, { force: true });
  process.exit(2);
}
