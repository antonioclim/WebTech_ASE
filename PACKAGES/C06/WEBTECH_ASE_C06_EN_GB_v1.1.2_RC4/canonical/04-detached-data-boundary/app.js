import express from "express";
import { DataTypes, Sequelize } from "sequelize";

function serializeNote(note) {
  const plain = note.get({ plain: true });
  return { id: plain.id, title: plain.title, archived: plain.archived, links: { self: `/api/notes/${plain.id}` } };
}

export async function createApplication() {
  const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
  const Note = sequelize.define("Note", {
    title: { type: DataTypes.STRING, allowNull: false },
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    internalReview: { type: DataTypes.STRING, allowNull: true },
  }, { timestamps: true, tableName: "notes" });
  await sequelize.sync();
  await Note.create({ title: "Public note", internalReview: "staff-only draft marker" });

  const app = express();
  app.get("/api/notes/:noteId", async (request, response, next) => {
    try {
      const note = await Note.findByPk(request.params.noteId);
      if (!note) return response.status(404).json({ error: { code: "note_not_found" } });
      response.json({ data: serializeNote(note) });
    } catch (error) { next(error); }
  });
  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: { code: "internal_error" } });
  });
  return { app, Note, close: () => sequelize.close() };
}
