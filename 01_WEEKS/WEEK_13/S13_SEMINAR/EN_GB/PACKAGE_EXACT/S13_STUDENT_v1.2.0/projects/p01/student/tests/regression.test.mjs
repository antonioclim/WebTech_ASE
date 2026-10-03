import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("worker source stays DOM-free and main UI owns presentation", async () => { const worker = await readFile("src/analysis-worker.js", "utf8"); assert.doesNotMatch(worker, /document|window\.|querySelector|innerHTML/); const main = await readFile("main.js", "utf8"); assert.match(main, /querySelector/); });
test("page has accessible controls and status output", async () => { const html = await readFile("index.html", "utf8"); assert.match(html, /<label>/); assert.match(html, /role="status"/); assert.match(html, /<button[^>]*>Analyze/); assert.match(html, /type="button">Cancel/); });
test("package is dependency-free and no fake main-thread offload exists", async () => { const manifest = JSON.parse(await readFile("package.json", "utf8")); assert.equal(manifest.dependencies, undefined); const client = await readFile("src/worker-client.js", "utf8"); assert.doesNotMatch(client, /setTimeout|setInterval|analyzeNumbers|document|window\./); });
