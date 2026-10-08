# Lecture Example — Accepted job contract

## Concept demonstrated

`202 Accepted` follows successful enqueue, identifies later status, and does not claim that work completed.

## Why this example is in the lecture

An Express endpoint awaits an injected queue adapter before emitting the actual HTTP response.

## What to observe

- Enqueue is awaited before the response exists.
- `Location` identifies status by opaque job ID.
- The public state is `queued`, not `completed`.
- Enqueue failure produces no false acceptance.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Validation

Validated through HTTP for successful enqueue and queue failure.
