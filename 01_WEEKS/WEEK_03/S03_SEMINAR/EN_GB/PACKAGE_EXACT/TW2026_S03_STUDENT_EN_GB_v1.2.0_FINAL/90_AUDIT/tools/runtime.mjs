import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
export const expectedNode = "v24.21.0";
export const expectedNpm = "11.19.0";
function npmCandidates() {
  const adjacent = process.platform === "win32" ? [join(dirname(process.execPath), "npm.cmd"), join(dirname(process.execPath), "npm.exe")] : [join(dirname(process.execPath), "npm")];
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  return [...adjacent.filter(existsSync), command];
}
export function runtimeStatus() {
  let npm = "NOT_FOUND", npmPath = null;
  for (const candidate of npmCandidates()) {
    const probe = spawnSync(candidate, ["--version"], { encoding: "utf8", timeout: 5000, windowsHide: true });
    if (!probe.error && probe.status === 0) { npm = (probe.stdout || probe.stderr).trim().split(/\r?\n/)[0]; npmPath = candidate; break; }
  }
  const exact = process.version === expectedNode && npm === expectedNpm;
  return { node: process.version, nodePath: process.execPath, npm, npmPath, exact, qaOverride: process.env.TW_QA_ALLOW_RUNTIME_MISMATCH === "1" };
}
