# Lecture Example — Credentialed CORS policy

## Concept demonstrated

Credentialed browser response sharing requires an exact origin allowlist, a specific reflected origin, and `Vary: Origin`.

## Why this example is in the lecture

Three origins exercise exact allow/deny behavior against a real Express response.

## What to observe

- A lookalike attacker origin is denied.
- An unlisted parent origin is denied.
- A trusted exact origin receives credential and cache-vary headers.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Security boundary

This example only models response-sharing policy. It does not replace authentication, authorization, or CSRF protection.

## Validation

Validated through HTTP response headers for trusted, parent, and suffix-lookalike origins.
