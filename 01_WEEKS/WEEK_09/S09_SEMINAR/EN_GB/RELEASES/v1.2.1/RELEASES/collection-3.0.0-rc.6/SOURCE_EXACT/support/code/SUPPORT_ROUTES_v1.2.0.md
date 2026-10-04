# New source-only support routes — S09 v1.2.0

These Node sources and CMD/SH wrappers are authored and statically reviewed, **not executed** in package production. Use commands only in a later separately provisioned, authorised environment. No route installs, acquires dependencies or rebuilds the supplied P03 client. Run from the student package root, not an assessed subdirectory.

| Root launcher | Direct Node route | Property |
| --- | --- | --- |
| VERIFY_PACKAGE.cmd / sh VERIFY_PACKAGE.sh | node tools/S09_VERIFY_PACKAGE_v1_2_0.mjs --verify-package | Exact root SHA256SUMS.txt payload set/hashes and PACKAGE_ID.txt identity; original package before work only. |
| CHECK_ENVIRONMENT.cmd / sh CHECK_ENVIRONMENT.sh | node tools/S09_CHECK_ENVIRONMENT_v1_2_0.mjs --check-environment | Actual version query versus prescribed Node v24.21.0/npm11.19.0; no install. Version equality alone is not qualification. |
| VERIFY_INITIAL_STATE.cmd p01 / sh VERIFY_INITIAL_STATE.sh p01 | node tools/S09_VERIFY_INITIAL_STATE_v1_2_0.mjs --check-source p01 | Exact supplied starter bytes; p02/p03 accepted similarly. |
| VERIFY_WORK_RESULT.cmd p01 / sh VERIFY_WORK_RESULT.sh p01 | node tools/S09_VERIFY_PROJECT_BOUNDARY_v1_2_0.mjs --check-source p01 | Protected hashes, one allowed objective edit; correctness remains unproved. |
| TEST_PROJECT_1.cmd / sh TEST_PROJECT_1.sh | node tools/S09_TEST_PROJECT_v1_2_0.mjs --run-checks p01 | Later actual baseline/objective/regression/build record under strict version gate. No browser or automatic mark. |
| TEST_PROJECT_2.cmd / sh TEST_PROJECT_2.sh | node tools/S09_TEST_PROJECT_v1_2_0.mjs --run-checks p02 | Optional later capstone checks; no extra S09 completion gate. |
| TEST_PROJECT_3.cmd / sh TEST_PROJECT_3.sh | node tools/S09_TEST_PROJECT_v1_2_0.mjs --run-checks p03 | Later actual baseline/objective/regression; never build:client. |

Later P03 HTTP observation, from package root: `node tools/S09_OBSERVE_P03_LOOPBACK_v1_2_0.mjs --run-local static-only` (or universal/student). The explicit flag is required. This starts only a transient loopback server on an assigned local port, records 15 ordinary request rows as JSON and closes its own server. There is no remote URL parameter. Fields include case_id, method, path, Accept, actual status, content_type, cache_control, bytes, sha256, index/asset identity and trace. Request errors remain errors. Missing-index and post-header streaming require distinct separately qualified fixtures; the observer does not pretend to test them. HTTP success does not prove client boot.

Package integrity is checked in the preserved original extraction; added work/evidence belongs in a separate working copy. PROJECT_BASELINES identifies assessed trees only; explicit generated exclusions do not qualify installed dependencies. EXACT_STARTER_BYTES means an incomplete starter is unchanged. ALLOWED_OBJECTIVE_EDIT_ONLY means permitted path changes without a correctness judgement. PROTECTED_SOURCE_MISMATCH requires STOP and clean-source remediation; no automatic correction occurs.

Test records distinguish PASS, dependency/parser/timeout/command/reporting failures and assertion failures requiring review. Only the named assertion against the exact untouched starter and its documented unavailable objective may be called intended; an arbitrary failed suite is not automatically expected. Every support route requires actual invocation evidence before its output is counted. R3B-6, browser/platforms and current remote remain unqualified.
