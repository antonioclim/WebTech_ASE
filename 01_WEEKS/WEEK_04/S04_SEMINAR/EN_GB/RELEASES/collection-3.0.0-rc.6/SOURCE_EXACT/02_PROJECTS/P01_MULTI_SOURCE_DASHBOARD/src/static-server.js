import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleControlRequest } from '../../tools/control-protocol.mjs';

const root = new URL('../public/', import.meta.url);
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const project = 'P01';

export function createStaticServer() {
  return createServer(async (req, res) => {
    if (handleControlRequest(req, res, project)) return;
    try {
      const pathname = new URL(req.url ?? '/', 'http://127.0.0.1').pathname;
      const relative = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[/\\]+/, '');
      const file = new URL(relative, root);
      if (!file.href.startsWith(root.href)) throw new Error('outside');
      const body = await readFile(file);
      const type = types[extname(relative)] ?? 'application/octet-stream';
      res.writeHead(200, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      res.end('{"error":"not_found"}');
    }
  });
}
export async function listen(server, port = 0) {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return `http://127.0.0.1:${server.address().port}`;
}
if (process.argv[1] && resolvePath(process.argv[1]) === resolvePath(fileURLToPath(import.meta.url))) {
  const server=createStaticServer();
  console.log(`Dashboard: ${await listen(server, Number(process.env.PORT ?? 0))}`);
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
