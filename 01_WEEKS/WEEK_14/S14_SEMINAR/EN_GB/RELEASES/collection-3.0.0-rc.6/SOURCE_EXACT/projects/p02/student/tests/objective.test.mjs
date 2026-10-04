import assert from "node:assert/strict";
import test from "node:test";
import { createLoadProbe } from "../src/load-probe.mjs";
import { calculateLatency } from "../src/statistics.mjs";
import { response, withProbeServer } from "./helpers.mjs";

const baseScenario = { url: "https://course.example/api/checklists", method: "GET", count: 4, concurrency: 2, timeoutMs: 10, warmup: 0, thresholds: { minSuccessRatio: 0, maxApplicationFailures: 4, maxTransportFailures: 4, maxTimeouts: 4, maxP95Ms: 1000 } };

test("scenario validation and scheduler enforce exact bounded work", async () => {
  let active = 0; let maximum = 0; let calls = 0;
  const fetchImpl = async () => { calls += 1; active += 1; maximum = Math.max(maximum, active); await new Promise((resolve) => setImmediate(resolve)); active -= 1; return response(true); };
  const probe = createLoadProbe({ fetchImpl, now: (() => { let value = 0; return () => ++value; })() });
  const report = await probe.run({ ...baseScenario, count: 7, concurrency: 3 });
  assert.equal(calls, 7); assert.equal(maximum, 3); assert.equal(report.sampleCount, 7);
  await assert.rejects(() => probe.run({ ...baseScenario, count: 0 }), (error) => error.code === "invalid_scenario");
});

test("warm-up is excluded and nearest-rank statistics are explicit", async () => {
  let clock = 0;
  const probe = createLoadProbe({ fetchImpl: async () => { clock += 10; return response(true); }, now: () => clock });
  const report = await probe.run({ ...baseScenario, count: 3, concurrency: 1, warmup: 2 });
  assert.equal(report.sampleCount, 3); assert.deepEqual(report.latency, { min: 10, median: 10, p95: 10, max: 10, mean: 10 });
  assert.deepEqual(calculateLatency([]), { min: 0, median: 0, p95: 0, max: 0, mean: 0 });
});

test("application, transport, timeout, and success settle exactly once", async () => {
  const fetchImpl = (url, { signal }) => {
    const sample = Number(new URL(url).searchParams.get("sample"));
    if (sample === 0) return Promise.resolve(response(true));
    if (sample === 1) return Promise.resolve(response(false));
    if (sample === 2) return Promise.reject(new TypeError("socket details"));
    return new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(Object.assign(new Error("late"), { name: "AbortError" })), { once: true }));
  };
  const probe = createLoadProbe({ fetchImpl });
  const report = await probe.run({ ...baseScenario, timeoutMs: 5 });
  assert.deepEqual(report.counts, { success: 1, application: 1, transport: 1, timeout: 1 });
  assert.equal(report.sampleCount, 4); assert.deepEqual(probe.diagnostics, { activeRuns: 0, activeRequests: 0, activeTimers: 0 });
});

test("thresholds are evaluated after settlement and independent runs clean up", async () => {
  const probe = createLoadProbe({ fetchImpl: async () => response(true), now: (() => { let value = 0; return () => value += 5; })() });
  const pass = await probe.run({ ...baseScenario, concurrency: 1, thresholds: { ...baseScenario.thresholds, minSuccessRatio: 1, maxP95Ms: 5 } });
  const fail = await probe.run({ ...baseScenario, concurrency: 1, thresholds: { ...baseScenario.thresholds, minSuccessRatio: 1, maxP95Ms: 4 } });
  assert.equal(pass.passed, true); assert.deepEqual(fail.breaches, ["p95_latency"]); assert.deepEqual(probe.diagnostics, { activeRuns: 0, activeRequests: 0, activeTimers: 0 });
});

test("real loopback failure scenario reports a bounded honest result", async () => withProbeServer({ delays: new Map([[4, 250]]), applicationFailures: new Set([1]), transportFailures: new Set([2]) }, async (url) => {
  const probe = createLoadProbe();
  const policy = { minSuccessRatio: 0.5, maxApplicationFailures: 1, maxTransportFailures: 1, maxTimeouts: 1, maxP95Ms: 1000 };
  const report = await probe.run({ url, method: "GET", count: 6, concurrency: 2, timeoutMs: 100, warmup: 1, thresholds: policy });
  assert.deepEqual(report.counts, { success: 3, application: 1, transport: 1, timeout: 1 }); assert.equal(report.passed, true);
  const breached = await probe.run({ url, method: "GET", count: 6, concurrency: 2, timeoutMs: 100, warmup: 0, thresholds: { ...policy, minSuccessRatio: 1, maxApplicationFailures: 0, maxTransportFailures: 0, maxTimeouts: 0, maxP95Ms: 0 } });
  assert.deepEqual(new Set(breached.breaches), new Set(["min_success_ratio", "application_failures", "transport_failures", "timeouts", "p95_latency"]));
  assert.deepEqual(probe.diagnostics, { activeRuns: 0, activeRequests: 0, activeTimers: 0 });
}));
