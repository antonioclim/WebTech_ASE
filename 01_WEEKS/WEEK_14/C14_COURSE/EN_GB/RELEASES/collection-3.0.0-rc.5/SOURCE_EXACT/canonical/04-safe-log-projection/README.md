# Lecture Example — Safe Log Projection

## Concept demonstrated

Structured logging starts from an allowlisted event schema, not serialization of an entire request or error.

## Why this example is in the lecture

Express middleware projects a real secret-bearing login request into an allowlisted completion event.

## What to observe

- Timestamp, level, event, request ID, method, path, and status remain.
- Authorization, request body, password, and stack fields do not cross the projection boundary.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

An allowlist avoids relying on every caller to remember every sensitive key. Production log pipelines still need access control, retention, and redaction verification.

## Variations

- Add a bounded duration field.
- Decide whether a user identifier is necessary and how it should be minimized.

## Validation

Validated against the emitted middleware event after a real HTTP request.
