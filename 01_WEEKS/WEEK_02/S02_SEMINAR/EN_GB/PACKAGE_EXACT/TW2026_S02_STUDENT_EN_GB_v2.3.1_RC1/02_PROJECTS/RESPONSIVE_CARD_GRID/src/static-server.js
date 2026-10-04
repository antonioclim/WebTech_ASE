import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../public/", import.meta.url);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

export function createStaticServer(options = {}) {
  const controlToken = typeof options.controlToken === "string" ? options.controlToken : null;
  const packageId = typeof options.packageId === "string" ? options.packageId : null;
  return createServer(async (request, response) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { allow: "GET, HEAD", "content-type": "text/plain; charset=utf-8" }); response.end("method not allowed"); return; }
      const pathname = new URL(request.url, "http://127.0.0.1").pathname;
      if (pathname === "/__tw2026_control") {
        if (!controlToken) throw new Error("control endpoint disabled");
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff"
        });
        response.end(JSON.stringify({ service: "TW2026_S02", token: controlToken, packageId }));
        return;
      }
      const relative = pathname === "/"
        ? "index.html"
        : normalize(pathname).replace(/^[/\\]+/, "");
      const file = new URL(relative, root);
      if (!file.href.startsWith(root.href)) throw new Error("unsafe path");
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": types[extname(relative)] ?? "application/octet-stream",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      response.end("not found");
    }
  });
}

export async function listen(server, port = 0) {
  await new Promise((resolve, reject) => {
    const onError = (error) => { server.off("listening", onListening); reject(error); };
    const onListening = () => { server.off("error", onError); resolve(); };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, "127.0.0.1");
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createStaticServer();
  try {
    const url = await listen(server, Number(process.env.PORT ?? 0));
    console.log(`S02 local project: ${url}`);
    console.log("Press Ctrl+C to stop the server.");
    const shutdown = () => {
      server.closeAllConnections?.();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(2), 3000).unref();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error(`STOP: the local server could not start (${error.message}).`);
    process.exit(2);
  }
}
