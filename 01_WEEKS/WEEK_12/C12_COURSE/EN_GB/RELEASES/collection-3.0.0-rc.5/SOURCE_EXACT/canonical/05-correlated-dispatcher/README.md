# Lecture Example — Correlated dispatcher

## Concept demonstrated

A dispatcher installs pending state before sending and settles concurrent callers by request ID rather than reply order.

## Why this example is in the lecture

A real WebSocket server replies out of order while the dispatcher correlates each response with its requesting promise.

## What to observe

- Pending state exists before `send` runs.
- Reversed replies resolve the correct promises.
- Terminal settlement removes the map entry.
- Unknown/late replies are ignored.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Boundary

The tutorial adds timeout, abort, transport-close, listener, and disposal cleanup; this example isolates correlation only.

## Validation

Validated with reversed replies over a real WebSocket connection and pending-state cleanup.
