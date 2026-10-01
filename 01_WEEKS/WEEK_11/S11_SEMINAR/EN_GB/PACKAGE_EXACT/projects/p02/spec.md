# Exercise Specification — Role-Protected Moderation Operation

## Unit

Unit 11 — Authentication, Authorization and Web Security

## Learning objective

Implement a deny-by-default authorization policy that evaluates an already authenticated principal, action, and resource without trusting client-supplied role or ownership claims.

## Why this exercise exists

Authentication answers “who”; authorization answers “may this principal perform this action on this resource now?” Generated APIs often check a role in one route, forget another, or accept an owner ID from the body. Students need one centralized, testable policy with explicit denial semantics and route-order boundaries.

## Prerequisites

- Project 1 authentication/principal model and Express route/middleware control flow.
- Resource repositories, stable errors, HTTP `401`/`403`/`404`, and immutable data.

## Starting context

Students receive an Express 5 moderation API with:

- supplied authentication middleware that maps deterministic opaque test sessions to frozen principals `{ id, role }` and returns `401` before authorization;
- a supplied report repository with `draft`, `submitted`, and `resolved` resources, immutable snapshots, deterministic failure injection, and ownership stored server-side;
- supplied routes: read one report, submit an owned draft, resolve a submitted report, and delete a draft;
- supplied role-to-permission map (`member`, `moderator`, `admin`), same-origin/CSRF middleware for writes, app/error/server harness, and tests;
- incomplete `src/authorization-policy.js`, exporting `authorize({ action, loadResource, concealMissingOrForbidden })` as Express middleware.

Routes supply constant action names. They never accept a role, permission, or owner ID from the request body.

## Required behavior

- Deny by default: only documented action/role/resource-state combinations may call the route handler.
- Assume authentication has already attached `request.principal`; if absent, return stable `401 authentication_required` rather than interpreting anonymous permissions.
- Load the resource by route parameter through the injected loader exactly once before an ownership/state decision; forward unexpected loader failures.
- `report:read`: owner, moderator, or admin may read; others receive concealed `404 report_not_found` so private report existence is not disclosed.
- `report:submit`: only the owner with `member` permission may submit their `draft`; non-owner is concealed `404`, while an owner targeting a non-draft receives stable `409 invalid_report_state` from the supplied route precondition boundary.
- `report:resolve`: moderator or admin may resolve a `submitted` report; authenticated members receive `403 forbidden`; missing resources remain `404`.
- `report:delete`: owner may delete their draft and admin may delete any draft; moderators without ownership and unrelated members receive `403` or concealed `404` exactly as the route's supplied policy option specifies.
- Attach the frozen loaded resource as `request.authorizedResource` only on allowance; route handlers must use it instead of reloading or trusting body identity.
- Ignore client-supplied `role`, `permissions`, `ownerId`, or resource state fields; body values never influence the policy.
- Unsupported action names fail closed through a stable developer-facing policy error handled as sanitized `500`, not allowance.
- Policy decisions remain deterministic, pure after loading, and isolated between requests/principals.

## Constraints

- JavaScript ESM, Express 5.1.0, native fetch, Node.js test runner, pinned lock file.
- Implement only `src/authorization-policy.js`; preserve authentication, CSRF/origin boundary, role-permission map, repositories, routes, handlers, tests, and dependencies.
- No authentication changes, JWT/session parsing, database, ACL package, body-supplied claims, module-global current user/resource, duplicated route-specific role checks, or client-only hiding.
- Do not reveal concealed resource existence through different body/message/timing shortcuts in the application layer.

## Observable completion criteria

- A principal/action/resource matrix proves every allowed and denied path with exact handler call counts and statuses.
- Client-supplied privilege/ownership fields cannot change any result.
- Authentication and CSRF failures occur before repository loading; missing/forbidden concealment remains consistent.
- Unexpected loader/policy failures are sanitized and a later authorized request remains healthy.
- Categorized checks/audit pass and only `src/authorization-policy.js` changes.

## Validation plan

### Baseline checks

- Supplied authentication sessions/principals, permission map, repository snapshots, route handlers, CSRF/origin middleware, app/server, and error envelope work independently with a passthrough policy.

### Objective checks

- Missing-principal and unknown-action fail-closed behavior.
- Read owner/moderator/admin allowances and concealed unrelated/missing denials.
- Submit owner/draft allowance, ownership concealment, and state boundary.
- Resolve moderator/admin allowance and member `403` denial.
- Delete owner/admin allowances plus configured moderator/unrelated denials.
- One load, frozen authorized resource, body-claim indifference, request isolation, and forwarded/sanitized failures.

### Regression checks

- Authentication `401` and CSRF/origin failures short-circuit before policy/repository work.
- Repository and route state transitions remain authoritative and immutable.
- Health, malformed JSON, unknown routes, and later requests remain healthy.
- No role/permission/ownership checks are duplicated in handlers or client code.

## Intended student work

After reference validation, copy the reference and replace only `src/authorization-policy.js` with a deny-all runnable middleware retaining the export signature, supported action vocabulary, and focused TODOs. Authentication, CSRF, repositories, handlers, app startup, and shared baselines remain healthy; authorization objectives fail as stable denials without granting accidental access.

No completed policy matrix is duplicated in route handlers, tests, comments, fixtures, generated output, or alternate modules.

## Gemini task

> Inspect `spec.md`, supplied principal shape, permission map, route/action constants, repository contract, concealment options, and categorized checks. Implement only `src/authorization-policy.js` as deny-by-default middleware: authenticate boundary assumption, one resource load, explicit action/role/ownership/state matrix, configured concealment, frozen authorized resource, body-claim indifference, and forwarded unexpected failures. Do not edit routes/auth/CSRF/tests, add packages, trust body claims, use globals, duplicate policy in handlers, or authorize unknown actions. Done when the full matrix/audit passes and the diff is one file. Explain every `401`, `403`, `404`, and allowance.

## Debugging / extension task

- Replace server-side ownership with `request.body.ownerId`, submit an admin-looking body as another member, observe the privilege escalation, then restore repository-owned identity and add the smallest regression assertion.

## Out of scope

- User/session implementation, organization hierarchies, field-level redaction, database row-level security, policy engines, audit-log persistence, rate limiting, or multi-tenant administration.
