# S11 Glossary and Evidence Classes

## Authentication

A trusted verification or server-session lookup that establishes the acting principal.

## Authorisation

A separate decision about this principal, constant action and server-owned resource.

## Principal

The supplied identity and role produced by authentication; not a body claim.

## Resource ownership

A server-stored relationship used by policy; not a caller’s proposed ownerId.

## Deny by default

Allowance needs an explicit documented rule. Unknown or unsupported cases do not receive accidental permission.

## Concealment

A route policy that uses the public missing-resource vocabulary for a forbidden resource to limit disclosure.

## State precondition

A domain requirement checked by a supplied route, such as the report being in the required state.

## Middleware

A request-processing function with a defined position and continuation/error boundary.

## Snapshot

The flat resource copy attached on allowance; freezing it is not a database lock or transaction.

## Origin

The tuple of scheme, host and port. The exact reviewed allowlist establishes sharing policy.

## CORS

A browser response-sharing policy. It does not establish user permission or request intent.

## CSRF

A request-intent concern for ambient credentials, kept separate from identity and permission.

## Fixture

Synthetic controlled teaching data. A deterministic session/token fixture is not a production secret.

## Baseline

Named checks of supplied infrastructure, separate from the assessed objective.

## Objective

Named checks of the assessed behaviour. Intended initial assertion failures are documented exactly.

## Regression

Named checks that existing behaviour and boundaries remain healthy after a change.

## Evidence locator

A precise pointer to a source path/line, named test/report row or redacted capture; a vague filename alone is insufficient.

## SOURCE

Source reading. It establishes what the supplied code or contract says, not that it executed.

## PURE_FUNCTION

A measured helper result without an application request. Record actual inputs by safe category and the limit.

## CALLBACK_MODEL

A request/response substitute or callback harness. It does not prove full Express middleware order.

## ACTUAL_EXPRESS

An actual request handled by the named Express harness in the recorded environment.

## REAL_BROWSER

An actual browser observation of the stated local page, with browser/version and context recorded.

## TLS_DEPLOYMENT

Separate real transport/deployment evidence. A forwarded string or Secure header is not a TLS handshake.

## NOT_EXECUTED

The operation did not run; its result must remain unmeasured.

## BLOCKED

A specific unavailable prerequisite or operation, preserved without inventing a successful result.

## DevTools

Inspection tools built into the browser and attached to a particular tab. These are different from DevOps.

## ZIP

A compressed archive. Extracted files in a real folder are needed before editing and checking the package.

## Working directory

The folder from which a terminal resolves relative paths in a command.

## TAP

Structured test output whose named records, counts, failures, skips and cancellations can be verified.

## Final candidate

A completed record proposed for review. The package remains WIP/PREVIEW_NOT_FINAL until its separate qualification gates close.
