# S11 — Role-Protected Moderation and a Reduced Security Portfolio

## 1. What is compulsory

**WIP/PREVIEW · individual work · 60 content minutes.** P02 Role-Protected Moderation Operation is the full central implementation. Complete its one-file authorisation policy and record your own protective evidence. P03 contributes the required reduced 11.3A portfolio for **CORS and CSRF only**. P01 Authenticated Session API remains a semester-project integration route rather than a second full implementation inside this meeting.

The source estimate for P02 alone is 55–65 minutes. The seminar provides an 18-minute implementation segment, not a promise that the full project, observations, bounded Gemini critique and final PDF will finish before minute 60. At minute 60, STOP and retain a truthful draft. Finish required P02 and the reduced two-class portfolio before the real teacher-set deadline. The other 30 reserved minutes are not overflow. This package does not create a date.

One private S11 Moodle Assignment receives one reviewed PDF combining P02 evidence, the reduced portfolio, the bounded Gemini critique and reflection. There is no C11 Assignment and no separate P03 upload.

## 2. Roles and permitted edits

| Route | Role | Permitted assessed edit |
| --- | --- | --- |
| P02 Role-Protected Moderation | Central full implementation | `projects/p02/student/src/authorization-policy.js` |
| P03 reduced 11.3A | Required two-class portfolio | `portfolio/p03-reduced/student/src/security-boundary.js` |
| P01 Authenticated Session API | Capstone transfer | `capstone/p01/student/src/authentication.js` when that semester work is scheduled |

Preserve every supplied support file, test, fixture, package and lockfile. The reduced P03 successor is a separate defensive exercise. It does not claim that the original all-five starter was safe or that two passing classes establish the other three. The canonical deliberately insecure evidence is not included in the public package.

## 3. Evidence classes and redaction

For every claim, label the evidence as SOURCE, PURE_FUNCTION, CALLBACK_MODEL, ACTUAL_EXPRESS, REAL_BROWSER, TLS_DEPLOYMENT, NOT_EXECUTED or BLOCKED. A source reading or a callback with a response substitute is not an Express request. A cookie header is not browser enforcement. A forwarded-proto string is not a TLS handshake. A query object is not SQL execution.

Do not submit passwords, raw cookies, session identifiers, CSRF token values, configured secrets, private records, full Gemini conversations or institutional data. Record redacted outcomes, named checks and evidence locators. The package uses only synthetic fixtures.

## 4. Environment and named checks

Actual project execution assumes an environment provisioned separately for the course. This package contains no `node_modules` and does not authorise installation. The prescribed pair is Node 24.21.0/npm 11.19.0. Local authoring checks used Node 22.16.0/npm 10.9.2. Record your real versions rather than copying the prescribed pair as a measurement.

After separate provisioning, the canonical P02 scripts are run from `projects/p02/student`:

```text
node --version
npm --version
npm run test:baseline
npm run test:objective
npm run test:regression
```

Baseline, objective and regression outputs remain distinct. An unavailable command, missing dependency, parser error, timeout, crash or reporter fault is an environment incident, not an intended policy failure. The additional S11 checks are separate from the canonical suite and must be reported separately.

From the public package root, the read-only boundary checker is:

```text
node tools/verify-boundary.mjs p02
node tools/verify-boundary.mjs p03
node tools/verify-boundary.mjs p01
```

`BOUNDARY_ONLY_PASS` proves only that the changed paths are permitted. It does not prove that the code is correct or secure.

## 5. The 60-minute seminar route

| Minutes | Individual activity | Record |
| --- | --- | --- |
| 00–05 | Package, scope and prediction | Exact package, actual environment and evidence class |
| 05–12 | Trust-boundary map | Principal provenance, constant route action, server resource and denial semantics |
| 12–30 | P02 implementation segment | One-file progress and unresolved obligations |
| 30–39 | Protective observations | Allowed, forbidden, concealed, one load and state precondition |
| 39–45 | Bounded Gemini critique | One sanitised claim and minimal excerpt |
| 45–50 | Independent check | Verdict, correction and remaining limit |
| 50–55 | Reduced P03 and P01 transfer | CORS/CSRF portfolio and capstone plan |
| 55–60 | Evidence draft and STOP | Outstanding required work and next evidence |

## 6. P02: identity, policy and state

Predict before executing. Record where `request.principal` came from, the constant action supplied by the route and the server-loaded resource. Do not treat body fields such as `role`, `permissions`, `ownerId` or resource state as authority.

Your evidence matrix needs at least one allowed case, one ordinary forbidden case, one concealed result and one state-precondition case. Record the loader call count and how it was measured. The policy snapshot is a flat frozen clone; it is not a transaction, database lock or universal deep immutability guarantee.

Unsupported action names are configuration errors raised while constructing the middleware. Keep this distinct from a runtime loader failure forwarded to `next(error)` and from a public HTTP response. A status code alone does not reveal which phase failed.

## 7. Reduced P03: CORS and CSRF

The mandatory 11.3A route contains only two selected classes:

1. **CORS:** record exact-origin allow/refuse decisions, status, `Access-Control-Allow-Origin`, credentials and `Vary`. Withholding sharing headers and returning application 403 are different policies. No real browser or cache observation is implied by a pure decision.
2. **CSRF:** record the safe-method rule, the cookie-authenticated unsafe-method rule and benign match/missing/mismatch controls. Do not export the token value. A deterministic fixture is not a production secret.

The reduced starter fails closed and contains no original insecure evidence import. The teacher reference is private. Completing this reduced route does not establish query safety, output-context encoding or configuration-secret handling.

## 8. Bounded Gemini critique

Ask Gemini to assess one sanitised, falsifiable policy claim against a small code or trace excerpt. Do not ask for the complete policy or security-boundary solution. Preserve only the relevant actual prompt and answer excerpt, then check the claim independently against source, named tests or your actual observation. Use ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN. UNKNOWN is not a pass of the implementation.

## 9. One PDF and honest completion

Use `form.html` for the text-only draft and `S11_EVIDENCE_FORM.docx` for genuine captures in the same final PDF. Imported JSON is an unverified draft and resets the declarations, PDF review and submission status. Structural completeness cannot prove truth, execution, teacher approval, PDF existence or Moodle submission.

Before submission, inspect every page of the actual PDF. If compulsory work is unfinished, keep the document as a draft. P01 capstone integration and advanced all-five 11.3B are not hidden S11 completion criteria.
