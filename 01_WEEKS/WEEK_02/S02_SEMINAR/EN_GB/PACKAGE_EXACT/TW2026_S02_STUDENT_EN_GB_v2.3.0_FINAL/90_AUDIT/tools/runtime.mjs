import { spawnSync } from "node:child_process";
export const expectedNode = "v24.21.0";
export const expectedNpm = "11.19.0";
export function runtimeStatus() {
  const node = process.version;
  const npmProbe = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"], { encoding: "utf8", timeout: 5000 });
  const npm = npmProbe.status === 0 ? npmProbe.stdout.trim() : "NOT_FOUND";
  const exact = node === expectedNode && npm === expectedNpm;
  const override = process.env.TW_QA_ALLOW_RUNTIME_MISMATCH === "1";
  return { node, npm, exact, override, acceptedForExecution: exact || override };
}
