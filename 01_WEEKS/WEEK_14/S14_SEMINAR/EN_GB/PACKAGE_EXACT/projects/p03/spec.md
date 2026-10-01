# Exercise Specification — Production Evidence Review

## Unit

Unit 14 — Testing, Observability, Performance and Production Review

## Learning objective

Evaluate a web project against explicit build, configuration, logging, security, dependency, and deployment-boundary evidence without converting a checklist into unsupported “production ready” approval.

## Why this exercise exists

Tool output and generated review prose can look authoritative while missing secrets, unsafe logs, broken builds, or deployment assumptions. Students need a reproducible evidence collector with scoped findings, severity, remediation, and honest unknowns.

## Prerequisites

- Package scripts/lock files, build versus development mode, environment configuration, structured errors/logs, authentication/security boundaries, dependency audits, and process exit semantics.

## Starting context

Students receive a deliberately small release-checklist web service fixture and sanitized review adapters:

- supplied project inventory, manifest/lock, production build command, health-check launcher, structured-log samples, dependency-audit adapter, secret/security-header/config fixtures, and expected finding taxonomy;
- supplied command runner with allowlisted fixed argument vectors and timeouts, a disposable real project, injected evidence for deterministic failure paths, reporter, and categorized tests;
- incomplete `src/production-review.mjs`, the only file students implement.

## Required behavior

- Accept an explicit project root and injected evidence adapters; reject traversal/out-of-root paths and never execute caller-provided arbitrary shell text.
- Inventory required artifacts and separate development input, build output, runtime configuration, persistent state, and reverse-proxy/TLS responsibilities.
- Verify locked install evidence, dependency audit result, production build exit/output artifact, start command/health response, and clean shutdown. A passing build does not imply a passing runtime gate.
- Parse structured JSON log samples and require timestamp, level, event, request correlation, and safe public fields. Flag tokens, passwords, cookies, authorization values, stacks, and unbounded bodies; do not reproduce secret values in findings.
- Check configuration for required environment variables, safe defaults, `.env`/generated/database exclusions, and explicit secret absence. Missing deployment-owned TLS/proxy evidence is recorded as `unknown`, not silently passed.
- Inspect supplied HTTP evidence for stable error envelope and baseline security headers appropriate to this scoped service; distinguish application headers from deployment headers.
- Normalize dependency/scanner/tool observations into stable findings with rule ID, severity, evidence location, remediation, and status `pass|fail|unknown`. Tool failure is `unknown` or a finding, never a clean result.
- Apply a documented gate: critical/high failures make the review fail; unknown deployment evidence remains visible; intentional exceptions require a reason and expiry/owner field.
- Produce deterministic JSON plus concise human output without absolute host paths, secret values, raw tool stacks, or unsupported certification language.
- Dispose launched processes/timers and permit an independent second review.

## Constraints

- JavaScript ESM, Node LTS, native filesystem/process/fetch APIs, supplied allowlisted runner, no new runtime dependency.
- Implement only `src/production-review.mjs`; preserve fixture, runner, reporter, evidence adapters, manifest, and tests.
- No arbitrary command interpolation, auto-fix, destructive scan, external deployment, live secret use, ZAP claim without an actual scan, “production ready” boolean without scoped evidence, hidden unknowns, raw secret/error output, or source changes outside the review module.

## Observable completion criteria

- Clean supplied project passes build/start/health and emits a deterministic report with known deployment unknowns visible.
- Each supplied defect fixture—failed build, unhealthy runtime, leaked authorization log, committed secret-shaped config, missing header, audit-tool failure—is detected and classified without leaking its value.
- Gate result, findings, exceptions, and unknowns remain stable across two runs; no process/timer remains active.
- Categorized checks pass and only `src/production-review.mjs` differs.

## Validation plan

### Baseline checks

- Supplied inventory, safe runner, fixture build/start/health, audit/log/config/header evidence, reporter, and defect adapters operate independently.

### Objective checks

- Root confinement, stable inventory, and build/runtime/deployment separation.
- Locked install/audit/build/start/health/shutdown evidence and tool-failure treatment.
- Structured log/schema/redaction and config/secret/exclusion checks.
- Security/error header evidence, findings taxonomy, unknowns, exceptions, and severity gate.
- Defect matrix, deterministic redacted outputs, second-run isolation, and zero resources.

### Regression checks

- Fixture application and production build behavior remain unchanged.
- Allowlisted runner cannot execute arbitrary caller text; reports contain no absolute paths or seeded secret values.
- No external scan/deploy, auto-fix, hidden unknown, dependency, or certification claim is added.

### Integration check

- The allowlisted runner performs a locked install and audit, builds a real fixture, launches the built artifact, checks `/health`, and shuts the process down.

## Intended student work

After complete reference validation, copy the reference and replace only `src/production-review.mjs` with a fail-closed API-compatible reviewer that returns an explicit unavailable/unknown report and cleans injected resources. Supplied build/runtime fixture and evidence adapters remain healthy; review detection and gate objectives fail.

## Gemini task

> Implement only `src/production-review.mjs`. Confine the project root; collect allowlisted locked-install/audit/build/start/health evidence; review structured logs, secrets/config, error/security headers, deployment boundaries, exceptions, and unknowns; normalize redacted findings and severity gate; clean processes/timers. Preserve fixtures/runner/tests and never execute arbitrary shell text or claim certification. Done when every supplied clean/defect matrix, deterministic report, cleanup diagnostic, and one-file diff passes. Explain what remains unknown.

## Debugging / extension task

- Make the audit adapter fail to execute, observe an incorrect “no vulnerabilities” result, then restore explicit `unknown` tool status and a failing policy decision.

## Out of scope

- Real deployment, penetration testing, live ZAP/k6 run, legal compliance certification, container orchestration, TLS termination setup, secret rotation, automatic remediation, or comprehensive production readiness proof.
