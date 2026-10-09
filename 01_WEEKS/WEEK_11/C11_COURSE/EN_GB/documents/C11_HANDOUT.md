# RC10 CURRENT CLASSROOM TRANSFER

Current S11 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Authentication transfer: trusted principal — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P02 — Authorization: owner versus role — editable path from the seminar package root: CLASSROOM_RC6/student/p02.mjs

P03 — CORS and CSRF: two independent decisions — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../S11_SEMINAR/index.html

Step-by-step tutorial: ../../../S11_SEMINAR/TUTORIAL.html

Current evidence form: ../../../S11_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C11 — Authentication, Authorisation and Web Security

## Reading this handout

**v4.0.0 candidate.** This is the derived 60-minute C11 course for third-year Economic Informatics. Its primary basis is the 35 numbered topics of canonical Unit 11 and the approved Week 11 architecture. Canonical titles below retain their original wording. Explanatory corrections are identified as derived notes, not silently applied to the sources.

The organising question is: **Which boundary accepts an identity, operation or representation, who owns that decision and what evidence actually tests it?** Keep transport, authentication, permission, request intent and output handling distinct. A successful result for one boundary does not certify the others.

The five exact source examples are reading anchors under `canonical/`. They are not started in this delivery. The offline model lab contains fixed explanatory cases, not an Express application or a security scanner. Predictions and outputs are synthetic learning material; do not present them as your later seminar observations.

## The 60-minute route

00–05: boundary map. 05–16: credentials and sessions. 16–28: moderation policy. 28–36: cookies and origins. 36–45: CORS and CSRF. 45–54: parameters, contexts and configuration. 54–57: defensive review and transfer. 57–60: retrieval and STOP. The three retrieval intermezzos are included in these blocks. The reserved 30 minutes belonged to the historical course plan, not a current S11 completion allowance. The current nominal course route is unpiloted; S11 uses its own taught continuation and excludes installation from timed work.


### 1. HTTPS protects transport

HTTPS is a transport boundary. With successful certificate validation, TLS protects traffic in transit and authenticates the server endpoint to the client. It does not establish an application user or decide whether that user may resolve a report. Describe the certificate/transport observation separately from a policy decision.

A string in `x-forwarded-proto` is not a TLS handshake. The canonical support assumes deployment facts that require a separately reviewed proxy topology. Likewise, serialising a `Secure` cookie attribute does not prove that a browser received it over an authenticated transport. No TLS or proxy test is performed by the offline lab.

**Check:** Which observation would concern transport, rather than permission?

*Basis: CAN-01, source lecture line 37; derived scope is in SOURCE_NOTES.md.*

### 2. Authentication establishes a principal

Authentication produces a principal from a trusted verification path. Treat the principal as the result of checking credentials or resolving server-owned session state, not as a claim copied from a form, hidden input or cookie profile. The identity decision precedes a resource policy; current S11 P02 receives that principal as a supplied fact.

The canonical lecture example 01 deliberately selects a fixture user by name without password verification. That demonstrates opaque lookup, not a complete login. Historical full P01 was the capstone source for a password/session boundary; current S11 P01 is principalOwner. Keep the reduced example and the full project distinct; understanding that boundary does not require completing the historical full P01 application as part of current S11.

**Check:** Who created the principal, and which trusted data supported it?

*Basis: CAN-02, source lecture line 41; derived scope is in SOURCE_NOTES.md.*

### 3. Passwords require slow salted hashing

A password verifier compares a submitted value with a stored record produced by a maintained, slow salted password-hashing construction. A salt distinguishes records; the work parameters make each guess costly. Neither reversible encryption nor a fast unsalted digest is an equivalent storage policy. This is the source lecture’s requirement, not a newly chosen deployment configuration. [R5]

The phase-1 audit exercised a verifier on a known synthetic record. That historical check did not search for passwords or measure resistance to guessing; this course-production phase does not rerun the password verifier. Work parameters, library provenance and capacity require separate review before deployment. Keep submitted passwords and stored verifier records out of student evidence and logs.

**Check:** Why is a successful verification test not a password-strength measurement?

*Basis: CAN-03, source lecture line 45; derived scope is in SOURCE_NOTES.md.*

