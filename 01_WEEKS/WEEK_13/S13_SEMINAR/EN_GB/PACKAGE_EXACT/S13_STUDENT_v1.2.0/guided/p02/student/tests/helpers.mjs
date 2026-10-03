import { createServiceWorkerDispatcher } from "../src/sw-dispatcher.js";
import { createFakeContainer } from "./fake-container.mjs";

export function fixture(options = {}) { let id = 0; const fake = createFakeContainer({ controlled: options.controlled ?? true }); const directCalls = []; const directFetch = options.directFetch ?? (async (url, requestOptions) => { directCalls.push({ url, options: requestOptions }); return { id: "direct", via: "direct" }; }); const dispatcher = createServiceWorkerDispatcher({ container: fake.container, registerWorker: options.registerWorker ?? (async () => ({})), directFetch, origin: "https://course.example", nextId: options.nextId ?? (() => `r${++id}`), defaultTimeoutMs: options.defaultTimeoutMs ?? 100 }); return { ...fake, dispatcher, directCalls }; }
export const code = async (promise) => { try { await promise; return null; } catch (error) { return error.code; } };
