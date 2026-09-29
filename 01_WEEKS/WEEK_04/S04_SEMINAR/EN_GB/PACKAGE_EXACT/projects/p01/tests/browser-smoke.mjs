import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { createStaticServer, listen } from "../src/static-server.js";

const execute = promisify(execFile);
const server = createStaticServer();
const profile = await mkdtemp(join(tmpdir(), "dashboard-browser-"));
try {
  const url = await listen(server);
  const { stdout } = await execute(process.env.CHROME_BIN ?? "google-chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", `--user-data-dir=${profile}`, "--virtual-time-budget=2000", "--dump-dom", url]);
  assert.match(stdout, /id="dashboard"[^>]*data-state="success"/);
  assert.match(stdout, /2 of 3 tasks open/);
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true });
}
