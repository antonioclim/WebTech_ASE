# Exercise Specification — Reduced Security Boundary (CORS and CSRF)

Implement exact-origin CORS decisions and cookie-authenticated unsafe-method CSRF verification in `src/security-boundary.js`. Preserve the support module, tests and package metadata. Fail closed, include `Vary: Origin`, keep safe methods distinct and never reveal token values. Do not add network access, servers, exploit traces or dependencies.
