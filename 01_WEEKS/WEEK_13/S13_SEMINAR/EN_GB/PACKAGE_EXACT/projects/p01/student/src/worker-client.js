const unavailable = () => Object.assign(new Error("Worker offload is unavailable"), { code: "worker_offload_unavailable" });

export function createWorkerClient() {
  let disposed = false;
  return Object.freeze({
    analyze() { return Promise.reject(disposed ? Object.assign(new Error("Worker client is disposed"), { code: "worker_client_disposed" }) : unavailable()); },
    dispose() { disposed = true; },
    get diagnostics() { return Object.freeze({ pendingCount: 0, hasWorker: false }); }
  });
}
