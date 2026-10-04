import path from "node:path";
import { fileURLToPath } from "node:url";
import { runTap } from "./tap-contract.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tests = path.join(root, "90_AUDIT/teaching-tests");
const specifications = [
  ["p01-baseline.test.mjs", 0, 2, 0, ["P01 starter exports createTaskRouter", "P01 starter retains one-file edit boundary"]],
  ["p01-objective.test.mjs", 1, 0, 3, ["P01 defines GET collection and member routes", "P01 defines POST with bounded validation and Location", "P01 defines PATCH DELETE and safe missing-task handling"]],
  ["p01-regression.test.mjs", 0, 2, 0, ["P01 does not edit app assembly through this exercise file", "P01 remains free of hidden install or network commands"]],
  ["p02-baseline.test.mjs", 0, 1, 0, ["P02 exports createReportPipeline"]],
  ["p02-objective.test.mjs", 1, 0, 2, ["P02 establishes request identity and timing", "P02 guards exactly-once terminal logging"]],
  ["p02-regression.test.mjs", 0, 1, 0, ["P02 starter contains no hidden install"]],
  ["p03-baseline.test.mjs", 0, 1, 0, ["P03 exports the two contract functions"]],
  ["p03-objective.test.mjs", 1, 0, 2, ["P03 maps bounded outcomes explicitly", "P03 handles malformed JSON and safe internal errors"]],
  ["p03-regression.test.mjs", 0, 1, 0, ["P03 keeps the legacy fallback import available"]],
];
try {
  for (const [file, expectedExit, pass, fail, names] of specifications) {
    runTap([path.join(tests, file)], { cwd: root, expectedExit, expectedNames: names, expectedPass: pass, expectedFail: fail });
    console.log(`PASS ${file}: pass=${pass} fail=${fail}`);
  }
  console.log("PASS_INITIAL_STATE_ASSERTION_SIGNATURE");
} catch (error) {
  console.error(`STOP_UNEXPECTED_TEACHING_SIGNATURE: ${error.message}`);
  process.exit(3);
}
