# Lecture Example — URL boundaries

## Concept demonstrated

A URL has separately observable components and its fragment is a browser-side navigation detail rather than part of an HTTP request target.

## Why this example is in the lecture

Printing parsed fields replaces the vague idea of “the URL” with an inspectable data structure.

## What to observe

- `pathname` and `searchParams` select and parameterise a server resource.
- `hash` is available to client code but is omitted from the derived request target.
- Query decoding turns `%20` into a space without changing the original URL string.

## Run / inspect

Run the relative commands in this README from this example’s own folder under `C01_COURSE/EN_GB/04_CANONICAL_EXAMPLES`. When using the package-root commands in the C01 start guide, keep the full `04_CANONICAL_EXAMPLES/...` path instead. All examples use Node built-ins; follow the capability policy and retain actual warnings.

```bash
node example.js
```

## Explanation

The built-in `URL` class parses the address without a dependency. The example then constructs the portion an HTTP client sends from the path and query only.

## Variations

- Add a second `tag` parameter and inspect `searchParams.getAll("tag")`.
- Remove the query or fragment and observe which fields become empty strings.

## Expected result and verification scope

The supplied check can be run with `node example.js`; the expected successful assertions establish that the printed request target excludes `#details`.
