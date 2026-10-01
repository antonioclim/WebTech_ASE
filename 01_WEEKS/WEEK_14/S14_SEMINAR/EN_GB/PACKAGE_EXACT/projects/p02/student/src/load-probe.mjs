const unavailable = () => Object.assign(new Error("Load probe is unavailable"), { code: "probe_unavailable" });

export function createLoadProbe() {
  const diagnostics = Object.freeze({ activeRuns: 0, activeRequests: 0, activeTimers: 0 });
  return Object.freeze({
    async run() { throw unavailable(); },
    get diagnostics() { return diagnostics; }
  });
}
