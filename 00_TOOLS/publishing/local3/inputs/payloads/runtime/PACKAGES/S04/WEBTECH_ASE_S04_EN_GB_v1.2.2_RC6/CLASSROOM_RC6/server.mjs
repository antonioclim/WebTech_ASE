import {runOwned, json} from './http.mjs';
import {readFileSync} from 'node:fs';

const routes = {
  '/': ['index.html', 'text/html'],
  '/browser.mjs': ['browser.mjs', 'text/javascript'],
  '/targets/p01.mjs': ['targets/p01.mjs', 'text/javascript'],
  '/targets/p02.mjs': ['targets/p02.mjs', 'text/javascript']
};
const data = {
  '/data/profile.json': {name: 'Ada'},
  '/data/tasks.json': [{status: 'open'}, {status: 'done'}, {status: 'open'}],
  '/data/notices.json': ['Check']
};

export async function serve() {
  await runOwned((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (request.method !== 'GET') {
      json(response, 405, {error: 'method'});
      return;
    }
    if (Object.hasOwn(data, url.pathname)) {
      json(response, 200, data[url.pathname]);
      return;
    }
    const route = routes[url.pathname];
    if (!route) {
      json(response, 404, {error: 'not_found'});
      return;
    }
    const body = readFileSync(new URL(route[0], import.meta.url));
    response.writeHead(200, {'content-type': route[1], 'cache-control': 'no-store'});
    response.end(body);
  });
}
