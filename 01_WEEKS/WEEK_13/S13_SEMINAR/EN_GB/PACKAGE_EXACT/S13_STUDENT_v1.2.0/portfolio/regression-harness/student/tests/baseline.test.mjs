import assert from "node:assert/strict";
import test from "node:test";
import { createChecklistServer, createChecklistSystem } from "../src/checklist-app.mjs";

test("supplied checklist service validates, persists, and completes", () => {
  const system = createChecklistSystem();
  const created = system.service.create({ title: "Inspect release evidence" });
  assert.equal(system.service.list().at(-1).id, created.id);
  assert.equal(system.service.complete(created.id).completed, true);
  assert.throws(() => system.service.complete("c-99"), (error) => error.code === "checklist_not_found");
});

test("supplied HTTP adapter is independently constructible", () => {
  const server = createChecklistServer(createChecklistSystem());
  assert.equal(typeof server.listen, "function");
  server.close();
});
