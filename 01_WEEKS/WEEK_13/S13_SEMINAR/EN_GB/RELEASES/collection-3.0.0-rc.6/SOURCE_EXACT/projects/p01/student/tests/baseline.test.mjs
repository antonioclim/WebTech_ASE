import assert from "node:assert/strict";
import test from "node:test";
import { analyzeNumbers, generateValues } from "../src/analysis.js";
import { createFakeWorker } from "./fake-worker.mjs";

test("supplied deterministic generator and synchronous oracle agree", () => { const values = generateValues(10); assert.equal(values.length, 10); assert.deepEqual(analyzeNumbers(values), analyzeNumbers([...values])); });
test("supplied fake worker exposes browser-like message lifecycle", () => { const worker = createFakeWorker(); const seen = []; const listener = (event) => seen.push(event.data); worker.addEventListener("message", listener); worker.postMessage({ type: "x" }); worker.emit("message", { type: "y" }); worker.removeEventListener("message", listener); worker.terminate(); assert.deepEqual(seen, [{ type: "y" }]); assert.equal(worker.diagnostics().terminated, true); });
