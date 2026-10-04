import { createEvidence } from "../src/evidence-fixtures.mjs";
import { createProductionReview } from "../src/production-review.mjs";
import { createSafeRunner } from "../src/safe-runner.mjs";

export function fixture(defect = null) {
  const evidence = createEvidence(defect); const runner = createSafeRunner(evidence);
  return { evidence, runner, reviewer: createProductionReview({ workspaceRoot: "/course", projectRoot: "/course/release-checklist", evidence, runner }) };
}
