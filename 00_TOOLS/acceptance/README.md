# Current v4.0.0 checks and acceptance

Use the [repository source checker](../README.md) before editing. Its result concerns inventory, source bytes, unit identities and declared document routes. It does not execute a course application, render HTML, inspect a saved PDF or contact Moodle.

The current classroom workspace for each seminar is:

```text
01_WEEKS/WEEK_XX/SXX_SEMINAR/EN_GB/CLASSROOM_RC6/
```

Choose the actual week through [the course plan](../../00_START_HERE/COURSE_PLAN.html), then read that workspace’s `START.html`, `GUIDE.html` and `EVIDENCE_FORM.html`. `CLASSROOM_RC6` identifies the retained inner workspace protocol; it is not the edition number of this v4.0.0 candidate.

From the selected seminar’s `EN_GB` folder, source checks are:

```text
node CLASSROOM_RC6/verify.mjs initial
node CLASSROOM_RC6/verify.mjs work
```

For S01–S07 the current task entry points are:

```text
node CLASSROOM_RC6/kit.mjs initial
node CLASSROOM_RC6/kit.mjs check all
```

For S08–S14 they are:

```text
node CLASSROOM_RC6/check.mjs initial
node CLASSROOM_RC6/check.mjs work
```

The guide distinguishes the environment required by each operation. Pure Node targets do not require npm; SQLite, HTTP, framework and infrastructure observations use separate profiles when applicable. Missing optional dependencies block their own operation. ENV_WARN permits the supported activity, while ENV_BLOCKED identifies the missing indispensable capability or actual probe failure. The named Node v24.21.0/npm 11.19.0 reference remains distinct from the observed Linux Node v24.19.0/npm 11.9.0 maintainer environment. An injected version string tests policy only and does not qualify that runtime. Read [environment guidance](../../00_START_HERE/ENVIRONMENT.html).

Learner targets are intentionally unfinished. An initial pass authenticates the starter boundary. A work check may return the documented assertion failure until the learner completes every required project; it must not be turned green by replacing learner tasks with supplied answers. Follow the selected guide’s protected-source and capability diagnostics before changing code.

Each seminar requires one PDF covering every required individual project, one genuine learner AI critique and an independent check of the chosen claim. Learner fields stay blank in the supplied forms. DOM-model maintainer checks are synthetic QA: they do not demonstrate native interaction, saved PDF output or a real learner AI exchange. Keep private drafts, logs, screenshots and PDFs outside the repository. Timings in the seminar plans are unpiloted estimates and preserve all required projects.

All seven teaching tranches are prepared with explicit limits. The owner has selected [the observed Windows technical profile](../../metadata/PUBLICATION_PROFILE.json) for v4.0.0. Its source eligibility is supported by the named existing Windows preflight/runtime, browser, JSON and PDF observations in [the current qualification record](../../metadata/CURRENT_QUALIFICATION.json), reused only for preserved tested bytes. Running a source checker does not repeat those observations. General qualification remains **NOT_FINAL**, native acceptance remains false and the ten broad historical gates remain pending. macOS is explicitly unexecuted and unqualified; its materials remain supplied. Linux observations, optional Word rendering and external or human checks retain their separate limits.

The final source commit, distribution, tag and complete asset set require their own exact receipts before publication. [The RC1 publication record](../../metadata/REVIEW_PRERELEASE.json) concerns the frozen earlier prerelease, whose tag and assets remain unchanged. Final publication and later portal promotion remain within T07, with no T08. Earlier failed or unexecuted observations remain historical records; later bounded evidence supplements them. No browser security refusal is bypassed or relabelled as a pass.
