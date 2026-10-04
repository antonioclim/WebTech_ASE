import * as application from "./checklist-app.mjs";

const boundaries = Object.freeze(["unit", "integration", "http"]);

export function createRegressionHarness({ adapter = application } = {}) {
  // Implement the contracts using adapter.createChecklistSystem,
  // adapter.createChecklistServer and adapter.resetSharedFixture. Protected
  // tests inject observed factories; do not bypass them with direct imports.
  const diagnostics = Object.freeze({ activeServers: 0, activeRuns: 0 });

  async function execute(defect = null) {
    return {
      defect: defect ?? "correct",
      results: [],
      passed: false,
      unavailable: true,
    };
  }

  async function runMutationMatrix() {
    return {
      correct: await execute(),
      // Keep the defect list visible even before the harness logic is implemented.
      mutations: [
        "wrong-status",
        "missing-persistence",
        "leaked-internal-error",
        "shared-state",
      ].map((defect) => ({ defect, killed: false, killedBy: [] })),
    };
  }

  return Object.freeze({
    boundaries,
    execute,
    runMutationMatrix,
    get diagnostics() {
      return diagnostics;
    },
  });
}
