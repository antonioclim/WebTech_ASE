import assert from "node:assert/strict";
import test from "node:test";
import { css, html, rules, normalise } from "./helpers.js";

test("source checklist rejects the documented concealment shortcuts", () => {
  for (const rule of rules) {
    assert.notEqual(normalise(rule.declarations.get("overflow-x")), "hidden", "do not hide horizontal overflow");
    if (rule.selectors.includes(".card")) assert.doesNotMatch(rule.declarations.get("width") ?? "", /^\s*[\d.]+px\s*$/i, "fixed card width");
    assert.doesNotMatch(normalise(rule.declarations.get("outline")), /^(?:0|none)$/, "do not erase focus");
    if (rule.selectors.includes(".card-grid") && !rule.context.length) assert.doesNotMatch(normalise(rule.declarations.get("grid-template-columns")), /^repeat\(4,/, "four columns require a media context");
  }
  assert.doesNotMatch(html, /style\s*=/i);
});

test("bounded parser accepts structure and custom properties resolve", () => {
  assert.ok(rules.length > 0);
  const defined = new Set(rules.flatMap(rule => [...rule.declarations.keys()].filter(name => name.startsWith("--"))));
  for (const match of css.matchAll(/var\(\s*(--[\w-]+)/g)) assert.ok(defined.has(match[1]), `undefined ${match[1]}`);
});
