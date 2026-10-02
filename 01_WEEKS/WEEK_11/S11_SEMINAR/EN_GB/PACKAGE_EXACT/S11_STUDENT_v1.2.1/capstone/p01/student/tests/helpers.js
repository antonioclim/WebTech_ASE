import { createServer } from "node:http";
import { createApp } from "../src/app.js";
import { createPasswordVerifier } from "../src/passwords.js";
import { createSessionStore } from "../src/session-store.js";
import { listen } from "../src/server.js";
import { createUserRepository } from "../src/users.js";
export function fixture(options = {}) { const clock = options.clock ?? { now: () => 1000 }; const sessions = options.sessions ?? createSessionStore({ clock, randomBytes: options.randomBytes ?? (() => Buffer.alloc(32, 7)), ttlMs: options.ttlMs ?? 60000 }); const users = options.users ?? createUserRepository(); const passwordVerifier = options.passwordVerifier ?? createPasswordVerifier(); return { sessions, users, passwordVerifier, app: createApp({ users, sessions, passwordVerifier, production: options.production, trustedOrigin: "https://course.example" }) }; }
export async function withApp(app, run) { const server = createServer(app); const baseUrl = await listen(server); try { await run(baseUrl); } finally { await new Promise((resolve) => server.close(resolve)); } }
export const json = (body, headers = {}) => ({ method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
export const cookiePair = (response) => response.headers.get("set-cookie").split(";")[0];
