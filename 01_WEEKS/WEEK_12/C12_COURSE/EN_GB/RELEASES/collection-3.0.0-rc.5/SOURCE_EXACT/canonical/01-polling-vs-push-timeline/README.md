# Lecture Example — Polling versus Push Timeline

## Concept demonstrated

Polling trades observation latency against repeated requests; push delivers one event when state changes.

## Why this example is in the lecture

An Express status endpoint and WebSocket event channel observe the same changing job while request counts remain visible.

## What to observe

- A shorter polling interval reduces delay but increases requests.
- A longer interval lowers traffic but may observe completion much later.
- Push requires a maintained channel and lifecycle handling even though its completion message is immediate here.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Explanation

Polling remains appropriate for infrequent changes, simple infrastructure, or reconnect-friendly status views. Push is useful when latency or server-initiated events justify a live connection.

## Variations

- Add ten idle minutes and compare requests sent when no state changes.

## Validation

Validated with real HTTP requests and a WebSocket client receiving completion.
