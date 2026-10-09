# C11 — Run the bounded neutral demonstrations

Work from the extracted C11_COURSE/EN_GB folder, where tools and DEMONSTRATIONS are immediate children. Keep the extraction separate from an earlier version. Read index.html and SOURCE_NOTES.md first. No installation is part of this route.

```text
node tools/tw-kit.mjs env core
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs env sqlite
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs env http
node tools/tw-kit.mjs example 04
```

Or run `node tools/tw-kit.mjs examples` for all four. The wrappers CHECK_ENVIRONMENT.sh/.cmd select core by default; RUN_ALL_EXAMPLES.sh/.cmd runs these four demonstrations. ENV_OK or ENV_WARN permits the selected operation. ENV_BLOCKED stops only that capability: preserve the reason and continue independent available work. Pure Node work uses no npm. The observed local runtime is Node 24.19.0; the retained Node 24.21.0/npm 11.19.0 reference is unexecuted. See the collection's capability policy rather than treating exact reference equality as a gate.

| ID | Pedagogic object and observed result | Boundary |
|---|---|---|
| 01 | Equipment receipt lookup at 29/30/31, cancellation and retained copy | Core Map/declared clock, no session or login |
| 02 | Two fixed injected catalogue calls and matching public failure values | Count, not elapsed time or real password verification |
| 03 | Bound apostrophe-containing value in actual node:sqlite, absent label, independent count 2 and exact text helper | New equipment database, not canonical sql.js/template/URL/browser |
| 04 | Five literal HTTP exchanges:200 sharing/200 no-sharing/204 OPTIONS/200 HEAD/404, then owned cleanup | Actual Node HTTP, not browser CORS/cache/CSRF/TLS |

These four direct demonstrations were executed on the observed Linux runtime during candidate QA; their result labels identify only the asserted neutral witnesses. The recipe predicts those same outcomes on a capable learner environment. A printed prediction is not the learner's actual observation. Record your actual CWD, exit, diagnostic and relevant result, including a blocked operation.

Neutral children are bounded at 10 seconds and 64KiB combined output. Selected HTTP/SQLite capability children are bounded at 5 seconds/64KiB; the inner HTTP capability attempt is 4 seconds. Each HTTP request in demo04 has its own timeout, and the demonstration closes its owned listener in finally. Cleanup and bounded Linux process ownership do not qualify native Windows process-tree behaviour.

## Optional exact canonical test profile

`node tools/canonical.mjs preflight 01` diagnoses the selected original project's prepared local dependencies. `node tools/canonical.mjs test 01` runs its unchanged original tests only when those dependencies exist; 01–05 select the five directories. An explicit `npm-preflight 01` diagnoses npm from that project; it performs no installation. Direct preflight/test is npm-free. Canonical child tests are bounded at 20 seconds/1,000,000 bytes combined output. Do not run original npm installation/start scripts as a preflight. No canonical server-start route is supplied.

Prepared Express dependencies are absent in current QA, and 05 additionally needs sql.js. An absent module is ENV_BLOCKED for that optional profile, not a security PASS or a blocker for the independent neutral examples/S11 pure models. Original README Validated statements remain historical source assertions. Browser/file-CSP delivery, TLS, Word rendering and native platforms are unexecuted.
