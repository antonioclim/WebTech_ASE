import assert from "node:assert/strict";
import test from "node:test";
import { createFrame, createHost } from "./fakes.mjs";
test("supplied host and frame adapters expose listener and exact-target traces", () => { const host = createHost(); let seen = 0; const listener = () => { seen += 1; }; host.addEventListener("message", listener); host.emit({}); host.removeEventListener("message", listener); const frame = createFrame(); frame.postMessage({ type: "x" }, "https://fragment.example"); assert.equal(seen, 1); assert.deepEqual(frame.sent(), [{ message: { type: "x" }, origin: "https://fragment.example" }]); });
test("supplied architecture note compares a normal application first", async () => { const { readFile } = await import("node:fs/promises"); const note = await readFile("architecture-note.md", "utf8"); assert.match(note, /ordinary single application is the preferred baseline/i); assert.match(note, /adds exact-origin configuration/i); });
