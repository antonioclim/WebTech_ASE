import assert from "node:assert/strict";
import test from "node:test";
import { createWorkerClient } from "../projects/p01/student/src/worker-client.js";

// Separately authored contract cases. Canonical tests and their assertions remain unchanged.
const check = (name, body) => test(name, { timeout: 700 }, body);
const errorCode = async (promise) => { try { await promise; return null; } catch (error) { assert.ok(error instanceof Error); assert.doesNotMatch(error.message, /PRIVATE_SECRET/); return error.code; } };
const fakeWorker = ({ post, attach } = {}) => {
  const listeners = new Map(["message", "error", "messageerror"].map((type) => [type, new Set()]));
  const sent = [];
  let terminated = 0;
  const worker = {
    addEventListener(type, fn) { listeners.get(type).add(fn); attach?.(type, fn); },
    removeEventListener(type, fn) { listeners.get(type).delete(fn); },
    postMessage(message) { sent.push(structuredClone(message)); post?.(message, worker); },
    terminate() { terminated += 1; },
    emit(type, message) { for (const fn of [...listeners.get(type)]) fn(type === "message" ? { data: message } : message); },
    sent, get terminated() { return terminated; },
    counts: () => Object.fromEntries([...listeners].map(([type, set]) => [type, set.size])),
  };
  return worker;
};
const fixture = (t, options = {}) => {
  let ids = 0, creates = 0;
  const workers = [];
  const originalClient = createWorkerClient({ nextId: options.nextId ?? (() => `request-${++ids}`), createWorker() { creates += 1; const worker = options.createWorker?.() ?? fakeWorker(options); workers.push(worker); return worker; } });
  // Observe all rejections so an incomplete starter produces named assertion failures rather than unhandled test errors.
  const client = Object.freeze({ analyze(...args) { const promise = originalClient.analyze(...args); Promise.resolve(promise).catch(() => {}); return promise; }, dispose: originalClient.dispose, get diagnostics() { return originalClient.diagnostics; } });
  t.after(() => client.dispose());
  return { client, workers, get creates() { return creates; } };
};
const workerAt = (fixture, index = 0) => { assert.ok(fixture.workers[index], "analysis must create the expected model worker"); return fixture.workers[index]; };
const fulfilled = async (promise) => { try { return await promise; } catch (error) { assert.fail(`expected resolution, received ${error?.code ?? "rejection"}`); } };
const completed = (id, result) => ({ type: "analysis.completed", requestId: id, result });
const signalModel = (hook) => {
  const listeners = new Set();
  const signal = { aborted: false, addEventListener(type, fn) { listeners.add(fn); hook?.(signal, fn); }, removeEventListener(type, fn) { listeners.delete(fn); } };
  return { signal, count: () => listeners.size, abort() { signal.aborted = true; for (const fn of [...listeners]) fn(); } };
};

