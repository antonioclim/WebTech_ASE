import assert from "node:assert/strict";
import test from "node:test";
import { createEvidence } from "../src/evidence-fixtures.mjs";
import { createSafeRunner } from "../src/safe-runner.mjs";

test("supplied clean evidence separates install audit build runtime and deployment", () => {
  const evidence = createEvidence();
  assert.deepEqual(Object.keys(evidence.commands), ["install", "audit", "build", "runtime"]);
  assert.equal(evidence.commands.runtime.healthStatus, 200); assert.equal(evidence.deployment.tls, null);
});

test("supplied runner executes only named allowlisted evidence operations", async () => {
  const runner = createSafeRunner(createEvidence());
  assert.equal((await runner.run("build")).ok, true);
  await assert.rejects(() => runner.run("rm -rf project"), (error) => error.code === "command_not_allowed");
  assert.deepEqual(runner.diagnostics, { active: 0 });
});
