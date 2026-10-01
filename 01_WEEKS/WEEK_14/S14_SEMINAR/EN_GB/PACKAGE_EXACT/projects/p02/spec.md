# Exercise Specification — Load and Failure Probe

## Unit

Unit 14 — Testing, Observability, Performance and Production Review

## Learning objective

Run a bounded concurrent workload with explicit failure injection, trustworthy latency/error measurements, thresholds, and complete request/server cleanup.

## Why this exercise exists

A single fast request says little about behavior under concurrency or failure. Students need a small reproducible probe that distinguishes offered work, completed work, application failures, transport failures, latency distribution, and an evidence-bounded threshold decision.

## Prerequisites

- Async concurrency, native fetch/AbortSignal, HTTP status semantics, percentiles conceptually, stable errors, deterministic injection, and process lifecycle.

## Starting context

Students receive the release-checklist API plus:

- supplied loopback server with deterministic latency/failure injection controlled by server-side scenario configuration, not caller headers;
- supplied request factory, monotonic clock, bounded sample set, expected oracle, CLI reporter, fake clock/fetch adapters, and categorized tests;
- incomplete `src/load-probe.mjs`, the only file students implement.

## Required behavior

- Validate a scenario with bounded request count, concurrency, timeout, target path/method, and threshold policy before starting any request.
- Run exactly the requested work with at most `concurrency` requests in flight; install bookkeeping/timeout before dispatch and never create an unbounded `Promise.all` burst.
- Measure each request from dispatch to complete body consumption with the supplied monotonic clock. Store bounded numeric samples and compute min, median, p95, max, and mean using a documented nearest-rank p95 rule.
- Classify successful responses, expected application failures (safe non-2xx), timeouts, and transport failures separately. Never count an HTTP `500` as transport success merely because fetch resolved.
- Attach an opaque request ID for trace correlation without using it to activate server failure. Validate safe public error bodies and do not retain response bodies or raw exceptions in the report.
- Abort timed-out work once, ignore late settlement, and release timer/abort state on every terminal path. One failure must not cancel unrelated requests unless the scenario explicitly says fail-fast.
- Evaluate thresholds only after all scheduled work settles: minimum success ratio, maximum application/transport/timeout counts, and p95 budget. Return a nonzero CLI outcome for a breached policy while still printing the complete summary.
- Support an explicit warm-up count excluded from measurements; report configuration and sample count so results are reproducible and honestly bounded.
- Dispose cleanly with zero active requests/timers and allow a second independent run in the same process.

## Constraints

- JavaScript ESM, Node LTS native fetch/timers/performance, no load-test/runtime dependency.
- Implement only `src/load-probe.mjs`; preserve server, scenario adapters, reporter, fakes, fixtures, and tests.
- No production benchmark claim, Internet target, caller-triggered failure header, unbounded concurrency, body retention, raw error/stack output, average-only decision, busy wait, arbitrary sleep synchronization, module-global run state, or weakening thresholds to pass.

## Observable completion criteria

- Deterministic fake run proves concurrency never exceeds its limit and classifies deliberately reversed success, application error, timeout, and transport failure exactly once.
- Real loopback run injects documented latency/failures, completes all work, reports correct totals/percentiles, breaches and passes known policies as expected, and leaves no active resources.
- Categorized checks pass and only `src/load-probe.mjs` changes.

## Validation plan

### Baseline checks

- Supplied API, deterministic server-side injection, scenario config, clock/fetch fakes, expected oracle, and reporter operate independently.

### Objective checks

- Scenario validation, bounded scheduling, pending-before-dispatch, and exact request count.
- Body-complete monotonic timing, warm-up exclusion, nearest-rank statistics, and bounded samples.
- Exact success/application/timeout/transport classification with safe correlation fields.
- Timeout/late-settlement isolation, second-run independence, and zero diagnostics.
- Real loopback pass/fail threshold outcomes and complete CLI summary.

### Regression checks

- Normal API behavior remains intact and injection cannot be activated by an arbitrary client header.
- Dependency-free ESM, bounded configuration, and stable output schema remain healthy.
- No Internet target, unbounded burst, average-only policy, body/raw-error retention, sleep/busy wait, global state, or production performance claim appears.

## Intended student work

After reference/loopback validation, copy the reference and replace only `src/load-probe.mjs` with a fail-closed API-compatible runner that validates basic disposal, schedules no requests, and reports probe unavailable. Server/API/fakes/reporter remain healthy; load and measurement objectives fail promptly.

## Gemini task

> Implement only `src/load-probe.mjs`. Validate bounded scenarios, schedule exact work under a concurrency cap, time through body consumption with the supplied clock, classify HTTP/application/timeout/transport outcomes, compute documented statistics, evaluate thresholds after settlement, and clean every timer/controller/request. Preserve server/reporter/tests; no external target or production benchmark claim. Done when deterministic ordering, real injected loopback scenarios, resource diagnostics, and one-file diff pass. Explain the limits of the evidence.

## Debugging / extension task

- Change the probe to measure only until response headers arrive, add delayed bodies, compare the falsely low p95, then restore body-complete timing.

## Out of scope

- k6 implementation, distributed load generation, capacity planning, soak tests, browser rendering metrics, autoscaling, Internet targets, production SLO certification, or statistical confidence claims.
