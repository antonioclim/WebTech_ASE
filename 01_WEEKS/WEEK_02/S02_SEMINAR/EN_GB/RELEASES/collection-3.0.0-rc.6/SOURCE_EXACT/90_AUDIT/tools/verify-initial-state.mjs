import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
  const expectedInitialHash = (await readFile(join(root, "90_AUDIT", "INITIAL_STYLES.sha256"), "utf8")).trim().split(/\s+/)[0];
  const actualInitialHash = sha256(await readFile(join(project, "public", "styles.css")));
  if (actualInitialHash !== expectedInitialHash) throw new Error("styles.css is no longer in the initial teaching state; re-extract the package before running this verifier");
  const states = [
    assertTestState("baseline", runNodeTest(project, "tests/baseline.test.js"), { status: 0, pass: 1, fail: 0 }),
    assertTestState("objective", runNodeTest(project, "tests/objective.test.js"), { status: 1, pass: 0, fail: 3 }),
    assertTestState("regression", runNodeTest(project, "tests/regression.test.js"), { status: 0, pass: 2, fail: 0 })
  ];
  console.log(JSON.stringify({ verdict: "PASS_INITIAL_STATE_EXACT_ASSERTION_TAXONOMY", states }, null, 2));
  process.exit(0);
} catch (error) {
  console.error(JSON.stringify({ verdict: "STOP_INITIAL_STATE", message: error.message, details: error.details ?? null }, null, 2));
  process.exit(2);
}
