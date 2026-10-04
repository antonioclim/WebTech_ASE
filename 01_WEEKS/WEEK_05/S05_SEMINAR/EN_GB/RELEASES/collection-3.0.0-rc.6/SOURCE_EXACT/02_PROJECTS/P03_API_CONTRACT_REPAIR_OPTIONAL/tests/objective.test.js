import assert from "node:assert/strict";
import test from "node:test";
import { apiErrorHandler, sendServiceOutcome } from "../src/http-contract.js";
import { createLegacyMeetingService } from "../src/legacy-meeting-service.js";
import { postJson, withApi } from "./helpers.js";

test("list, create, accept, missing, conflict and invalid map correctly", async () => {
  await withApi(async (baseUrl) => {
    const listed = await fetch(`${baseUrl}/api/meetings`);
    assert.equal(listed.status, 200);
    assert.match(listed.headers.get("content-type"), /^application\/json/);
    assert.equal((await listed.json()).data.length, 1);

    const created = await fetch(
      `${baseUrl}/api/meetings`,
      postJson({ title: "  API review  " }),
    );
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/api/meetings/meeting-2");
    assert.deepEqual(await created.json(), {
      data: { id: "meeting-2", title: "API review", accepted: false },
    });

    const accepted = await fetch(`${baseUrl}/api/meetings/meeting-2/accept`, {
      method: "POST",
    });
    assert.equal(accepted.status, 200);
    assert.equal((await accepted.json()).data.accepted, true);

    const conflict = await fetch(`${baseUrl}/api/meetings/meeting-2/accept`, {
      method: "POST",
    });
    assert.equal(conflict.status, 409);
    assert.deepEqual(await conflict.json(), {
      error: { code: "already_accepted", message: "Invitation already accepted" },
    });

    const missing = await fetch(`${baseUrl}/api/meetings/absent/accept`, {
      method: "POST",
    });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "meeting_not_found");

    const invalid = await fetch(
      `${baseUrl}/api/meetings`,
      postJson({ title: " " }),
    );
    assert.equal(invalid.status, 400);
    const invalidBody = await invalid.json();
    assert.deepEqual(invalidBody, {
      error: { code: "title_required", message: "title must be a nonblank string" },
    });
    assert.doesNotMatch(JSON.stringify(invalidBody), /internalHint/);
  });
});

test("frozen outcomes are not mutated and unknown kinds throw", () => {
  const calls = [];
  const response = {
    status(value) { calls.push(["status", value]); return this; },
    json(value) { calls.push(["json", value]); return this; },
    location(value) { calls.push(["location", value]); return this; },
  };
  const outcome = Object.freeze({ kind: "missing", resource: "meeting" });
  sendServiceOutcome(response, outcome);
  assert.deepEqual(outcome, { kind: "missing", resource: "meeting" });
  assert.throws(
    () => sendServiceOutcome(response, Object.freeze({ kind: "mystery" })),
    { name: "TypeError", message: "unknown service outcome" },
  );
});

test("malformed and unexpected errors use safe centralised responses", async () => {
  await withApi(async (baseUrl) => {
    const malformed = await fetch(`${baseUrl}/api/meetings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"title":',
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).error.code, "invalid_json");
  });

  const secret = new Error("secret database host");
  const sent = [];
  const response = {
    headersSent: false,
    status(value) { sent.push(["status", value]); return this; },
    json(value) { sent.push(["json", value]); return this; },
  };
  apiErrorHandler(secret, {}, response, () => assert.fail("should not delegate"));
  assert.deepEqual(sent[0], ["status", 500]);
  assert.doesNotMatch(JSON.stringify(sent), /secret|database/i);
});

test("headers-sent errors delegate", () => {
  const error = new Error("late failure");
  let delegated;
  apiErrorHandler(error, {}, { headersSent: true }, (value) => { delegated = value; });
  assert.equal(delegated, error);
});

test("unexpected service failure leaks nothing and server recovers", async () => {
  const service = createLegacyMeetingService();
  service.list = async () => { throw new Error("password=do-not-leak"); };
  await withApi(async (baseUrl) => {
    const failed = await fetch(`${baseUrl}/api/meetings`);
    assert.equal(failed.status, 500);
    const body = await failed.json();
    assert.equal(body.error.code, "internal_error");
    assert.doesNotMatch(JSON.stringify(body), /password|do-not-leak|stack/i);

    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
  }, { service });
});
