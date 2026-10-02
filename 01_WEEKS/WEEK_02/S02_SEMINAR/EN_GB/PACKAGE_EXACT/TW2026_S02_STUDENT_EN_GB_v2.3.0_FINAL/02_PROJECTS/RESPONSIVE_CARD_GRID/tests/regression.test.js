import assert from "node:assert/strict";
import test from "node:test";
import { css, html } from "./helpers.js";

test("does not mask layout defects or use forbidden shortcuts", () => {
  assert.doesNotMatch(css, /overflow-x\s*:\s*hidden/);
  assert.doesNotMatch(css, /\.card\s*\{[^}]*width\s*:\s*\d+px/);
  assert.doesNotMatch(css, /outline\s*:\s*(?:0|none)/);
  assert.doesNotMatch(css, /grid-template-columns\s*:\s*repeat\(\s*4\s*,[^}]+\)(?![\s\S]*@media)/);
  assert.doesNotMatch(html, /style\s*=/i);
});

test("CSS braces balance and custom properties resolve", () => {
  assert.equal((css.match(/{/g) ?? []).length, (css.match(/}/g) ?? []).length);
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
  for (const match of css.matchAll(/var\((--[\w-]+)/g)) {
    assert.ok(defined.has(match[1]), `undefined ${match[1]}`);
  }
});
