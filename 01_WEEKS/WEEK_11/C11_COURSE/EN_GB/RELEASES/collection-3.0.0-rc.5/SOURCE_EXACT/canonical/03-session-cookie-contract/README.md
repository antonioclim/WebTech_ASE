# Lecture Example — Session cookie contract

## Concept demonstrated

A browser session cookie carries only an opaque identifier plus deliberate transport, script-access, cross-site, scope, and lifetime attributes.

## Why this example is in the lecture

An Express response emits the cookie, making every browser-facing attribute inspectable through HTTP.

## What to observe

- `HttpOnly`, `Secure`, `SameSite`, `Path`, and bounded lifetime solve different concerns.
- Role/profile/password claims are absent.
- The cookie value is described as opaque; real IDs require cryptographic randomness and rotation.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Security boundary

This is a cookie-attribute demonstrator, not a production session system. Production also needs HTTPS, secure random IDs, server-side storage, rotation, invalidation, CSRF policy, and monitoring.

## Validation

Validated against the actual `Set-Cookie` response header.
