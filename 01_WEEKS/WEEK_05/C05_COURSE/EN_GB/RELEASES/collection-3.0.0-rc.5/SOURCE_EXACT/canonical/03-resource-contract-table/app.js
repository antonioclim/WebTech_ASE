import express from "express";

export function createApp() {
  const app = express();
  const tasks = new Map([["t-1", { id: "t-1", title: "Inspect HTTP semantics" }]]);
  let nextId = 2;
  app.use(express.json());

  app.get("/api/tasks", (_request, response) => response.json({ data: [...tasks.values()] }));
  app.get("/api/tasks/:taskId", (request, response) => {
    const task = tasks.get(request.params.taskId);
    return task ? response.json({ data: task }) : response.status(404).json({ error: { code: "task_not_found", message: "Task not found" } });
  });
  app.post("/api/tasks", (request, response) => {
    const task = { id: `t-${nextId++}`, title: request.body.title };
    tasks.set(task.id, task);
    response.location(`/api/tasks/${task.id}`).status(201).json({ data: task });
  });
  app.delete("/api/tasks/:taskId", (request, response) => {
    if (!tasks.delete(request.params.taskId)) return response.status(404).json({ error: { code: "task_not_found", message: "Task not found" } });
    response.status(204).end();
  });
  return app;
}

