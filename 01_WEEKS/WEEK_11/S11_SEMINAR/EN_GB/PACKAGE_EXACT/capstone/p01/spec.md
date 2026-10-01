# Exercise Specification — Authenticated Session API

## Unit

Unit 11 — Authentication, Authorization and Web Security

## Learning objective

Implement a scoped Express authentication boundary that verifies password hashes, rotates an opaque server-side session, and protects a current-user resource through hardened cookie semantics.

## Why this exercise exists

Authentication establishes who is making a request; it does not decide every action they may perform. Students need one inspectable login/session/logout flow that avoids plaintext passwords and fake self-decodable tokens while making browser cookie and HTTPS assumptions explicit.

## Prerequisites

- Express middleware, JSON validation, centralized errors, and native-fetch loopback tests.
- Browser cookies, headers, status codes, injected clocks/randomness, and async error handling.

## Starting context

Students receive an Express 5 ESM account API with:

- a supplied immutable user repository containing deterministic `scrypt` password-hash records and public-user projections;
- a supplied in-memory session store with injected `clock.now()`, `randomBytes()`, TTL, one-time rotation, cleanup, and hashed opaque-token keys;
- supplied JSON parsing, HTTPS-awareness middleware, origin policy for credential-bearing writes, cookie serializer/parser, centralized errors, `/health`, server harness, and tests;
- incomplete `src/authentication.js`, exporting `createAuthentication({ users, sessions, passwordVerifier })`, whose `router` handles login/logout and whose `requireUser` middleware protects `GET /api/me`;
- no real credentials, committed secret, or production persistence.

The memory store and deterministic fixtures are explicitly teaching infrastructure, not a production session deployment.

## Required behavior

- `POST /api/session` accepts exactly `{ email, password }` as nonblank strings, normalizes email only, and rejects invalid shape as `400 validation_failed` before verification.
- Enforce the supplied trusted-origin/HTTPS boundary before credential-bearing login/logout. Production-mode insecure requests fail closed; no password/session value is logged or returned.
- Look up by normalized email and always execute one injected password verification path, including an equivalent dummy hash when the account is absent, to avoid an obvious user-existence timing branch.
- Failed credentials return one stable `401 invalid_credentials` response without identifying whether email or password failed and without creating a session.
- Successful login invalidates any presented session, creates a new random opaque session bound only to the internal user ID, and returns `200 { data: publicUser }`.
- Set the session cookie with the supplied fixed name plus `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`, exact `Max-Age`, and no user/profile data in the cookie.
- `requireUser` hashes/looks up the opaque token through the supplied store, checks expiry, attaches a frozen public principal, and returns stable `401 authentication_required` for missing/invalid/expired sessions.
- `GET /api/me` returns only `{ id, email, displayName }`; never password hash parameters, roles/permissions not requested by this resource, token, or internal store data.
- `DELETE /api/session` invalidates the current token when present, clears the cookie with matching scope/security attributes, and returns `204` without leaking whether the token existed.
- Login rotates rather than reuses a caller-supplied token; logout and expiry prevent later protected access; independent stores remain isolated.
- Unexpected repository/verifier/store failures reach sanitized centralized `500` handling.

## Constraints

- JavaScript ESM, Express 5.1.0, Node.js LTS `crypto.scrypt`/`timingSafeEqual`, native fetch, pinned lock file.
- Implement only `src/authentication.js`; preserve user/session/password/cookie/origin/HTTPS utilities, app assembly, tests, fixtures, and dependencies.
- Use the supplied opaque server-side session model; no JWT, localStorage token, Basic auth, plaintext/reversible password storage, home-grown encryption, third-party identity provider, logging dependency, database, or production claims.
- Do not compare password hash strings directly, return internal errors, or branch around verification for unknown users.

## Observable completion criteria

- Live cookie-jar traces prove failed login, successful login, `/api/me`, rotation, logout, expiry, and post-logout denial.
- Cookie attributes differ correctly between deterministic development and production HTTPS modes.
- Unknown-user and wrong-password paths invoke equivalent verifier work and return the same public result.
- Public responses/log captures contain no password, hash/salt, token, session key, stack, or internal error.
- Categorized checks/audit pass and only `src/authentication.js` changes.

## Validation plan

### Baseline checks

- User hash fixture and injected `scrypt` verifier validate the known password and reject another.
- Session store create/hash/lookup/rotate/invalidate/expiry and cookie/origin/HTTPS utilities work independently.
- Express app/server, health, JSON/error boundary, and a supplied protected-route probe are healthy with known passthrough authentication.

### Objective checks

- Exact login shape/normalization and stable validation errors.
- Equivalent known/unknown credential verification, stable denial, and zero session creation on failure.
- Successful opaque-session creation/rotation, exact cookie attributes, and public projection.
- Missing/invalid/expired authentication and frozen principal behavior.
- `/api/me`, logout/clear-cookie, post-logout denial, independent stores, and forwarded failure sanitization.
- Source checks for supplied verifier/store/cookie boundaries and bans on tokens/JWT/plaintext/manual crypto shortcuts.

### Regression checks

- Health, malformed JSON, unknown routes, origin/HTTPS enforcement, and later requests remain healthy.
- Supplied user/session/cookie/security utilities and deterministic fixtures remain unchanged.
- Authentication module contains no authorization policy beyond requiring a verified principal.
- No secrets, credentials, tokens, password fields, hashes, or internal failures appear in responses/logs.

## Intended student work

After reference validation, copy the reference and replace only `src/authentication.js` with a runnable unavailable router/middleware contract retaining imports, exports, cookie name, and focused TODOs. Health, security utilities, password/session baselines, app startup, malformed/unknown handling, and build-independent checks remain healthy; login/protected/logout objectives fail at the unavailable boundary.

No completed credential/session flow is duplicated in tests, fixtures, utilities, prose, generated output, or alternate routes.

## Gemini task

> Inspect `spec.md`, supplied user/session/password/cookie/origin/HTTPS contracts, app mounting order, and categorized checks. Implement only `src/authentication.js`: exact login validation, equivalent hash verification, stable credential denial, opaque session rotation, hardened cookie, protected principal middleware, public `/api/me`, and non-enumerating logout. Forward unexpected failures and expose no secrets. Do not edit supplied files, add dependencies/JWT/localStorage/Basic auth, implement authorization, log credentials/tokens, or claim the memory store is production-ready. Done when all checks/audit/live cookie traces pass and the diff is one file. Explain each trust boundary and public denial.

## Debugging / extension task

- Temporarily skip password verification for an unknown email and instrument verifier calls. Explain the user-enumeration timing signal, then restore the equivalent dummy-hash path and stable public response.

## Out of scope

- Registration, password reset, MFA, federated login, refresh tokens, distributed session persistence, rate limiting, account lockout, authorization policy, or deployment key management.
