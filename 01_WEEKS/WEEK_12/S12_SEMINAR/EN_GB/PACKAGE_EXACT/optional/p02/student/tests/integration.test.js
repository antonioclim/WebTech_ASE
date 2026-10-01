import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { createSystem } from "../src/system.js";

test("real BullMQ worker processes and projects one Redis-backed export", { timeout: 15000 }, async () => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL is required; this gate never substitutes a fake");
  const system = createSystem({ env: process.env, queueName: `course-integration-${randomBytes(6).toString("hex")}`, nextJobId: () => `job-${randomBytes(6).toString("hex")}` });
  try {
    await system.runtime.worker.waitUntilReady();
    const completed = once(system.runtime.worker, "completed");
    const acceptance = await system.lifecycle.enqueue({ principal: { id: "u1" }, reportId: "report-real" });
    await completed;
    const record = system.lifecycle.findForOwner(acceptance.jobId, "u1");
    assert.equal(record.status, "completed");
    assert.equal(record.progress, 100);
    assert.equal(system.eventSink.forOwner("u1").at(-1).type, "export.completed");
  } finally {
    await system.runtime.queue.obliterate({ force: true });
    await system.close();
  }
});
