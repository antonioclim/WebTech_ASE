# Operative specification — Role-Protected Moderation Operation, S11 v1.2.1

This derived specification supersedes the active v1.1.0 wording. Exact historical source is retained privately. P02 is the central full implementation; assessed file: `student/src/authorization-policy.js` only.

## Trust boundaries and required decisions

Authentication supplies a frozen synthetic principal `{id, role}` from an own-only fixture lookup. The request body cannot establish identity, role, permission or stored ownership. Routes supply constant action names; the injected repository supplies one loaded flat report snapshot. Authentication and the deterministic CSRF fixture precede policy loading. The CSRF fixture is **not production authentication or browser same-origin verification**.

- Read: a member may read their own report; moderators and administrators have read-any permission. Configured unrelated-member denial is concealed as404. Unknown roles are denied.
- Submit: the owner with member submit-own permission may proceed. Moderators or administrators do not acquire submit-own merely by owning a report. Non-owner denial is concealed404. A permitted non-draft reaches the route's409 state precondition.
- Resolve: moderators/administrators may proceed; members receive403. Missing resources remain404; a permitted non-submitted report reaches the route's409 state precondition.
- Delete: a permitted owner may delete their draft and administrators may delete any draft. Moderator ownership uses delete-own permission; unrelated members/moderators are denied. State remains a route precondition.
- Unsupported actions are rejected at construction. Missing principal returns401 before any load. Load once, attach a cloned flat frozen snapshot only on allowance and forward loader errors to the app's sanitised handler. A flat Object.freeze is not a deep-immutability or database-transaction claim.

Return exact statuses/error envelopes required by the preserved canonical suites. Do not put permission/ownership checks in routes or trust body claims. Keep requests isolated and use fresh repository fixtures when state changes.

## Defensive experiments

Predict legitimate owner/member/moderator/administrator outcomes, compare a benign contradictory body claim without changing any protective code, distinguish concealed404 from ordinary403, record a permitted action with a route-state409 and record the one-load count. Use supplied synthetic local fixtures only. Never weaken stored ownership, authentication or CSRF to manufacture evidence.

## Execution and evidence

Required stack: Node24.21.0/npm11.19.0, Express5.1.0 and preserved locked dependencies. No installation, server launch or external action is authorised here. Root preflight and separate execution authorisation are prerequisites. Canonical baseline2/objective5/regression3 tests are unchanged; starter baseline/regression should pass in the qualified environment and all five objective allowances have specific expected assertion failures. Exact counts/names/signatures are in the suite contract. Missing dependencies, exceptions, crashes, skips/cancellations and timeouts are infrastructure failures, never intended assertion failures.

The current authoring environment lacks Express and has the documented Node/npm mismatch. Source and callback checks preserve an honest draft; they do not prove middleware execution, route order, real browser state, TLS or normal assignment completion. A finished result requires actual canonical suites and the required reduced portfolio before the teacher-set deadline.

## Bounded Gemini task

Ask Gemini to critique one sanitised claim about principal/action/server-owned resource or a denial's evidence limit. Supply a relevant short excerpt; do not request the complete policy, credentials or a full project. Independently decide ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN using a locator. Record actual access blocks without inventing dialogue.

## Scope exclusions

No session implementation, JWT, databases, policy packages, client-only hiding, multi-tenant administration, production deployment or temporary weakening extension. Retain source/test/module boundaries and one S11 reviewed PDF route.
