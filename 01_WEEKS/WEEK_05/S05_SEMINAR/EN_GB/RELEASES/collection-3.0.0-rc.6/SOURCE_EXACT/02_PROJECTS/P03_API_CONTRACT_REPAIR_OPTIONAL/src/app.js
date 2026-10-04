import express from "express";
import { fileURLToPath } from "node:url";
import { apiErrorHandler, sendServiceOutcome } from "./http-contract.js";
import { createLegacyMeetingService } from "./legacy-meeting-service.js";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));

export function createApp({ service = createLegacyMeetingService() } = {}) {
  const app = express();
  app.use(express.json());
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.use(express.static(publicDirectory));

  app.get("/api/meetings", async (_request, response) => {
    sendServiceOutcome(response, await service.list());
  });
  app.post("/api/meetings", async (request, response) => {
    sendServiceOutcome(response, await service.create(request.body));
  });
  app.post("/api/meetings/:meetingId/accept", async (request, response) => {
    sendServiceOutcome(response, await service.accept(request.params.meetingId));
  });

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: "not_found", message: "Resource not found" },
    });
  });
  app.use(apiErrorHandler);
  return app;
}
