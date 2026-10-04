// Supplied author derivation: parsing and callback fault ownership are distinct.
export function createWebSocketTransport(socket, { onCallbackError = () => {} } = {}) {
  const messageListeners = new Set(), closeListeners = new Set();
  let disposed = false, malformedFrames = 0, callbackFaults = 0;
  function report(error) { callbackFaults++; try { onCallbackError(error); } catch { /* Reporting failure cannot prevent other listeners. */ } }
  function handleMessage(event) {
    let message;
    try { message = JSON.parse(String(event.data)); }
    catch { malformedFrames++; return; }
    for (const listener of [...messageListeners]) { try { listener(message); } catch (error) { report(error); } }
  }
  function handleClose() { for (const listener of [...closeListeners]) { try { listener(); } catch (error) { report(error); } } }
  socket.addEventListener("message", handleMessage);
  socket.addEventListener("close", handleClose);
  return Object.freeze({
    send(command) { if (disposed || socket.readyState !== socket.OPEN) throw new Error("Transport is unavailable"); socket.send(JSON.stringify(command)); },
    onMessage(listener) { if (disposed) throw new Error("Transport is disposed"); messageListeners.add(listener); return () => messageListeners.delete(listener); },
    onClose(listener) { if (disposed) throw new Error("Transport is disposed"); closeListeners.add(listener); return () => closeListeners.delete(listener); },
    dispose() { if (disposed) return; disposed = true; socket.removeEventListener("message", handleMessage); socket.removeEventListener("close", handleClose); messageListeners.clear(); closeListeners.clear(); },
    diagnostics() { return Object.freeze({ messageListeners: messageListeners.size, closeListeners: closeListeners.size, socketListenersOwned: disposed ? 0 : 2, malformedFrames, callbackFaults, disposed }); }
  });
}
