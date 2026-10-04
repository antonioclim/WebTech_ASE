import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exact, qaOverride, REQUIRED_EXPRESS } from "./runtime.mjs";
import { runTap } from "./tap-contract.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const project = path.join(root, "02_PROJECTS/P01_IN_MEMORY_TASK_API");
const value = exact();
let expressVersion = "ABSENT";
try { expressVersion = JSON.parse(fs.readFileSync(path.join(project, "node_modules/express/package.json"), "utf8")).version; } catch {}
if ((!value.match || expressVersion !== REQUIRED_EXPRESS) && !qaOverride()) {
  console.error("APPLICATION_PREREQUISITE_BLOCK: exact runtime and project-local Express 5.1.0 are required");
  process.exit(2);
}
const files = ["tests/baseline.test.js", "tests/objective.test.js", "tests/regression.test.js"];
const names = [
  "app serves its static resource and health route",
  "repository starts from deterministic copied data",
  "CRUD lifecycle uses deliberate REST contracts",
  "write validation rejects bad media, shapes, fields and values",
  "unexpected repository errors reach safe centralised handling",
  "malformed JSON and unknown routes keep standard errors",
  "methods are matched with resource paths",
];
try {
  runTap(files, { cwd: project, expectedExit: 0, expectedNames: names, expectedPass: 7, expectedFail: 0, timeoutMs: 30000 });
  console.log("PASS_WORK_RESULT_P01_EXPRESS_APPLICATION");
} catch (error) {
  console.error(`STOP_P01_APPLICATION_TEST_CONTRACT: ${error.message}`);
  process.exit(3);
}
