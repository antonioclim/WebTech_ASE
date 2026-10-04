import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createReportRepository } from "./report-repository.js";
export function listen(server, port = 0) { return new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", () => { server.off("error", reject); resolve(`http://127.0.0.1:${server.address().port}`); }); }); }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { const server = createServer(createApp({ repository: createReportRepository() })); console.log(`Moderation API listening at ${await listen(server, Number(process.env.PORT ?? 3000))}`); }