### 4. Login failure should not enumerate accounts

Unknown account and incorrect password should have the same public failure meaning. A comparable expensive-work path can reduce obvious discrepancies, but equality of the number of verifier calls is not proof of constant-time login behaviour. Storage, parsing and control flow still matter.

The Node documentation explicitly limits the guarantee of `timingSafeEqual`: surrounding code can still introduce timing differences. [R4] Record only the asserted result and the check’s actual scope. Do not describe one synthetic comparison or two identical status codes as a distributional timing study. This course includes no timing attack or account enumeration procedure.

**Check:** What could a verifier-call count establish, and what would remain unknown?

*Basis: CAN-04, source lecture line 49; derived scope is in SOURCE_NOTES.md.*

### 5. Session IDs are opaque capabilities

An opaque session identifier is a reference to server-owned state, not a readable bundle of trusted role claims. The server maps the reference to a principal and can stop accepting it by removing or expiring that state. The identifier therefore needs careful handling even if it contains no meaningful text. [R1]

A deterministic identifier generator is useful in a reproducible local test. It is not evidence that a production random generator has sufficient entropy. The lab shows the effect of lookup and invalidation using fixed synthetic events without displaying session identifiers. Do not export real cookies, raw session values or account data when recording evidence.

**Check:** Which side gives an opaque identifier its authority?

*Basis: CAN-05, source lecture line 53; derived scope is in SOURCE_NOTES.md.*

### 6. Rotate and expire sessions

Rotation changes the accepted session identity after a relevant authentication or privilege transition. Expiration bounds acceptance on the server; logout invalidates the server record. Clearing a browser cookie is related housekeeping, not a substitute for revocation. [R1]

The historical full P01 store had an expiry boundary and explicit invalidation. Its cleanup of expired records is triggered by lookup; do not invent a periodic cleanup worker or a `rotate` method absent from that source. Login composes invalidation and creation. A pure store check can verify expiry at the boundary, but it cannot demonstrate the browser’s cookie lifecycle or the full login sequence.

**Check:** What should happen at exactly the recorded server expiry time?

*Basis: CAN-06, source lecture line 57; derived scope is in SOURCE_NOTES.md.*

### 7. Worked example — session identity trace

EX-01 uses a map inside its application factory. After the fixture login, lookup supplies a principal; removing the map entry means the same former identifier no longer resolves. This is the precise mental model the example contributes.

The example does not check a password or expire the map entry based on time. Its cookie `Max-Age` is not a server-side expiry implementation. Historical README claims and run commands remain in the exact source copy; they are not results of this delivery. Use the static source explanation and the labelled model now, not a launch of the demonstration as a purported production session service.

**Check:** Name one session property supplied by EX-01 and one it omits.

*Basis: CAN-07, source lecture line 61; derived scope is in SOURCE_NOTES.md.*

### 8. Tokens shift rather than erase state

A signed self-contained token changes where some state is represented; it does not remove verification responsibilities. The lecture names expiry, issuer, audience, key management and a revocation strategy as obligations. Signature validity alone is not a permission decision for a specific resource.

This week does not introduce an external identity provider or a new JWT implementation. The historical full central project received a principal from supplied authentication; current S11 P02 also assumes its supplied principal. Keep token architecture as an explanatory contrast with opaque sessions, not an extra implementation hidden in the policy file. A diagram of a token does not count as an executed verifier or a deployment acceptance.

**Check:** Which policy question remains after a token has been verified?

*Basis: CAN-08, source lecture line 74; derived scope is in SOURCE_NOTES.md.*

### 9. Authorization is a separate decision

Authorisation asks whether this principal may perform this action on this server-loaded resource. The action is fixed by the route; the resource and principal have separate trusted sources. An authenticated request can still be refused. [R6]

Historical full P02 used src/authorization-policy.js. The current assessed file is CLASSROOM_RC6/student/p02.mjs. The historical full P02 route owned its state precondition after allowance; current reportPermission performs no route operation. The course explains this decision boundary without providing the complete assessed policy implementation. A check of a callback is evidence about that callback’s result, not proof that Express invoked middleware in the intended order. Record those two classes of evidence separately.

**Check:** Which inputs are required beyond a valid identity?

