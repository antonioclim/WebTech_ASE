import assert from 'node:assert/strict';
import { nearestRank } from '../derived/performance-evidence.mjs';
const completed = 200;
const seconds = 4;
const stipulatedDurationsMs = [10,10,10,10,10,10,10,10,10,200];
const meanMs = stipulatedDurationsMs.reduce((total, value) => total + value, 0) / stipulatedDurationsMs.length;
const p95Ms = nearestRank(stipulatedDurationsMs, 95);
assert.equal(completed / seconds, 50);
assert.equal(meanMs, 29);
assert.equal(p95Ms, 200);
const headerArrivalMs = 12;
const bodyCompleteMs = 48;
assert.equal(bodyCompleteMs - headerArrivalMs, 36);
console.log(JSON.stringify({ evidenceClass: 'SYNTHETIC_ARITHMETIC_EXECUTED_IN_NODE',
  numerator: completed, denominatorSeconds: seconds, throughputPerSecond: completed / seconds,
  populationMs: stipulatedDurationsMs, algorithm: 'nearest-rank, one-based ceil(p/100*n)', meanMs, p95Ms,
  clock: { startMs: 0, headerArrivalMs, bodyCompleteMs },
  limit: 'Stipulated samples and clock; no network measurement or production capacity' }, null, 2));
