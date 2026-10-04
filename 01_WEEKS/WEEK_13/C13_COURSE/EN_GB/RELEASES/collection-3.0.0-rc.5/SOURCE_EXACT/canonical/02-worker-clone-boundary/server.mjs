import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";

const allowed = new Set(["/", "/index.html", "/main.js", "/worker.js"]);
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  if (!allowed.has(path)) { response.statusCode = 404; response.end("Not found"); return; }
  response.setHeader("content-type", extname(path) === ".js" ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8");
  createReadStream(join(process.cwd(), path === "/" ? "index.html" : path.slice(1))).pipe(response);
}).listen(4215, "127.0.0.1", () => console.log("Worker clone example listening on 4215"));
process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