*Basis: CAN-09, source lecture line 78; derived scope is in SOURCE_NOTES.md.*

### 10. Trust server-loaded facts

Ownership and resource state come from repository data. Principal identity and role come from authentication. A request body may contain proposed domain data, but it must not redefine these trusted facts. Hidden controls in a user interface are not enforcement.

The historical full P02 support used fixed test sessions and a closed fixture domain. Do not generalise those lookups to arbitrary principal objects or unreviewed role names. Current S11 has its separate supplied-principal boundary; C11 does not repair authentication in a file the learner is forbidden to edit. Inspect provenance, not merely the attractive name of a property such as `ownerId`.

**Check:** At which boundary would a proposed field acquire trustworthy meaning?

*Basis: CAN-10, source lecture line 86; derived scope is in SOURCE_NOTES.md.*

### 11. Roles should map to permissions

A role is meaningful because a central permission policy assigns actions to it. Keep the vocabulary explicit, reviewable and consistent across routes. Do not scatter role-name checks across unrelated handlers or treat an administrator label submitted by a client as authority.

The lecture example has a reduced set of fixture principals; it does not instantiate every role named in the lecture prose. Its role checks are inline middleware, not the separate pure policy function announced in the README. Historical full P02 had its own permission map; current reportPermission uses the declared read/delete table. Read the supplied map there rather than extrapolating a full matrix from EX-02.

**Check:** Why is a role label insufficient without an action and resource?

*Basis: CAN-11, source lecture line 90; derived scope is in SOURCE_NOTES.md.*

### 12. Deny by default

Default refusal means that allowance must follow an explicit rule, not an absence of checks. Distinguish an unauthenticated request, a known principal lacking permission and a resource intentionally concealed. The project gives exact response vocabulary for these cases. [R6]

An unsupported action in the historical full P02 policy raised a configuration `TypeError` while constructing the middleware. That is distinct from an unexpected loader error forwarded at request time. Do not report an observed HTTP 500 when only the constructor was executed. Retain the original source distinction and explain the mismatch with prose; fail-closed configuration is not accidental permission.

**Check:** How does a construction error differ from an HTTP denial?

*Basis: CAN-12, source lecture line 94; derived scope is in SOURCE_NOTES.md.*

### 13. Worked example — authorization middleware

EX-02 combines a trusted fixture principal, repository lookup and route-specific middleware. It illustrates the separation of identity and permission, but its report map belongs to the module rather than to each application factory. It is not evidence of per-factory isolation.

In historical full P02 evidence, measure the policy loader call and the route-continuation call independently. A frozen clone of the flat loaded record is not a transaction or lock. A permitted operation may still fail the supplied state precondition with 409. Keep that result distinct from a permission refusal. No concurrent authorisation/mutation race is executed in this course.

**Check:** What does one loader call fail to prove about later mutation?

*Basis: CAN-13, source lecture line 98; derived scope is in SOURCE_NOTES.md.*

### 14. Cookie attributes solve different concerns

Cookie attributes answer different questions. `HttpOnly` restricts ordinary script access to the cookie; `Secure` constrains transport; `SameSite` affects cross-site sending. Path, Domain and lifetime scope delivery. None of these attributes grants resource permission. [R1]

Read the attributes as a contract emitted by the server, then identify what evidence would be needed to observe browser enforcement. A header assertion is not a browser run. The configured same-site policy must match the application’s intended flows; this course does not silently change it or turn one attribute into a universal CSRF control.

**Check:** Which attribute concerns script reading, and which concerns transport?

*Basis: CAN-14, source lecture line 117; derived scope is in SOURCE_NOTES.md.*

### 15. Do not store authority claims in an unsigned cookie

A caller-controlled cookie string is not an authenticated role profile. With an opaque-session design, the server resolves identity and role from trusted state. Do not accept a role merely because it arrived inside cookie syntax rather than JSON.

The example supports this conceptual separation, but its fixture identity mechanism is not complete authentication. Evidence should record whether the principal came from trusted lookup and which boundary was checked; it should not reproduce a raw cookie. Keep any redaction policy separate from the question of whether verification actually happened. A redacted trace can be honest and useful without exposing a credential.

