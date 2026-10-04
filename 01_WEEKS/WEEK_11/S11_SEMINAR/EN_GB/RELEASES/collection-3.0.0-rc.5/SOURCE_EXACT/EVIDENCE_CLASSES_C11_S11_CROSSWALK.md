# C11 and S11 evidence classes

Keep the exact source label in the evidence locator, then describe what actually ran. This crosswalk clarifies vocabulary; it does not change C11 or certify any execution.

| Source label | S11 description | What it can support | What it cannot establish |
| --- | --- | --- | --- |
| C11 `SOURCE` | `SOURCE` or form `SOURCE_ONLY` | A source-anchored control flow, declared contract or inferred outcome | An observed runtime outcome |
| C11 `PURE_JS` | `PURE_FUNCTION` when a pure function actually ran | Recorded input/output of the named dependency-free function | HTTP, Express middleware, browser enforcement or TLS |
| C11 `CALLBACK_MODEL` | `CALLBACK_MODEL` or form `MODEL_ONLY`, with model type named | The exact callback calls, captured arguments and counters in that model | Native Express request parsing, route ordering or cookie handling |
| C11 `ACTUAL_HTTP` | `ACTUAL_EXPRESS` only if the actual Express app handled the recorded request | That named app/request/response under the measured runtime | Real-browser CORS enforcement, TLS, SQL transactions or a production identity system |
| C11 `ACTUAL_HTTP` from another HTTP implementation | Preserve `ACTUAL_HTTP` and name the implementation | The response actually observed in that implementation | An Express qualification by relabelling |
| Real browser observation | `REAL_BROWSER`, with browser/version and exact local tab | The rendered or browser-enforced behaviour actually observed | Untested browsers, operating systems or production deployment |
| Actual TLS deployment | `TLS_DEPLOYMENT`, with the actual deployment boundary | The bounded TLS observation, with secret material removed | A broad security certification |
| Missing runtime, dependency or service access | `BLOCKED` or `NOT_EXECUTED` | The real blocking condition and honest unfinished obligations | Intended objective failure or completed assessment |

The form uses broad execution-status selectors and detailed evidence fields. A broad `ACTUAL_RECORDED` value must be accompanied by an exact class, command or action, test identity, observed result and locator. Selecting a value does not prove that an activity occurred.

For each experiment, record a prediction before acting, the trusted input source, expected protective result, actual observation, locator and limitation. Example of a locator format, not an observed result: `ACTUAL_EXPRESS; P02 regression test title; captured TAP file; actual date/time; runtime pair; status and report state`. Replace every example component with your own evidence. Do not insert passwords, raw cookies, session IDs, tokens or private account details.

A frozen flat snapshot is not a database lock. One loader counter is not a transaction. A response header is not browser behaviour. A source-derived expectation is not an actual response.

Normal S11 completion retains the actual canonical P02 test gate and required reduced CORS/CSRF portfolio. Source and model work can preserve an evidence draft without manufacturing completion. The teacher's actual assessment policy governs an access block; this document grants no alternative approval.
