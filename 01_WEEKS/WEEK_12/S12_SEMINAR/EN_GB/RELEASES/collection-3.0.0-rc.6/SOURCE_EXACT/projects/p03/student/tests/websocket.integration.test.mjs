import assert from "node:assert/strict";
import test from "node:test";
import WebSocket from "ws";
import { startDemoServer } from "../src/demo-server.mjs";
import { publicError } from "../src/public-errors.mjs";
import { createRequestDispatcher } from "../src/request-dispatcher.mjs";
import { createWebSocketTransport } from "../src/websocket-transport.mjs";

test("the dispatcher correlates out-of-order replies over a real WebSocket", async (t) => {
  const server = await startDemoServer();
  const socket = new WebSocket(server.url);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const transport = createWebSocketTransport(socket);
  let sequence = 0;
  const dispatcher = createRequestDispatcher({ transport, nextId: () => `ws-${++sequence}`, makeError: publicError });
  t.after(async () => { dispatcher.dispose(); transport.dispose(); await new Promise((resolve) => { if (socket.readyState === socket.CLOSED) return resolve(); socket.addEventListener("close", resolve, { once: true }); socket.close(); }); await server.close(); });
  const slow = dispatcher.dispatch("calculation", { value: 2, delay: 30 });
  const fast = dispatcher.dispatch("calculation", { value: 5, delay: 1 });
  assert.deepEqual(await Promise.all([slow, fast]), [4, 10]);
  assert.equal(dispatcher.pendingCount, 0);
});
