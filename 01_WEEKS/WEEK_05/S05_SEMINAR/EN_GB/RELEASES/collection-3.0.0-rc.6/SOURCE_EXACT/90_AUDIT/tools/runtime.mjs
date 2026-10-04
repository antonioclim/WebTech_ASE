import { spawnSync } from "node:child_process";
export const REQUIRED_NODE = "v24.21.0";
export const REQUIRED_NPM = "11.19.0";
export const REQUIRED_EXPRESS = "5.1.0";
export function versions() {
  const npm = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"], {
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  return {
    node: process.version,
    npm: (npm.stdout || "").trim(),
    npmExit: npm.status,
    npmError: npm.error ? String(npm.error.message || npm.error) : "",
  };
}
export function exact() {
  const value = versions();
  return { ...value, match: value.node === REQUIRED_NODE && value.npm === REQUIRED_NPM };
}
export function qaOverride() { return process.env.TW2026_QA_ALLOW_RUNTIME_MISMATCH === "1"; }
