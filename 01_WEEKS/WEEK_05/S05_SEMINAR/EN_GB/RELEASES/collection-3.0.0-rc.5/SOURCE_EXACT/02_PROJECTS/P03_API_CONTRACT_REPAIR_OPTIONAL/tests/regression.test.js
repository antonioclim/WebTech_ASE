import assert from "node:assert/strict";
import test from "node:test";
import { postJson, withApi } from "./helpers.js";

test("invalid creation does not mutate state and unknown routes remain standard", async () => {
  await withApi(async (baseUrl) => {
    const before = await fetch(`${baseUrl}/api/meetings`);
    const beforeBody = await before.json();
    assert.equal((beforeBody.data ?? beforeBody.meetings).length, 1);

    await fetch(`${baseUrl}/api/meetings`, postJson({ title: "" }));
    const after = await fetch(`${baseUrl}/api/meetings`);
    const afterBody = await after.json();
    assert.equal((afterBody.data ?? afterBody.meetings).length, 1);

    const unknown = await fetch(`${baseUrl}/api/nope`);
    assert.equal(unknown.status, 404);
    assert.equal((await unknown.json()).error.code, "not_found");
  });
});
