import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./server.mjs";

test("an opaque cookie resolves only through server-side session state", async (t) => {
  const server = createApp().listen(0); t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/me`)).status, 401);
  const login = await fetch(`${base}/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: "alice" }) });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  assert.deepEqual((await (await fetch(`${base}/me`, { headers: { cookie: `${cookie}; role=admin` } })).json()).principal, { userId: "u1", role: "member" });
  await fetch(`${base}/logout`, { method: "POST", headers: { cookie } });
  assert.equal((await fetch(`${base}/me`, { headers: { cookie } })).status, 401);
});
