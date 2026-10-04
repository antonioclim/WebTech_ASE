/* C04 derived, read-only loopback helper for the exact canonical event page.
   No directory serving, uploads, dependencies or automatic browser launch. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const pageURL = new URL('../canonical/05-delegated-event-boundary/index.html', import.meta.url);
export async function createEventServer() {
  const page = await readFile(pageURL);
  const landing = Buffer.from('<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>C04 canonical event example</title><h1>C04 canonical event example</h1><p>Local HTTP only. No browser acceptance is implied by this server.</p><p><a href="/event/">Open the original event page</a></p><p>The page performs an initial scripted click. That initial output is synthetic. Then compare a direct button activation with a nested-label click.</p><p>Stop the server using Ctrl+C in its terminal.</p></html>');
  const payloads = new Map([['/', landing], ['/event/', page]]);
  return createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); res.end(); return; }
    // Exact URL allowlist: no traversal, queries, directory listing or file lookup.
    const data = payloads.get(req.url);
    if (!data) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Length':data.length});
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}
export async function start() {
  const server = await createEventServer();
  await new Promise((yes,no) => { server.once('error',no); server.listen(0,'127.0.0.1',yes); });
  const { port } = server.address();
  console.log(`READY http://127.0.0.1:${port}/`);
  console.log('Open that exact address manually. No browser has been launched or checked.');
  console.log('Stop: Ctrl+C in this terminal. No background service is installed.');
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once('SIGINT',stop); process.once('SIGTERM',stop);
  server.on('close', () => { process.removeListener('SIGINT',stop); process.removeListener('SIGTERM',stop); console.log('STOPPED: loopback listener closed.'); });
  return server;
}
const invoked = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (invoked) start().catch(error => { console.error('C04 server did not become ready:',error.message);process.exitCode=1; });
