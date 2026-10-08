import express from "express";

const publicError = (status, code, message) => Object.assign(new Error(message), { status, code });

export function createApp({ log = () => {} } = {}) {
  const app = express();
  app.use(express.json());

  app.get("/api/tasks/:taskId", (request, _response, next) => next(publicError(404, "task_not_found", `Task ${request.params.taskId} was not found`)));
  app.get("/api/failure", () => { throw new Error("database password=secret"); });
  app.post("/api/tasks", (_request, response) => response.status(201).json({ data: {} }));

  app.use((error, _request, response, _next) => {
    log(error);
    if (error?.type === "entity.parse.failed") return response.status(400).json({ error: { code: "invalid_json", message: "Request body is not valid JSON" } });
    const status = Number.isInteger(error.status) ? error.status : 500;
    response.status(status).json({ error: { code: error.code ?? "internal_error", message: status === 500 ? "Internal server error" : error.message } });
  });

  return app;
}

