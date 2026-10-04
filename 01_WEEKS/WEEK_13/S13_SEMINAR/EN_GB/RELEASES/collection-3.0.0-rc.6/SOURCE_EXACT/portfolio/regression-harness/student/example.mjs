import { createRegressionHarness } from "./src/regression-harness.mjs";
const report = await createRegressionHarness().runMutationMatrix();
console.log(JSON.stringify({ correct: report.correct.passed, mutations: report.mutations }, null, 2));
