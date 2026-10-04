import { once } from "node:events";
import { createProbeServer } from "../src/probe-server.mjs";

export async function withProbeServer(config, run) {
  const server = createProbeServer(config);
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  try { return await run(`http://127.0.0.1:${server.address().port}/api/checklists`); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

export function response(ok, body = ok ? { data: [] } : { error: { code: "expected_failure", message: "Expected" } }) {
  return { ok, async json() { return body; } };
}
