import { Queue, Worker } from "bullmq";
import { processExport } from "./export-processor.js";

export function loadRedisConfig(env) {
  if (!env.REDIS_URL) throw new Error("REDIS_URL is required");
  const url = new URL(env.REDIS_URL);
  if (url.protocol !== "redis:" || !url.hostname || url.username || url.password) throw new Error("REDIS_URL must be a credential-free redis URL for this teaching project");
  return Object.freeze({ host: url.hostname, port: Number(url.port || 6379), db: Number(url.pathname.slice(1) || 0), maxRetriesPerRequest: null });
}

export function createQueueRuntime({ connection, queueName }) {
  const queue = new Queue(queueName, { connection });
  const worker = new Worker(queueName, processExport, { connection, concurrency: 2 });
  return Object.freeze({ queue, worker, async close() { await worker.close(); await queue.close(); } });
}
