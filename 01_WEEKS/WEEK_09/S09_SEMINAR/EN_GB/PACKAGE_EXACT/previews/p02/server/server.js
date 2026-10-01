import { createServer } from "node:http";
import { createNotesServer } from "./app.js";
export async function listen(server, port = 0) { await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); }); return `http://127.0.0.1:${server.address().port}`; }
if (process.argv[1] === new URL(import.meta.url).pathname) { const server = createServer(createNotesServer()); console.log(`Notes API listening at ${await listen(server, Number(process.env.PORT ?? 3000))}`); process.once("SIGINT", () => server.close()); process.once("SIGTERM", () => server.close()); }
