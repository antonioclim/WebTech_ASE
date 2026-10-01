export function createJobLifecycle() {
  async function enqueue() {
    throw Object.assign(new Error("Queue lifecycle unavailable"), { status: 503, code: "job_lifecycle_unavailable" });
  }

  return Object.freeze({
    enqueue,
    findForOwner: () => null,
    close() {}
  });
}
