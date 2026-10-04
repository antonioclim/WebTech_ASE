export function createReplyCoordinator() {
  function attachSocket(socket) {
    socket.once("message", (data) => {
      let message;
      try { message = JSON.parse(data.toString()); } catch { socket.close(4403, "reply coordinator unavailable"); return; }
      if (message?.type === "register" && typeof message.connectionId === "string") socket.send(JSON.stringify({ type: "registered", connectionId: message.connectionId }));
      setImmediate(() => socket.close(4403, "reply coordinator unavailable"));
    });
  }

  function accept() {
    throw Object.assign(new Error("Reply coordinator unavailable"), { status: 503, code: "reply_coordinator_unavailable" });
  }

  return Object.freeze({
    attachSocket,
    accept,
    diagnostics: () => Object.freeze({ connectionCount: 0, pendingCount: 0 })
  });
}
