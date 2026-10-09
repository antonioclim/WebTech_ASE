import assert from 'node:assert/strict';
// Stipulated transition traces, not a transaction or event-bus implementation.
const traces = [
  { order: ['announce', 'commit fails'], storedState: false, announcement: true,
    consequence: 'Announcement can describe state that never committed' },
  { order: ['commit succeeds', 'delivery fails'], storedState: true, announcement: false,
    consequence: 'Storage exists while delivery remains pending' }
];
assert.notEqual(traces[0].storedState, traces[1].storedState);
assert.notEqual(traces[0].announcement, traces[1].announcement);
console.log(JSON.stringify({ evidenceClass: 'SYNTHETIC_TRANSITION_MODEL', traces,
  limit: 'No database transaction, event bus, retry or durable outbox runs; S14 Map has none' }, null, 2));
