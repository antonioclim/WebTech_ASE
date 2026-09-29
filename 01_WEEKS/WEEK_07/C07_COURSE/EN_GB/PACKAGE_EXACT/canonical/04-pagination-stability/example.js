import assert from "node:assert/strict";
import express from "express";
import { DataTypes, Op, Sequelize } from "sequelize";

const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
const Session = sequelize.define("Session", {
  title: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.ENUM("beginner", "advanced"), allowNull: false },
  startsAt: { type: DataTypes.DATE, allowNull: false },
}, { timestamps: false });
await sequelize.sync({ force: true });
await Session.bulkCreate([
  { title: "CSS", level: "beginner", startsAt: "2026-10-01T09:00:00Z" },
  { title: "HTTP", level: "beginner", startsAt: "2026-10-01T09:00:00Z" },
  { title: "SQL", level: "advanced", startsAt: "2026-10-01T10:00:00Z" },
  { title: "Transactions", level: "advanced", startsAt: "2026-10-01T11:00:00Z" },
]);
const sortMap = { starts_asc: [["startsAt", "ASC"], ["id", "ASC"]], title_asc: [["title", "ASC"], ["id", "ASC"]] };
const app = express();
app.get("/api/sessions", async (request, response) => {
  const limit = Number(request.query.limit ?? 2);
  const order = sortMap[request.query.sort ?? "starts_asc"];
  if (!Number.isInteger(limit) || limit < 1 || limit > 20 || !order || (request.query.level && !["beginner", "advanced"].includes(request.query.level))) return response.status(400).json({ error: { code: "invalid_query" } });
  const where = { ...(request.query.level && { level: request.query.level }), ...(request.query.afterId && { id: { [Op.gt]: Number(request.query.afterId) } }) };
  const rows = await Session.findAll({ where, order, limit });
  response.json({ data: rows, page: { next: rows.length === limit ? rows.at(-1).id : null } });
});
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}/api/sessions`;
const filtered = await (await fetch(`${base}?level=advanced&sort=title_asc&limit=2`)).json();
assert.deepEqual(filtered.data.map(({ title }) => title), ["SQL", "Transactions"]);
const page = await (await fetch(`${base}?sort=starts_asc&limit=2`)).json();
assert.deepEqual(page.data.map(({ id }) => id), [1, 2]);
assert.equal(page.page.next, 2);
assert.equal((await fetch(`${base}?sort=title%20DESC`)).status, 400);
await new Promise((resolve) => server.close(resolve));
await sequelize.close();
console.log("filtering, sorting, and pagination verified");
