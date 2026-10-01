# Lecture Example — Express Authorization Middleware

## Concept demonstrated

Authentication establishes a principal; authorization separately combines principal, action, and trusted resource facts.

## Why this example is in the lecture

Express middleware loads the principal and resource before enforcing ownership and role permissions on concrete routes.

## What to observe

- Anonymous requests need authentication rather than a permission check.
- Ownership is read from the resource, never a request-body claim.
- A role becomes useful only through explicit permissions for an action.
- Missing resources and forbidden operations are separate policy outcomes, even if an API sometimes conceals both as `404`.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Explanation

The small pure function makes deny-by-default review possible. Production policy also needs tenant boundaries, resource state, audit requirements, and carefully chosen concealment semantics.

## Variations

- Add owner deletion and state the exact permission required before changing the function.

## Validation

Validated through HTTP for anonymous, owner, other-member, and moderator requests.
