import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (request, response) => { try { const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); const relative = pathname === "/" ? "index.html" : pathname.slice(1); const file = join(root, normalize(relative)); if (!file.startsWith(root)) throw new Error("outside root"); const info = await stat(file); if (!info.isFile()) throw new Error("not file"); response.setHeader("content-type", types[extname(file)] ?? "application/octet-stream"); createReadStream(file).pipe(response); } catch { response.statusCode = 404; response.end("Not found"); } });
const port = Number(process.env.PORT ?? 3000);
server.listen(port, "127.0.0.1", () => console.log(`Worker offload reference listening on http://127.0.0.1:${server.address().port}`));
process.once("SIGTERM", () => server.close());
