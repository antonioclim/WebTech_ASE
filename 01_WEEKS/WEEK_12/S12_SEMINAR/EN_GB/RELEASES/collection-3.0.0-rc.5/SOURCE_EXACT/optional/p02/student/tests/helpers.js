import { EventEmitter } from "node:events";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { createEventSink } from "../src/event-sink.js";
import { createJobLifecycle } from "../src/job-lifecycle.js";
import { createStatusStore } from "../src/status-store.js";

export function fixture(options = {}) {
  const worker = options.worker ?? new EventEmitter();
  const added = [];
  const queue = options.queue ?? { async add(name, data, jobOptions) { added.push({ name, data: structuredClone(data), options: structuredClone(jobOptions) }); return { id: jobOptions.jobId, data }; } };
  const store = createStatusStore();
  const eventSink = createEventSink();
  let id = 0;
  const lifecycle = createJobLifecycle({ queue, worker, store, eventSink, nextJobId: options.nextJobId ?? (() => `job-${++id}`) });
  return { app: createApp({ lifecycle }), lifecycle, worker, queue, store, eventSink, added };
}

export async function withApp(app, run) { const server = app.listen(0, "127.0.0.1"); await once(server, "listening"); try { await run(`http://127.0.0.1:${server.address().port}`); } finally { server.close(); await once(server, "close"); } }
export const headers = (session = "alice-session") => ({ "x-session-id": session, "content-type": "application/json" });
export const post = (url, reportId, session) => fetch(`${url}/api/exports`, { method: "POST", headers: headers(session), body: JSON.stringify({ reportId }) });
