import assert from "node:assert/strict";
import test from "node:test";
import { createApplication } from "./app.js";

test("Express CRUD awaits Sequelize and classifies persistence errors", async () => {
  const application = await createApplication();
  const server = application.app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const created = await fetch(`${base}/api/notes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Stored note" }) });
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/api/notes/1");
    const conflict = await fetch(`${base}/api/notes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Stored note" }) });
    assert.equal(conflict.status, 409);
    const updated = await fetch(`${base}/api/notes/1`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ archived: true }) });
    assert.equal((await updated.json()).data.archived, true);
    assert.equal((await fetch(`${base}/api/notes/1`, { method: "DELETE" })).status, 204);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await application.close();
  }
});
