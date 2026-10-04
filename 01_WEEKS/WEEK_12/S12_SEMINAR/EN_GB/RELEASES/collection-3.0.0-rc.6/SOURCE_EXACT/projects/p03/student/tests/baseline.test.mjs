import assert from "node:assert/strict";
import test from "node:test";
import { createFakeTransport } from "../src/fake-transport.mjs";
import { publicError } from "../src/public-errors.mjs";

test("supplied transport sends, publishes, and unsubscribes", () => { const transport = createFakeTransport(); const messages = []; const off = transport.onMessage((message) => messages.push(message)); transport.send({ type: "x", requestId: "r", payload: {} }); transport.emitMessage({ type: "x.completed", requestId: "r", result: 1 }); off(); transport.emitMessage({ type: "ignored", requestId: "r" }); assert.equal(messages.length, 1); assert.equal(transport.sent().length, 1); assert.deepEqual(transport.diagnostics(), { messageListeners: 0, closeListeners: 0 }); });
test("supplied public errors hide raw transport details", () => { const error = publicError("send_failed", new Error("socket secret")); assert.equal(error.code, "send_failed"); assert.equal(error.message, "The request could not be sent"); assert.doesNotMatch(JSON.stringify(error), /secret/); });
