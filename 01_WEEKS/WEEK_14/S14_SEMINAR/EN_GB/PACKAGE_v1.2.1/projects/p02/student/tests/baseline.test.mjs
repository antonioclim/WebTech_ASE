import assert from "node:assert/strict";
import test from "node:test";
import { calculateLatency } from "../src/statistics.mjs";
import { withProbeServer } from "./helpers.mjs";

test("supplied loopback server exposes normal and injected application behavior", async () => withProbeServer({ applicationFailures: new Set([1]) }, async (url) => {
  assert.equal((await fetch(`${url}?sample=0`)).status, 200);
  const failed = await fetch(`${url}?sample=1`); assert.equal(failed.status, 503); assert.equal((await failed.json()).error.code, "temporarily_unavailable");
}));

test("supplied nearest-rank latency oracle is deterministic", () => {
  assert.deepEqual(calculateLatency([10, 30, 20, 40]), { min: 10, median: 20, p95: 40, max: 40, mean: 25 });
});
