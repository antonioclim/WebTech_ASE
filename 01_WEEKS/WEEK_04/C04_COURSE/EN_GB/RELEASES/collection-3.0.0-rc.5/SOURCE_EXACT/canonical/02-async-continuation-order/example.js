/**
 * Teaching guide
 *
 * Goal: `await` pauses one async function's continuation; it does not block the current script or the JavaScript runtime.
 *
 * Why this design: Five log entries make the scheduling model observable without network or UI concerns.
 *
 * Follow the evidence:
 * - The async function starts synchronously.
 * - Code after `await` runs only after the current stack clears.
 * - The returned promise settles after the continuation completes.
 */

import assert from "node:assert/strict";

const events = [];
const record = (event) => events.push(event);

async function run() {
  record("function start");
  await Promise.resolve();
  record("after await");
}

record("script start");
const completion = run().then(() => record("promise fulfilled"));
record("script end");
await completion;

assert.deepEqual(events, [
  "script start",
  "function start",
  "script end",
  "after await",
  "promise fulfilled",
]);

console.log(events.join(" → "));