**Check:** Does changing the carrier of a claim make the claim trustworthy?

*Basis: CAN-15, source lecture line 121; derived scope is in SOURCE_NOTES.md.*

### 16. Worked example — session cookie contract

EX-03 assembles a header containing an opaque-looking fixed value and selected cookie attributes. The `production` option adds `Secure`; it does not configure TLS, sign a session or create server-owned identity. The fixed value is a demonstration fixture.

The supplied test examines a response header. In this delivery it is preserved as source and is not executed. A separately labelled scalar expression check can examine which attributes are selected without starting Express, but it must not be called an HTTP response observation. Keep configuration, serialisation, server session state and browser behaviour as four different evidence questions.

**Check:** What does the example’s production option actually change?

*Basis: CAN-16, source lecture line 125; derived scope is in SOURCE_NOTES.md.*

### 17. Origin is scheme, host, and port

Origin is the tuple of scheme, host and port. Compare the complete origin required by the sharing policy, not a familiar-looking part of a name. The source’s allowlist represents exact accepted origins; it does not admit every site using HTTPS.

The offline model uses fictional fixed origins solely to illustrate that tuple. It does not send requests, resolve names or probe a service. A pure URL conversion can show which tuple a parser represents, but it cannot establish trust. Trust comes from the application’s reviewed allowlist and deployment contract, not from successful parsing or the visual similarity of names.

**Check:** Can a different port denote a different origin?

*Basis: CAN-17, source lecture line 138; derived scope is in SOURCE_NOTES.md.*

### 18. Same-origin policy limits browser reads

The same-origin policy constrains what browser scripts may read across origins. It is not the application’s identity system and should not be treated as a universal guarantee that no cross-origin request reaches a server. [R3]

Separate request arrival, browser response visibility and permission to mutate a resource. These may have different outcomes for the same interaction. A server-side test using native fetch does not implement a browser’s enforcement model. When browser evidence is unavailable, record that absence rather than inferring it from a response header or a successful callback check.

**Check:** Which part of a cross-origin interaction is the observation about?

*Basis: CAN-18, source lecture line 142; derived scope is in SOURCE_NOTES.md.*

### 19. CORS opts origins into response sharing

CORS is a server-selected browser response-sharing policy. It indicates when a script from an allowed origin may read a cross-origin response. It does not replace session verification, resource policy or request-intent checks. [R3]

The relevant record has distinct fields for the origin, emitted sharing headers, HTTP status and actual browser observation. Some applications refuse an unlisted origin explicitly; a teaching example may instead continue without granting sharing headers. Those are not the same HTTP result. Do not label both as a measured 403, and do not label a missing sharing header as proof of server-side authorisation.

**Check:** What additional field prevents “CORS denied” from becoming ambiguous?

*Basis: CAN-19, source lecture line 146; derived scope is in SOURCE_NOTES.md.*

### 20. Credentialed CORS requires exact matching

For credentialed sharing, the source specifies an exact allowed origin rather than wildcard sharing. When the selected response depends on Origin, `Vary: Origin` communicates that variation to caches. This concerns response selection, not user permission. [R3]

EX-04 emits `Vary` on its allowed branch; the historical full P03 protective reference emits it before branching. The audit records that difference but did not execute a cache. Treat any cache consequence as dependent on the actual deployment and cache rules. The handout does not turn this source observation into a reproduced cache failure or a complete CORS repair.

**Check:** Why should the status and the Vary header be recorded separately?

*Basis: CAN-20, source lecture line 150; derived scope is in SOURCE_NOTES.md.*

### 21. Worked example — credentialed CORS policy

EX-04 has an allowlist and an OPTIONS branch. For an unlisted origin it can continue without Access-Control-Allow-Origin; this is withholding response sharing, not necessarily returning an HTTP refusal. Its account fixture is not an authenticated production account endpoint.

The supplied test asserts selected headers. No Express or browser test is run here. A preflight-like header exchange is not approval of the later operation’s principal or permission. Inspect the exact source, then describe the boundary it implements. Current S11 securityDecision instead returns independent sharing/token Booleans, with no emitted response or explicit HTTP refusal.

**Check:** Does a 204 from an OPTIONS branch grant permission to mutate?

