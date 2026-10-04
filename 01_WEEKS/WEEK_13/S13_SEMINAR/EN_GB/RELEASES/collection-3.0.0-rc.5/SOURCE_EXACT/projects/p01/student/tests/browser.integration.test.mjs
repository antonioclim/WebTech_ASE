import assert from "node:assert/strict";
import { launchBrowser, startServer } from "./browser-runtime.mjs";

const server = await startServer({ cwd: process.cwd(), env: { PORT: "0" }, readyPattern: /http:\/\/127\.0\.0\.1:(\d+)/ });
const url = `http://127.0.0.1:${server.match[1]}/?selftest=1`;
const browser = await launchBrowser(url);
try {
  await browser.waitFor("document.body.dataset.selftest");
  assert.equal(await browser.evaluate("document.querySelector('#status').textContent"), "Complete");
  assert.ok(Number(await browser.evaluate("document.querySelector('#heartbeat').value")) > 0);
  assert.equal(await browser.evaluate("JSON.parse(document.querySelector('#result').textContent).count"), 50000);
} finally { await browser.close(); await server.stop(); }
