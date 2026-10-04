import WebSocket from "ws";
import { startDemoServer } from "./src/demo-server.mjs";
import { publicError } from "./src/public-errors.mjs";
import { createRequestDispatcher } from "./src/request-dispatcher.mjs";
import { createWebSocketTransport } from "./src/websocket-transport.mjs";

let sequence = 0;
const server = await startDemoServer();
const socket = new WebSocket(server.url);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const transport = createWebSocketTransport(socket);
const dispatcher = createRequestDispatcher({ transport, nextId: () => `request-${++sequence}`, makeError: publicError });
try {
  const results = await Promise.all([
    dispatcher.dispatch("calculation", { value: 2, delay: 20 }),
    dispatcher.dispatch("calculation", { value: 5, delay: 1 })
  ]);
  console.log(JSON.stringify({ transport: "websocket", results, pending: dispatcher.pendingCount }));
} finally {
  dispatcher.dispose(); transport.dispose();
  await new Promise((resolve) => { socket.addEventListener("close", resolve, { once: true }); socket.close(); });
  await server.close();
}
