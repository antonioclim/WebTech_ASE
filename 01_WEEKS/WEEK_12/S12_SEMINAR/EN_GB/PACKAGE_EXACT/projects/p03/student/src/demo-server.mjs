import { WebSocketServer } from "ws";

export async function startDemoServer() {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  server.on("connection", (socket) => {
    socket.on("message", (frame) => {
      let command;
      try { command = JSON.parse(frame.toString()); } catch { return; }
      if (command.type !== "calculation") return;
      const delay = Number(command.payload?.delay) || 0;
      setTimeout(() => socket.send(JSON.stringify({ type: "calculation.completed", requestId: command.requestId, result: Number(command.payload?.value) * 2 })), delay);
    });
  });
  const { port } = server.address();
  return Object.freeze({ url: `ws://127.0.0.1:${port}`, close: () => new Promise((resolve) => server.close(resolve)) });
}
