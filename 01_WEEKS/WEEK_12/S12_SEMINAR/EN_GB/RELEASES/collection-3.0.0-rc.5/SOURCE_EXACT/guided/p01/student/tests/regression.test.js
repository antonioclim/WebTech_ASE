import assert from "node:assert/strict";
import test from "node:test";
import WebSocket from "ws";
import { once } from "node:events";
import { post, withSystem } from "./helpers.js";

test("authentication and command validation deny before scheduling", async () => { let calls = 0; await withSystem(async ({ httpUrl }) => { assert.equal((await fetch(`${httpUrl}/api/calculations`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 401); assert.equal((await post(httpUrl, "alice-session", { operation: "sum", values: [Infinity], connectionId: "a" })).status, 400); assert.equal(calls, 0); }, { runCalculation: async () => { calls += 1; } }); });
test("invalid upgrades, malformed JSON, unknown routes, and later health remain stable", async () => { await withSystem(async ({ wsUrl, httpUrl }) => { const socket = new WebSocket(`${wsUrl}/replies?session=wrong`); const [error] = await once(socket, "error"); assert.match(error.message, /401/); assert.equal((await fetch(`${httpUrl}/api/calculations`, { method: "POST", headers: { "x-session-id": "alice-session", "content-type": "application/json" }, body: "{" })).status, 400); assert.equal((await fetch(`${httpUrl}/missing`)).status, 404); assert.equal((await fetch(`${httpUrl}/health`)).status, 200); }); });
test("coordinator source keeps state local and dependencies remain narrow", async () => { const { readFile } = await import("node:fs/promises"); const source = await readFile("src/reply-coordinator.js", "utf8"); assert.doesNotMatch(source, /module\.exports|broadcast|\.clients|request\.body|raw error/i); const manifest = JSON.parse(await readFile("package.json", "utf8")); assert.deepEqual(manifest.dependencies, { express: "5.1.0", ws: "8.21.3" }); });
