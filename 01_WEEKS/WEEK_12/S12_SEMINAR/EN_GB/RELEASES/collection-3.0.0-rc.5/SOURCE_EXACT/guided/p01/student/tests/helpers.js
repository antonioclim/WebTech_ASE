import { once } from "node:events";
import WebSocket from "ws";
import { createSystem } from "../src/system.js";

export async function withSystem(run, options = {}) {
  const system = createSystem(options);
  system.server.listen(0, "127.0.0.1");
  await once(system.server, "listening");
  const port = system.server.address().port;
  try { await run({ ...system, httpUrl: `http://127.0.0.1:${port}`, wsUrl: `ws://127.0.0.1:${port}` }); }
  finally { for (const client of system.sockets.clients) client.terminate(); system.sockets.close(); system.server.close(); await once(system.server, "close"); }
}

export async function connect(wsUrl, session, connectionId) {
  const socket = new WebSocket(`${wsUrl}/replies?session=${session}`);
  await once(socket, "open");
  socket.send(JSON.stringify({ type: "register", connectionId }));
  const [data] = await once(socket, "message");
  return { socket, registered: JSON.parse(data.toString()) };
}

export function nextMessage(socket) { return once(socket, "message").then(([data]) => JSON.parse(data.toString())); }
export const post = (httpUrl, session, body) => fetch(`${httpUrl}/api/calculations`, { method: "POST", headers: { "x-session-id": session, "content-type": "application/json" }, body: JSON.stringify(body) });