check("dense finite input rejects empty, holes, non-numbers, non-finite values and throwing accessors before factory", async (t) => {
  const sparse = new Array(2); sparse[1] = 1;
  const accessor = [1]; Object.defineProperty(accessor, 0, { get() { throw new Error("PRIVATE_SECRET"); } });
  const f = fixture(t);
  for (const values of [[], sparse, [NaN], [Infinity], [-Infinity], ["1"], [null], [1n], accessor, new Array(100_001).fill(1), { 0: 1, length: 1 }]) assert.equal(await errorCode(f.client.analyze(values)), "invalid_values");
  assert.equal(f.creates, 0);
});
check("minimum one value and maximum 100000 values are accepted with a snapshot", async (t) => {
  const f = fixture(t, { post(message, worker) { if (message.type === "analysis.start") worker.emit("message", completed(message.requestId, "accepted")); } });
  const values = [-0]; assert.equal(await fulfilled(f.client.analyze(values)), "accepted"); values[0] = 99;
  assert.equal(Object.is(workerAt(f).sent[0].values[0], -0), true);
  assert.equal(await fulfilled(f.client.analyze(new Array(100_000).fill(2))), "accepted");
  assert.equal(f.creates, 1);
});
check("pre-aborted valid request rejects locally before factory or send", async (t) => {
  const f = fixture(t); const controller = new AbortController(); controller.abort();
  assert.equal(await errorCode(f.client.analyze([1], { signal: controller.signal })), "analysis_aborted");
  assert.equal(f.creates, 0);
});
check("synchronous fake completion is correlated because pending is installed before send", async (t) => {
  const f = fixture(t, { post(message, worker) { if (message.type === "analysis.start") worker.emit("message", completed(message.requestId, "opaque")); } });
  assert.equal(await fulfilled(f.client.analyze([1])), "opaque");
  assert.equal(f.client.diagnostics.pendingCount, 0);
  assert.deepEqual(workerAt(f).sent[0], { type: "analysis.start", requestId: "request-1", values: [1] });
});
check("own undefined result is a present opaque result", async (t) => {
  const f = fixture(t, { post(message, worker) { worker.emit("message", completed(message.requestId, undefined)); } });
  assert.equal(await fulfilled(f.client.analyze([1])), undefined);
  assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("completed envelope without own result rejects once and a late valid reply is ignored", async (t) => {
  const f = fixture(t); const promise = f.client.analyze([1]);
  workerAt(f).emit("message", { type: "analysis.completed", requestId: "request-1" });
  assert.equal(await errorCode(promise), "invalid_worker_result");
  workerAt(f).emit("message", completed("request-1", "late"));
  assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("inherited result does not satisfy the own result contract", async (t) => {
  const f = fixture(t); const promise = f.client.analyze([1]);
  workerAt(f).emit("message", Object.assign(Object.create({ result: "inherited" }), { type: "analysis.completed", requestId: "request-1" }));
  assert.equal(await errorCode(promise), "invalid_worker_result");
});
check("unknown IDs, wrong types and malformed messages cannot settle an active request", async (t) => {
  const f = fixture(t); const promise = f.client.analyze([1]);
  for (const message of [null, {}, completed("other", "forged"), { type: "completed", requestId: "request-1", result: "wrong" }, { type: "analysis.completed", requestId: 1, result: "wrong" }]) workerAt(f).emit("message", message);
  assert.equal(f.client.diagnostics.pendingCount, 1);
  workerAt(f).emit("message", completed("request-1", { ok: true }));
  assert.deepEqual(await fulfilled(promise), { ok: true });
});
check("reversed results correlate independently and progress remains finite monotonic and nonterminal", async (t) => {
  const f = fixture(t); const seen = [];
  const first = f.client.analyze([1], { onProgress: (value) => seen.push(value) }); const second = f.client.analyze([2]);
  for (const progress of [40, 20, -1, 101, NaN, Infinity]) workerAt(f).emit("message", { type: "analysis.progress", requestId: "request-1", progress });
  assert.equal(f.client.diagnostics.pendingCount, 2);
  workerAt(f).emit("message", completed("request-2", "second")); workerAt(f).emit("message", completed("request-1", "first"));
  assert.deepEqual(await fulfilled(Promise.all([first, second])), ["first", "second"]);
  assert.deepEqual(seen, [40]); assert.equal(f.creates, 1); assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("lifetime ID reuse after terminal completion is rejected before another send", async (t) => {
  const f = fixture(t, { nextId: () => "same" }); const first = f.client.analyze([1]);
  workerAt(f).emit("message", completed("same", "first")); assert.equal(await fulfilled(first), "first");
  assert.equal(await errorCode(f.client.analyze([2])), "invalid_request_id");
  workerAt(f).emit("message", completed("same", "late")); assert.equal(workerAt(f).sent.length, 1);
});
check("duplicate active ID rejects only the new call and preserves the original", async (t) => {
  const f = fixture(t, { nextId: () => "same" }); const first = f.client.analyze([1]);
  assert.equal(await errorCode(f.client.analyze([2])), "invalid_request_id");
  assert.equal(f.client.diagnostics.pendingCount, 1); workerAt(f).emit("message", completed("same", "first")); assert.equal(await fulfilled(first), "first");
});
check("ID factory throws or returns an invalid primitive without a synchronous exception or worker", async (t) => {
  for (const nextId of [() => { throw new Error("PRIVATE_SECRET"); }, () => "", () => undefined, () => 7, () => ({ id: "r" })]) {
    const f = fixture(t, { nextId }); let promise;
    assert.doesNotThrow(() => { promise = f.client.analyze([1]); });
    assert.equal(await errorCode(promise), "invalid_request_id"); assert.equal(f.creates, 0);
  }
});
check("worker factory failure is a stable rejection and later creation can recover", async (t) => {
  let first = true;
  const f = fixture(t, { createWorker() { if (first) { first = false; throw new Error("PRIVATE_SECRET"); } return fakeWorker({ post(message, worker) { worker.emit("message", completed(message.requestId, "recovered")); } }); } });
  let promise; assert.doesNotThrow(() => { promise = f.client.analyze([1]); });
  assert.equal(await errorCode(promise), "worker_create_failed"); assert.equal(await fulfilled(f.client.analyze([2])), "recovered");
});
check("invalid factory object is rejected and partial worker termination is attempted", async (t) => {
  let terminated = 0; const f = fixture(t, { createWorker: () => ({ terminate() { terminated += 1; } }) });
  assert.equal(await errorCode(f.client.analyze([1])), "worker_create_failed"); assert.equal(terminated, 1);
});
check("partially failing listener attachment detaches all attached listeners and terminates", async (t) => {
  const worker = fakeWorker({ attach(type) { if (type === "error") throw new Error("PRIVATE_SECRET"); } });
  const f = fixture(t, { createWorker: () => worker });
  assert.equal(await errorCode(f.client.analyze([1])), "worker_listener_failed");
  assert.deepEqual(worker.counts(), { message: 0, error: 0, messageerror: 0 }); assert.equal(worker.terminated, 1); assert.equal(f.client.diagnostics.hasWorker, false);
});
check("start send failure removes pending and abort listener while a healthy worker remains shared", async (t) => {
  const signal = signalModel(); const f = fixture(t, { post() { throw new Error("PRIVATE_SECRET"); } });
  assert.equal(await errorCode(f.client.analyze([1], { signal: signal.signal })), "worker_send_failed");
  assert.equal(signal.count(), 0); assert.equal(f.client.diagnostics.pendingCount, 0);
  assert.deepEqual(workerAt(f).counts(), { message: 1, error: 1, messageerror: 1 });
});
check("throwing progress callback rejects locally and sends at most one best-effort cancel", async (t) => {
  const f = fixture(t); const promise = f.client.analyze([1], { onProgress() { throw new Error("PRIVATE_SECRET"); } });
  assert.doesNotThrow(() => workerAt(f).emit("message", { type: "analysis.progress", requestId: "request-1", progress: 40 }));
  assert.equal(await errorCode(promise), "progress_callback_failed");
  workerAt(f).emit("message", { type: "analysis.progress", requestId: "request-1", progress: 50 });
  assert.equal(workerAt(f).sent.filter((message) => message.type === "analysis.cancel").length, 1); assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("abort settles once even if cancel send throws and a late completion arrives", async (t) => {
  const signal = signalModel(); const f = fixture(t, { post(message) { if (message.type === "analysis.cancel") throw new Error("PRIVATE_SECRET"); } });
  const promise = f.client.analyze([1], { signal: signal.signal }); assert.doesNotThrow(() => signal.abort()); signal.abort();
  assert.equal(await errorCode(promise), "analysis_aborted"); workerAt(f).emit("message", completed("request-1", "late"));
  assert.equal(signal.count(), 0); assert.equal(workerAt(f).sent.filter((message) => message.type === "analysis.cancel").length, 1);
});
check("abort while attaching the signal avoids analysis.start and cleans pending", async (t) => {
  const signal = signalModel((current, fn) => { current.aborted = true; fn(); }); const f = fixture(t);
  assert.equal(await errorCode(f.client.analyze([1], { signal: signal.signal })), "analysis_aborted");
  assert.equal(workerAt(f).sent.some((message) => message.type === "analysis.start"), false); assert.equal(signal.count(), 0);
});
check("throwing abort-listener attachment produces a stable rejection with no start send", async (t) => {
  const signal = signalModel(() => { throw new Error("PRIVATE_SECRET"); }); const f = fixture(t);
  assert.equal(await errorCode(f.client.analyze([1], { signal: signal.signal })), "abort_listener_failed");
  assert.equal(signal.count(), 0); assert.equal(workerAt(f).sent.length, 0);
});
check("worker error rejects all, retires the failed worker and replaces it lazily", async (t) => {
  const f = fixture(t); const first = f.client.analyze([1]); const second = f.client.analyze([2]);
  first.catch(() => {}); second.catch(() => {}); const failed = workerAt(f); failed.emit("error", new Error("PRIVATE_SECRET"));
  assert.deepEqual(await Promise.all([errorCode(first), errorCode(second)]), ["worker_failed", "worker_failed"]);
  assert.deepEqual(failed.counts(), { message: 0, error: 0, messageerror: 0 }); assert.equal(failed.terminated, 1); assert.equal(f.client.diagnostics.hasWorker, false);
  const third = f.client.analyze([3]); assert.equal(f.creates, 2); failed.emit("message", completed("request-3", "stale"));
  workerAt(f, 1).emit("message", completed("request-3", "new")); assert.equal(await fulfilled(third), "new");
});
check("messageerror follows the same safe retirement policy", async (t) => {
  const f = fixture(t); const promise = f.client.analyze([1]); workerAt(f).emit("messageerror", new Error("PRIVATE_SECRET"));
  assert.equal(await errorCode(promise), "worker_failed"); assert.equal(workerAt(f).terminated, 1); assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("disposal rejects pending, removes all listeners, terminates once and forbids future calls", async (t) => {
  const f = fixture(t); const signal = signalModel(); const first = f.client.analyze([1], { signal: signal.signal }); const second = f.client.analyze([2]);
  first.catch(() => {}); second.catch(() => {}); f.client.dispose(); f.client.dispose();
  assert.deepEqual(await Promise.all([errorCode(first), errorCode(second)]), ["worker_client_disposed", "worker_client_disposed"]);
  assert.equal(await errorCode(f.client.analyze([1])), "worker_client_disposed"); assert.equal(signal.count(), 0);
  assert.deepEqual(workerAt(f).counts(), { message: 0, error: 0, messageerror: 0 }); assert.equal(workerAt(f).terminated, 1);
  assert.deepEqual(f.client.diagnostics, { pendingCount: 0, hasWorker: false });
});
check("a synchronous completion followed by a send exception remains settled once", async (t) => {
  const f = fixture(t, { post(message, worker) { worker.emit("message", completed(message.requestId, "first")); throw new Error("PRIVATE_SECRET"); } });
  assert.equal(await fulfilled(f.client.analyze([1])), "first"); assert.equal(f.client.diagnostics.pendingCount, 0);
});
check("reentrant callback abort followed by throw cannot cancel or settle twice", async (t) => {
  const signal = signalModel(); const f = fixture(t); const promise = f.client.analyze([1], { signal: signal.signal, onProgress() { signal.abort(); throw new Error("PRIVATE_SECRET"); } });
  assert.doesNotThrow(() => workerAt(f).emit("message", { type: "analysis.progress", requestId: "request-1", progress: 40 }));
  assert.equal(await errorCode(promise), "analysis_aborted"); assert.equal(workerAt(f).sent.filter((message) => message.type === "analysis.cancel").length, 1);
});
check("invalid callback and throwing option getters reject before factory", async (t) => {
  const f = fixture(t); const options = {}; Object.defineProperty(options, "signal", { get() { throw new Error("PRIVATE_SECRET"); } });
  for (const current of [null, { onProgress: "callback" }, { signal: {} }, options]) assert.equal(await errorCode(f.client.analyze([1], current)), "invalid_options");
  assert.equal(f.creates, 0);
});

check("listener errors cannot spoof a public code or expose factory details", async (t) => {
  const worker = fakeWorker({ attach() { throw Object.assign(new Error("PRIVATE_SECRET"), { code: "worker_create_failed" }); } });
  const f = fixture(t, { createWorker: () => worker });
  assert.equal(await errorCode(f.client.analyze([1])), "worker_listener_failed");
  assert.deepEqual(worker.counts(), { message: 0, error: 0, messageerror: 0 }); assert.equal(worker.terminated, 1);
});
