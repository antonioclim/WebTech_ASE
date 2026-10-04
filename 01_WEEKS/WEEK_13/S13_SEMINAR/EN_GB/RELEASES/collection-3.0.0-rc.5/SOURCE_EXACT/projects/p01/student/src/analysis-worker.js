const cancelled = new Set();

const yieldToMessages = () => new Promise((resolve) => {
  const channel = new MessageChannel();
  channel.port1.onmessage = () => { channel.port1.close(); channel.port2.close(); resolve(); };
  channel.port2.postMessage(null);
});

async function analyze(requestId, values) {
  let sum = 0;
  let checksum = 0;
  const chunkSize = 500;
  for (let start = 0; start < values.length; start += chunkSize) {
    if (cancelled.has(requestId)) { cancelled.delete(requestId); return; }
    const end = Math.min(start + chunkSize, values.length);
    for (let index = start; index < end; index += 1) {
      const value = values[index];
      sum += value;
      for (let round = 0; round < 80; round += 1) checksum = (checksum + Math.imul((index + 1) ^ round, Math.trunc(value * 1000) ^ round)) >>> 0;
    }
    postMessage({ type: "analysis.progress", requestId, progress: Math.round((end / values.length) * 100) });
    await yieldToMessages();
  }
  if (!cancelled.delete(requestId)) postMessage({ type: "analysis.completed", requestId, result: { count: values.length, sum, mean: values.length ? sum / values.length : 0, checksum } });
}

self.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.type === "analysis.cancel" && typeof message.requestId === "string") { cancelled.add(message.requestId); return; }
  if (message?.type !== "analysis.start" || typeof message.requestId !== "string" || !Array.isArray(message.values)) return;
  analyze(message.requestId, message.values).catch(() => postMessage({ type: "analysis.failed", requestId: message.requestId, error: { code: "analysis_failed", message: "Analysis failed" } }));
});
