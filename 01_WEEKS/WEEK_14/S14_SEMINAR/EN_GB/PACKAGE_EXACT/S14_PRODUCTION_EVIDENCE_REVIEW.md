# S14 — Production Evidence Review

Apply the table to your own project. The required columns are:

| Claim | Evidence source | State | Owner | Next action | Limit |
| --- | --- | --- | --- | --- | --- |
| A specific readiness claim | File, command log, runtime trace or pending source | `pass`, `fail` or `unknown` | Named person or role | Concrete next step | What the witness cannot prove |

Review at least: project identity, locked installation, dependency audit, production build, runtime health and cleanup, log redaction, configuration and secrets, HTTP errors and headers, deployment/TLS/proxy evidence and exceptions with owners and expiry.

`UNKNOWN` is required when evidence was not obtained or a tool failed. A truthy value, a copied `PASS` string or a historical log does not authenticate current evidence. The supplied structural validator runs no commands and certifies nothing.
