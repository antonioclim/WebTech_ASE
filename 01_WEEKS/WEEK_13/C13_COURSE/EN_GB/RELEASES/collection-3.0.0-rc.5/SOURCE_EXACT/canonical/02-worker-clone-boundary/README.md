# Lecture Example — Worker Clone Boundary

## Concept demonstrated

`postMessage` crosses an execution boundary by structured cloning. The main thread and worker do not share the posted object.

## Why this example is in the lecture

The complete browser example is only one request and one response, making the ownership boundary visible before correlation, cancellation, and progress complicate the protocol.

## What to observe

- The worker receives `[2, 4, 6]` and computes `12`.
- The main thread immediately changes its own first value to `99`.
- The page reports both results and sets `data-result="pass"`; the mutation did not alter the worker's clone.

## Run / inspect

```bash
node server.mjs
# Open http://127.0.0.1:4215
```

## Explanation

The worker has no DOM access. The main module owns the status element and terminates the worker after the one response. Structured cloning avoids shared object mutation, but it also has copying cost.

## Variations

- Try posting a function and inspect the `DataCloneError`.
- Compare a transferred `ArrayBuffer` with this copied record.

## Validation

Validated in headless Chrome: the rendered body reached `data-result="pass"` and displayed `worker total=12; main first=99`.
