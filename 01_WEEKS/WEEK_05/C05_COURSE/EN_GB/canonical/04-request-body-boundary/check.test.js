import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";

test("Express separates media-type, JSON parsing, and domain validation", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/tasks`;
  const post = (body, type = "application/json") => fetch(base, { method: "POST", headers: { "content-type": type }, body });
  try {
    assert.equal((await post("{}", "text/plain")).status, 415);
    const unknown = await post(JSON.stringify({ title: "Task", admin: true }));
    assert.deepEqual(await unknown.json(), { error: { code: "validation_failed", message: "unknown_field" } });
    const accepted = await post(JSON.stringify({ title: "  Review boundary  " }));
    assert.equal(accepted.status, 201);
    assert.equal((await accepted.json()).data.title, "Review boundary");
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

