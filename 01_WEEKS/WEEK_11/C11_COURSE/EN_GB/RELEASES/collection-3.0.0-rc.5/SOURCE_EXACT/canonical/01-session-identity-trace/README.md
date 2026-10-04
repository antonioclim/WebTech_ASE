# Lecture Example — Session Identity Trace

## Concept demonstrated

An opaque cookie identifies server-side session state; it is not itself the user or their permissions.

## Why this example is in the lecture

Four real Express requests make login, cookie parsing, trusted lookup, and logout invalidation observable at the HTTP boundary.

## What to observe

- Missing and invented session IDs remain anonymous.
- The principal comes from trusted server state, not cookie claims.
- Removing server state immediately invalidates the same browser cookie.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Explanation

Real session IDs must be unpredictable, transported over HTTPS, and protected with suitable cookie attributes. This trace isolates only the lookup mental model; it is not a production session implementation.

## Variations

- Put `role=admin` in the cookie and verify that it cannot alter the server-side principal.

## Validation

Validated through the Express HTTP interface; opaque lookup, forged claims, and invalidation pass.
