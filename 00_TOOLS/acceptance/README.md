# Current edition checks and acceptance

Use the [repository source checker](../README.md) first. Its result concerns bytes, unit identities and document routes. It does not execute a course application, render a page in a browser, inspect a saved PDF or contact Moodle.

Each seminar's current classroom work is inside:

```text
01_WEEKS/WEEK_XX/SXX_SEMINAR/EN_GB/CLASSROOM_RC6/
```

Open that seminar's `START.html`, `GUIDE.html` and `EVIDENCE_FORM.html`. The retained `CLASSROOM_RC6` folder name identifies its inner classroom contract within the current v3.0.0 edition.

From the chosen seminar's `EN_GB` folder, the protected-source commands are:

```text
node CLASSROOM_RC6/verify.mjs initial
node CLASSROOM_RC6/verify.mjs work
```

S01–S07 use:

```text
node CLASSROOM_RC6/kit.mjs initial
node CLASSROOM_RC6/kit.mjs check all
```

S08–S14 use:

```text
node CLASSROOM_RC6/check.mjs initial
node CLASSROOM_RC6/check.mjs work
```

Read the chosen guide for its actual browser, HTTP, SQLite, React or observation steps. These seminar commands retain the recorded Node `v24.21.0` reference. The repository byte checker does not require that exact minor version. A `STOP_REFERENCE_NODE` or `REFERENCE_NODE_MISMATCH` from a retained seminar command records a runtime mismatch; it is not evidence that the repository bytes failed or that the seminar passed. No command here installs or changes the runtime.

Learner targets are intentionally unfinished. An initial/source-boundary pass shows the supplied starter state. A work check may fail until the student implements the required project. Do not replace unfinished learner code with solutions merely to obtain a pass.

Keep evidence files, exported drafts, logs and PDFs outside the entire repository. Record the actual runtime and actual observations. A browser observation must distinguish source inspection from rendered behaviour; a saved PDF must be checked after saving; a Moodle observation must come from the real service. Planned 30–45-minute project intervals remain unpiloted estimates.

General qualification remains **NOT_FINAL**, with all ten gates pending: local integrity, reference runtime, headless browser, native Windows, native macOS, manual browser, Word, live Moodle, human pilot and owner acceptance. Finite checks may provide scoped evidence while these general gates remain pending. No source-check or build command claims their completion.
