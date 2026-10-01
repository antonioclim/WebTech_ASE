import { Router } from "express";

export function createAuthentication() {
  const router = Router();
  router.post("/", (_request, response) => response.status(503).json({ error: { code: "authentication_unavailable", message: "Authentication not implemented" } }));
  router.delete("/", (_request, response) => response.status(204).end());
  function requireUser(_request, response) {
    response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
  }
  return { router, requireUser };
}
