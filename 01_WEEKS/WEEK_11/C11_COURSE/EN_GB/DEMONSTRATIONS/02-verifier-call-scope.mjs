// Neutral catalogue verification: equal call counts are a narrow observation.
// This fixed injected verifier is not password hashing or an authentication API.
import assert from 'node:assert/strict';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment = await assessCourseEnvironment({ unit: 'C11', operation: 'neutral verifier count', cwd: process.cwd(), command: 'node DEMONSTRATIONS/02-verifier-call-scope.mjs' });
console.log(JSON.stringify(environment));
if (environment.exitCode) process.exit(environment.exitCode);

const catalogue = new Map([['book-7', { edition: 'second' }]]);
const knownTrace = [];
const absentTrace = [];
const fixedVerifier = (candidate, trace) => { trace.push({ step: 'injected verifier called', present: candidate !== null }); return false; };
// Two explicit observations, not a generic login pipeline.
const knownVerification = fixedVerifier(catalogue.get('book-7'), knownTrace);
const absentVerification = fixedVerifier(null, absentTrace);
const knownPublic = { category: 'not-confirmed' };
const absentPublic = { category: 'not-confirmed' };
assert.equal(knownVerification, false);
assert.equal(absentVerification, false);
assert.equal(knownTrace.length, 1);
assert.equal(absentTrace.length, 1);
assert.deepEqual(knownPublic, absentPublic);
assert.equal(catalogue.size, 1);
console.log(JSON.stringify({ example: '02', scope: 'actual fixed injected catalogue calls', knownCallCount: knownTrace.length, absentCallCount: absentTrace.length, knownPublic, absentPublic, result: 'PASS_NEUTRAL_CALL_COUNT_WITNESSES', limit: 'No elapsed-time measurement, real verifier, password cost or whole-login timing claim' }));
