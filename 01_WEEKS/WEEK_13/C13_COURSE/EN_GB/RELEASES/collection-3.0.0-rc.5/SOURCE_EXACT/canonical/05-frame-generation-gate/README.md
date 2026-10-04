# Lecture Example — Frame generation gate

## Concept demonstrated

An iframe replacement creates a new lifecycle generation; readiness from the old document cannot activate or consume current shell state.

## Why this example is in the lecture

Two real iframe documents report readiness out of order while the shell queues one render command for the current generation.

## What to observe

- Replacement increments generation and clears obsolete queued state.
- Only the latest safe render command is retained before readiness.
- A late old-generation ready message is ignored.
- Current readiness releases the current queued command once.

## Run / inspect

```bash
node server.mjs
# Open http://127.0.0.1:4218
```

## Validation

Validated in headless Chrome: generation 2 renders once and late generation 1 readiness is ignored.
