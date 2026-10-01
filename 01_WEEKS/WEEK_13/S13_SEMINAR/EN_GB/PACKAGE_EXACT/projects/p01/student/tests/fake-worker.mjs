export function createFakeWorker({ onPost } = {}) {
  const listeners = new Map([["message", new Set()], ["error", new Set()], ["messageerror", new Set()]]);
  const sent = [];
  let terminated = false;
  const worker = { postMessage(message) { if (terminated) throw new Error("terminated"); sent.push(structuredClone(message)); onPost?.(message, worker); }, addEventListener(type, listener) { listeners.get(type).add(listener); }, removeEventListener(type, listener) { listeners.get(type).delete(listener); }, terminate() { terminated = true; }, emit(type, value) { for (const listener of [...listeners.get(type)]) listener(type === "message" ? { data: structuredClone(value) } : value); }, sent: () => structuredClone(sent), diagnostics: () => ({ terminated, listeners: Object.fromEntries([...listeners].map(([type, set]) => [type, set.size])) }) };
  return worker;
}
