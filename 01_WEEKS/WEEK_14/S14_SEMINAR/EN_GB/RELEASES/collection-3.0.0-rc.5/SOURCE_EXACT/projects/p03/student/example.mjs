import { createEvidence } from "./src/evidence-fixtures.mjs";
import { createProductionReview } from "./src/production-review.mjs";
import { createSafeRunner } from "./src/safe-runner.mjs";

const workspaceRoot = "/course"; const projectRoot = "/course/release-checklist"; const evidence = createEvidence();
const report = await createProductionReview({ workspaceRoot, projectRoot, evidence, runner: createSafeRunner(evidence) }).review();
console.log(JSON.stringify(report, null, 2));
