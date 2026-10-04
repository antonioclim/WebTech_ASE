export function createStatusStore() {
  const records = new Map();
  return Object.freeze({
    get(jobId) { const value = records.get(jobId); return value ? structuredClone(value) : null; },
    set(jobId, value) { records.set(jobId, structuredClone(value)); return this.get(jobId); },
    snapshot() { return structuredClone([...records.values()]); }
  });
}
