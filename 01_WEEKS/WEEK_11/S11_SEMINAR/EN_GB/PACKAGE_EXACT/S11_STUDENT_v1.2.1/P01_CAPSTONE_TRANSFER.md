# S11 P01 Authentication and Session Transfer

Version 1.2.1 CANDIDATE / WIP/PREVIEW_NOT_FINAL. Separately scheduled transfer.

P01 is a separately scheduled semester-project route. In S11, understand how the supplied P02 authentication creates a principal, then record a transfer plan. Do not attempt a second full implementation in the 60-minute content route.

The separately assessed capstone file is `capstone/p01/student/src/authentication.js` when the teacher schedules it. Keep password verification, opaque server-side session state, cookie transport attributes, request-origin/HTTPS assumptions and resource authorisation distinct. A deterministic token generator supports reproducible fixtures, not an entropy measurement. A cookie header is not browser enforcement, and a forwarded-proto string is not a TLS handshake.

The preserved P01 objective starter has source-predicted non-assertion failure paths: the intentionally incomplete 503 response can leave the test helper without an expected cookie. This is `BLOCKED_NONASSERTION_STARTER_FAILURE_SOURCE_DERIVED_NOT_EXPRESS_EXECUTED`, not an accepted intended assertion-only initial state. No actual Express execution is implied by that source finding. P01 objectives are excluded from mandatory S11 initial/work completion and need a separately scheduled capstone contract.

Use `p01_capstone` to identify the principal/session boundary you will integrate later, the source you inspected and the evidence still needed. Do not enter passwords, raw cookies, session identifiers, tokens or deployment secrets. A teaching memory store is not a qualified production deployment.
