export function createWebSocketTransport(socket) {
  const messageListeners = new Set();
  const closeListeners = new Set();

  function handleMessage(event) {
    try {
      const message = JSON.parse(String(event.data));
      for (const listener of [...messageListeners]) listener(message);
    } catch {
      // Malformed frames do not belong to a pending request and are ignored.
    }
  }

  function handleClose() {
    for (const listener of [...closeListeners]) listener();
  }

  socket.addEventListener("message", handleMessage);
  socket.addEventListener("close", handleClose);

  return Object.freeze({
    send(command) {
      if (socket.readyState !== socket.OPEN) throw new Error("WebSocket is not open");
      socket.send(JSON.stringify(command));
    },
    onMessage(listener) { messageListeners.add(listener); return () => messageListeners.delete(listener); },
    onClose(listener) { closeListeners.add(listener); return () => closeListeners.delete(listener); },
    dispose() {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("close", handleClose);
      messageListeners.clear();
      closeListeners.clear();
    }
  });
}
