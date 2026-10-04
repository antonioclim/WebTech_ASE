const boundaries = Object.freeze(["unit", "integration", "http"]);

export function createRegressionHarness() {
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
