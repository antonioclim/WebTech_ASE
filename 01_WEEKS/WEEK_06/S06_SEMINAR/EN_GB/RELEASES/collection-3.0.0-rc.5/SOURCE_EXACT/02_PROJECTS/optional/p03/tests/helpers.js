import { createServer } from "node:http";
import { Sequelize } from "sequelize";
import { createApp } from "../src/app.js";
import { createDatabase, initializeDatabase } from "../src/database.js";
import { listen } from "../src/server.js";

export async function withDatabase(run) {
  const database = createDatabase();
  await initializeDatabase(database);
  try { await run(database); } finally { await database.sequelize.close(); }
}

export async function withUnsafeDatabase(run) {
  const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
  try { await run(sequelize); } finally { await sequelize.close(); }
}

export async function withApi(database, run, options = {}) {
  const server = createServer(createApp({ Reservation: database.Reservation, ...options }));
  const baseUrl = await listen(server);
  try { await run(baseUrl); } finally { await new Promise((resolve) => server.close(resolve)); }
}

export const postJson = (body) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
