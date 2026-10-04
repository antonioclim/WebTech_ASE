import express from "express";

const principals = new Map([["s-owner", { id: "u1", role: "member" }], ["s-other", { id: "u2", role: "member" }], ["s-moderator", { id: "u3", role: "moderator" }]]);
const reports = new Map([["r1", { id: "r1", ownerId: "u1", status: "open" }]]);

export function createApp() {
  const app = express(); app.use(express.json());
  app.use((req, _res, next) => { req.principal = principals.get(req.get("x-session-id")) ?? null; next(); });
  app.param("reportId", (req, res, next, id) => { req.report = reports.get(id); return req.report ? next() : res.status(404).json({ error: "not_found" }); });
  const requireUser = (req, res, next) => req.principal ? next() : res.status(401).json({ error: "authentication_required" });
  const mayRead = (req, res, next) => req.principal.id === req.report.ownerId || req.principal.role === "moderator" ? next() : res.status(403).json({ error: "forbidden" });
  const mayResolve = (req, res, next) => req.principal.role === "moderator" ? next() : res.status(403).json({ error: "forbidden" });
  app.get("/reports/:reportId", requireUser, mayRead, (req, res) => res.json(req.report));
  app.patch("/reports/:reportId/resolve", requireUser, mayResolve, (req, res) => { req.report.status = "resolved"; res.json(req.report); });
  return app;
}
if (import.meta.url === `file://${process.argv[1]}`) createApp().listen(3000, () => console.log("Authorization service: http://localhost:3000"));
