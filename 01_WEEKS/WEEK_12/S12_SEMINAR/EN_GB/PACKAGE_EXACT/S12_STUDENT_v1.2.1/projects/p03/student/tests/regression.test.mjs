import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createFakeTransport } from "../src/fake-transport.mjs";
import { fixture } from "./helpers.mjs";

test("supplied transport remains healthy after malformed and unknown messages", () => { const transport = createFakeTransport(); const seen = []; const off = transport.onMessage((message) => seen.push(message)); transport.emitMessage(null); transport.emitMessage({ requestId: 1, type: "unknown" }); transport.emitMessage({ type: "work.completed", requestId: "r1", result: "ok" }); assert.equal(seen.length, 3); assert.deepEqual(seen.at(-1), { type: "work.completed", requestId: "r1", result: "ok" }); off(); });
test("dispatcher uses one transport subscription pair and disposal leaks none", () => { const f = fixture(); assert.deepEqual(f.transport.diagnostics(), { messageListeners: 1, closeListeners: 1 }); f.dispatcher.dispose(); assert.deepEqual(f.transport.diagnostics(), { messageListeners: 0, closeListeners: 0 }); });
test("dispatcher source remains browser-compatible and socket construction stays in its adapter", async () => { const manifest = JSON.parse(await readFile("package.json", "utf8")); assert.equal(manifest.dependencies.ws, "8.21.3"); const source = await readFile("src/request-dispatcher.mjs", "utf8"); assert.doesNotMatch(source, /node:|WebSocket|fetch\(|module\.exports|setInterval|raw error/i); });
