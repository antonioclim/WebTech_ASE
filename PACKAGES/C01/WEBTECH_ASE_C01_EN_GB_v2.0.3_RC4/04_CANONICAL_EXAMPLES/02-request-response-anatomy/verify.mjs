/**
 * Teaching guide
 *
 * Goal: verify the observable contract of the request/response anatomy target.
 * Why this design: requests cross the live HTTP boundary instead of inspecting server internals.
 * Follow the evidence: status, fields, and parsed representations must agree.
 */

import assert from "node:assert/strict";
import { startServer } from "./server.mjs";

const server = await startServer();
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const retrieval = await fetch(`${baseUrl}/api/notes/n-7`);
  assert.equal(retrieval.status, 200);
  assert.match(retrieval.headers.get("content-type"), /^application\/json\b/);
  assert.equal(retrieval.headers.get("example-trace-id"), "trace-read-7");
  assert.deepEqual(await retrieval.json(), { id: "n-7", text: "Read diff" });

  const creation = await fetch(`${baseUrl}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Read diff" }),
  });
  assert.equal(creation.status, 201);
  assert.equal(creation.headers.get("location"), "/api/notes/n-7");
  assert.equal(creation.headers.get("example-trace-id"), "trace-create-7");
  assert.deepEqual(await creation.json(), { id: "n-7", text: "Read diff" });

  const malformed = await fetch(`${baseUrl}/api/notes`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{broken",
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: "invalid_json_body" });
  const missingText = await fetch(`${baseUrl}/api/notes`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  });
  assert.equal(missingText.status, 400);
  assert.deepEqual(await missingText.json(), { error: "text_required" });
  const oversized = await fetch(`${baseUrl}/api/notes`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "x".repeat(70000) }),
  });
  assert.equal(oversized.status, 400);
  assert.deepEqual(await oversized.json(), { error: "invalid_json_body" });
  const afterMalformed = await fetch(`${baseUrl}/api/notes/n-7`);
  assert.equal(afterMalformed.status, 200);
  assert.deepEqual(await afterMalformed.json(), { id: "n-7", text: "Read diff" });
  console.log("request/response contract verified through live HTTP, including malformed JSON 400 and server continuity");
} finally {
  server.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
