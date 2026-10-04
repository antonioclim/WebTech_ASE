import express from "express";
import { DataTypes, QueryTypes, Sequelize } from "sequelize";

export async function createApplication() {
  const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
  const Note = sequelize.define("Note", {
    title: { type: DataTypes.STRING, allowNull: false },
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { timestamps: false, tableName: "notes" });
  await sequelize.sync();
  await Note.bulkCreate([
    { title: "First active note", archived: false },
    { title: "Second active note", archived: false },
    { title: "Archived note", archived: true },
  ]);

  const app = express();
  app.get("/api/reports/note-summary", async (request, response, next) => {
    try {
      if (!new Set(["true", "false"]).has(request.query.archived)) {
        return response.status(400).json({ error: { code: "invalid_archived_filter" } });
      }
      const archived = request.query.archived === "true" ? 1 : 0;
      const rows = await sequelize.query(
        `SELECT archived, COUNT(*) AS count
         FROM notes
         WHERE archived = :archived
         GROUP BY archived`,
        { replacements: { archived }, type: QueryTypes.SELECT },
      );
      response.json({ data: { archived: request.query.archived === "true", count: rows[0]?.count ?? 0 } });
    } catch (error) { next(error); }
  });
  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: { code: "internal_error" } });
  });
  return { app, close: () => sequelize.close() };
}
