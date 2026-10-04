import assert from "node:assert/strict";
export function createLoadProbe() {
 const diagnostics = Object.freeze({ activeRuns: 0, activeRequests: 0, activeTimers: 0 });
 return Object.freeze({ async run() { assert.fail("Optional load probe work has not been implemented"); }, get diagnostics() { return diagnostics; } });
}
