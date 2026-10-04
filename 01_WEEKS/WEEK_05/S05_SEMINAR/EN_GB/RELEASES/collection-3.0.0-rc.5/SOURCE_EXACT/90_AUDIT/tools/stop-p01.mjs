import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { probeRecord, readRecord, requestControl } from "./control-client.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const project = path.join(root, "02_PROJECTS/P01_IN_MEMORY_TASK_API");
const controlRecord = path.join(root, ".tw2026-runtime/s05-p01-control.json");
const packageId = fs.readFileSync(path.join(root, "90_AUDIT/PACKAGE_ID.txt"), "utf8").trim();
const expected = { packageId, project, node: process.execPath };

if (!fs.existsSync(controlRecord)) {
  console.log("PASS_NOT_RUNNING: no S05 P01 control record exists.");
  process.exit(0);
}

let record;
try { record = readRecord(controlRecord); } catch (error) {
  fs.rmSync(controlRecord, { force: true });
  console.error(`STOP_UNTRUSTED_CONTROL_RECORD_REMOVED: ${error.message}`);
  process.exit(2);
}

const probe = await probeRecord(record, expected);
if (!probe.ok) {
  fs.rmSync(controlRecord, { force: true });
  console.error(`STALE_OR_UNTRUSTED_CONTROL_RECORD_REMOVED_NO_SIGNAL: ${probe.classification}`);
  process.exit(2);
}

const response = await requestControl(record, "/__tw2026_stop", "POST", 2000);
if (response.status !== 202 || response.value?.stopping !== true) {
  console.error("STOP_CONTROL_RESPONSE_INVALID");
  process.exit(3);
}

const deadline = Date.now() + 5000;
while (Date.now() < deadline) {
  if (!fs.existsSync(controlRecord)) {
    console.log("PASS_STOP_CLEANUP: verified application stopped and control record removed.");
    process.exit(0);
  }
  await sleep(100);
}
console.error("PROCESS_TIMEOUT: verified application acknowledged stop but did not clean up within 5 seconds.");
process.exit(3);
