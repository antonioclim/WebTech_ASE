export function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
export function controlledApi() { return { list: async () => [], markRead: async (id) => ({ id, title: id, read: true, createdAt: "2026-01-01T00:00:00.000Z" }) }; }
