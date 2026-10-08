# Lecture Example — Evidence Tristate Gate

## Concept demonstrated

Missing evidence is `unknown`, not `pass`. Policy decides which unknowns block while every unknown remains visible.

## Why this example is in the lecture

The review runs a real syntax command, observes a missing required audit tool, and records absent deployment-owned TLS evidence.

## What to observe

- A known successful build passes its rule.
- A required dependency-audit tool failure is unknown and blocking.
- Deployment-owned TLS evidence is unknown and visible but non-blocking in this pre-deployment review.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

`pass`, `fail`, and `unknown` preserve epistemic state. Severity, ownership, and required evidence then determine the gate.

## Variations

- Add an exception with owner, reason, and expiry.
- Make TLS evidence required at a deployment-stage gate.

## Validation

Validated from actual subprocess exit/error evidence and an explicit deployment artifact boundary.
