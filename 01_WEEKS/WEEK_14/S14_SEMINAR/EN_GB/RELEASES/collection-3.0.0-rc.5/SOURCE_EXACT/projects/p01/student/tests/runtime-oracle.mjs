// Protected observer: no harness implementation. Reports alone cannot satisfy it.
import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { createChecklistSystem, createChecklistServer, resetSharedFixture } from "../src/checklist-app.mjs";

export const contractNames = Object.freeze([
  "unit: validates trimmed titles",
  "integration: persists creation and repeated completion",
  "integration: isolates systems",
  "http: stable status and Location",
  "http: persisted follow-up",
  "http: safe errors",
  "http: route and method refusal",
]);
export const mutationContracts = Object.freeze({
  "wrong-status": "http: stable status and Location",
  "missing-persistence": "http: persisted follow-up",
  "leaked-internal-error": "http: safe errors",
  "shared-state": "integration: isolates systems",
});

export async function observeExecution(factory, defect = null) {
  const context = new AsyncLocalStorage();
  const calls = [], systems = [], servers = [], requests = [];
  const marker = `oracle-${randomUUID()}`;
  resetSharedFixture();
  const adapter = Object.freeze({
    createChecklistSystem(options = {}) {
      const system = createChecklistSystem({ ...options, defect });
      const raw = Object.fromEntries(Object.entries(system.repository).map(([key, fn]) => [key, fn.bind(system.repository)]));
      systems.push({ system, raw });
      for (const [owner, object] of [["service", system.service], ["repository", system.repository]]) {
        for (const [name, original] of Object.entries(object)) {
          object[name] = function (...args) {
            const call = { owner, name, args, http: context.getStore() === "http", system };
            calls.push(call);
            try { call.result = original.apply(this, args); return call.result; }
            catch (error) { call.error = error; throw error; }
          };
        }
      }
      return system;
    },
    createChecklistServer(system) {
      assert.ok(systems.some((item) => item.system === system), "server must use an injected observed system");
      const server = createChecklistServer(system), record = { server, listened: false, closed: false };
      servers.push(record);
      const listen = server.listen;
      server.listen = function (...args) {
        record.ephemeral = (typeof args[0] === "object" ? args[0]?.port : args[0]) === 0;
        return listen.apply(this, args);
      };
      server.on("listening", () => { record.listened = true; record.address = server.address(); });
      server.on("close", () => { record.closed = true; });
      const handlers = server.listeners("request");
      server.removeAllListeners("request");
      server.on("request", (request, response) => {
        const row = { method: request.method, path: request.url, system, chunks: [], finished: false };
        requests.push(row);
        const write = response.write, end = response.end;
        response.write = function (chunk, ...args) { if (chunk) row.chunks.push(Buffer.from(chunk)); return write.call(this, chunk, ...args); };
        response.end = function (chunk, ...args) { if (chunk) row.chunks.push(Buffer.from(chunk)); return end.call(this, chunk, ...args); };
        response.on("finish", () => {
          row.finished = true; row.status = response.statusCode; row.location = response.getHeader("location");
          try { row.body = JSON.parse(Buffer.concat(row.chunks).toString("utf8")); } catch { row.body = null; }
          const raw = systems.find((item) => item.system === system).raw;
          row.stored = row.body?.data?.id ? raw.find(row.body.data.id) : null;
        });
        context.run("http", () => { for (const handler of handlers) handler.call(server, request, response); });
      });
      return server;
    },
    resetSharedFixture,
  });
  let report, executionError;
  try { report = await factory({ adapter }).execute(defect); }
  catch (error) { executionError = error; }
  try {
  // A failed harness must not leak a listener into later tests. Record its actual
  // cleanup first; emergency cleanup below is an oracle action, never a PASS.
  const ownedClosed = servers.every((item) => item.listened && item.ephemeral
    && ["127.0.0.1", "::1"].includes(item.address?.address) && item.closed && !item.server.listening);
  const direct = calls.filter((call) => call.owner === "service" && !call.http);
  const created = direct.filter((call) => call.name === "create" && call.result);
  const completed = direct.filter((call) => call.name === "complete" && call.result);
  const posts = requests.filter((row) => row.method === "POST" && row.path === "/api/checklists" && row.body?.data);
  const lists = requests.filter((row) => row.method === "GET" && row.path === "/api/checklists" && Array.isArray(row.body?.data));
  const errors = requests.filter((row) => row.status >= 400);
  let isolated = false;
  if (systems.length >= 2) {
    systems[0].raw.save({ id: marker, title: marker, completed: false });
    isolated = systems.slice(1).every((item) => item.raw.find(marker) === null);
  }
  const conditions = [
    direct.some((call) => call.name === "create" && call.error?.code === "invalid_checklist")
      && created.some((call) => call.args[0]?.title !== call.args[0]?.title.trim() && call.result.title === call.args[0].title.trim()),
    created.some((call) => completed.filter((item) => item.args[0] === call.result.id && item.system === call.system).length >= 2
      && systems.find((item) => item.system === call.system).raw.find(call.result.id)?.completed === true),
    isolated,
    posts.length > 0 && posts.every((row) => row.status === 201 && row.location === `/api/checklists/${row.body.data.id}`),
    posts.length > 0 && posts.every((row) => row.body.data.completed === false && row.stored?.completed === false && row.stored?.title === row.body.data.title
      && lists.some((list) => list.system === row.system && requests.indexOf(list) > requests.indexOf(row)
        && list.body.data.some((item) => item.id === row.body.data.id && item.title === row.body.data.title))),
    errors.some((row) => row.status === 500) && errors.every((row) => row.body?.error
      && Object.keys(row.body.error).sort().join(",") === "code,message"
      && (row.status !== 500 || (row.body.error.code === "internal_error" && row.body.error.message === "Internal server error"))),
    [["invalid_json", 400], ["invalid_checklist", 400], ["checklist_not_found", 404], ["route_not_found", 404], ["method_not_allowed", 405]]
      .every(([code, status]) => errors.some((row) => row.body?.error?.code === code && row.status === status)),
  ];
  const checks = contractNames.map((name, index) => ({ name, pass: !!conditions[index] }));
  return { report, executionError, checks, ownedClosed, systems: systems.length, servers: servers.length,
    requests: requests.length, finishedRequests: requests.filter((row) => row.finished).length,
    directServiceCalls: direct.length, evidenceClass: "PROTECTED_ACTUAL_ADAPTER_HTTP_STATE_OBSERVATION" };
  } finally {
    for (const { server } of servers) {
      if (server.listening) await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
    }
    resetSharedFixture(); context.disable();
  }
}

export function assertExercised(witness) {
  assert.equal(witness.executionError, undefined, "harness execution must settle without an unexpected error");
  assert.ok(witness.systems >= 2, "injected adapter must construct isolated systems");
  assert.ok(witness.directServiceCalls >= 3, "unit/integration contracts must execute service operations outside HTTP");
  assert.ok(witness.servers >= 1 && witness.requests >= 1, "HTTP contracts must perform real loopback requests");
  assert.equal(witness.finishedRequests, witness.requests, "all observed HTTP responses must finish");
  assert.equal(witness.ownedClosed, true, "harness must own ephemeral loopback servers and close them before returning");
}

export function assertCorrectReport(report) {
  assert.deepEqual(report.results.map((row) => row.name), contractNames);
  report.results.forEach((row, index) => {
    assert.equal(row.passed, true, `${contractNames[index]} correct-run row must be typed true`);
    assert.equal(row.boundary, contractNames[index].split(":")[0], `${contractNames[index]} correct-run boundary`);
  });
  assert.equal(report.passed, true);
}

export function assertCorrect(witness) {
  assertExercised(witness);
  for (const check of witness.checks) assert.equal(check.pass, true, check.name);
  assertCorrectReport(witness.report);
}
