# Lecture Example — Generated-code audit

## Concept demonstrated

Plausible generated code can combine truthiness, implicit coercion, and broad assumptions into an incorrect result; an audit makes accepted types and failure ownership explicit.

## Why this example is in the lecture

It preserves the most useful coercion and error-boundary material as one concluding review example aligned with the Generated-Code Audit tutorial.

## What to observe

- The string `"false"` passes a truthiness filter.
- Adding a string estimate changes the accumulator from a number to a string.
- Exact validation reports different type and range failures.
- The parser throws; the batch owner catches because it decides to continue and report rows.

## Run / inspect

```bash
node example.js
```

## Explanation

The unsafe function is syntactically compact and superficially idiomatic. The audit begins at its input contract, supplies counterexamples, and preserves precise failures instead of silently substituting defaults.

## Variations

- Add an empty estimate and predict both the generated and validated outcomes.
- Replace the targeted batch result with a broad catch returning `0` and identify the lost evidence.

## Validation

Validated with `node example.js`; the coercion defect, error categories, accepted row, and repaired numeric result are asserted.
