import express from "express";
import { DataTypes, Sequelize, UniqueConstraintError, ValidationError } from "sequelize";

export async function createApplication() {
  const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
  const Note = sequelize.define("Note", {
    title: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { notEmpty: true } },
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { timestamps: true, tableName: "notes" });
  await sequelize.sync();
  const app = express();
  app.use(express.json());

  app.get("/api/notes", async (_request, response, next) => {
    try { response.json({ data: await Note.findAll({ order: [["id", "ASC"]] }) }); }
    catch (error) { next(error); }
  });
  app.post("/api/notes", async (request, response, next) => {
    try {
      const note = await Note.create({ title: request.body.title });
      response.status(201).location(`/api/notes/${note.id}`).json({ data: note });
    } catch (error) { next(error); }
  });
  app.patch("/api/notes/:noteId", async (request, response, next) => {
    try {
      const note = await Note.findByPk(request.params.noteId);
      if (!note) return response.status(404).json({ error: { code: "note_not_found" } });
      if (Object.hasOwn(request.body, "title")) note.title = request.body.title;
      if (Object.hasOwn(request.body, "archived")) note.archived = request.body.archived;
      await note.save();
      response.json({ data: note });
    } catch (error) { next(error); }
  });
  app.delete("/api/notes/:noteId", async (request, response, next) => {
    try {
      const deleted = await Note.destroy({ where: { id: request.params.noteId } });
      response.status(deleted === 1 ? 204 : 404).end();
    } catch (error) { next(error); }
  });
  app.use((error, _request, response, _next) => {
    if (error instanceof UniqueConstraintError) return response.status(409).json({ error: { code: "title_conflict" } });
    if (error instanceof ValidationError) return response.status(400).json({ error: { code: "invalid_note" } });
    console.error(error);
    response.status(500).json({ error: { code: "internal_error" } });
  });
  return { app, close: () => sequelize.close() };
}
