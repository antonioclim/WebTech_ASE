# Exercise Specification — Regression Harness

## Unit

Unit 14 — Testing, Observability, Performance and Production Review

## Learning objective

Build a behavior-focused API regression harness that distinguishes unit, integration, and HTTP contract checks and proves its assertions detect realistic mutations.

## Why this exercise exists

Passing tests are weak evidence when they only repeat implementation details or never fail under a defect. Students need to select boundaries, isolate state, assert observable contracts, and demonstrate that the suite detects plausible regressions.

## Prerequisites

- Node ESM, native test runner, HTTP/REST semantics, dependency injection, deterministic fixtures, async cleanup, and the stable course error envelope.

## Starting context

Students receive a dependency-free release-checklist service with:

- supplied validated domain/repository and native HTTP adapter supporting list, create, complete, validation, `404`, and the canonical JSON error shape;
- supplied deterministic request/client helper, fixture reset, seeded defect adapters, baseline checks, regression checks, and meta-test runner;
- incomplete `src/regression-harness.mjs`, the only file students implement.

## Required behavior

- Export a suite descriptor that separates pure service cases, repository/service integration cases, and HTTP contract cases rather than treating every check as an end-to-end test.
- Create isolated fixtures per case; tests are order-independent, repeatable, and perform no external network, clock, random, or shared-file/database access.
- Cover successful list/create/complete behavior and observable state transitions without asserting private function calls or exact internal object identity.
- Cover invalid JSON/domain input, duplicate completion/idempotent behavior, unknown resource, method/path mismatch, and canonical safe error responses.
- Assert HTTP status, content type, public JSON shape, relevant headers, and persisted follow-up state; avoid snapshotting unstable fields or whole responses without purpose.
- Close every created server and reject/finish every request on failure; the harness leaves zero open servers and can run twice in one process.
- Execute supplied named defect adapters and report which expected contract each violates. The complete harness must kill wrong-status, mutation-without-persistence, leaked-internal-error, and shared-state defects.
- Produce concise named results suitable for CI; a failed assertion identifies behavior and boundary without dumping secrets or internal stacks.

## Constraints

- JavaScript ESM, Node LTS native `node:test`/`assert`, native HTTP/fetch, no runtime or test-framework dependency.
- Implement only `src/regression-harness.mjs`; preserve application, adapters, defect fixtures, runner, manifests, and tests.
- No implementation-source text matching, private-method spies, sleeps, fixed external ports, production database, broad snapshots, generated test cases with no reviewed assertions, or claims that mutation samples prove complete correctness.

## Observable completion criteria

- Clean run passes all intended unit/integration/API contracts twice with isolated state and zero open server handles.
- Each of four supplied realistic defects is detected by at least one specific contract, while the correct adapter produces no false failure.
- Categorized checks pass and only `src/regression-harness.mjs` differs between validated reference and student trees.

## Validation plan

### Baseline checks

- Supplied release-checklist service, repository, HTTP adapter, client, deterministic fixtures, and defect adapters behave independently of the missing harness.

### Objective checks

- Boundary-separated descriptor and behavior-oriented assertions.
- Isolated repeatable unit and integration contracts.
- HTTP success, validation, not-found, method/path, error-shape, content-type, and persisted follow-up contracts.
- Four seeded defects are killed and attributed without source inspection or brittle snapshots.
- Second-run/resource cleanup and concise safe CI result behavior.

### Regression checks

- Dependency-free ESM package and documented commands remain healthy.
- Application code remains unchanged and contains canonical safe error boundaries.
- No external network/fixed port, sleep, leaked server, source matching, private spy, secret, or completeness claim is introduced.

## Intended student work

After reference validation, copy the reference and replace only `src/regression-harness.mjs` with an API-compatible empty harness that reports no cases and closes safely. Supplied application and baseline infrastructure still work; coverage, defect detection, and API contract objectives fail.

## Gemini task

> Implement only `src/regression-harness.mjs`. Define separate unit, integration, and HTTP behavior contracts with isolated fixtures; assert stable status/header/public-body/follow-up state; run twice without leaked servers; and prove the suite kills all four supplied defects. Preserve app/adapters/tests, use native Node APIs, and avoid source matching/private spies/sleeps/broad snapshots. Done when categorized checks, mutation evidence, cleanup diagnostics, and one-file diff pass. Explain why each case belongs at its chosen boundary.

## Debugging / extension task

- Remove the follow-up read after create, run the persistence defect, observe the false pass, then restore the state-based assertion and explain why response-only testing was insufficient.

## Out of scope

- Browser automation, coverage percentage targets, fuzzing, full mutation-testing tools, production databases, third-party test frameworks, visual regression, or exhaustive correctness proof.
