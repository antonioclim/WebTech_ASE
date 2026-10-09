# Lecture Example — Seeded defect sensitivity

## Concept demonstrated

A regression suite is useful when assertions distinguish realistic faults, not merely when the happy path stays green.

## Why this example is in the lecture

Three seeded Express service variants are exercised through actual create/list/failure HTTP requests.

## What to observe

- Correct body with wrong creation status fails only the status contract.
- Claimed success without stored state fails the persistence contract.
- A raw secret-bearing failure violates the sanitization contract.

## Run / inspect

```bash
npm install
npm test
```

## Validation

Validated through public HTTP contracts; each seeded defect produces only its expected failure.
