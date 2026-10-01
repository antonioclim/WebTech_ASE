# S14 — Regression Harness Closure

## Required closure

Complete only `student/src/regression-harness.mjs` and preserve the supplied application, fixtures and tests. The evidence pack must show:

1. separate unit, integration and HTTP contract boundaries;
2. a correct-adapter run with stable named checks;
3. persisted follow-up state after creation;
4. four named mutation kills: wrong status, missing persistence, leaked internal error and shared state;
5. exact assertion-to-mutation attribution;
6. two repeated runs with consistent outcomes;
7. zero active servers and zero active harness runs after completion;
8. an explicit limitation stating what was not executed or qualified.

Starter objective failures are the expected starting signature, not an environmental pass. A source-model result is not a canonical HTTP run. Record actual commands and logs only when they were truly executed in the authorised environment.
