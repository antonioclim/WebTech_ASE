# C07 sources and attribution

The primary basis is the supplied canonical U07 `07-relationships-transactions` lecture, examples and project contracts, together with the approved Week07 Phase1 architecture. Canonical teaching files are exact copies. New slides, explanations, models and launch adapters are derived materials. CANONICAL_SOURCES.json gives exact public paths and SHA-256 identities. Private source copies and the audit register remain with the teacher.

| Label | Reference | Role |
|---|---|---|
| C1 | Supplied U07 lecture, Relationships, Transactions and API Design | Primary content, 39 numbered headings |
| E1–E5 | Supplied U07 course examples in canonical/ | Preserved executable sources and README discrepancies |
| P1–P3 | Supplied U07 project specifications/source | Assessment boundaries; complete references are private |
| A1 | Week07 Phase1 audit, architecture and ADR design (29 September 2026) | Explicit 60-minute derivation and planned supplementary checks |
| R1 | Sequelize contributors. (n.d.). Transactions (v6 documentation). https://sequelize.org/docs/v6/other-topics/transactions/ | Managed callback and outer settlement; read 29 September 2026 |
| R2 | SQLite. (n.d.). Row values, section 3.1. https://www.sqlite.org/rowvalue.html | Cursor and ordering tuple; read 29 September 2026 |
| R3 | SQLite. (n.d.). Isolation in SQLite. https://www.sqlite.org/isolation.html | Concurrency limits; verified in the preceding audit |
| R4 | Fielding, R., Nottingham, M., & Reschke, J. (2022). HTTP semantics (RFC 9110), section 9.2.2. https://www.rfc-editor.org/rfc/rfc9110.html | Intended effect of idempotent repetition; read 29 September 2026 |

These software documentation sources have no DOI assigned in this dossier. No DOI, classroom outcome or current security certification is invented. Optional external links are references, not resources required to run the local shell. The exact next-reading list is canonical/reading-list-next.md. SOURCE_NOTES.md explains the preserved documentary mismatches.


## Current bridge references

Read alongside actual local code and finite receipts. Checked 9 October 2026; software documentation has no invented DOI.

- [Node 24.19 SQLite API](https://nodejs.org/download/release/v24.19.0/docs/api/sqlite.html): actual synchronous DatabaseSync/StatementSync boundary and parameter binding.
- [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html): reference enforcement, separately enabled from nullability/pair uniqueness.
- [SQLite transactions](https://www.sqlite.org/lang_transaction.html): BEGIN/COMMIT/ROLLBACK; actual classroom observations remain single-connection serial cases.
- [SQLite row values](https://www.sqlite.org/rowvalue.html): tuple/order relationship; fixed model does not qualify concurrent edits.
- [Sequelize v6 transactions](https://sequelize.org/docs/v6/other-topics/transactions/): historical managed callback/outer settlement comparison, distinct from built-in SQLite adapter execution.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), §§9.2.2,15.3.2,15.3.5 and 15.5.6: idempotent intended effect, 201, 204 and 405. The bounded target’s empty 405 mapper headers do not implement the RFC’s Allow requirement; retain the assessed contract rather than adding a policy.
