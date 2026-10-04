import { spawnSync } from "node:child_process";

export function runTap(files, { cwd, expectedExit, expectedNames, expectedPass, expectedFail, timeoutMs = 15000 }) {
  const args = ["--test", "--test-reporter=tap", ...files];
  const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8", timeout: timeoutMs, windowsHide: true });
  if (result.error) throw new Error(`PROCESS_ERROR ${result.error.message}`);
  if (result.signal) throw new Error(`PROCESS_SIGNAL ${result.signal}`);
  if (result.status !== expectedExit) throw new Error(`EXIT_MISMATCH expected=${expectedExit} actual=${result.status}\n${result.stdout}\n${result.stderr}`);
  if ((result.stderr || "").trim()) throw new Error(`UNEXPECTED_STDERR\n${result.stderr}`);
  const output = result.stdout || "";
  const summary = {};
  for (const key of ["tests", "pass", "fail", "cancelled", "skipped", "todo"]) {
    const match = output.match(new RegExp(`^# ${key} (\\d+)$`, "m"));
    if (!match) throw new Error(`MISSING_TAP_SUMMARY ${key}`);
    summary[key] = Number(match[1]);
  }
  if (summary.pass !== expectedPass || summary.fail !== expectedFail || summary.tests !== expectedNames.length) {
    throw new Error(`TAP_COUNT_MISMATCH ${JSON.stringify(summary)}`);
  }
  if (summary.cancelled || summary.skipped || summary.todo) throw new Error(`TAP_NONEXECUTION ${JSON.stringify(summary)}`);
  const plan = output.match(/^(\d+)\.\.(\d+)$/m);
  if (!plan || Number(plan[1]) !== 1 || Number(plan[2]) !== expectedNames.length) throw new Error("TAP_PLAN_MISMATCH");
  const names = [...output.matchAll(/^(?:ok|not ok) \d+ - (.+)$/gm)].map((match) => match[1].replace(/ #.*$/, "").trim());
  if (names.length !== expectedNames.length || names.some((name, index) => name !== expectedNames[index])) {
    throw new Error(`TAP_NAME_MISMATCH expected=${JSON.stringify(expectedNames)} actual=${JSON.stringify(names)}`);
  }
  return { output, summary, status: result.status };
}
