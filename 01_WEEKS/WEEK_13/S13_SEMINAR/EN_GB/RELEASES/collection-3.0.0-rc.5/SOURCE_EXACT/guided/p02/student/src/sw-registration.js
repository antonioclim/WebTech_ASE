export async function registerCourseWorker(container) {
  await container.register("/service-worker.js", { scope: "/" });
  return container.ready;
}

export async function directTaskFetch(url, options = {}) {
  const response = await fetch(url, { method: options.method ?? "GET" });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error?.message ?? "Task request failed"), { code: body.error?.code ?? "task_failed" });
  return Object.freeze({ ...body.data, via: "direct" });
}
