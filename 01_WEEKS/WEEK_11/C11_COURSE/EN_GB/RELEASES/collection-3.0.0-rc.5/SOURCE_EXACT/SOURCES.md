# C11 — Sources and evidence rights

## Primary basis

The controlling material is canonical Unit 11, its 35 lecture topics, five exact examples and the approved Week 11 architecture. CAN-xx identifies a source topic; EX-xx an exact directory; Mxx a separate fixed model. Public source hashes are in CANONICAL_SOURCES.json. Original spellings and historical README/test/run statements remain exact. The authoring does not convert those statements into new execution evidence.

The local design changes the 96-minute source lecture to 60 minutes and changes attack-trace execution to static defensive analysis and benign protective checks. SOURCE_NOTES.md identifies corrections. P02 is central, P01 is capstone integration and the mandatory reduced 11.3A pair is the locally selected CORS/CSRF pair. Source prescribes two classes but not their choice.

## Primary documentation consulted

Consulted 30 September 2026 for the bounded interpretations below. These pages do not update or qualify source pins, and do not have journal DOIs. None is invented. Current Node documentation identifies itself as v26.10.0; this is not the runtime used for local checks.

| ID | APA-style reference | Role and limit |
| --- | --- | --- |
| R1 | [OWASP Foundation. (n.d.). Session management cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Server-owned session state and expiry; not a browser, transport or entropy test. |
| R2 | [OWASP Foundation. (n.d.). Cross-site request forgery prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | Request-intent controls and unpredictable session-bound tokens; not execution of the supplied middleware. |
| R3 | [MDN contributors. (n.d.). Cross-Origin Resource Sharing (CORS).](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | Sharing, credentialed origins and Vary; not actual browser or cache evidence. |
| R4 | [Node.js contributors. (n.d.). Crypto.](https://nodejs.org/api/crypto.html) | timingSafeEqual boundary; not timing safety of surrounding login code or a prescribed runtime qualification. |
| R5 | [OWASP Foundation. (n.d.). Password storage cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | Maintained slow salted constructions; no new work parameters or password attack. |
| R6 | [OWASP Foundation. (n.d.). Authorization cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Explicit least-privilege permission and deny-by-default; not the full assessed P02 answer. |
| R7 | [OWASP Foundation. (n.d.). SQL injection prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | Separate query structure and bound values; no SQL engine execution. |
| R8 | [OWASP Foundation. (n.d.). Cross site scripting prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | Destination-specific output handling; not universal sanitisation or browser acceptance. |

## Qualification boundary

Source identity, a pure JavaScript result, a callback substitute, an actual Express request, a SQL-engine run, browser enforcement and TLS are different evidence classes. No application server, SQL, browser or TLS run is performed here. Native Word/platform and Moodle qualification remain separate. No secret or real credential is requested. The next-reading list is preserved at canonical/reading-list-next.md, not implemented by this phase.
