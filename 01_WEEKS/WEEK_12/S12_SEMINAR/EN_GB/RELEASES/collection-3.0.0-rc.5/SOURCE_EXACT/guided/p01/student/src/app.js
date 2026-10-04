import express from "express";
import { authenticateHttp } from "./authentication.js";

// Validate the accepted command here so the coordinator only sees normalized, authenticated work.
function validateCommand(body) {
  if (!body || Object.keys(body).sort().join(",") !== "connectionId,operation,values" || body.operation !== "sum" || typeof body.connectionId !== "string" || !body.connectionId.trim() || body.connectionId.length > 80 || !Array.isArray(body.values) || body.values.length < 1 || body.values.length > 100 || body.values.some((value) => typeof value !== "number" || !Number.isFinite(value))) return null;
  return { operation: body.operation, connectionId: body.connectionId.trim(), values: [...body.values] };
}

export function createApp({ coordinator }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.post("/api/calculations", authenticateHttp, (request, response, next) => {
    const command = validateCommand(request.body);
    if (!command) return response.status(400).json({ error: { code: "validation_failed", message: "A sum command with finite values and connectionId is required" } });
    try {
      const acceptance = coordinator.accept({ principal: request.principal, ...command });
      response.location(`/api/calculations/${acceptance.requestId}`).status(202).json({ data: acceptance });
    } catch (error) { next(error); }
  });
  app.use((_request, response) => response.status(404).json({ error: { code: "not_found", message: "Route not found" } }));
  app.use((error, _request, response, _next) => { const status = Number.isInteger(error.status) ? error.status : 500; response.status(status).json({ error: { code: status === 500 ? "internal_error" : error.code, message: status === 500 ? "Unexpected server error" : error.message } }); });
  return app;
}
