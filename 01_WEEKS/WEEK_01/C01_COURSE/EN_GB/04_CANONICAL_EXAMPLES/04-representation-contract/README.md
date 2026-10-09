# Lecture Example — Representation contract

## Concept demonstrated

The declared media type determines how a response body should be interpreted; JSON-looking text is not automatically a JSON representation.

## Why this example is in the lecture

It separates resource, representation, declaration and valid serialization without introducing a server framework.

## What to observe

- Media-type parameters such as `charset` do not change the base type.
- A JSON-looking body declared as `text/plain` remains text.
- Declaring `application/json` does not make malformed bytes valid JSON.

## Run / inspect

Run the relative commands in this README from this example’s own folder under `C01_COURSE/EN_GB/04_CANONICAL_EXAMPLES`. When using the package-root commands in the C01 start guide, keep the full `04_CANONICAL_EXAMPLES/...` path instead. All examples use Node built-ins; follow the capability policy and retain actual warnings.

```bash
node example.js
```

## Explanation

The inspector reads the header before choosing a parser. The body and header must agree; neither should be guessed from the other.

## Variations

- Remove `Content-Type` and decide whether the client should guess.
- Add `application/problem+json` and discuss explicit support for structured suffixes.

## Expected result and verification scope

The supplied check can be run with `node example.js`; it asserts the JSON, text and invalid-JSON outcomes.
