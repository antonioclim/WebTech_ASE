import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("service worker uses exact same-origin task path and scoped cache prefix", async () => { const source = await readFile("service-worker.js", "utf8"); assert.match(source, /url\.origin !== self\.location\.origin/); assert.match(source, /course-sw-dispatcher-/); assert.doesNotMatch(source, /postMessage\([^,]+,\s*["']\*["']/); });
test("page remains accessible and explicitly avoids offline completeness", async () => { const html = await readFile("index.html", "utf8"); assert.match(html, /<label>/); assert.match(html, /role="status"/); const readme = await readFile("README.md", "utf8"); assert.match(readme, /not complete offline\/PWA support/i); });
test("package is dependency-free and dispatcher uses no storage/global proxy", async () => { const manifest = JSON.parse(await readFile("package.json", "utf8")); assert.equal(manifest.dependencies, undefined); const source = await readFile("src/sw-dispatcher.js", "utf8"); assert.doesNotMatch(source, /localStorage|sessionStorage|endsWith\(|includes\([^)]*origin|module\.exports/); });
