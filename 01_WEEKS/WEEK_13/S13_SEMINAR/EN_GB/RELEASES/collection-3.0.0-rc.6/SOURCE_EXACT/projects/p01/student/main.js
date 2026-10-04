import { analyzeNumbers, generateValues } from "./src/analysis.js";
import { createWorkerClient } from "./src/worker-client.js";

let id = 0;
const client = createWorkerClient({ createWorker: () => new Worker("./src/analysis-worker.js", { type: "module" }), nextId: () => `analysis-${++id}` });
const form = document.querySelector("#analysis-form");
const count = document.querySelector("#count");
const status = document.querySelector("#status");
const result = document.querySelector("#result");
const heartbeat = document.querySelector("#heartbeat");
let controller = null;
let ticks = 0;
setInterval(() => { ticks += 1; heartbeat.value = String(ticks); }, 5);

async function run(valueCount, selftest = false) {
  controller?.abort();
  controller = new AbortController();
  const values = generateValues(valueCount);
  const startTicks = ticks;
  status.textContent = "Working: 0%";
  try {
    const computed = await client.analyze(values, { signal: controller.signal, onProgress: (progress) => { status.textContent = `Working: ${progress}%`; } });
    result.textContent = JSON.stringify(computed, null, 2);
    status.textContent = "Complete";
    if (selftest) document.body.dataset.selftest = JSON.stringify(computed) === JSON.stringify(analyzeNumbers(values)) && ticks > startTicks ? "pass" : "fail";
  } catch (error) { status.textContent = error.code === "analysis_aborted" ? "Cancelled" : "Failed"; if (selftest) document.body.dataset.selftest = "fail"; }
}

form.addEventListener("submit", (event) => { event.preventDefault(); run(Number(count.value)); });
document.querySelector("#cancel").addEventListener("click", () => controller?.abort());
if (new URL(location.href).searchParams.get("selftest") === "1") run(50000, true);
window.addEventListener("pagehide", () => client.dispose(), { once: true });
