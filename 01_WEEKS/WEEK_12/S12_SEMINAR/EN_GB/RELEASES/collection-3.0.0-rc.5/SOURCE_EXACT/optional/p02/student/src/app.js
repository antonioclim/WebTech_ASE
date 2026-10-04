import express from "express";
import { authenticate } from "./authentication.js";

function validBody(body) {
  return body && Object.keys(body).join(",") === "reportId" && typeof body.reportId === "string" && body.reportId.trim() && body.reportId.length <= 80 ? body.reportId.trim() : null;
}

export function createApp({ lifecycle }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.post("/api/exports", authenticate, async (request, response, next) => { const reportId = validBody(request.body); if (!reportId) return response.status(400).json({ error: { code: "validation_failed", message: "A valid reportId is required" } }); try { const acceptance = await lifecycle.enqueue({ principal: request.principal, reportId }); response.location(`/api/exports/${acceptance.jobId}`).status(202).json({ data: acceptance }); } catch (error) { next(error); } });
  app.get("/api/exports/:jobId", authenticate, (request, response) => { const record = lifecycle.findForOwner(request.params.jobId, request.principal.id); if (!record) return response.status(404).json({ error: { code: "export_not_found", message: "Export not found" } }); response.json({ data: record }); });
  app.use((_request, response) => response.status(404).json({ error: { code: "not_found", message: "Route not found" } }));
  app.use((error, _request, response, _next) => { const status = Number.isInteger(error.status) ? error.status : 500; response.status(status).json({ error: { code: status === 500 ? "internal_error" : error.code, message: status === 500 ? "Unexpected server error" : error.message } }); });
  return app;
}
