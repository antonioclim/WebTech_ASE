import assert from "node:assert/strict";
import test from "node:test";
import { processExport } from "../src/export-processor.js";
import { loadRedisConfig } from "../src/queue-runtime.js";
import { createStatusStore } from "../src/status-store.js";
import { fixture, withApp } from "./helpers.js";

test("supplied processor reports progress and returns a safe descriptor", async () => { const progress = []; const result = await processExport({ id: "j1", data: { reportId: "r1" }, updateProgress: async (value) => progress.push(value) }); assert.deepEqual(progress, [25, 75]); assert.deepEqual(result, { downloadId: "download-j1", format: "csv" }); });
test("supplied Redis config and status store are isolated", () => { assert.deepEqual(loadRedisConfig({ REDIS_URL: "redis://localhost:6387/2" }), { host: "localhost", port: 6387, db: 2, maxRetriesPerRequest: null }); assert.throws(() => loadRedisConfig({})); const one = createStatusStore(); const two = createStatusStore(); one.set("j", { jobId: "j", status: "queued" }); assert.equal(two.get("j"), null); });
test("supplied application shell starts with a passthrough lifecycle", async () => { const { app } = fixture(); await withApp(app, async (url) => assert.equal((await fetch(`${url}/health`)).status, 200)); });
