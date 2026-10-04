import crypto from "node:crypto";
import express from "express";

export function createApp() {
  const app = express();
  const sessions = new Map();
  app.use(express.json());

  app.post("/login", (req, res) => {
    if (req.body?.username !== "alice") return res.status(401).json({ error: "invalid_credentials" });
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { userId: "u1", role: "member" });
    res.setHeader("Set-Cookie", `session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`);
    res.status(204).end();
  });

  app.use((req, _res, next) => {
    const sessionId = req.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
    req.sessionId = sessionId;
    req.principal = sessions.get(sessionId) ?? null;
    next();
  });

  app.get("/me", (req, res) => req.principal
    ? res.json({ principal: req.principal })
    : res.status(401).json({ error: "authentication_required" }));

  app.post("/logout", (req, res) => {
    if (req.sessionId) sessions.delete(req.sessionId);
    res.setHeader("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    res.status(204).end();
  });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) createApp().listen(3000, () => console.log("Session service: http://localhost:3000"));
