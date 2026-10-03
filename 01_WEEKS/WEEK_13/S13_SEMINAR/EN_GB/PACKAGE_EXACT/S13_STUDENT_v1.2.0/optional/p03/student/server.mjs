import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const items = new Map([["item-1", { id: "item-1", title: "Worker", description: "Offload CPU work" }], ["item-2", { id: "item-2", title: "Shell", description: "Coordinate isolated fragments" }]]);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
function staticHandler(allowed) { return async (request, response) => { const url = new URL(request.url, "http://localhost"); if (allowed === "shell") { const match = url.pathname.match(/^\/api\/items\/([a-zA-Z0-9_-]+)$/); if (match) { const item = items.get(match[1]); response.setHeader("content-type", "application/json"); response.statusCode = item ? 200 : 404; response.end(JSON.stringify(item ? { data: item } : { error: { code: "item_not_found", message: "Item not found" } })); return; } } const permitted = allowed === "shell" ? new Set(["/", "/index.html", "/shell.js", "/styles.css", "/src/composition-coordinator.js"]) : new Set([`/${allowed}.html`]); if (!permitted.has(url.pathname)) { response.statusCode = 404; response.end("Not found"); return; } try { const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1); const file = join(root, normalize(relative)); if (!file.startsWith(root) || !(await stat(file)).isFile()) throw new Error("missing"); response.setHeader("content-type", types[extname(file)] ?? "application/octet-stream"); createReadStream(file).pipe(response); } catch { response.statusCode = 404; response.end("Not found"); } }; }
const servers = [[4212, "shell"], [4213, "catalog"], [4214, "details"]].map(([port, role]) => createServer(staticHandler(role)).listen(port, "127.0.0.1"));
console.log("Composable shell reference listening on 4212, 4213, and 4214");
const close = () => servers.forEach((server) => server.close()); process.once("SIGINT", close); process.once("SIGTERM", close);
