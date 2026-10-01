# S11 — Required Reduced Security Portfolio: CORS and CSRF

## 1. Scope

This is the mandatory **11.3A reduced two-class portfolio**. It is a locally derived route because the curriculum requires two classes but does not name them. The selected classes are CORS and CSRF. The original five-class exercise remains private provenance and advanced follow-up. Two-class completion must never be labelled an all-five-suite pass.

The permitted assessed file is:

```text
portfolio/p03-reduced/student/src/security-boundary.js
```

Do not edit the support module, tests, package metadata or evidence contract. Do not import the original deliberately insecure evidence module.

## 2. Defensive method

For each class, use the following sequence:

1. trace the benign input from its source to the decision;
2. identify the trust boundary and owner of the decision;
3. predict one expected allow and one expected refuse result;
4. implement or review the protective decision;
5. execute only the supplied benign controls in an authorised local environment;
6. record the exact evidence class, result and limitation;
7. retain a narrow diff and restore any temporary observation change.

Do not create exploit payloads, credential theft demonstrations, guard-bypass recipes or scans. Do not weaken the guard to manufacture a result.

## 3. CORS evidence

The reduced contract uses exact origins. Record:

- the configured origin set without secrets;
- a benign allowed origin decision;
- a benign non-member origin decision;
- whether the response policy includes `Vary: Origin`;
- preflight status and declared methods/headers when applicable;
- the distinction between HTTP refusal and browser response-sharing behaviour;
- the evidence class: pure decision, callback model, actual Express or real browser.

Do not claim browser or cache behaviour from a pure function. Do not generalise an exact-origin set to suffix matching.

## 4. CSRF evidence

Record:

- which methods are safe in this exercise;
- whether authentication is cookie-based for the write;
- one benign matching-token result;
- one missing or nonmatching result;
- the exact comparison owner and the fact that token values are redacted;
- what the evidence does not establish about production sessions, entropy, origin checks or deployment.

A deterministic fixture token is test infrastructure, not a production token. A constant-time helper does not make the whole request path timing-safe.

## 5. Required portfolio record

For each class, provide: source-to-decision trace, correction or retained control, named benign checks, result, locator and limitation. Include a before/after hash or narrow diff locator when you changed the assessed file. State explicitly that query, output encoding and configuration-secret classes were not assessed by this reduced route.

The portfolio belongs in the single S11 PDF. It is not a second upload.