*Basis: CAN-21, source lecture line 154; derived scope is in SOURCE_NOTES.md.*

### 22. CORS is not authorization

A non-browser client is not constrained by browser CORS enforcement. Conversely, a browser being unable to read a response does not by itself establish that a request was never sent or that its side effects were refused. The server still needs its independent security boundaries. [R3]

In the diagram, keep CORS alongside response sharing rather than placing it in the identity-to-policy chain as a substitute for authentication. The lab offers a fixed classification example, not a request generator. A correct answer should name the missing evidence boundary, not propose broader origin access just to make a demonstration succeed.

**Check:** Which control still owns permission when sharing is granted?

*Basis: CAN-22, source lecture line 167; derived scope is in SOURCE_NOTES.md.*

### 23. CSRF exploits ambient credentials

Cookie-authenticated requests may carry credentials by browser behaviour rather than an explicit script-held authorisation header. A state-changing operation therefore needs a deliberate request-intent defence in addition to identity and resource permission. The course explains that risk without executing a cross-site attack.

The historical full portfolio selected CORS and CSRF as two distinct classes. Current S11 requires the third bounded function, not that portfolio. A request record must not include raw tokens or cookies. Record a benign accepted check, a benign refused check and the decision boundary, with the actual execution class stated. A token mismatch result from a helper is not proof that a browser or a middleware chain enforced it.

**Check:** Why can valid identity be insufficient for a cookie-authenticated write?

*Basis: CAN-23, source lecture line 171; derived scope is in SOURCE_NOTES.md.*

### 24. CSRF controls compose

The source combines intentional cookie policy with a secret, unpredictable session-bound request token and origin checks as defence in depth. Enforcement must occur before a write. A deterministic classroom fixture is not a production secret merely because the comparison succeeds. [R2]

Historical full P02’s supplied CSRF helper checks its fixture token but does not inspect Origin or Referer. Explain that limit while preserving the learner’s one-file policy boundary. Current S11 P03 identifies its two independent decisions separately and does not repair those historical helpers. Completing or testing those two helpers must not be reported as acceptance of the original five-class exercise.

**Check:** Which claim about same-origin enforcement is unsupported by historical full P02’s helper?

*Basis: CAN-24, source lecture line 175; derived scope is in SOURCE_NOTES.md.*

### 25. Injection occurs when data becomes syntax

Preserve query structure by keeping the SQL statement fixed and binding data separately. This is a boundary between instructions and values, not an HTML-escaping problem. An ordinary search term is enough to inspect the query object and its parameter list. [R7]

The historical full P03 repository checked a fixed query contract and filters an in-memory array; it does not execute SQL. EX-05 imports sql.js and prepares a statement in source, but that engine remains unexecuted here. Keep parameter-object checks separate from parser, LIKE, ordering and database execution evidence. No injection payload or database attack is generated by the lab.

**Check:** What would be necessary before calling a result a SQLite test?

*Basis: CAN-25, source lecture line 185; derived scope is in SOURCE_NOTES.md.*

### 26. XSS depends on output context

HTML text, a quoted attribute, a URL and JavaScript source are different destinations. A transformation suitable for one destination is not automatically suitable for another. First identify the exact sink, then choose the corresponding control. [R8]

The protective functional examples use ordinary text such as an ampersand; they are not exploit demonstrations. The literal-text helper in this package is limited to a text representation and does not claim URL acceptance, HTML sanitisation or JavaScript safety. A successful transformation check is evidence about that function, not proof that every place the application inserts text uses it.

**Check:** Why should the record identify a sink rather than say only “sanitised”?

*Basis: CAN-26, source lecture line 189; derived scope is in SOURCE_NOTES.md.*

### 27. Prefer text APIs for text

For content intended as text, a text API such as `textContent` avoids interpreting that value as markup. Template auto-escaping has its own documented destination contract. Sanitising intentionally accepted HTML is a different problem and is not added to this lesson’s implementation. [R8]

The offline lab inserts the learner’s prediction as text and provides no HTML-import facility. This is a specific code choice, not universal safety certification. A DOM-model check can reject attempted HTML assignment in the code path under test; focus, rendering and browser APIs remain separate qualification. Keep long predictions bounded and do not paste private data.

