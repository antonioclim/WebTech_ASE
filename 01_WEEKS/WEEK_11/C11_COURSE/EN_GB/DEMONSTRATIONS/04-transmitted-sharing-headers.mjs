// Literal HTTP fixtures, not a general origin/token policy or assessed solution.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment = await assessCourseEnvironment({ unit: 'C11', operation: 'neutral literal HTTP exchange', cwd: process.cwd(), command: 'node DEMONSTRATIONS/04-transmitted-sharing-headers.mjs', usesHttp: true, usesHttpTimeout: true, usesHttpCloseAll: true });
console.log(JSON.stringify(environment));
if (environment.exitCode) process.exit(environment.exitCode);

const listener = createServer((request, response) => {
  if (request.url === '/visible' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': 'https://reader.example', 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' });
    response.end('equipment list');
  } else if (request.url === '/opaque' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('equipment list');
  } else if (request.url === '/options' && request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Methods': 'GET' });
    response.end();
  } else if (request.url === '/head' && request.method === 'HEAD') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end();
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('no fixture');
  }
});
let address;
const observations = [];
try {
  await new Promise((resolve, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', resolve); });
  address = listener.address();
  for (const [path, method] of [['/visible', 'GET'], ['/opaque', 'GET'], ['/options', 'OPTIONS'], ['/head', 'HEAD'], ['/missing', 'GET']]) {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method, signal: AbortSignal.timeout(3000) });
    observations.push({ path, method, status: response.status, origin: response.headers.get('access-control-allow-origin'), credentials: response.headers.get('access-control-allow-credentials'), vary: response.headers.get('vary'), allowMethods: response.headers.get('access-control-allow-methods'), body: await response.text() });
  }
  assert.deepEqual(observations, [
    { path: '/visible', method: 'GET', status: 200, origin: 'https://reader.example', credentials: 'true', vary: 'Origin', allowMethods: null, body: 'equipment list' },
    { path: '/opaque', method: 'GET', status: 200, origin: null, credentials: null, vary: null, allowMethods: null, body: 'equipment list' },
    { path: '/options', method: 'OPTIONS', status: 204, origin: null, credentials: null, vary: null, allowMethods: 'GET', body: '' },
    { path: '/head', method: 'HEAD', status: 200, origin: null, credentials: null, vary: null, allowMethods: null, body: '' },
    { path: '/missing', method: 'GET', status: 404, origin: null, credentials: null, vary: null, allowMethods: null, body: 'no fixture' }
  ]);
} finally {
  listener.closeAllConnections();
  await new Promise((resolve, reject) => listener.close(error => error && error.code !== 'ERR_SERVER_NOT_RUNNING' ? reject(error) : resolve()));
}
assert.equal(listener.listening, false);
let refused = false;
let refusalCode;
try {
  await fetch(`http://127.0.0.1:${address.port}/visible`, { signal: AbortSignal.timeout(1000) });
} catch (error) {
  refusalCode = error.cause?.code;
  assert.equal(refusalCode, 'ECONNREFUSED', 'A timeout or another fetch fault does not prove a refused connection');
  refused = true;
}
assert.equal(refused, true);
console.log(JSON.stringify({ example: '04', scope: 'actual five loopback HTTP exchanges and owned listener cleanup', observations, listenerClosed: !listener.listening, laterConnectionRefused: refused, refusalCode, result: 'PASS_NEUTRAL_HTTP_WITNESSES', limit: 'Node fetch, not browser CORS, cache, cookie sending, request-token defence, authentication or TLS' }));
