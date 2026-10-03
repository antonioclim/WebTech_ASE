import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("package is dependency-free ESM with categorized checks", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(manifest.type, "module"); assert.equal(manifest.dependencies, undefined);
  assert.equal(["test:baseline", "test:objective", "test:regression", "test:integration"].every((name) => Object.hasOwn(manifest.scripts, name)), true);
});

test("command runner contains a fixed allowlist, fixed argument vectors, and no shell execution", async () => {
  const source = await readFile("src/safe-runner.mjs", "utf8");
  assert.match(source, /new Set\(\["install", "audit", "build", "runtime"\]\)/);
  assert.match(source, /\["ci", "--ignore-scripts"\]/);
  assert.match(source, /\["audit", "--json", "--audit-level=moderate"\]/);
  assert.doesNotMatch(source, /shell\s*:|execSync|caller.*args/i);
});

test("review and prose avoid auto-fix external scan and certification claims", async () => {
  const source = await readFile("src/production-review.mjs", "utf8"); const readme = await readFile("README.md", "utf8");
  assert.doesNotMatch(source, /unlink|rmSync|writeFile|https:\/\//);
  assert.match(readme, /not a penetration test, compliance certification/i);
  assert.doesNotMatch(readme, /production[- ]ready verdict|guarantees|certifies/i);
});
