import { createFakeTransport } from "../src/fake-transport.mjs";
import { publicError } from "../src/public-errors.mjs";
import { createRequestDispatcher } from "../src/request-dispatcher.mjs";

export function fixture(options = {}) {
  let sequence = 0;
  const transport = options.transport ?? createFakeTransport(options.transportOptions);
  const dispatcher = createRequestDispatcher({ transport, nextId: options.nextId ?? (() => `r${++sequence}`), timers: options.timers, defaultTimeoutMs: options.defaultTimeoutMs ?? 100, makeError: publicError });
  return { transport, dispatcher };
}

export const rejectionCode = async (promise) => { try { await promise; return null; } catch (error) { return error.code; } };
