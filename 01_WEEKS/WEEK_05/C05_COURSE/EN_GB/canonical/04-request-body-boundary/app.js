import express from "express";

const validateCreateTask = (body) => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, reason: "object_required" };
  if (Object.keys(body).some((field) => field !== "title")) return { ok: false, reason: "unknown_field" };
  if (typeof body.title !== "string" || body.title.trim() === "") return { ok: false, reason: "title_required" };
  return { ok: true, value: { title: body.title.trim() } };
};

export function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/api/tasks", (request, response) => {
    if (!request.is("application/json")) return response.status(415).json({ error: { code: "unsupported_media_type", message: "Content-Type must be application/json" } });
    const result = validateCreateTask(request.body);
    if (!result.ok) return response.status(400).json({ error: { code: "validation_failed", message: result.reason } });
    response.status(201).json({ data: { id: "t-1", ...result.value } });
  });

  return app;
}

