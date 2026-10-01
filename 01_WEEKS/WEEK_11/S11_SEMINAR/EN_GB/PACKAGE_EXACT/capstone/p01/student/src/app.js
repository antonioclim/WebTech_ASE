import express from "express";
import { createAuthentication } from "./authentication.js";
import { requireCredentialWriteBoundary } from "./request-security.js";

export function createApp({ users, sessions, passwordVerifier, production = false, trustedOrigin } = {}) {
  const app = express();
  app.use(express.json());
  const authentication = createAuthentication({ users, sessions, passwordVerifier, secureCookies: production });
  app.get("/health", (_request, response) => response.json({ data: { status: "ok" } }));
  app.use("/api/session", requireCredentialWriteBoundary({ production, trustedOrigin }), authentication.router);
  app.get("/api/me", authentication.requireUser, (request, response) => response.json({ data: request.principal }));
  app.use((_request, response) => response.status(404).json({ error: { code: "not_found", message: "Route not found" } }));
  app.use((error, _request, response, _next) => { if (error instanceof SyntaxError && "body" in error) return response.status(400).json({ error: { code: "invalid_json", message: "Malformed JSON" } }); response.status(500).json({ error: { code: "internal_error", message: "Internal server error" } }); });
  return app;
}
