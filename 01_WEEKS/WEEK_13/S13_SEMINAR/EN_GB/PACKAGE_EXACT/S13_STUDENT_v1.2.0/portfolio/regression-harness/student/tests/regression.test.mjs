import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("package is dependency-free ESM with categorized commands", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(manifest.type, "module");
  assert.equal(manifest.dependencies, undefined);
  assert.equal(Object.hasOwn(manifest.scripts, "test:baseline"), true);
  assert.equal(Object.hasOwn(manifest.scripts, "test:objective"), true);
  assert.equal(Object.hasOwn(manifest.scripts, "test:regression"), true);
});

test("application retains canonical safe error boundary", async () => {
  const app = await readFile("src/checklist-app.mjs", "utf8");
  const harness = await readFile("src/regression-harness.mjs", "utf8");
  assert.match(app, /internal_error/);
  assert.match(app, /Internal server error/);
  assert.doesNotMatch(harness, /setTimeout|sleep|spy|readFile|source.*match|https:\/\/(?!127)/i);
});

test("documentation bounds mutation evidence and avoids completeness claims", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.match(readme, /do not prove the absence of other defects/i);
  assert.doesNotMatch(readme, /production[- ]ready|proves complete correctness/i);
});
