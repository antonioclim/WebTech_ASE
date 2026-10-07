import {createServer} from 'node:http';

const ownedListeners = new WeakMap();
const REQUEST_TIMEOUT_MS = 10000;
const CLOSE_GRACE_MS = 1000;
const CLOSE_DEADLINE_MS = 2000;

export function json(response, status, body, headers = {}) {
  response.writeHead(status, {'content-type': 'application/json; charset=utf-8', ...headers});
  response.end(body === null ? '' : JSON.stringify(body));
}

function rejectRequest(response) {
  if (response.destroyed) return;
  if (response.headersSent || response.writableEnded) {
    response.destroy();
    return;
  }
  try {
    json(response, 500, {error: 'internal_error'});
  } catch {
    response.destroy();
  }
}

export async function listen(handler) {
  if (typeof handler !== 'function') throw Error('INVALID_OWNED_HANDLER');
  const server = createServer({
    requestTimeout: REQUEST_TIMEOUT_MS,
    headersTimeout: REQUEST_TIMEOUT_MS,
    connectionsCheckingInterval: 1000
  }, (request, response) => {
    Promise.resolve().then(() => handler(request, response)).catch(() => rejectRequest(response));
  });
  const state = {sockets: new Set(), listenerClosed: false, closePromise: null, checkDrained: null};
  ownedListeners.set(server, state);
  server.on('connection', socket => {
    state.sockets.add(socket);
    socket.once('close', () => {
      state.sockets.delete(socket);
      state.checkDrained?.();
    });
  });
  server.once('close', () => {
    state.listenerClosed = true;
    state.checkDrained?.();
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  return {server, origin: `http://127.0.0.1:${server.address().port}`};
}

export function close(server) {
  const state = ownedListeners.get(server);
  if (!state) return Promise.reject(Error('OWNED_LISTENER_REQUIRED'));
  if (state.closePromise) return state.closePromise;
  state.closePromise = new Promise((resolve, reject) => {
    let settled = false;
    let forceTimer;
    let deadlineTimer;
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(forceTimer);
      clearTimeout(deadlineTimer);
      state.checkDrained = null;
      if (error) reject(error);
      else resolve();
    };
    state.checkDrained = () => {
      if (state.listenerClosed && state.sockets.size === 0) finish();
    };
    forceTimer = setTimeout(() => {
      // Only sockets accepted by this listener are owned by this operation.
      for (const socket of state.sockets) socket.destroy();
      state.checkDrained?.();
    }, CLOSE_GRACE_MS);
    deadlineTimer = setTimeout(() => finish(Error('OWNED_LISTENER_CLOSE_TIMEOUT')), CLOSE_DEADLINE_MS);
    forceTimer.unref();
    deadlineTimer.unref();
    try {
      server.close(error => {
        if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') finish(error);
        else state.checkDrained?.();
      });
      server.closeIdleConnections?.();
      state.checkDrained();
    } catch (error) {
      finish(error);
    }
  });
  return state.closePromise;
}

export async function exchanges(handler, requests) {
  const {server, origin} = await listen(handler);
  try {
    const rows = [];
    for (const request of requests) {
      const response = await fetch(origin + request.path, {
        method: request.method || 'GET',
        headers: request.headers,
        body: request.body,
        signal: AbortSignal.timeout(2500),
        redirect: 'error'
      });
      rows.push({method: request.method || 'GET', path: request.path, status: response.status,
        headers: Object.fromEntries(response.headers), body: await response.text()});
    }
    return {origin, rows, listenerStoppedInFinally: true};
  } finally {
    await close(server);
  }
}

export async function runOwned(handler) {
  const {server, origin} = await listen(handler);
  let stopping;
  const stop = () => {
    if (stopping) return stopping;
    stopping = (async () => {
      try {
        await close(server);
        console.log('STOPPED_OWNED_LISTENER');
      } catch (error) {
        console.error('STOP_CLEANUP_UNKNOWN ' + error.message);
        process.exitCode = 1;
      } finally {
        process.off('SIGINT', stop);
        process.off('SIGTERM', stop);
      }
    })();
    return stopping;
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  console.log('READY ' + origin);
  console.log('Classroom loopback listener only. Ctrl+C once in this terminal; wait for STOPPED.');
}