**Check:** What interpretation should be avoided when the input is only a label?

*Basis: CAN-27, source lecture line 193; derived scope is in SOURCE_NOTES.md.*

### 28. URL policy is separate from encoding

URL acceptance is a policy decision separate from escaping a quoted attribute. An allowed protocol does not establish a permitted origin or a privacy policy for a remote image. Conversely, encoding a value does not grant it URL authority. [R8]

The canonical helper returns a fallback path for an unsupported value. That path’s string is not proof the corresponding image exists: the audit found missing fallback assets in the relevant sources. This course documents that gap without a browser GET or asset download. Future support can supply a named local asset, but that work must be explicit and independently checked.

**Check:** Which check is missing after a helper returns a fallback filename?

*Basis: CAN-28, source lecture line 197; derived scope is in SOURCE_NOTES.md.*

### 29. Worked example — browser security contexts

EX-05 contains source for a parameterised database route and an HTML card route with text handling and URL selection. Read each control alongside its own destination. No one of those controls replaces CORS, CSRF or resource permission.

The source tests include historical adversarial inputs; they are preserved for provenance and not run in this course route. The current neutral demonstrations execute benign equipment fixtures, actual node:sqlite and literal Node HTTP. They start no canonical Express server or sql.js engine and no browser. Do not describe the historical full P03 array-based repository as equivalent execution merely because both examples discuss queries.

**Check:** Which evidence class is different between a prepared object and an executed query?

*Basis: CAN-29, source lecture line 201; derived scope is in SOURCE_NOTES.md.*

### 30. CSP reduces impact

Content Security Policy can restrict execution and provide reports when configured appropriately. It is an additional layer, not a substitute for correct output handling or permission checks. The source presents the concept without supplying a complete deployment policy for this application.

Do not invent a policy header and call it tested. A useful review asks which destinations and execution sources are intended, how the policy fits them and what a real browser observation would need to show. This course does not enable a reporting endpoint, modify a deployment or treat a passed model as evidence that CSP is enforced.

**Check:** What input-handling responsibility remains when CSP is configured?

*Basis: CAN-30, source lecture line 214; derived scope is in SOURCE_NOTES.md.*

### 31. Secrets come from deployment configuration

Secrets belong in controlled deployment configuration, not committed fallback values. Missing required configuration should stop the relevant operation rather than silently using a permissive production default. Length validation is a shape check, not a measurement of randomness or entropy.

Historical full P03 checked a sessionSecret configuration field, but fixture authentication does not use it to sign sessions. The source therefore cannot support a claim that passing configuration validation proves signed-session authentication. Record which component actually consumes each configuration value. No credentials, environment dumps or keys are requested for this course or the later evidence form.

**Check:** Which use of a secret must exist before its length check can support an authentication claim?

*Basis: CAN-31, source lecture line 218; derived scope is in SOURCE_NOTES.md.*

### 32. Logs and errors are output boundaries

Logs and public errors are output destinations too. Keep credentials, tokens and internal diagnostic detail out of public responses and learning evidence. Stable public categories can be recorded without copying sensitive values. A helpful internal diagnostic need not be emitted to every caller.

The historical full P03 source sanitises 500 messages explicitly, while some 4xx messages follow a different route. That is a source boundary to review, not an observed disclosure in this delivery. Do not classify every 4xx as a leak. A future support wrapper can map known public errors separately without silently extending the student’s assessed file.

**Check:** Which diagnostic detail is unnecessary in a student’s public outcome record?

*Basis: CAN-32, source lecture line 222; derived scope is in SOURCE_NOTES.md.*

### 33. Review one exploit trace at a time

The canonical heading asks for an exploit trace. The approved derived method changes that activity explicitly to static data-flow review: input, trusted source, decision or sink, applicable control and a protective verification plan. No exploit is produced, launched or reported as performed.

Keep one claim narrow enough to falsify through benign expected-allow and expected-refuse checks on protective code. Preserve a normal positive control; refusing everything is not a complete implementation. Do not weaken controls to manufacture a demonstration or scan third-party systems. This method change is documented rather than concealed under the original activity label.

**Check:** What would make a static finding reviewable without executing an attack?

