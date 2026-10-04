import { createServer } from "node:http";

if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
const server = createServer((request, response) => {
  response.setHeader("content-type", "application/json");
  response.setHeader("content-security-policy", "default-src 'none'");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("referrer-policy", "no-referrer");
  if (request.url === "/health") { response.end(JSON.stringify({ status: "ok" })); return; }
  response.statusCode = 404;
  response.end(JSON.stringify({ error: { code: "not_found", message: "Resource not found" } }));
});
server.listen(Number(process.env.PORT), "127.0.0.1", () => console.log(JSON.stringify({ event: "listening", port: server.address().port })));
process.once("SIGTERM", () => server.close());
