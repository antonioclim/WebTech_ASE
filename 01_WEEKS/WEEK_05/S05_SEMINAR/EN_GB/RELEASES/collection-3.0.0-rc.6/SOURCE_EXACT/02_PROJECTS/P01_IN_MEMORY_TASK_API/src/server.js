import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

export async function listen(server, port = 0) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

function writeJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
  });
  response.end(body);
}

function safeUnlink(file) {
  if (!file) return;
  try { fs.unlinkSync(file); } catch (error) {
    if (error?.code !== "ENOENT") console.error(`CONTROL_CLEANUP_WARNING ${error.message}`);
  }
}

function writeControlRecord(file, value) {
  if (!file) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporary, file);
}

const isMain = Boolean(process.argv[1])
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const token = process.env.TW2026_CONTROL_TOKEN ?? "";
  const packageId = process.env.TW2026_PACKAGE_ID ?? "";
  const controlRecord = process.env.TW2026_CONTROL_RECORD ?? "";
  const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const app = createApp();
  let closing = false;

  const server = createServer((request, response) => {
    const supplied = request.headers["x-tw2026-control-token"] ?? "";
    if (token && request.url === "/__tw2026_control" && request.method === "GET") {
      if (supplied !== token) return writeJson(response, 403, { ok: false });
      return writeJson(response, 200, {
        ok: true,
        schema: "TW2026_S05_CONTROL_V1",
        token,
        packageId,
        pid: process.pid,
        project,
        node: process.execPath,
      });
    }
    if (token && request.url === "/__tw2026_stop" && request.method === "POST") {
      if (supplied !== token) return writeJson(response, 403, { ok: false });
      writeJson(response, 202, { ok: true, stopping: true });
      if (!closing) {
        closing = true;
        setImmediate(() => server.close(() => {
          safeUnlink(controlRecord);
          process.exit(0);
        }));
      }
      return;
    }
    app(request, response);
  });

  const baseUrl = await listen(server, Number(process.env.PORT ?? 0));
  const record = {
    schema: "TW2026_S05_CONTROL_V1",
    pid: process.pid,
    token,
    packageId,
    project,
    node: process.execPath,
    port: server.address().port,
    baseUrl,
    startedAt: new Date().toISOString(),
  };
  writeControlRecord(controlRecord, record);
  console.log(`PASS_PROJECT_READY ${baseUrl}`);

  const closeFromSignal = (signal) => {
    if (closing) return;
    closing = true;
    console.log(`STOP_SIGNAL_RECEIVED ${signal}`);
    server.close(() => {
      safeUnlink(controlRecord);
      process.exit(0);
    });
    setTimeout(() => {
      safeUnlink(controlRecord);
      process.exit(3);
    }, 5000).unref();
  };
  process.on("SIGINT", () => closeFromSignal("SIGINT"));
  process.on("SIGTERM", () => closeFromSignal("SIGTERM"));
  process.on("exit", () => safeUnlink(controlRecord));
}
