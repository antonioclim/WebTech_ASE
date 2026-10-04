import assert from "node:assert/strict";
import { launchBrowser, startServer } from "./browser-runtime.mjs";

const server = await startServer({ cwd: process.cwd(), readyPattern: /listening on 4212, 4213, and 4214/ });
const browser = await launchBrowser("http://127.0.0.1:4212/?selftest=1");
try {
  await browser.waitFor("document.body.dataset.selftest");
  assert.equal(await browser.evaluate("document.body.dataset.forgedIgnored"), "true");
  assert.equal(await browser.evaluate("document.body.dataset.generation"), "2");
  assert.equal(await browser.evaluate("document.body.dataset.selected"), "item-2");
  assert.equal(await browser.evaluate("location.search"), "?item=item-2&selftest=1");
} finally { await browser.close(); await server.stop(); }
