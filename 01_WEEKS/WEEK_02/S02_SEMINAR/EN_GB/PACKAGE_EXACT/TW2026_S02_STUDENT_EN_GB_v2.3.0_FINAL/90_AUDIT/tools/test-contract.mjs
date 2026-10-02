import { spawnSync } from "node:child_process";
export function runNodeTest(project, relativeTest) {
  const result = spawnSync(process.execPath, ["--test", relativeTest], {
    cwd: project,
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 8 * 1024 * 1024
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const pass = Number(/# pass\s+(\d+)/.exec(output)?.[1] ?? 0);
  const fail = Number(/# fail\s+(\d+)/.exec(output)?.[1] ?? 0);
  const cancelled = Number(/# cancelled\s+(\d+)/.exec(output)?.[1] ?? 0);
  const skipped = Number(/# skipped\s+(\d+)/.exec(output)?.[1] ?? 0);
  const timedOut = result.error?.code === "ETIMEDOUT";
  return { status: result.status, signal: result.signal, pass, fail, cancelled, skipped, timedOut, output };
}
export function assertTestState(label, actual, expected) {
  const ok = !actual.timedOut && actual.signal === null && actual.status === expected.status && actual.pass === expected.pass && actual.fail === expected.fail && actual.cancelled === 0;
  if (!ok) {
    const error = new Error(`${label} did not match the test contract`);
    error.details = { actual, expected };
    throw error;
  }
  return { label, pass: actual.pass, fail: actual.fail, status: actual.status };
}
