export function createFakeTransport({ onSend } = {}) {
  const messageListeners = new Set();
  const closeListeners = new Set();
  const sent = [];
  return Object.freeze({
    send(command) { sent.push(structuredClone(command)); return onSend?.(command, this); },
    onMessage(listener) { messageListeners.add(listener); return () => messageListeners.delete(listener); },
    onClose(listener) { closeListeners.add(listener); return () => closeListeners.delete(listener); },
    emitMessage(message) { for (const listener of [...messageListeners]) listener(structuredClone(message)); },
    emitClose() { for (const listener of [...closeListeners]) listener(); },
    sent: () => structuredClone(sent),
    diagnostics: () => Object.freeze({ messageListeners: messageListeners.size, closeListeners: closeListeners.size })
  });
}
