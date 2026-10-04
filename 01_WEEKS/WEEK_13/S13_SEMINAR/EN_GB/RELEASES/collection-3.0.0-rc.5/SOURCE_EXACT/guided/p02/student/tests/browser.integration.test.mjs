import assert from "node:assert/strict";
import { launchBrowser, startServer } from "./browser-runtime.mjs";

const server = await startServer({ cwd: process.cwd(), env: { PORT: "0" }, readyPattern: /http:\/\/127\.0\.0\.1:(\d+)/ });
const browser = await launchBrowser(`http://127.0.0.1:${server.match[1]}/?selftest=1`);
try {
  await browser.waitFor("document.body.dataset.selftest");
  assert.equal(await browser.evaluate("document.body.dataset.firstPath"), "direct");
  assert.equal(await browser.evaluate("document.body.dataset.secondPath"), "service-worker");
  assert.equal(await browser.evaluate("document.body.dataset.courseCaches"), "1");
  assert.equal(await browser.evaluate("Boolean(navigator.serviceWorker.controller)"), true);
} finally { await browser.close(); await server.stop(); }
