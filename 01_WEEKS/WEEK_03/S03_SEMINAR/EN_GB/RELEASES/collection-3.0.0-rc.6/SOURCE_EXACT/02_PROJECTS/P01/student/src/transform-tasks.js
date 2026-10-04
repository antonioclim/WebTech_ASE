export function transformTasks(tasks, options = {}) {
  /*
   * TODO: build the defensive transformation described in `spec.md`.
   *
   * Before asking AI to edit:
   * 1. Run the baseline, objective, and regression checks separately.
   * 2. Inspect the fixture, CLI call site, and focused failures.
   * 3. Ask AI for a no-edit table of accepted input types, required own
   *    properties, stage shapes, mutation risks, and completion evidence.
   * 4. Verify that table against the specification and tests yourself.
   *
   * Constrain the implementation request to this file. It must validate the
   * dataset and own task fields without coercion, produce fresh projected
   * records, preserve caller-owned inputs, order deterministically, and derive
   * the summary from the correct stage. Do not permit fixture, CLI, test, or
   * dependency changes.
   *
   * After AI proposes a change, inspect every diff hunk for inherited-property
   * acceptance, shallow aliases, in-place sorting, implicit coercion, and edits
   * outside scope. Run all checks, compare one CLI result by hand, and explain
   * every pipeline stage before accepting the result.
   */
  void tasks;
  void options;
  return { tasks: [], count: 0, totalEstimate: 0, owners: [] };
}
