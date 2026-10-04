import express from "express";
import { requireAuthentication } from "./authentication.js";
import { authorize as defaultAuthorize } from "./authorization-policy.js";
import { requireCsrf } from "./csrf.js";

export function createApp({ repository, authorize = defaultAuthorize }) {
  const app = express();
  app.use(express.json());
  app.get("/health", (_request, response) => response.json({ data: { status: "ok" } }));
  const loadResource = (id) => repository.findById(id);
  const protect = (options) => [requireAuthentication, requireCsrf, authorize({ ...options, loadResource })];

  app.get("/api/reports/:reportId", ...protect({ action: "report:read", concealMissingOrForbidden: true }), (request, response) => response.json({ data: request.authorizedResource }));
  app.post("/api/reports/:reportId/submit", ...protect({ action: "report:submit", concealMissingOrForbidden: true }), async (request, response, next) => { try { if (request.authorizedResource.status !== "draft") return response.status(409).json({ error: { code: "invalid_report_state", message: "Report is not a draft" } }); response.json({ data: await repository.submit(request.authorizedResource.id) }); } catch (error) { next(error); } });
  app.post("/api/reports/:reportId/resolve", ...protect({ action: "report:resolve" }), async (request, response, next) => { try { if (request.authorizedResource.status !== "submitted") return response.status(409).json({ error: { code: "invalid_report_state", message: "Report is not submitted" } }); response.json({ data: await repository.resolve(request.authorizedResource.id) }); } catch (error) { next(error); } });
  app.delete("/api/reports/:reportId", ...protect({ action: "report:delete" }), async (request, response, next) => { try { if (request.authorizedResource.status !== "draft") return response.status(409).json({ error: { code: "invalid_report_state", message: "Report is not a draft" } }); await repository.remove(request.authorizedResource.id); response.status(204).end(); } catch (error) { next(error); } });
  app.use((_request, response) => response.status(404).json({ error: { code: "not_found", message: "Route not found" } }));
  app.use((error, _request, response, _next) => { if (error instanceof SyntaxError && "body" in error) return response.status(400).json({ error: { code: "invalid_json", message: "Malformed JSON" } }); response.status(500).json({ error: { code: "internal_error", message: "Internal server error" } }); });
  return app;
}
