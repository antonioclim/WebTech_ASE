import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("package is dependency-free ESM with categorized checks", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(manifest.type, "module"); assert.equal(manifest.dependencies, undefined);
  assert.deepEqual(["test:baseline", "test:objective", "test:regression"].every((name) => Object.hasOwn(manifest.scripts, name)), true);
});

test("server injection is scenario-owned and reports safe public errors", async () => {
  const server = await readFile("src/probe-server.mjs", "utf8");
  assert.doesNotMatch(server, /x-fail|x-delay|authorization|cookie/i);
  assert.match(server, /temporarily_unavailable/);
  assert.doesNotMatch(server, /https:\/\//);
});

test("probe and documentation reject unbounded or production claims", async () => {
  const source = await readFile("src/load-probe.mjs", "utf8");
  const readme = await readFile("README.md", "utf8");
  assert.doesNotMatch(source, /responseBodies|rawError|while\s*\(true\)|busyWait/);
  assert.match(readme, /not a production capacity or SLO claim/i);
  assert.doesNotMatch(readme, /production[- ]ready|certif/i);
});
