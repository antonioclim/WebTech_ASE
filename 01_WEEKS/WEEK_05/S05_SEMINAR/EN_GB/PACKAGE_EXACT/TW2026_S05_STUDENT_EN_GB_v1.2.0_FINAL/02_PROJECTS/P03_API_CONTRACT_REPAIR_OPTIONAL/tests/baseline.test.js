import assert from "node:assert/strict";
import test from "node:test";
import { sendLegacyOutcome } from "../src/legacy-http-fallback.js";
import { createLegacyMeetingService } from "../src/legacy-meeting-service.js";
import { withApi } from "./helpers.js";

test("supplied server, static page and health route work", async () => {
  await withApi(async (baseUrl) => {
    const page = await fetch(`${baseUrl}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Meeting invitation API/);
    const health = await fetch(`${baseUrl}/health`);
    assert.deepEqual(await health.json(), { status: "ok" });
  });
});

test("legacy service returns frozen documented outcomes", async () => {
  const service = createLegacyMeetingService();
  const listed = await service.list();
  const invalid = await service.create({ title: " " });
  assert.equal(Object.isFrozen(listed), true);
  assert.equal(listed.kind, "listed");
  assert.equal(Object.isFrozen(invalid), true);
  assert.equal(invalid.kind, "invalid");
});

test("preserved fallback demonstrates the raw 200 defect", () => {
  const calls = [];
  const response = {
    status(value) { calls.push(["status", value]); return this; },
    json(value) { calls.push(["json", value]); return this; },
  };
  const outcome = Object.freeze({ kind: "missing", resource: "meeting" });
  sendLegacyOutcome(response, outcome);
  assert.deepEqual(calls, [["status", 200], ["json", outcome]]);
});
