import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaType, useServer } from './helpers.js';

const getBaseUrl = useServer();

function compareEntry(name, submitted, observed) {
  assert.deepEqual(Object.keys(submitted).sort(), Object.keys(observed).sort(), `${name}: submitted fields differ`);
  for (const [field, expected] of Object.entries(observed)) {
    assert.deepEqual(submitted[field], expected, `${name}.${field}: observed contract mismatch`);
  }
}

test('case report matches live HTTP observations', async () => {
  const stylesheet = await fetch(`${getBaseUrl()}/assets/detective.css`);
  await stylesheet.text();
  const clues = await fetch(`${getBaseUrl()}/api/clues?case=missing-cookie`);
  await clues.json();
  const verdict = await fetch(`${getBaseUrl()}/api/verdicts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ caseId: 'missing-cookie', verdict: 'cookie-jar' })
  });
  await verdict.json();

  const observed = {
    stylesheet: { method: 'GET', pathname: '/assets/detective.css', query: {}, requestMediaType: null, status: stylesheet.status, responseMediaType: mediaType(stylesheet.headers), bodyRepresentation: 'text' },
    clues: { method: 'GET', pathname: '/api/clues', query: { case: 'missing-cookie' }, requestMediaType: null, status: clues.status, responseMediaType: mediaType(clues.headers), bodyRepresentation: 'json', xCaseId: clues.headers.get('x-case-id') },
    verdict: { method: 'POST', pathname: '/api/verdicts', query: {}, requestMediaType: 'application/json', status: verdict.status, responseMediaType: mediaType(verdict.headers), bodyRepresentation: 'json', location: verdict.headers.get('location') }
  };
  const report = JSON.parse(await readFile(new URL('../case-report.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(report).sort(), Object.keys(observed).sort(), 'submitted report exchange names differ');
  for (const name of Object.keys(observed)) compareEntry(name, report[name], observed[name]);
});
