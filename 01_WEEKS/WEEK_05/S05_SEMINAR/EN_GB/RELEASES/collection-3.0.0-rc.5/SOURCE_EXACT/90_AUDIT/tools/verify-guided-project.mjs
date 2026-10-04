import path from "node:path";
import { fileURLToPath } from "node:url";
import { runTap } from "./tap-contract.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const project = (process.argv[2] || "").toUpperCase();
const definitions = {
  P02: {
    baseline: ["p02-baseline.test.mjs", ["P02 exports createReportPipeline"]],
    objective: ["p02-objective.test.mjs", ["P02 establishes request identity and timing", "P02 guards exactly-once terminal logging"]],
    regression: ["p02-regression.test.mjs", ["P02 starter contains no hidden install"]],
    initialFail: 2,
  },
  P03: {
    baseline: ["p03-baseline.test.mjs", ["P03 exports the two contract functions"]],
    objective: ["p03-objective.test.mjs", ["P03 maps bounded outcomes explicitly", "P03 handles malformed JSON and safe internal errors"]],
    regression: ["p03-regression.test.mjs", ["P03 keeps the legacy fallback import available"]],
    initialFail: 2,
  },
};
const definition = definitions[project];
if (!definition) { console.error("Usage: verify-guided-project.mjs P02|P03"); process.exit(2); }
const dir = path.join(root, "90_AUDIT/teaching-tests");
try {
  runTap([path.join(dir, definition.baseline[0])], { cwd: root, expectedExit: 0, expectedNames: definition.baseline[1], expectedPass: definition.baseline[1].length, expectedFail: 0 });
  runTap([path.join(dir, definition.regression[0])], { cwd: root, expectedExit: 0, expectedNames: definition.regression[1], expectedPass: definition.regression[1].length, expectedFail: 0 });
  try {
    runTap([path.join(dir, definition.objective[0])], { cwd: root, expectedExit: 1, expectedNames: definition.objective[1], expectedPass: 0, expectedFail: definition.initialFail });
    console.log(`PASS_${project}_GUIDED_INITIAL_OBSERVATION`);
  } catch (initialError) {
    runTap([path.join(dir, definition.objective[0])], { cwd: root, expectedExit: 0, expectedNames: definition.objective[1], expectedPass: definition.objective[1].length, expectedFail: 0 });
    console.log(`PASS_${project}_OPTIONAL_IMPLEMENTATION_SOURCE_CONTRACT`);
  }
} catch (error) {
  console.error(`STOP_${project}_UNEXPECTED_SIGNATURE: ${error.message}`);
  process.exit(3);
}
