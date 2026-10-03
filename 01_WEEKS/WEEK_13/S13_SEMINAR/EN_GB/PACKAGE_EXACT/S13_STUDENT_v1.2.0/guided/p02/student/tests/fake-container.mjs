export function createFakeContainer({ controlled = true } = {}) {
  const listeners = new Map([["message", new Set()], ["controllerchange", new Set()]]);
  const sent = [];
  const controller = { postMessage(message) { sent.push(structuredClone(message)); } };
  const container = { controller: controlled ? controller : null, addEventListener(type, listener) { listeners.get(type).add(listener); }, removeEventListener(type, listener) { listeners.get(type).delete(listener); }, emit(type, value = {}) { for (const listener of [...listeners.get(type)]) listener(value); }, sent: () => structuredClone(sent), diagnostics: () => Object.fromEntries([...listeners].map(([type, set]) => [type, set.size])) };
  return { container, controller };
}
