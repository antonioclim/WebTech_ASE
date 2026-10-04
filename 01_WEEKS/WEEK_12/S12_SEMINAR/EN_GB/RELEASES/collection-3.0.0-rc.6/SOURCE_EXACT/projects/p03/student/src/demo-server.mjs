// Supplied author derivation. Real network lane; excluded from core preflight.
import { WebSocketServer } from "ws";
const bound = (value, fallback) => Number.isInteger(value) && value > 0 && value <= 10000 ? value : fallback;
export async function startDemoServer({ port = 0, startupMs = 1500, cleanupMs = 1500 } = {}) {
  startupMs = bound(startupMs, 1500); cleanupMs = bound(cleanupMs, 1500);
  const server = new WebSocketServer({ host: "127.0.0.1", port });
  const scheduled = new Map();
  let closing = false;
  function clearSocket(socket) { const owned = scheduled.get(socket); if (!owned) return; for (const timer of owned) clearTimeout(timer); scheduled.delete(socket); }
  server.on("connection", socket => {
    if (closing) { socket.terminate(); return; }
    scheduled.set(socket, new Set());
    socket.once("close", () => clearSocket(socket));
    socket.on("error", () => clearSocket(socket));
    socket.on("message", frame => {
      let command; try { command = JSON.parse(frame.toString()); } catch { return; }
      if (closing || !command || command.type !== "calculation" || typeof command.requestId !== "string") return;
      const rawDelay = Number(command.payload?.delay), delay = Number.isFinite(rawDelay) ? Math.min(1000, Math.max(0, rawDelay)) : 0;
      const owned = scheduled.get(socket); if (!owned || owned.size >= 1000) { socket.close(1013, "Capacity limit"); return; }
      const timer = setTimeout(() => { owned.delete(timer); if (closing || socket.readyState !== socket.OPEN) return; try { socket.send(JSON.stringify({ type: "calculation.completed", requestId: command.requestId, result: Number(command.payload?.value) * 2 })); } catch { clearSocket(socket); socket.terminate(); } }, delay);
      owned.add(timer);
    });
  });
  let closePromise;
  function close() {
    if (closePromise) return closePromise;
    closing = true;
    for (const socket of [...scheduled.keys()]) clearSocket(socket);
    closePromise = new Promise((resolve, reject) => {
      let done = false;
      const deadline = setTimeout(() => { for (const socket of server.clients) socket.terminate(); finish(new Error("Demo cleanup deadline exceeded")); }, cleanupMs);
      function finish(error) { if (done) return; done = true; clearTimeout(deadline); error ? reject(error) : resolve(); }
      for (const socket of server.clients) socket.terminate();
      try { server.close(error => finish(error)); } catch (error) { finish(error); }
    });
    return closePromise;
  }
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error("Demo startup deadline exceeded")), startupMs);
      function finish(error) { clearTimeout(timer); server.off("listening", listen); server.off("error", fail); error ? reject(error) : resolve(); }
      function listen() { finish(); } function fail(error) { finish(error); }
      server.once("listening", listen); server.once("error", fail);
    });
  } catch (error) { try { await close(); } catch { /* Preserve the startup fault; no successful qualification is claimed. */ } throw error; }
  const { port: actualPort } = server.address();
  return Object.freeze({ url: `ws://127.0.0.1:${actualPort}`, close, diagnostics: () => ({ clients: server.clients.size, scheduledTimers: [...scheduled.values()].reduce((sum, timers) => sum + timers.size, 0), closing }) });
}
