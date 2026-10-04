import { createServiceWorkerDispatcher } from "./src/sw-dispatcher.js";
import { directTaskFetch, registerCourseWorker } from "./src/sw-registration.js";

let sequence = 0;
const dispatcher = createServiceWorkerDispatcher({ container: navigator.serviceWorker, registerWorker: registerCourseWorker, directFetch: directTaskFetch, origin: location.origin, nextId: () => `request-${++sequence}` });
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-id");
const status = document.querySelector("#status");
const result = document.querySelector("#result");

async function loadTask(id) { status.textContent = "Loading"; try { const task = await dispatcher.request(`/api/tasks/${encodeURIComponent(id)}`); result.textContent = JSON.stringify(task, null, 2); status.textContent = `Loaded via ${task.via}`; return task; } catch { status.textContent = "Failed"; return null; } }
form.addEventListener("submit", (event) => { event.preventDefault(); loadTask(input.value); });
window.addEventListener("pagehide", () => dispatcher.dispose(), { once: true });

if (new URL(location.href).searchParams.get("selftest") === "1") {
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  const task = await loadTask("t1");
  if (!wasControlled) {
    sessionStorage.setItem("first-path", task?.via ?? "failed");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
    location.reload();
  } else {
    const first = sessionStorage.getItem("first-path");
    document.body.dataset.selftest = first === "direct" && task?.via === "service-worker" && task.id === "t1" ? "pass" : "fail";
    document.body.dataset.firstPath = first ?? "missing";
    document.body.dataset.secondPath = task?.via ?? "failed";
    const names = await caches.keys();
    document.body.dataset.courseCaches = String(names.filter((name) => name.startsWith("course-sw-dispatcher-")).length);
  }
}
