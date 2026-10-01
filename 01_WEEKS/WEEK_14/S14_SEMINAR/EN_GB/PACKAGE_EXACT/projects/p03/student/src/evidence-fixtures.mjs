const cleanLog = JSON.stringify({ timestamp: "2026-08-10T12:00:00.000Z", level: "info", event: "request.completed", requestId: "req-1", method: "GET", path: "/health", status: 200 });

export function createEvidence(defect = null) {
  const evidence = {
    inventory: ["package.json", "package-lock.json", "src/server.mjs", "dist/server.mjs", ".gitignore"],
    commands: {
      install: { ok: true, locked: true },
      audit: { ok: true, vulnerabilities: [] },
      build: { ok: true, artifacts: ["dist/server.mjs"] },
      runtime: { ok: true, healthStatus: 200, body: { status: "ok" }, closed: true }
    },
    logs: [cleanLog],
    config: { required: ["SESSION_SECRET"], suppliedByEnvironment: ["SESSION_SECRET"], ignored: [".env", "*.db", "dist/"], trackedSecretFiles: [] },
    http: { errorShape: true, headers: { "content-security-policy": "default-src 'none'", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" } },
    deployment: { tls: null, reverseProxy: null },
    exceptions: []
  };
  if (defect === "failed-build") evidence.commands.build = { ok: false, artifacts: [] };
  if (defect === "unhealthy-runtime") evidence.commands.runtime = { ok: false, healthStatus: 503, body: { status: "down" }, closed: true };
  if (defect === "leaked-authorization-log") evidence.logs = [JSON.stringify({ ...JSON.parse(cleanLog), authorization: "Bearer seeded-secret-value" })];
  if (defect === "committed-secret") evidence.config.trackedSecretFiles = [{ path: ".env", kind: "credential" }];
  if (defect === "missing-header") delete evidence.http.headers["content-security-policy"];
  if (defect === "audit-tool-failure") evidence.commands.audit = { ok: false, toolError: true };
  return evidence;
}
