# Lecture Example — Async continuation order

## Concept demonstrated

`await` pauses one async function's continuation; it does not block the current script or the JavaScript runtime.

## Why this example is in the lecture

Five log entries make the scheduling model observable without network or UI concerns.

## What to observe

- The async function starts synchronously.
- Code after `await` runs only after the current stack clears.
- The returned promise settles after the continuation completes.

## Run / inspect

```bash
node example.js
```

## Explanation

Calling `run` executes through `before await`, schedules its continuation, and immediately returns a promise. The top-level code logs `script end`; only then can the continuation and `.then` callback run.

## Variations

- Add a second `await` and predict its place in the log.
- Replace the resolved promise with a rejected one and add a targeted `try`/`catch`.

## Validation

Validated with `node example.js`; an assertion verifies the exact five-entry order.
