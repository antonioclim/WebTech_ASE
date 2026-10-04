import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";
import { createServer } from "node:http";
import { listen } from "../src/server.js";

test("supplied parser, fallback, health, and safe internal error remain healthy", async () => {
  const Reservation = { findAll: async () => { throw new Error("sqlite path secret"); } };
  const server = createServer(createApp({ Reservation }));
  const baseUrl = await listen(server);
  try {
    const malformed = await fetch(`${baseUrl}/api/reservations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"code":',
    });
    assert.equal(malformed.status, 400);
    const unknown = await fetch(`${baseUrl}/api/nope`);
    assert.equal(unknown.status, 404);
    const failed = await fetch(`${baseUrl}/api/reservations`);
    assert.equal(failed.status, 500);
    assert.doesNotMatch(await failed.text(), /sqlite|path|secret|stack/i);
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
