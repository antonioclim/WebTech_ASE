import assert from "node:assert/strict";
import test from "node:test";
import { css } from "./helpers.js";

test("tokens, sizing and layout primitives exist", () => {
  for (const pattern of [
    /--canvas\s*:/,
    /--space\s*:/,
    /--radius\s*:/,
    /box-sizing\s*:\s*border-box/,
    /minmax\(\s*0\s*,\s*1fr\s*\)/,
    /display\s*:\s*flex/,
    /display\s*:\s*grid/,
    /aspect-ratio\s*:\s*16\s*\/\s*9/,
    /width\s*:\s*min\(\s*100%\s*-\s*2\s*\*\s*var\(\s*--space\s*\)\s*,\s*72rem\s*\)/
  ]) assert.match(css, pattern);
});

test("exact responsive column states exist", () => {
  assert.match(css, /grid-template-columns\s*:\s*minmax\(\s*0\s*,\s*1fr\s*\)/);
  assert.match(css, /@media\s*\(\s*min-width\s*:\s*40rem\s*\)[\s\S]*repeat\(\s*2\s*,\s*minmax\(\s*0\s*,\s*1fr\s*\)\s*\)/);
  assert.match(css, /@media\s*\(\s*min-width\s*:\s*64rem\s*\)[\s\S]*repeat\(\s*4\s*,\s*minmax\(\s*0\s*,\s*1fr\s*\)\s*\)/);
});

test("focus and reduced motion are explicit", () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(css, /transition\s*:\s*none/);
});
