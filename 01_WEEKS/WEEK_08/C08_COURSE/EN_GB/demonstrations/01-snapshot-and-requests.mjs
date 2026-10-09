import assert from 'node:assert/strict';
// Complete finite JavaScript reduction. No React scheduler or render is executed.
const capturedGain = 4;
const requestedValues = [capturedGain + 1, capturedGain + 1];
const replacementResult = requestedValues.reduce((_previous, requested) => requested, capturedGain);
const updaterResult = [gain => gain + 1, gain => gain + 1].reduce((pending, updater) => updater(pending), capturedGain);
assert.deepEqual(requestedValues, [5, 5]);
assert.equal(capturedGain, 4);
assert.equal(replacementResult, 5);
assert.equal(updaterResult, 6);
console.log(JSON.stringify({scope:'FINITE_JS_REDUCTION_NOT_REACT',capturedGain,requestedValues,replacementResult,updaterResult}));
