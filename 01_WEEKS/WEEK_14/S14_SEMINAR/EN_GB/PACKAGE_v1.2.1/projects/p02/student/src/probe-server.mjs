import { createServer } from "node:http";

export function createProbeServer({ delays = new Map(), applicationFailures = new Set(), transportFailures = new Set() } = {}) {
  return createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname !== "/api/checklists" || request.method !== "GET") { response.statusCode = 404; response.end(JSON.stringify({ error: { code: "route_not_found", message: "Route not found" } })); return; }
    const sample = Number(url.searchParams.get("sample"));
    const finish = () => {
      if (transportFailures.has(sample)) { request.socket.destroy(); return; }
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.statusCode = applicationFailures.has(sample) ? 503 : 200;
      response.end(JSON.stringify(applicationFailures.has(sample) ? { error: { code: "temporarily_unavailable", message: "Try later" } } : { data: [{ id: "c-1", completed: false }] }));
    };
    const delay = delays.get(sample) ?? 0;
    if (delay > 0) setTimeout(finish, delay); else finish();
  });
}
