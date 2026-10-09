# Lecture Example — Response contract check

## Concept demonstrated

Runtime checks turn HTTP-contract claims into evidence: creation, validation failure and unexpected failure need different statuses and response shapes.

## Why this example is in the lecture

It models the verification step used after an AI agent proposes response descriptors, without building another HTTP server.

## What to observe

- A creation result uses `201` and identifies the created resource.
- A client error uses a 4xx status and a stable machine-readable code.
- A check can reject a plausible-looking but semantically incorrect `200` response.

## Run / inspect

Run the relative commands in this README from this example’s own folder under `C01_COURSE/EN_GB/04_CANONICAL_EXAMPLES`. When using the package-root commands in the C01 start guide, keep the full `04_CANONICAL_EXAMPLES/...` path instead. All examples use Node built-ins; follow the capability policy and retain actual warnings.

```bash
node check.js
```

## Explanation

`responses.js` contains small response descriptors. `check.js` independently asserts their public contract. This separation mirrors reviewing behaviour rather than trusting the implementation that produced it.

## Variations

- Change the creation status to `200` and inspect the focused failure.
- Add a `500` descriptor without exposing an internal stack trace.

## Expected result and verification scope

The supplied check can be run with `node check.js`; the expected successful run prints `3 response contracts verified`.
