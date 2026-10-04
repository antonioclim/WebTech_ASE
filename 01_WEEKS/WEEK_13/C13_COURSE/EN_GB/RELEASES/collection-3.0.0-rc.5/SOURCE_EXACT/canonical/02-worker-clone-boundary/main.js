const input = { values: [2, 4, 6] };
const worker = new Worker("./worker.js", { type: "module" });
worker.addEventListener("message", ({ data }) => {
  document.querySelector("#result").textContent = `worker total=${data.total}; main first=${input.values[0]}`;
  document.body.dataset.result = data.total === 12 && input.values[0] === 99 ? "pass" : "fail";
  worker.terminate();
}, { once: true });
worker.postMessage(input);
input.values[0] = 99;
