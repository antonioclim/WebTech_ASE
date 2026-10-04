import { spawnSync } from "node:child_process";
export function runNodeTest(project, relativeTest, options = {}) {
  const result = spawnSync(process.execPath, ["--test", "--test-reporter=tap", relativeTest], {
    cwd: project, encoding: "utf8", timeout: options.timeout ?? 30000, maxBuffer: 8 * 1024 * 1024
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const count = label => Number(new RegExp(`^# ${label}\\s+(\\d+)\\s*$`, "m").exec(output)?.[1] ?? 0);
  const summaryPresent = ["tests", "pass", "fail", "cancelled", "skipped", "todo"].every(label => new RegExp(`^# ${label}\\s+\\d+\\s*$`, "m").test(output));
  const assertionFailures = [...output.matchAll(/code: ['"]ERR_ASSERTION['"]/g)].length;
  const pass = count("pass"), fail = count("fail"), cancelled = count("cancelled"), skipped = count("skipped"), todo = count("todo");
  const timedOut = result.error?.code === "ETIMEDOUT";
  const classification = timedOut ? "TIMEOUT" : result.error ? "SPAWN_ERROR" : result.signal ? "PROCESS_SIGNAL" : !summaryPresent ? "MISSING_RESULT" : cancelled ? "CANCELLED" : skipped || todo ? "INCOMPLETE" : fail && assertionFailures !== fail ? "INFRASTRUCTURE_FAILURE" : fail ? "ASSERTION_FAILURE" : "PASS";
  return { status: result.status, signal: result.signal, tests: count("tests"), pass, fail, cancelled, skipped, todo, assertionFailures, summaryPresent, timedOut, classification, output };
}
export function assertTestState(label, actual, expected) {
  const expectedClass = expected.fail ? "ASSERTION_FAILURE" : "PASS";
  const ok = actual.classification === expectedClass && actual.status === expected.status && actual.pass === expected.pass && actual.fail === expected.fail && actual.tests === expected.pass + expected.fail;
  if (!ok) { const error = new Error(`${label} did not match the test contract`); error.details = { actual, expected }; throw error; }
  return { label, pass: actual.pass, fail: actual.fail, status: actual.status, classification: actual.classification };
}