*Basis: CAN-33, source lecture line 226; derived scope is in SOURCE_NOTES.md.*

### 34. Scanners provide partial evidence

A scanner contributes evidence within its configured scope and version. Known-dependency findings, a source scan and a dynamic check have different coverage. None of them alone proves the full authorisation policy or the absence of unknown weaknesses.

This course performs no dependency installation or live scanner run. The audit’s hash and source checks establish identity and selected properties, not production security. When later evidence is collected, name the tool, input, version, result and untested boundary. A report bearing PASS is not self-authenticating evidence, especially when copied into an unverified draft.

**Check:** Which missing context prevents “the scanner passed” from being a complete claim?

*Basis: CAN-34, source lecture line 230; derived scope is in SOURCE_NOTES.md.*

### 35. AI output requires a threat model

Require a model of the asset, input provenance, trusted data, decision owner and enforcement order before accepting a generated security change. Constrain the permitted files and ask for evidence tied to the actual implementation, not a generic promise to make the application secure.

For the seminar, critique one sanitised claim with a minimal code or trace excerpt. Retain the relevant real Gemini response, independently check it and record ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN with a correction and limit. The course’s synthetic practice claim is not a Gemini conversation. Never submit passwords, cookies, tokens or institutional records for this exercise.

**Check:** What observation would independently challenge the generated claim?

*Basis: CAN-35, source lecture line 234; derived scope is in SOURCE_NOTES.md.*

## Transfer to S11

Historical full applications assigned central P02 middleware, capstone P01 and a selected two-class P03 portfolio. Their paths and timings do not define current S11. All three current pure targets and twelve stages remain required individually.

The original P03 starter imports deliberately insecure evidence transitively. Do not launch it as a routine preview. Current S11 is supplied and has its own three bounded tasks; it does not qualify that old starter or selected full-application helpers. A selected two-class result cannot be called a pass of the original all-five suite.

## A record that does not overclaim

State the input category without secret values, the trusted source, expected protective result, observed result, exact evidence locator and evidence class. SOURCE, PURE_JS, CALLBACK_MODEL and ACTUAL_HTTP are not synonyms. Browser enforcement, TLS and deployment evidence remain separate. A frozen flat snapshot is not a lock; one loader count is not a transaction; a header is not browser behaviour.

The nominal 60-minute guided course segment ends with a recorded checkpoint; continue remaining reading and consolidation separately, without declaring unfinished work accepted. The later seminar uses one PDF for one private S11 Assignment, not a C11 upload. No deadline, grade or permission to run a service is created by this handout.

## Qualification boundary

Source identity, a pure JavaScript result, a callback substitute, an actual Express request, a SQL-engine run, browser enforcement and TLS are different evidence classes. Current neutral demonstrations have their own Node, node:sqlite and literal HTTP scope; canonical Express/sql.js, browser and TLS execution remain separately unqualified. Native Word/platform and Moodle qualification remain separate. No secret or real credential is requested. The next-reading list is preserved at canonical/reading-list-next.md, not implemented by this phase.

<!--pagebreak-->
# C11 — Sources and evidence rights

## Primary basis

The controlling material is canonical Unit 11, its 35 lecture topics, five exact examples and the approved Week 11 architecture. CAN-xx identifies a source topic; EX-xx an exact directory; Mxx a separate fixed model. Public source hashes are in CANONICAL_SOURCES.json. Original spellings and historical README/test/run statements remain exact. The authoring does not convert those statements into new execution evidence.

The local design changes the 96-minute source lecture to 60 minutes and changes attack-trace execution to static defensive analysis and benign protective checks. SOURCE_NOTES.md identifies corrections. Historical full P02 was central, P01 capstone integration and the selected reduced 11.3A pair is the locally selected CORS/CSRF pair. Source prescribes two classes but not their choice.

## Primary documentation consulted

Retained source references were consulted 30 September 2026; the current primary-reference review is 9 October 2026. These pages do not update or qualify source pins, and do not have journal DOIs. None is invented. The referenced Node v24 documentation identifies v24.21.0 at current review; it documents an API and does not establish execution on that reference runtime.

