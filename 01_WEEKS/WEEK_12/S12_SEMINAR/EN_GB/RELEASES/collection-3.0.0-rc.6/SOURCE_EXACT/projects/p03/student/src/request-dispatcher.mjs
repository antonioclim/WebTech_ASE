export function createRequestDispatcher({ transport, makeError }) {
  let disposed = false;
  const offMessage = transport.onMessage(() => {});
  const offClose = transport.onClose(() => {});

  function dispatch() {
    if (disposed) return Promise.reject(makeError("dispatcher_disposed"));
    const error = new Error("The dispatcher is unavailable");
    error.code = "dispatcher_unavailable";
    return Promise.reject(error);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    offMessage();
    offClose();
  }

  return Object.freeze({ dispatch, dispose, get pendingCount() { return 0; } });
}
