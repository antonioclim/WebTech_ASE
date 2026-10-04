import assert from 'node:assert/strict';
import test from 'node:test';
import { useServer } from './helpers.js';

const getBaseUrl = useServer();

test('clues preserve query identity in payload and header', async () => {
  const response = await fetch(`${getBaseUrl()}/api/clues?case=missing-cookie`);
  assert.equal(response.headers.get('x-case-id'), 'missing-cookie');
  assert.equal((await response.json()).caseId, 'missing-cookie');
});

test('verdict represents the submission and created resource', async () => {
  const submitted = { caseId: 'missing-cookie', verdict: 'cookie-jar' };
  const response = await fetch(`${getBaseUrl()}/api/verdicts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(submitted) });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('location'), '/api/verdicts/verdict-1');
  assert.deepEqual(await response.json(), { id: 'verdict-1', ...submitted });
});

test('unknown paths fail without stopping the server', async () => {
  assert.equal((await fetch(`${getBaseUrl()}/unknown`)).status, 404);
  assert.equal((await fetch(`${getBaseUrl()}/api/clues?case=still-running`)).status, 200);
});


test('invalid case identifiers return 400 and preserve subsequent requests', async () => {
  for (const value of ['%0A', '%C8%99', '', 'x'.repeat(65)]) {
    const response = await fetch(`${getBaseUrl()}/api/clues?case=${value}`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'invalid_case_id' });
    assert.equal((await fetch(`${getBaseUrl()}/api/clues?case=still-running`)).status, 200);
  }
});

test('malformed request targets return 400 and preserve subsequent requests', async () => {
  const { request } = await import('node:http');
  const target = new URL(getBaseUrl());
  const result = await new Promise((resolve, reject) => {
    const req = request({ hostname: target.hostname, port: target.port, path: '//[', method: 'GET' }, res => {
      let body = ''; res.setEncoding('utf8'); res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject); req.end();
  });
  assert.deepEqual(result, { status: 400, body: { error: 'invalid_request_target' } });
  assert.equal((await fetch(`${getBaseUrl()}/api/clues?case=still-running`)).status, 200);
});
