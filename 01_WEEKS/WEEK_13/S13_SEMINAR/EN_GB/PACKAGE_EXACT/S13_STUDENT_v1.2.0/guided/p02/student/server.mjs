import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const tasks = new Map([["t1", { id: "t1", title: "Inspect Service Worker scope", done: false }], ["t2", { id: "t2", title: "Verify controlled reload", done: true }]]);
const root = process.cwd();
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (request, response) => { const url = new URL(request.url, "http://localhost"); const taskMatch = url.pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_-]{1,80})$/); if (request.method === "GET" && taskMatch) { const task = tasks.get(taskMatch[1]); response.setHeader("content-type", "application/json"); if (!task) { response.statusCode = 404; response.end(JSON.stringify({ error: { code: "task_not_found", message: "Task not found" } })); } else response.end(JSON.stringify({ data: task })); return; } try { const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1); const file = join(root, normalize(relative)); if (!file.startsWith(root) || !(await stat(file)).isFile()) throw new Error("not found"); response.setHeader("content-type", types[extname(file)] ?? "application/octet-stream"); response.setHeader("service-worker-allowed", "/"); createReadStream(file).pipe(response); } catch { response.statusCode = 404; response.end("Not found"); } });
const port = Number(process.env.PORT ?? 3000); server.listen(port, "127.0.0.1", () => console.log(`Service Worker dispatcher reference listening on http://127.0.0.1:${server.address().port}`));
process.once("SIGTERM", () => server.close());
