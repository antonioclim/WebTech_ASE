# Responsive Card/Grid Reconstruction

This project has no external npm dependencies. **Do not run `npm install`.**

Student route:

1. start from the package root and run `CHECK_ENVIRONMENT`;
2. run `VERIFY_INITIAL_STATE` before editing;
3. edit only `public/styles.css`;
4. use the root `START_PROJECT` launcher;
5. run `VERIFY_WORK_RESULT` after completing the reconstruction.

Exact qualification runtime: Node.js v24.21.0 and npm 11.19.0.
The static tests do not replace real browser evidence. Browser absence must be recorded as `UNKNOWN`, while timeout or crash is a genuine failure.

## Teaching scope

Card links scroll to their own named demonstration cards. They do not open real tools. The supplied server binds loopback and serves GET/HEAD files; unsupported methods receive 405. This is a local lesson server, not a production service. Source checks are a bounded checklist, while browser smoke measures selected rendered states. Manual Tab activation and native 200% zoom remain individual checks.

## Source checklist syntax and teacher review

The small built-in parser supports ordinary style rules, selector lists, declarations with functions, and grouping rules such as `@media`, `@supports` and `@layer`. The checklist recognises `(min-width: 40rem)` or `(width >= 640px)` and the corresponding 64rem or 1024px boundary. These local breakpoints are part of this teaching exercise. It accepts either repeated `1fr` or `minmax(0, 1fr)` tracks; actual shrinkage and overflow are measured in the browser. It is not a general CSS validator or a complete cascade engine. Nested style rules, more complex selectors or an equivalent unrecognised expression need a teacher source review rather than a claim that all valid CSS is supported. A source-check stop for such an expression should be recorded with the rendered measurements; do not rewrite a working design solely to satisfy a textual pattern without understanding it.
