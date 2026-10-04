import express from "express";

const initial = [{ id: "1", title: "Server state", body: "The API is authoritative." }];
const error = (res, status, code, message) => res.status(status).json({ error: { code, message } });
export function createNotesServer() {
  let notes = structuredClone(initial); let nextId = 2;
  const app = express(); app.use(express.json()); app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/notes", (_req, res) => res.json({ data: structuredClone(notes) }));
  app.post("/api/notes", (req, res) => { const body = req.body; if (!body || Object.keys(body).length !== 2 || typeof body.title !== "string" || !body.title.trim() || typeof body.body !== "string") return error(res, 400, "validation_failed", "Invalid note"); const note = { id: String(nextId++), title: body.title.trim(), body: body.body.trim() }; notes = [...notes, note]; return res.status(201).location(`/api/notes/${note.id}`).json({ data: structuredClone(note) }); });
  app.put("/api/notes/:id", (req, res) => { const index = notes.findIndex((note) => note.id === req.params.id); if (index < 0) return error(res, 404, "note_not_found", "Note not found"); const body = req.body; if (!body || Object.keys(body).length !== 2 || typeof body.title !== "string" || !body.title.trim() || typeof body.body !== "string") return error(res, 400, "validation_failed", "Invalid note"); const note = { id: notes[index].id, title: body.title.trim(), body: body.body.trim() }; notes = notes.map((current, position) => position === index ? note : current); return res.json({ data: structuredClone(note) }); });
  app.delete("/api/notes/:id", (req, res) => { const before = notes.length; notes = notes.filter((note) => note.id !== req.params.id); if (notes.length === before) return error(res, 404, "note_not_found", "Note not found"); return res.status(204).end(); });
  app.post("/api/testing/reset", (_req, res) => { notes = structuredClone(initial); nextId = 2; res.status(204).end(); });
  app.use("/api", (_req, res) => error(res, 404, "not_found", "Resource not found"));
  app.use((err, _req, res, next) => { if (res.headersSent) return next(err); if (err instanceof SyntaxError && err.type === "entity.parse.failed") return error(res, 400, "invalid_json", "Request body is not valid JSON"); return error(res, 500, "internal_error", "Internal server error"); });
  return app;
}
