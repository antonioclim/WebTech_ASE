# Exercise Specification — Capstone Requirement Extension

## Unit

Unit 14 — Testing, Observability, Performance and Production Review

## Learning objective

Add an idempotent, atomic bulk-archive requirement to an existing tested release-checklist application by making a bounded change that preserves prior contracts and produces auditable evidence.

## Why this exercise exists

The final engineering task is not greenfield generation. Students must read an existing application, specify a meaningful change, preserve behavior, update tests and observability, and review an AI-assisted diff for scope and correctness.

## Prerequisites

- REST/API design, transactions and consistency, authorization concepts, stable errors, idempotency, structured logging, regression testing, performance/failure review, and the Unit 14 evidence workflow.

## Starting context

Students receive the validated release-checklist application from the earlier Unit 14 projects with existing list/create/complete behavior and regression contracts, plus:

- supplied repository transaction adapter, authorization/context adapter, HTTP route shell for `POST /api/checklists/archive`, idempotency store, structured event sink, deterministic clock, fixture/client, and old regression suite;
- supplied objective tests for the approved extension and failure injection at transaction/event/idempotency boundaries;
- incomplete `src/archive-extension.mjs`, the only file students implement.

## Required behavior

- Accept an authenticated principal, owner-scoped `releaseId`, optional bounded checklist IDs, required idempotency key, and `dryRun` boolean through the supplied route shell. Never trust owner/role fields from the body.
- Validate and normalize input before opening a transaction. Reject empty/oversized/duplicate/invalid ID sets, malformed release/key, and unsupported fields with stable safe errors and no mutation.
- Authorize the release operation through the supplied trusted context before reading concealed owner data; unauthorized and unknown releases share the documented concealed response.
- Select only completed, non-archived checklists in the authorized release. A dry run returns the deterministic candidate IDs/count with no transaction, idempotency record, or archive event.
- For a real operation, reserve the owner-scoped idempotency key with a canonical request fingerprint. The same key+fingerprint replays the original safe result; the same key with different input fails with a stable conflict.
- Archive all selected records atomically through the supplied transaction. An injected failure leaves every record unarchived and creates no completed idempotency result/event.
- Commit a minimal result, then emit one structured `checklists.archived` event containing request ID, principal ID, release ID, count, and no checklist bodies/secrets. Event-delivery failure is handled through the supplied post-commit policy and must not roll back committed data or falsely replay success without status.
- Concurrent duplicate calls settle to one mutation/event and one replayable result; no double count. A later call with a new key selects no already archived items and succeeds with count zero.
- Preserve every prior list/create/complete/error contract and existing performance/resource bounds; do not rewrite the application or add a second persistence path.
- Expose deterministic diagnostics and dispose idempotency/event resources cleanly for repeated tests.

## Constraints

- JavaScript ESM, supplied repository transaction/idempotency/event interfaces, no new runtime dependency.
- Implement only `src/archive-extension.mjs`; preserve route/application/repository, previous regression suite, fakes, fixtures, manifests, and tests.
- No body-supplied identity/role, per-item independent commits, in-memory shortcut bypassing repository, raw database/error leak, global idempotency key without owner scope, event before commit, broad application rewrite, new framework, or claim of distributed exactly-once delivery.

## Observable completion criteria

- Authorized dry-run and atomic archive produce exact stable results; old endpoints remain unchanged.
- Validation, concealment, rollback, idempotent replay/conflict, concurrent duplicate, post-commit event failure, already-archived, and disposal paths behave as documented.
- Old regression harness plus new objective/integration checks pass; one live HTTP trace shows dry-run, commit, replay, and follow-up list state.
- Reference/student comparison changes only `src/archive-extension.mjs`.

## Validation plan

### Baseline checks

- Existing release-checklist list/create/complete API, regression harness, route shell, repository transaction, trusted context, idempotency/event adapters, fixtures, and client remain healthy without the extension.

### Objective checks

- Input normalization, trusted authorization, owner concealment, candidate selection, and dry-run no-side-effect behavior.
- Atomic commit/rollback and preserved old endpoint behavior.
- Owner-scoped fingerprinted idempotency replay/conflict and concurrent duplicate isolation.
- Commit-before-event ordering, minimal structured event, and explicit post-commit delivery-failure policy.
- Live HTTP dry-run/commit/replay/follow-up state plus disposal/second-run diagnostics.

### Regression checks

- All prior Unit 14 regression contracts pass unchanged.
- No identity trust, per-item commits, persistence bypass, event-before-commit, raw error/body leak, dependency/framework, global state, or exactly-once claim appears.
- Invalid/denied/failure requests leave state and events unchanged.

## Intended student work

After reference validation, copy the reference and replace only `src/archive-extension.mjs` with an API-compatible fail-closed extension that validates disposal and returns `archive_unavailable` before any repository/idempotency/event action. Existing application and old regression suite remain healthy; all new archive objectives fail safely.

## Gemini task

> Implement only `src/archive-extension.mjs`. Read the existing app/contracts first; validate bounded input, use trusted owner authorization, dry-run without effects, reserve owner-scoped fingerprinted idempotency, archive candidates in one transaction, commit before one minimal event, handle replay/conflict/concurrency/post-commit delivery failure, and preserve all old tests. Do not rewrite or add dependencies. Done when old regression plus new failure/concurrency/live HTTP checks and one-file diff pass. Explain transaction, idempotency, and event ordering.

## Debugging / extension task

- Move event emission before transaction commit, inject a commit failure, observe the false archived event, then restore commit-before-event ordering and its regression.

## Out of scope

- Distributed transactions, message broker/outbox implementation, cross-service exactly-once delivery, background retry worker, UI redesign, database migration tooling, deployment, or broad capstone rewrite.
