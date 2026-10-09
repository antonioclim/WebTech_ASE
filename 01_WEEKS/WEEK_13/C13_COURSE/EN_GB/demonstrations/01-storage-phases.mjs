import assert from 'node:assert/strict';
// Teaching fixture: fake storage, distinct phases, no native Storage object.
function inspectPreference(read) {
  let raw;
  try { raw = read(); } catch (error) { return { phase: 'access_failed', code: error.name }; }
  if (raw === null) return { phase: 'missing', fallback: 'comfortable' };
  let record;
  try { record = JSON.parse(raw); } catch { return { phase: 'malformed', fallback: 'comfortable' }; }
  if (!record || record.version !== 1 || !['compact', 'comfortable'].includes(record.theme)) {
    return { phase: 'unsupported_schema', fallback: 'comfortable' };
  }
  return { phase: 'admitted', theme: record.theme };
}
const fixtures = [
  ['missing', () => null],
  ['malformed', () => '{broken'],
  ['unsupported_schema', () => '{"version":0,"theme":"compact"}'],
  ['admitted', () => '{"version":1,"theme":"compact"}'],
  ['access_failed', () => { const error = new Error('fixture access refusal'); error.name = 'SecurityError'; throw error; }]
];
const observations = fixtures.map(([label, read]) => ({label, actual: inspectPreference(read)}));
assert.deepEqual(observations.map(row => row.actual.phase), fixtures.map(([label]) => label));
console.log(JSON.stringify({scope:'NODE_WITH_DECLARED_STORAGE_FAKE', observations, cleanup:'No storage or file was created'}, null, 2));
