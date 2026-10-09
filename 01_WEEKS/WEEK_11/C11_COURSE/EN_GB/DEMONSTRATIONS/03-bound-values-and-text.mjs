// Neutral equipment catalogue: SQL values and HTML-text representations differ.
import assert from 'node:assert/strict';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment = await assessCourseEnvironment({ unit: 'C11', operation: 'neutral SQL value and text', cwd: process.cwd(), command: 'node DEMONSTRATIONS/03-bound-values-and-text.mjs', usesSqlite: true });
console.log(JSON.stringify(environment));
if (environment.exitCode) process.exit(environment.exitCode);
const { DatabaseSync } = await import('node:sqlite');
const helperModule = await import('../derived/literal-text.js');
const textHelper = helperModule.default ?? globalThis.C11Text;
assert.equal(typeof textHelper?.represent, 'function');
const database = new DatabaseSync(':memory:');
let receipt;
try {
  database.exec('CREATE TABLE equipment (id TEXT PRIMARY KEY, label TEXT NOT NULL)');
  const insert = database.prepare('INSERT INTO equipment (id, label) VALUES (?, ?)');
  insert.run('e7', "Curator's notebook");
  insert.run('e8', 'Research & Teaching');
  const query = database.prepare('SELECT id, label FROM equipment WHERE label = ? ORDER BY id');
  const selected = query.all("Curator's notebook").map(row => ({ id: row.id, label: row.label }));
  const absent = query.all('Unlisted equipment');
  const independentCount = database.prepare('SELECT COUNT(*) AS count FROM equipment').get().count;
  const originalText = 'Research & Teaching';
  const representedText = textHelper.represent(originalText);
  assert.deepEqual(selected, [{ id: 'e7', label: "Curator's notebook" }]);
  assert.equal(absent.length, 0);
  assert.equal(independentCount, 2);
  assert.equal(representedText, 'Research &amp; Teaching');
  receipt = { example: '03', scope: 'actual node:sqlite in-memory engine and exact retained HTML-text helper', selected, absentCount: absent.length, independentCount, originalText, representedText, result: 'PASS_NEUTRAL_SQL_TEXT_WITNESSES', limit: 'Not canonical sql.js qualification, a template engine, URL policy, general sanitiser or native DOM render' };
} finally {
  database.close();
}
console.log(JSON.stringify({ ...receipt, databaseClosed: true }));
