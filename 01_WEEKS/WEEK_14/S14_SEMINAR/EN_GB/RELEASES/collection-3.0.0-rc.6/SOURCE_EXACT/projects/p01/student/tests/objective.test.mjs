import assert from "node:assert/strict";
import test from "node:test";
import { createRegressionHarness } from "../src/regression-harness.mjs";
import { observeExecution, assertExercised, assertCorrect, assertCorrectReport, mutationContracts } from "./runtime-oracle.mjs";

test("descriptor separates unit, integration, and HTTP boundaries", async () => {
  const harness = createRegressionHarness();
  assert.deepEqual(harness.boundaries, ["unit", "integration", "http"]);
  const witness = await observeExecution(createRegressionHarness);
  assertCorrect(witness);
  const report = witness.report;
  assert.equal(report.passed, true);
  assert.deepEqual(new Set(report.results.map((item) => item.boundary)), new Set(harness.boundaries));
});

test("isolated behavior contracts pass twice with stable names", async () => {
  const firstWitness = await observeExecution(createRegressionHarness);
  const secondWitness = await observeExecution(createRegressionHarness);
  assertCorrect(firstWitness); assertCorrect(secondWitness);
  const first = firstWitness.report;
  const second = secondWitness.report;
  assert.deepEqual(first.results, second.results);
  assert.equal(first.results.length, 7);
});

test("HTTP contracts include persisted follow-up and safe error behavior", async () => {
  const witness = await observeExecution(createRegressionHarness);
  assertCorrect(witness);
  const report = witness.report;
  const names = report.results.filter((item) => item.boundary === "http").map((item) => item.name);
  assert.equal(names.some((name) => /persisted follow-up/.test(name)), true);
  assert.equal(names.some((name) => /safe errors/.test(name)), true);
  assert.equal(names.some((name) => /stable status/.test(name)), true);
});

test("all supplied realistic mutations are killed by named contracts", async () => {
  const report = await createRegressionHarness().runMutationMatrix();
  assert.equal(report.correct.passed, true);
  assertCorrectReport(report.correct);
  assert.deepEqual(report.mutations.map(({ defect, killed }) => [defect, killed]), [["wrong-status", true], ["missing-persistence", true], ["leaked-internal-error", true], ["shared-state", true]]);
  assert.equal(report.mutations.every((item) => item.killedBy.length > 0 && item.killedBy.every((name) => /^(unit|integration|http):/.test(name))), true);
  for (const [defect, contract] of Object.entries(mutationContracts)) {
    const witness = await observeExecution(createRegressionHarness, defect);
    assertExercised(witness);
    assert.equal(witness.checks.find((row) => row.name === contract).pass, false, `${defect} must fail ${contract} in the protected oracle`);
    assert.equal(witness.report.passed, false, `${defect} must fail the harness run too`);
    assert.ok(report.mutations.find((row) => row.defect === defect).killedBy.includes(contract), `${defect} must attribute ${contract}`);
  }
});

test("every run closes servers and releases active-run state", async () => {
  const harness = createRegressionHarness();
  await harness.runMutationMatrix();
  assert.deepEqual(harness.diagnostics, { activeServers: 0, activeRuns: 0 });
  await harness.execute();
  assert.deepEqual(harness.diagnostics, { activeServers: 0, activeRuns: 0 });
});
