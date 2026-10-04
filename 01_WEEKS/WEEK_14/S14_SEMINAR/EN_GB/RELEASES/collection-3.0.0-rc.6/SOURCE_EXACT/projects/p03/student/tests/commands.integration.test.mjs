import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { createCommandRunner } from "../src/safe-runner.mjs";

test("allowlisted commands inspect a real disposable project", async () => {
  const runner = createCommandRunner({ projectRoot: resolve("fixture-app") });
  assert.deepEqual(await runner.run("install"), { ok: true, locked: true });
  assert.deepEqual(await runner.run("audit"), { ok: true, vulnerabilities: [] });
  assert.deepEqual(await runner.run("build"), { ok: true, artifacts: ["dist/server.mjs"] });
  assert.deepEqual(await runner.run("runtime"), { ok: true, healthStatus: 200, body: { status: "ok" }, closed: true });
  assert.deepEqual(runner.diagnostics, { active: 0 });
  await assert.rejects(() => runner.run("caller shell text"), (error) => error.code === "command_not_allowed");
});
