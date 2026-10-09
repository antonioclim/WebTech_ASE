# Lecture Example — BullMQ Job Lifecycle

## Concept demonstrated

An HTTP-facing projection follows a real BullMQ job from acceptance through worker progress to terminal completion.

## Why this example is in the lecture

Express, BullMQ, a worker, and Redis make ownership of acceptance, execution, and public status observable.

## What to observe

- `queued → active → completed|failed` is directional.
- The HTTP process owns acceptance while the worker owns execution.
- Redis/BullMQ records are not returned as the public contract.
- The projection is client-facing state, distinct from the queue’s internal job record.

## Run / inspect

```bash
podman compose up -d
npm install
REDIS_URL=redis://127.0.0.1:6387 npm test
podman compose down
```

## Explanation

Retries and distributed delivery can produce duplicates or surprising order. A projection must define valid transitions and idempotent terminal handling rather than trust event order.

## Variations

- Fail the job and send a late completion event; confirm the terminal state remains failed.

## Validation

Validated against a real Redis-backed BullMQ queue and worker.
