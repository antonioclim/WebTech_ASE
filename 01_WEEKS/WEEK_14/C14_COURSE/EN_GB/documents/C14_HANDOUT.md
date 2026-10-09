# RC10 CURRENT CLASSROOM TRANSFER

Current S14 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Regression: actual persisted follow-up — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P03 — Production evidence: fail/unknown/pass gate — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../../ENTRY/S14.html

Step-by-step tutorial: ../../../../TUTORIALS/S14.html

Current evidence form: ../../../S14/WEBTECH_ASE_S14_EN_GB_v1.2.3_RC6/CLASSROOM_RC6/EVIDENCE_FORM.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C14 — Synthesis handout: Testing, Observability, Performance and Production Evidence

This retained synthesis summarises the source topics. The offline worked companion at `../worked-mechanisms.html` explains inputs, state transitions, results and limits; the Word handout remains a synthesis summary.

This handout preserves the 38 source topics and their evidence boundaries.

## Readiness and test boundaries

### 1. Unit tests isolate local rules
Use a unit boundary for pure rules such as validation, reducers and parsers when collaborators are not part of the claim.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 2. Integration tests join real collaborators
Use integration evidence when the claim joins real collaborators such as repositories, constraints, queues or adapters.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 3. API tests verify HTTP contracts
Use a loopback API boundary for method, status, headers, body, persistence and public failure contracts.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 4. Browser tests verify browser-owned behavior
Use a real browser when focus, navigation, storage, Worker, Service Worker or iframe lifecycle owns the behaviour.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 5. Use the cheapest sufficient boundary
Choose the lowest boundary that can observe the claim. Higher boundaries add lifecycle cost and additional failure modes.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

## Sensitivity, determinism and regression

### 6. Worked example — test boundary selector
The canonical selector maps pure policy, persistence and HTTP semantics to different boundaries. It does not run in this package.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 7. Test observable behavior
Assert public behaviour and persisted state. Avoid private choreography unless that sequence is itself the contract.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 8. Determinism requires lifecycle ownership
Deterministic evidence owns setup, readiness, fixtures, clocks and cleanup. A leaked resource can contaminate later runs.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 9. Avoid arbitrary sleeps
Replace arbitrary delays with explicit events, promises, conditions or controlled time.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 10. Passing tests can be insensitive
A green happy path can miss wrong status, absent persistence and unsafe public errors.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 11. Seed realistic defects
Introduce plausible faults and predict the specific failure vector. Surviving faults require interpretation.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 12. Worked example — seeded defect sensitivity
The exact seeded-defect example separates status, persistence and sanitisation failures, but its cleanup is not fully guarded.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 13. Coverage is execution evidence
Coverage is execution evidence. It does not establish that assertions distinguish the behaviour that matters.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 14. Separate baseline, objective and regression
Baseline validates infrastructure, objective differentiates the required implementation and regression protects other behaviour.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

## Performance evidence

### 15. “Fast” needs a scenario
A performance claim requires a declared operation, state, warm-up, sample size, concurrency, timeout, interval, statistic and environment.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 16. Concurrency is not throughput
Concurrency is in-flight work. Throughput also needs completions and scenario duration.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 17. Bound concurrent work
Bound scheduling and settle every operation once. Unbounded Promise.all is not a load methodology.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 18. Classify HTTP and transport outcomes
HTTP failure, transport rejection and local timeout are distinct classes even when the client API fulfils the promise for HTTP 500.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 19. Measure the intended interval
Header-arrival and body-complete latency are different intervals. Measure the interval named by the claim.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 20. Mean can hide tails
A mean can conceal a severe tail. Report distribution and failures, not a single reassuring average.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 21. Worked example — tail latency trace
The canonical tail example provides a bounded teaching sample, not a capacity or SLO result.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 22. Percentiles need definition
State the percentile algorithm, population, warm-up policy, sample size and environment.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

## Observability evidence

### 23. Observability connects symptoms to work
Logs record events, metrics aggregate values and traces link operations across boundaries.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 24. Structure logs around stable schemas
Prefer a stable allowlisted schema with internal correlation, route templates, status and bounded duration.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 25. Minimise sensitive data
Do not place request bodies, cookies, credentials, ORM instances or raw errors into the evidence pack.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 26. Worked example — safe log projection
The canonical log projection retains selected fields, but raw path and caller request ID still need trust and cardinality policy.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 27. Metrics need bounded cardinality
Labels must have bounded cardinality. Raw URLs, emails, request IDs and arbitrary error text are unsuitable metric labels.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

## Production gates

### 28. Development is not deployment
Development, locked install, build, start, health, shutdown and deployment are separate gates.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 29. Build success does not prove runtime
A successful build can still fail to start, find configuration, serve routes or connect dependencies.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 30. Deployment owns external boundaries
TLS termination, proxy trust, secret injection, restart policy, volumes and log collection may belong to deployment owners.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 31. Security tools produce findings
Audits and scanners have scope, configuration, authentication, false positives and blind spots.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 32. Tool failure is unknown
A tool that failed to run produced unknown evidence, not a clean report.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 33. Worked example — evidence tristate gate
A tri-state gate preserves pass, fail and unknown, but truthy values are not typed or authenticated evidence.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

## Ownership, maintainability and AI change safety

### 34. Findings need ownership
Each finding needs a stable rule, severity, evidence, owner, action and any scoped exception with expiry.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 35. Maintainability is change safety
Maintainability is the capacity to change safely across responsibilities, contracts, cleanup and dependencies.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 36. AI-assisted changes start with impact maps
Before AI-assisted change, map routes, trusted identity, persistence, events, old contracts, cleanup and allowed files.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 37. Commit/event ordering matters
Commit-before-event and delivery-after-commit need explicit failure policy such as retry, pending state or outbox.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 38. Production readiness is an argument
Production readiness is a bounded argument: scope, environment, evidence, pass/fail/unknown, owners, remediation and limitations.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

## Week 14 routes

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

| Object | Route | Base obligation |
| --- | --- | --- |
| P01 | Required portfolio close | Close Regression Harness with mutation sensitivity and cleanup evidence |
| P02 | Optional advanced | Local bounded probe only if separately qualified |
| P03 | Required capstone review | Apply pass/fail/unknown review to the student project |
| P04 | Separate assessment bank | Not part of ordinary S14 |

**STOP.** This course package does not authorise publishing, a release or a FINAL tag.
