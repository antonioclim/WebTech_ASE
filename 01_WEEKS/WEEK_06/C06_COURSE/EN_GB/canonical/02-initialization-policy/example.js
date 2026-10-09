import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DataTypes, Sequelize } from "sequelize";

function openDatabase(storage) {
  const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });
  const Note = sequelize.define("Note", {
    title: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { timestamps: false, tableName: "notes" });
  return { sequelize, Note };
}

async function initialize({ storage, reset = false }) {
  const database = openDatabase(storage);
  await database.sequelize.sync(reset ? { force: true } : undefined);
  if (await database.Note.count() === 0) await database.Note.create({ title: "Seeded once" });
  return database;
}

const directory = await mkdtemp(path.join(tmpdir(), "sequelize-lifecycle-"));
const storage = path.join(directory, "notes.sqlite");
try {
  const firstRun = await initialize({ storage });
  await firstRun.Note.create({ title: "Created by the application" });
  await firstRun.sequelize.close();

  const restart = await initialize({ storage });
  assert.deepEqual(
    (await restart.Note.findAll({ order: [["id", "ASC"]], raw: true })).map(({ title }) => title),
    ["Seeded once", "Created by the application"],
  );
  await restart.sequelize.close();

  const reset = await initialize({ storage, reset: true });
  assert.deepEqual((await reset.Note.findAll({ raw: true })).map(({ title }) => title), ["Seeded once"]);
  await reset.sequelize.close();
} finally {
  await rm(directory, { recursive: true, force: true });
}
console.log("rows survived restart; explicit reset recreated the schema");
