import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exact, REQUIRED_EXPRESS, REQUIRED_NODE, REQUIRED_NPM } from "./runtime.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const value = exact();
const expressFile = path.join(root, "02_PROJECTS/P01_IN_MEMORY_TASK_API/node_modules/express/package.json");
let expressVersion = "ABSENT";
try { expressVersion = JSON.parse(fs.readFileSync(expressFile, "utf8")).version ?? "UNKNOWN"; } catch {}
const expressMatch = expressVersion === REQUIRED_EXPRESS;
console.log(`Node.js observed: ${value.node}`);
console.log(`npm observed: ${value.npm || "ABSENT"}`);
console.log(`Node.js required: ${REQUIRED_NODE}`);
console.log(`npm required: ${REQUIRED_NPM}`);
console.log(`Express observed: ${expressVersion}`);
console.log(`Express required: ${REQUIRED_EXPRESS}`);
console.log("Postman Desktop: NOT VERIFIED BY THIS SCRIPT");
if (value.match && expressMatch) {
  console.log("PASS_ENVIRONMENT_EXACT_AND_EXPRESS_READY");
  process.exit(0);
}
console.log("DOCUMENTED_RUNTIME_MISMATCH_OR_DEPENDENCY_BLOCK");
process.exit(2);
