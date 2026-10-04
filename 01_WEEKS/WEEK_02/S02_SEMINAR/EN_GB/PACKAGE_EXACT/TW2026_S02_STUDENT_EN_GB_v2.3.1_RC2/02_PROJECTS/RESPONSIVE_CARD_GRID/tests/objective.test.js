import assert from "node:assert/strict";
import test from "node:test";
import { rules, hasRule, baseContext, minWidthContext, columnValue } from "./helpers.js";

test("source checklist names the real sizing and layout targets", () => {
  for (const token of ["--canvas", "--space", "--radius"]) assert.ok(hasRule(":root", token), `missing ${token}`);
  assert.ok(hasRule("*", "box-sizing", value => value === "border-box"), "global sizing");
  assert.ok(hasRule(".card-grid", "display", value => value === "grid", baseContext), "Grid collection");
  assert.ok(hasRule(".site-header", "display", value => value === "flex", baseContext), "Flexbox header");
  assert.ok(hasRule(".card", "display", value => value === "flex", baseContext), "Flexbox cards");
  assert.ok(hasRule(".card-media", "aspect-ratio", value => value === "16/9", baseContext), "media ratio");
  assert.ok(["main", ".site-header"].every(selector => hasRule(selector, "width") || hasRule(selector, "max-width")), "page container source");
});

test("source checklist contains scoped 1 2 4 column states", () => {
  assert.ok(hasRule(".card-grid", "grid-template-columns", value => columnValue(value, 1), baseContext), "base one column");
  assert.ok(hasRule(".card-grid", "grid-template-columns", value => columnValue(value, 2), minWidthContext(640)), "two columns inside the 40rem or 640px query");
  assert.ok(hasRule(".card-grid", "grid-template-columns", value => columnValue(value, 4), minWidthContext(1024)), "four columns inside the 64rem or 1024px query");
});

test("source checklist contains focus and reduced motion rules", () => {
  assert.ok(rules.some(rule => rule.selectors.some(selector => selector.includes(":focus-visible")) && (rule.declarations.has("outline") || rule.declarations.has("box-shadow"))), "focus rule");
  assert.ok(rules.some(rule => rule.context.some(value => /prefers-reduced-motion\s*:\s*reduce/i.test(value)) && rule.declarations.get("transition")?.replace(/\s/g, "") === "none"), "reduced motion rule");
});
