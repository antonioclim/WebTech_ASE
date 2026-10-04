import { createServer } from "node:http";
import { createApp } from "../src/app.js";
import { createReportRepository } from "../src/report-repository.js";
import { listen } from "../src/server.js";
export async function withApp(app, run) { const server = createServer(app); const url = await listen(server); try { await run(url); } finally { await new Promise((resolve) => server.close(resolve)); } }
export const auth = (session, csrf = true, extra = {}) => ({ authorization: `Session ${session}`, ...(csrf ? { "x-csrf-token": `csrf-${session.split("-").at(-1)}` } : {}), ...extra });
export const fixture = (options = {}) => { const repository = options.repository ?? createReportRepository(); return { repository, app: createApp({ repository, authorize: options.authorize }) }; };
