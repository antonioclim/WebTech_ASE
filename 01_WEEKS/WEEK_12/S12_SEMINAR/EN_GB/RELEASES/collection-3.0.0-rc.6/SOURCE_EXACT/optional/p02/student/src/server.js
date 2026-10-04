import { createSystem } from "./system.js";

let system;
try {
  system = createSystem();
  const port = Number(process.env.PORT ?? 3000);
  const server = system.app.listen(port, () => console.log(`Queued job runner reference listening on http://localhost:${port}`));
  const shutdown = async () => { server.close(); await system.close(); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch {
  console.error("Queue configuration is invalid");
  process.exitCode = 1;
}
