import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { verifyPackage, sha256 } from "./package-integrity.mjs";
import { runtimeStatus } from "./runtime.mjs";
import { runNodeTest, assertTestState } from "./test-contract.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const project = join(root, "02_PROJECTS", "RESPONSIVE_CARD_GRID");
try {
  const integrity = await verifyPackage(root);
  const runtime = runtimeStatus();
  console.log(JSON.stringify({ stage: "package", verdict: "PASS_PACKAGE_INTEGRITY", ...integrity }));
  console.log(JSON.stringify({ stage: "runtime", ...runtime }));
  if (!runtime.acceptedForExecution) throw new Error("exact Node.js/npm runtime is unavailable");
  if (!runtime.exact) console.log("DOCUMENTED_RUNTIME_MISMATCH: QA override active; this is not exact-runtime acceptance.");
  const initialHash = (await readFile(join(root, "90_AUDIT", "INITIAL_STYLES.sha256"), "utf8")).trim().split(/\s+/)[0];
  const currentHash = sha256(await readFile(join(project, "public", "styles.css")));
  if (currentHash === initialHash) throw new Error("styles.css still matches the initial scaffold");
  const states = [
    assertTestState("baseline", runNodeTest(project, "tests/baseline.test.js"), { status: 0, pass: 1, fail: 0 }),
    assertTestState("objective", runNodeTest(project, "tests/objective.test.js"), { status: 0, pass: 3, fail: 0 }),
    assertTestState("regression", runNodeTest(project, "tests/regression.test.js"), { status: 0, pass: 2, fail: 0 })
  ];
  const browser = spawnSync(process.execPath, ["tests/browser-smoke-runner.mjs"], { cwd: project, encoding: "utf8", timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  process.stdout.write(browser.stdout ?? "");
  process.stderr.write(browser.stderr ?? "");
  if (browser.error?.code === "ETIMEDOUT") throw new Error("browser smoke process timed out");
  if (browser.status === 3) {
    const browserOutput = `${browser.stdout ?? ""}\n${browser.stderr ?? ""}`;
    const browserClassification = browserOutput.includes('"BROWSER_BLOCKED"') ? "BROWSER_BLOCKED" : browserOutput.includes('"BROWSER_UNSUPPORTED_ENGINE"') ? "BROWSER_UNSUPPORTED_ENGINE" : "BROWSER_NOT_FOUND";
    console.log(JSON.stringify({ verdict: "PENDING_RENDERED_RESULT", states, browser: browserClassification }, null, 2));
    process.exit(3);
  }
  if (browser.status !== 0) throw new Error(`browser smoke failed with exit code ${browser.status}`);
  console.log(JSON.stringify({ verdict: "PASS_SOURCE_AND_BOUNDED_BROWSER_CHECKS", states, manualGates: ["Tab sequence and activation", "native 200% zoom", "teacher review of individual evidence"] }, null, 2));
  process.exit(0);
} catch (error) {
  console.error(JSON.stringify({ verdict: "STOP_WORK_RESULT", message: error.message, details: error.details ?? null }, null, 2));
  process.exit(2);
}
