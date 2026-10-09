import assert from 'node:assert/strict';
// Fixed neutral cabinet ledger. No learner adapter, target export or solution.
const normalLedger = new Map();
const omittedLedger = new Map();
const acknowledgement = { label: 'Cabinet A', code: 'cabinet-demo' };
normalLedger.set('cabinet-demo', { label: 'Cabinet A' });
// The second ledger deliberately receives no write, while acknowledgement stays equal.
const observations = [normalLedger, omittedLedger].map((ledger, index) => ({
  case: index === 0 ? 'retained entry' : 'omitted entry',
  acknowledgementLabel: acknowledgement.label,
  independentObservation: ledger.get('cabinet-demo') ?? null
}));
assert.equal(observations[0].acknowledgementLabel, observations[1].acknowledgementLabel);
assert.deepEqual(observations[0].independentObservation, { label: 'Cabinet A' });
assert.equal(observations[1].independentObservation, null);
console.log(JSON.stringify({ evidenceClass: 'ACTUAL_BOUNDED_NODE_MODEL', observations,
  limit: 'Two fixed Map states; no service adapter, HTTP, disk or restart observation' }, null, 2));
