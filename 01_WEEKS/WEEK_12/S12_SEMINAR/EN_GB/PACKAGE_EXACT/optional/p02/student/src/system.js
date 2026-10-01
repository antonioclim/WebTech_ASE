import { randomBytes } from "node:crypto";
import { createApp } from "./app.js";
import { createEventSink } from "./event-sink.js";
import { createJobLifecycle } from "./job-lifecycle.js";
import { createQueueRuntime, loadRedisConfig } from "./queue-runtime.js";
import { createStatusStore } from "./status-store.js";

export function createSystem({ env = process.env, queueName = `course-exports-${process.pid}`, nextJobId = () => randomBytes(12).toString("hex") } = {}) {
  const runtime = createQueueRuntime({ connection: loadRedisConfig(env), queueName });
  const store = createStatusStore();
  const eventSink = createEventSink();
  const lifecycle = createJobLifecycle({ queue: runtime.queue, worker: runtime.worker, store, eventSink, nextJobId });
  const app = createApp({ lifecycle });
  return Object.freeze({ app, lifecycle, store, eventSink, runtime, async close() { lifecycle.close(); await runtime.close(); } });
}
