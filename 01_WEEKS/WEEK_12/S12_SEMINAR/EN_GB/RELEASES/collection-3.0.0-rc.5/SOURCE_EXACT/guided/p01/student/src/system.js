import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createApp } from "./app.js";
import { principalForSession } from "./authentication.js";
import { runCalculation } from "./calculation.js";
import { createReplyCoordinator } from "./reply-coordinator.js";

export function createSystem(options = {}) {
  const coordinator = createReplyCoordinator({ runCalculation: options.runCalculation ?? runCalculation, nextRequestId: options.nextRequestId ?? (() => randomBytes(12).toString("hex")) });
  const server = createServer(createApp({ coordinator }));
  const sockets = new WebSocketServer({ noServer: true });
  server.on("upgrade", (request, networkSocket, head) => {
    const url = new URL(request.url, "http://localhost");
    const principal = url.pathname === "/replies" ? principalForSession(url.searchParams.get("session")) : null;
    if (!principal) { networkSocket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n"); networkSocket.destroy(); return; }
    sockets.handleUpgrade(request, networkSocket, head, (socket) => coordinator.attachSocket(socket, principal));
  });
  return { server, sockets, coordinator };
}
