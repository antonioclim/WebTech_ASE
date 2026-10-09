import assert from 'node:assert/strict';
import { startServer } from './server.mjs';
const server = await startServer(0);
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  const creation = await fetch(origin + '/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'C01 fresh text' }), signal: AbortSignal.timeout(5000) });
  const created = await creation.json();
  const retrieval = await fetch(origin + '/api/notes/n-7', { signal: AbortSignal.timeout(5000) });
  const retrieved = await retrieval.json();
  assert.equal(creation.status, 201);
  assert.equal(created.text, 'C01 fresh text');
  assert.equal(retrieval.status, 200);
  assert.equal(retrieved.text, 'Read diff');
  assert.notEqual(retrieved.text, created.text);
  console.log(JSON.stringify({ scope: 'ACTUAL_NODE_LOOPBACK_HTTP', origin, creation: { status: creation.status, location: creation.headers.get('location'), mediaType: creation.headers.get('content-type'), body: created }, retrieval: { status: retrieval.status, mediaType: retrieval.headers.get('content-type'), body: retrieved }, conclusion: 'This GET does not retrieve the posted fresh text; source has no persistence code.' }, null, 2));
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
