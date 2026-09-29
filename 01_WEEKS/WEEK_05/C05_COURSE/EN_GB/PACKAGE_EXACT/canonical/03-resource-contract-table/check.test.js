import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";

test("Express exposes coherent REST status, header, body, and state contracts", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const created = await fetch(`${base}/api/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Test the API" }) });
    assert.equal(created.status, 201);
    const location = created.headers.get("location");
    assert.match(location, /^\/api\/tasks\/t-\d+$/);
    assert.equal((await (await fetch(`${base}${location}`)).json()).data.title, "Test the API");
    const deleted = await fetch(`${base}/api/tasks/t-1`, { method: "DELETE" });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), "");
    assert.equal((await fetch(`${base}/api/tasks/missing`)).status, 404);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

