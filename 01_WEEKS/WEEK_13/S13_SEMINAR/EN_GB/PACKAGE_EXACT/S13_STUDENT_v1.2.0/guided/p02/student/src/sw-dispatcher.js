const taskPath = /^\/api\/tasks\/[a-zA-Z0-9_-]{1,80}$/;

// The student starter preserves safe fallback behavior until the controlled-dispatch protocol is implemented.
export function createServiceWorkerDispatcher({ container, registerWorker, directFetch, origin }) {
  let disposed = false;
  const onMessage = () => {};
  const onControllerChange = () => {};
  container.addEventListener("message", onMessage);
  container.addEventListener("controllerchange", onControllerChange);

  async function request(url, { method = "GET" } = {}) {
    if (disposed) throw Object.assign(new Error("Dispatcher is disposed"), { code: "dispatcher_disposed" });
    let target;
    try { target = new URL(url, origin); } catch { return directFetch(url, { method }); }
    if (method !== "GET" || target.origin !== origin || !taskPath.test(target.pathname)) return directFetch(url, { method });
    await registerWorker(container);
    if (!container.controller) return directFetch(target.href, { method });
    throw Object.assign(new Error("Controlled Service Worker dispatch is unavailable"), { code: "sw_dispatch_unavailable" });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    container.removeEventListener("message", onMessage);
    container.removeEventListener("controllerchange", onControllerChange);
  }

  return Object.freeze({ request, dispose, get diagnostics() { return Object.freeze({ pendingCount: 0, controlled: Boolean(container.controller) }); } });
}
