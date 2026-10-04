import assert from 'node:assert/strict';
// This function reproduces the supplied flawed snippet; it is not a correct route implementation.
function flawed(request, url) {
  if (url.pathname.includes('/api/greetings/')) {
    const name = url.pathname.split('/').pop();
    return { status: 200, body: { greeting: `Hello, ${name}!` } };
  }
  return null;
}
const cases = [
  { method: 'GET', path: '/api/greetings/Ada%20Lovelace', expected: { status: 200, body: { message: 'Hello, Ada Lovelace!', source: 'path' } } },
  { method: 'GET', path: '/api/greetings/%20%20', expected: { status: 400, body: { error: 'name_required' } } },
  { method: 'GET', path: '/api/greetings/Ada/extra', expected: { status: 404, body: { error: 'not_found' } } },
  { method: 'POST', path: '/api/greetings/Ada', expected: { status: 404, body: { error: 'not_found' } } },
];
for (const c of cases) {
  const actual = flawed({ method: c.method }, new URL(c.path, 'http://127.0.0.1'));
  assert.notDeepEqual(actual, c.expected, 'The witness must retain the deliberately flawed behaviour.');
  console.log(JSON.stringify({ method: c.method, path: c.path, actualFlawedFunctionResult: actual, expectedUnderContract: c.expected, verdict: 'COUNTEREXAMPLE_OBSERVED_IN_ISOLATED_FUNCTION' }));
}
console.log('PASS_FLAWED_WITNESSES — function execution only; no browser, network exchange or completed student route was tested.');
