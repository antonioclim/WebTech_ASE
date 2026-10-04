# Required Regression Harness launch · content minutes 53–55

Complete this prepared five-item hand-off individually. Two minutes launches the record; it does not complete the 55–65-minute portfolio. Finish the full work before S14.

1. Exact package locator: `portfolio/regression-harness/student` and the supplied target contract. Record in `rh_package_locator`.
2. One target behaviour: state an observable requirement and falsifier. Record in `rh_target_contract`.
3. A boundary matrix draft: happy, edge, rejected and persistence/cleanup case, each with input, expected observation and evidence class. Record in `rh_test_matrix_draft`.
4. One mutation candidate: name a concrete faulty behaviour the test should detect, such as a response that looks correct while the persisted state is wrong. Record in `rh_mutation_candidate`.
5. Outstanding work before S14: tests, real HTTP integration and actual cleanup still to execute. Record in `rh_outstanding_before_s14`.

RUN_PROJECT_TESTS rh runs the dependency-free baseline and regression suites. The source objective suite imports/listens on HTTP and remains NOT_EXECUTED in this phase. A separately labelled injected model may support reasoning about bounded startup, fetch and cleanup. It cannot substitute for actual HTTP evidence.
