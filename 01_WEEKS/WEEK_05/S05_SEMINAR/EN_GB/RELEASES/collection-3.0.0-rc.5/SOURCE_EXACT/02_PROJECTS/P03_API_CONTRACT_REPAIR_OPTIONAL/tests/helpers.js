import { createServer } from "node:http";
import { createApp } from "../src/app.js";
import { listen } from "../src/server.js";

export async function withApi(run, options = {}) {
  const server = createServer(createApp(options));
  const baseUrl = await listen(server);
  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

export const postJson = (body) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
