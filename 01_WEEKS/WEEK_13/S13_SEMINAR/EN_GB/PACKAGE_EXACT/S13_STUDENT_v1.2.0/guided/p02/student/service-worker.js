const VERSION = 1;
const CACHE_PREFIX = "course-sw-dispatcher-";
const CACHE_NAME = `${CACHE_PREFIX}v${VERSION}`;

self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE_NAME)); self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil((async () => { const names = await caches.keys(); await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name))); await self.clients.claim(); })()); });
self.addEventListener("fetch", () => {});
self.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.type !== "task.request" || message.version !== VERSION || typeof message.requestId !== "string" || typeof message.url !== "string" || !event.source) return;
  event.waitUntil((async () => {
    try {
      const url = new URL(message.url);
      if (url.origin !== self.location.origin || !/^\/api\/tasks\/[a-zA-Z0-9_-]{1,80}$/.test(url.pathname)) throw new Error("invalid target");
      const response = await fetch(url, { method: "GET" });
      const body = await response.json();
      if (!response.ok) throw new Error("task request failed");
      event.source.postMessage({ type: "task.response", version: VERSION, requestId: message.requestId, data: body.data });
    } catch { event.source.postMessage({ type: "task.failed", version: VERSION, requestId: message.requestId, error: { code: "task_failed", message: "Task request failed" } }); }
  })());
});
