import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const packageId = (await readFile(join(root, "90_AUDIT", "PACKAGE_ID.txt"), "utf8")).trim();
const control = join(tmpdir(), `tw2026-s02-${packageId.slice(0, 16)}.json`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function alive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { return error?.code === "EPERM"; }
}

async function waitForExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!alive(pid)) return true;
    await sleep(100);
  }
  return !alive(pid);
}

try {
  let raw;
  try { raw = await readFile(control, "utf8"); }
  catch (error) {
    if (error?.code === "ENOENT") {
      console.log("INFO: no S02 control record exists; no process was stopped.");
      process.exit(0);
    }
    throw error;
  }
  const data = JSON.parse(raw);
  if (!Number.isInteger(data.pid) || data.pid <= 1 || data.pid === process.pid || data.root !== root || data.packageId !== packageId || typeof data.url !== "string" || typeof data.token !== "string") {
    throw new Error("control record does not belong to this package");
  }
  let observed;
  try {
    const response = await fetch(`${data.url}/__tw2026_control`, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    observed = response.ok ? await response.json() : null;
  } catch {
    if (!alive(data.pid)) {
      await rm(control, { force: true });
      console.log("INFO: a stale control record was removed; the recorded process was not running.");
      process.exit(0);
    }
    throw new Error("the recorded process is alive but its control endpoint could not be verified; no signal was sent");
  }
  if (observed?.service !== "TW2026_S02" || observed?.token !== data.token || observed?.packageId !== packageId) {
    throw new Error("the live endpoint did not match the verified package token; no signal was sent");
  }
  if (process.platform === "win32") {
    execFileSync("taskkill", ["/PID", String(data.pid), "/T", "/F"], { stdio: "ignore", timeout: 8000, windowsHide: true });
  } else {
    process.kill(data.pid, "SIGTERM");
    if (!await waitForExit(data.pid, 3000)) {
      process.kill(data.pid, "SIGKILL");
      if (!await waitForExit(data.pid, 2000)) throw new Error("the verified process did not exit after SIGKILL");
    }
  }
  await rm(control, { force: true });
  console.log("PASS: the verified S02 project process stopped and the control record was removed.");
  process.exit(0);
} catch (error) {
  console.error(`STOP: ${error.message}`);
  process.exit(2);
}
