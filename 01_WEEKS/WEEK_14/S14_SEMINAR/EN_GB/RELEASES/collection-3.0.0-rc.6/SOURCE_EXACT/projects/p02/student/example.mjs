import { once } from "node:events";
import { createLoadProbe } from "./src/load-probe.mjs";
import { createProbeServer } from "./src/probe-server.mjs";

const server = createProbeServer({ delays: new Map([[4, 250]]), applicationFailures: new Set([1]), transportFailures: new Set([2]) });
server.listen(0, "127.0.0.1"); await once(server, "listening");
try {
  const { port } = server.address();
  const report = await createLoadProbe().run({ url: `http://127.0.0.1:${port}/api/checklists`, method: "GET", count: 6, concurrency: 2, timeoutMs: 100, warmup: 1, thresholds: { minSuccessRatio: 0.5, maxApplicationFailures: 1, maxTransportFailures: 1, maxTimeouts: 1, maxP95Ms: 1000 } });
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.passed ? 0 : 1;
} finally { await new Promise((resolve) => server.close(resolve)); }
