# Repository status

```text
Stable baseline version: 2.0.1
Current state: WORK_IN_PROGRESS
Automatic GitHub Actions triggers: 0
Workflow mode: manual-only
Pages deployment: deferred
Weekly release publication: deferred
Published curriculum currently present: Day 0 and weeks 1–2
Alternative setup candidates: integrated as RC documentation and downloads
Canonical TW2026 repository modified: no
```

The repository is being expanded. Uploads must not trigger validation, Pages or
release publication automatically. Do not use historical red workflow badges as a
current verdict and do not re-run historical failed jobs.

`REPOSITORY_SHA256SUMS.txt` and `REPOSITORY_PACKAGE_ID.txt` describe the last
frozen baseline. They are deliberately not regenerated after every browser commit.
The WIP validator checks content, package integrity, guide mirrors, public/private
boundaries and manual-only workflow policy, but postpones exact repository-tree
identity until the final freeze.

The final freeze requires one manifest regeneration, one package-ID regeneration,
a complete local validation and one owner-triggered **Deploy GitHub Pages** run.
