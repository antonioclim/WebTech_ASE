self.addEventListener("message", ({ data }) => {
  self.postMessage({ total: data.values.reduce((sum, value) => sum + value, 0) });
}, { once: true });
