import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { exact } from "./runtime.mjs";
import { probeRecord, readRecord } from "./control-client.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const project = path.join(root, "02_PROJECTS/P01_IN_MEMORY_TASK_API");
const runtimeDirectory = path.join(root, ".tw2026-runtime");
const controlRecord = path.join(runtimeDirectory, "s05-p01-control.json");
const logFile = path.join(runtimeDirectory, "s05-p01.log");
const packageId = fs.readFileSync(path.join(root, "90_AUDIT/PACKAGE_ID.txt"), "utf8").trim();
const expected = { packageId, project, node: process.execPath };

function expressReady() {
  const file = path.join(project, "node_modules/express/package.json");
  try { return JSON.parse(fs.readFileSync(file, "utf8")).version === "5.1.0"; } catch { return false; }
}

const versions = exact();
if (!versions.match || !expressReady()) {
  console.error("APPLICATION_PREREQUISITE_BLOCK");
  console.error(`Node.js observed: ${versions.node}`);
  console.error(`npm observed: ${versions.npm || "ABSENT"}`);
  console.error("Required: Node.js v24.21.0, npm 11.19.0 and project-local Express 5.1.0 prepared with npm ci after authorisation.");
  process.exit(2);
}

fs.mkdirSync(runtimeDirectory, { recursive: true });
if (fs.existsSync(controlRecord)) {
  try {
    const existing = readRecord(controlRecord);
    const probe = await probeRecord(existing, expected);
    if (probe.ok) {
      console.log(`PASS_PROJECT_ALREADY_RUNNING ${existing.baseUrl}`);
      console.log(`CONTROL_RECORD=${controlRecord}`);
      console.log(`LOG_FILE=${logFile}`);
      process.exit(0);
    }
  } catch {}
  fs.rmSync(controlRecord, { force: true });
}

const token = crypto.randomUUID();
const log = fs.openSync(logFile, "a", 0o600);
const child = spawn(process.execPath, ["src/server.js"], {
  cwd: project,
  detached: true,
  windowsHide: true,
  stdio: ["ignore", log, log],
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: "0",
    TW2026_CONTROL_TOKEN: token,
    TW2026_CONTROL_RECORD: controlRecord,
    TW2026_PACKAGE_ID: packageId,
  },
});
child.unref();
fs.closeSync(log);

const deadline = Date.now() + 8000;
while (Date.now() < deadline) {
  if (fs.existsSync(controlRecord)) {
    try {
      const record = readRecord(controlRecord);
      const probe = await probeRecord(record, expected);
      if (probe.ok && record.pid === child.pid && record.token === token) {
        console.log(`PASS_PROJECT_READY ${record.baseUrl}`);
        console.log(`CONTROL_RECORD=${controlRecord}`);
        console.log(`LOG_FILE=${logFile}`);
        process.exit(0);
      }
    } catch {}
  }
  await sleep(150);
}

try { process.kill(child.pid, "SIGTERM"); } catch {}
fs.rmSync(controlRecord, { force: true });
console.error("PROCESS_TIMEOUT: P01 did not establish a verified control endpoint within 8 seconds.");
console.error(`Inspect ${logFile}`);
process.exit(3);
