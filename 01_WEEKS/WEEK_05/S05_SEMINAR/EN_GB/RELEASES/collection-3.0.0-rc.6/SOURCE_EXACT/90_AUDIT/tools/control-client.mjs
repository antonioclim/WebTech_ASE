import fs from "node:fs";
import http from "node:http";
import path from "node:path";

export const CONTROL_SCHEMA = "TW2026_S05_CONTROL_V1";

export function readRecord(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function validateRecord(record, expected) {
  const reasons = [];
  if (record?.schema !== CONTROL_SCHEMA) reasons.push("schema");
  if (!Number.isInteger(record?.pid) || record.pid <= 0) reasons.push("pid");
  if (typeof record?.token !== "string" || record.token.length < 20) reasons.push("token");
  if (record?.packageId !== expected.packageId) reasons.push("packageId");
  if (path.resolve(record?.project ?? "") !== path.resolve(expected.project)) reasons.push("project");
  if (path.resolve(record?.node ?? "") !== path.resolve(expected.node)) reasons.push("node");
  if (!Number.isInteger(record?.port) || record.port < 1 || record.port > 65535) reasons.push("port");
  return { ok: reasons.length === 0, reasons };
}

export function requestControl(record, pathname, method = "GET", timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: "127.0.0.1",
      port: record.port,
      path: pathname,
      method,
      headers: { "x-tw2026-control-token": record.token },
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
        if (body.length > 65536) request.destroy(new Error("control response too large"));
      });
      response.on("end", () => {
        let value;
        try { value = JSON.parse(body); } catch { return reject(new Error("invalid control JSON")); }
        resolve({ status: response.statusCode, value });
      });
    });
    request.setTimeout(timeoutMs, () => request.destroy(new Error("control timeout")));
    request.on("error", reject);
    request.end();
  });
}

export async function probeRecord(record, expected) {
  const valid = validateRecord(record, expected);
  if (!valid.ok) return { ok: false, classification: "UNTRUSTED_RECORD", reasons: valid.reasons };
  try {
    const response = await requestControl(record, "/__tw2026_control", "GET");
    const value = response.value;
    const ok = response.status === 200
      && value?.ok === true
      && value?.schema === CONTROL_SCHEMA
      && value?.token === record.token
      && value?.packageId === expected.packageId
      && value?.pid === record.pid
      && path.resolve(value?.project ?? "") === path.resolve(expected.project)
      && path.resolve(value?.node ?? "") === path.resolve(expected.node);
    return { ok, classification: ok ? "LIVE_VERIFIED" : "LIVE_IDENTITY_MISMATCH", response };
  } catch (error) {
    return { ok: false, classification: "NO_LIVE_CONTROL_ENDPOINT", error: String(error?.message ?? error) };
  }
}
