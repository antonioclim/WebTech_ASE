import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, delimiter, join, resolve } from "node:path";
export const expectedNode = "v24.21.0";
export const expectedNpm = "11.19.0";
export function npmCliCandidates() {
  const dirs = [dirname(process.execPath), ...(process.env.PATH ?? "").split(delimiter), process.env.APPDATA].filter(Boolean);
  return [...new Set([process.env.npm_execpath, ...dirs.flatMap(dir => [join(dir, "node_modules/npm/bin/npm-cli.js"), resolve(dir, "../lib/node_modules/npm/bin/npm-cli.js")])].filter(x => x && x.endsWith("npm-cli.js") && existsSync(x)))];
}
export function runtimeStatus() {
  let npm = "NOT_FOUND", npmCli = null;
  for (const candidate of npmCliCandidates()) {
    const result = spawnSync(process.execPath, [candidate, "--version"], { encoding: "utf8", timeout: 5000, maxBuffer: 65536, windowsHide: true });
    if (!result.error && result.status === 0 && /^\d+\.\d+\.\d+$/.test(result.stdout.trim())) { npm = result.stdout.trim(); npmCli = candidate; break; }
  }
  const node = process.version;
  const exact = node === expectedNode && npm === expectedNpm;
  const override = process.env.TW_QA_ALLOW_RUNTIME_MISMATCH === "1";
  return { node, npm, npmCli, exact, override, acceptedForExecution: exact || override };
}