| ID | APA-style reference | Role and limit |
| --- | --- | --- |
| R1 | [OWASP Foundation. (n.d.). Session management cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Server-owned session state and expiry; not a browser, transport or entropy test. |
| R2 | [OWASP Foundation. (n.d.). Cross-site request forgery prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | Request-intent controls and unpredictable session-bound tokens; not execution of the supplied middleware. |
| R3 | [MDN contributors. (n.d.). Cross-Origin Resource Sharing (CORS).](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | Sharing, credentialed origins and Vary; not actual browser or cache evidence. |
| R4 | [Node.js contributors. (n.d.). Crypto.](https://nodejs.org/docs/latest-v24.x/api/crypto.html) | timingSafeEqual boundary; not timing safety of surrounding login code or a prescribed runtime qualification. |
| R5 | [OWASP Foundation. (n.d.). Password storage cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | Maintained slow salted constructions; no new work parameters or password attack. |
| R6 | [OWASP Foundation. (n.d.). Authorization cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Explicit least-privilege permission and deny-by-default; not the full assessed P02 answer. |
| R7 | [OWASP Foundation. (n.d.). SQL injection prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | Separate query structure and bound values; no SQL engine execution. |
| R8 | [OWASP Foundation. (n.d.). Cross site scripting prevention cheat sheet.](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | Destination-specific output handling; not universal sanitisation or browser acceptance. |

## Follow one report across five trust questions

The accessible responsibility diagram in reading.html links transport → accepted principal → resource permission, then separates request intent and output handling. Its arrows organise the explanation rather than claim an executed middleware order. The table below gives each owner, input, witness and limit.

Begin with the fictional request to read r42, whose loaded ownerId is u1. An earlier accepted stage supplies u1/member. Body proposes role admin, but remains requester data. Keep the same case across five responsibilities so that a fact accepted by one owner does not silently answer another question.

| Question | Owner and input | Discriminating witness | Limit |
|---|---|---|---|
| Transport | Reviewed TLS endpoint and certificate policy | Actual validated transport | A forwarded label or Secure header is insufficient |
| Accepted principal | Credential/session mechanism and accepted server state | Lookup after invalidation with the same retained client copy | Current P01 assumes the earlier trusted stage |
| Report permission | Principal, route action and server-loaded ownerId | Moderator non-owner read versus delete and moderator-owner delete | Current P02 neither loads nor deletes a report |
| Request intent | Application token/credential contract | Same cookie POST with false versus true synthetic match | Current P03 compares no actual token |
| Output boundary | Sharing policy and destination-specific representation | HTTP status/header/body separately; SQL row versus text result | Browser, cache and TLS remain unqualified |

Changing body to admin leaves the accepted principal unchanged. Changing stored ownerId can change the relationship. Changing a role can grant a particular action without granting all operations. A listed origin may accompany a refused cookie POST: sharing and request intent answer separate questions. These contrasts refute one generic security flag without creating another application assignment.

### Server record versus transported representation

Neutral demo01 owns an equipment receipt with expiry 30. Lookup at 29 succeeds; at 30 and 31 it refuses. Cancellation causes an independent lookup at 29 to fail while an earlier copied receipt remains. This actual Map/deadline observation concerns equipment. Transferring the reasoning to a session requires the actual session store's invalidation and expiry: canonical01 removes at logout but has no server-time expiry.

### Policy snapshot versus operation

A loaded report supports a decision at one moment. A frozen flat copy can retain that view while the original repository changes. Neither cloning nor one loader call gives transaction isolation. C07/S07 names the owner of atomic finalisation. Current S11 deliberately leaves that operation out: returning 204 does not delete a report.

### Course and seminar continuity

Reactivate C05 service boundaries and C09 identity/delivery ownership, then follow all four stages of current S11 P01 provenance, P02 action policy and P03 independent decisions. C12/S12 carries trusted principal provenance into recipient selection, keeping principal, connection and request identities distinct.

The nominal 60-minute guided course route selects the main causal steps and at most one neutral run. Full reading, remaining demonstrations and consolidation have separate time. S11 plans 30–45 minutes per project and 120–165 total, unpiloted. A 100-minute meeting requires taught 20–65-minute continuation, a 90-minute meeting 30–75; start all three and resume their unfinished stages. These are planning estimates, not novice pilot measurements.
