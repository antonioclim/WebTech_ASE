# Identity and test method — v6.1.1

PAYLOAD_SHA256SUMS.txt lists every regular payload file in sorted relative POSIX-path order, except itself and PACKAGE_ID.txt. PACKAGE_ID is SHA-256 over the exact UTF-8 LF manifest bytes. Both files must exist; the digest must be 64 lower-case hexadecimal characters and agree with the manifest. The verifier rejects extra, missing, changed, unsafe, non-regular and symlink paths and case-insensitive or Unicode-normalisation collisions.

VERIFY_PACKAGE and VERIFY_INITIAL_STATE require the untouched starter, including the two editable files. Work-result and project checks accept changes only to P01 case-report.json and P02 application-handler.js; every other file remains immutable and the exact set of paths is checked before and after execution. Store PDF/JSON backups outside the kit.

This detects accidental or bounded tampering relative to a trusted package identity. Someone able to rewrite all files and regenerate all hashes can create a different internally consistent package. Verify the external ZIP sidecar from the trusted distribution route; the manifest is not a digital signature.

Every suite has exact ordered test names, TAP plan/counts, expected exit code and failure category. An expected initial failure must be ERR_ASSERTION with testCodeFailure. Syntax errors, skipped/cancelled tests, stderr, signal, spawn error, output limit and timeout are real failures. The derived P01 objective uses strict Node assertions with unchanged equality semantics; the original Error-based test remains in the private provenance archive.

A suite is limited to 10 seconds and 2 MiB combined stdout/stderr. Owned child trees are terminated on interruption or limit. Foreground application sessions are loopback-only, supervised and limited to 100 minutes. Their authenticated local control channel stops only sessions created for this exact root. No arbitrary PID or process-name killing is offered. A stale record produces STOP, not a claimed cleanup PASS.

No automatic installer or dependency download is performed. Exact runtime remains v24.21.0/npm11.19.0. TW2026_ALLOW_RUNTIME_MISMATCH=1 is an explicitly labelled audit-only override, not the student route.
