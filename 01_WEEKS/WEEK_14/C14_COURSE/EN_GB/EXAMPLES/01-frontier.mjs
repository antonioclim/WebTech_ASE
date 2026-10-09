import assert from 'node:assert/strict';
// Fixed neutral claims, not the assessed persistenceWitness or evidenceGate.
const claims = [
  { claim: 'Format a cabinet label', frontier: 'unit', witness: 'formatted value' },
  { claim: 'Retain a cabinet entry', frontier: 'integration', witness: 'independent ledger read' },
  { claim: 'Return an HTTP Location', frontier: 'api', witness: 'actual response header' },
  { claim: 'Move native keyboard focus', frontier: 'browser', witness: 'actual focus action' }
];
assert.equal(new Set(claims.map(row => row.frontier)).size, 4);
console.log(JSON.stringify({ evidenceClass: 'SYNTHETIC_MODEL', claims,
  limit: 'Stipulated frontier mapping, not actual HTTP or browser execution' }, null, 2));
