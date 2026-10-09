import assert from 'node:assert/strict';
import fixed from '../derived/fixed-costs.js';
// Fixed expressions only: no general candidate-ranking function.
const at0=fixed.costs(0),at3=fixed.costs(3),crossing=fixed.exactIntersection;
assert.equal(at0.costA,1);assert.equal(at0.costB,2);
assert.equal(at3.costA,4);assert.equal(at3.costB,2.45);
assert.equal(crossing,'20/17');
const displayOnlyDescriptor={id:'display-only',capabilities:['display'],assumedCost:0};
assert.equal(displayOnlyDescriptor.capabilities.includes('history'),false);
console.log(JSON.stringify({scope:'FIXED_ALGEBRA_AND_ONE_MISSING_CAPABILITY_NO_BENCHMARK',at0,at3,crossing,excludedReason:'display-only lacks required history regardless of cost'},null,2));
