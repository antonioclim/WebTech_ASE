import assert from "node:assert/strict";
import test from "node:test";
import { createProductionReview } from "../src/production-review.mjs";
import { fixture } from "./helpers.mjs";

test("root confinement and clean evidence preserve explicit deployment unknowns", async () => {
  const { reviewer } = fixture(); const report = await reviewer.review();
  assert.equal(report.project, "release-checklist"); assert.equal(report.passed, true); assert.deepEqual(report.summary, { pass: 13, fail: 0, unknown: 2 });
  assert.deepEqual(report.findings.filter((item) => item.status === "unknown").map((item) => [item.ruleId, item.required]), [["DEPLOYMENT_TLS", false], ["DEPLOYMENT_PROXY", false]]);
  const { evidence, runner } = fixture();
  assert.throws(() => createProductionReview({ workspaceRoot: "/course", projectRoot: "/other/project", evidence, runner }), (error) => error.code === "invalid_root");
});

test("build runtime and audit-tool failures are distinct blocking evidence", async () => {
  for (const [defect, rule, status] of [["failed-build", "PRODUCTION_BUILD", "fail"], ["unhealthy-runtime", "RUNTIME_HEALTH", "fail"], ["audit-tool-failure", "DEPENDENCY_AUDIT", "unknown"]]) {
    const report = await fixture(defect).reviewer.review(); const item = report.findings.find((entry) => entry.ruleId === rule);
    assert.equal(report.passed, false); assert.equal(item.status, status);
  }
});

test("logs secrets and headers become redacted stable findings", async () => {
  const cases = [["leaked-authorization-log", "LOG_SENSITIVE_DATA"], ["committed-secret", "TRACKED_SECRET"], ["missing-header", "HEADER_CONTENT_SECURITY_POLICY"]];
  for (const [defect, rule] of cases) {
    const report = await fixture(defect).reviewer.review(); const item = report.findings.find((entry) => entry.ruleId === rule && entry.status === "fail");
    assert.equal(report.passed, false); assert.ok(item); const serialized = JSON.stringify(report); assert.doesNotMatch(serialized, /Bearer seeded-secret-value/);
  }
});

test("complete defect matrix uses stable taxonomy without certification", async () => {
  const rules = new Set();
  for (const defect of [null, "failed-build", "unhealthy-runtime", "leaked-authorization-log", "committed-secret", "missing-header", "audit-tool-failure"]) {
    const report = await fixture(defect).reviewer.review(); report.findings.forEach((item) => { rules.add(item.ruleId); assert.match(item.status, /^(pass|fail|unknown)$/); assert.match(item.severity, /^(info|low|medium|high|critical)$/); });
    assert.match(report.limitations[0], /No live deployment/); assert.doesNotMatch(JSON.stringify(report), /production[- ]ready|certified/i);
  }
  assert.equal(rules.size >= 12, true);
});

test("reports are deterministic and repeated reviews release resources", async () => {
  const { reviewer, runner } = fixture(); const first = await reviewer.review(); const second = await reviewer.review();
  assert.deepEqual(first, second); assert.deepEqual(reviewer.diagnostics, { activeReviews: 0, runnerActive: 0 });
  await assert.rejects(() => runner.run("caller shell text"), (error) => error.code === "command_not_allowed");
});
