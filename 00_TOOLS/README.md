# Current v4.0.0 candidate tools

The student source checker confirms the supplied files before editing and protects support files after declared learner changes. Runtime helpers perform the capability checks required by the selected activity. Neither checker grades an implementation or substitutes for its actual task checks.

From the repository root, with Node already available:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs
```

After editing only declared learner targets or creating declared dependency/output folders:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits
```

An available Python installation provides a separate source and route check:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/qa/validate_public_repo.py --strict --allow-student-edits
```

The work mode permits only the 38 declared learner targets and 83 declared runtime directories. Keep drafts, exported evidence, screenshots, logs and PDFs outside the entire repository. Read the seminar guide for its actual execution commands and expected TODO refusals.

| Route | Purpose |
| --- | --- |
| [Source checks](qa/validate_public_repo.py) | Whole-source inventory, byte identities, project map and declared local routes |
| [Activity environment](runtime/README.md) | Capability checks and owned-resource limits for the selected operation |
| [Acceptance scope](acceptance/README.md) | Distinguish source, application, browser, native and classroom observations |
| [Offline build](publishing/README.md) | Maintainer preparation of a deterministic candidate ZIP |
| [Source maintenance](maintainer/README.md) | Refresh reviewed seals before final integration and publication |

All seven teaching tranches have a prepared candidate scope. Final integration and publication remain within T07; there is no T08. General qualification is **NOT_FINAL**, with ten gates pending. No checker installs software, dispatches Actions, publishes a release, merges a branch or contacts student accounts. The latest published classroom edition remains 3.0.0. Read [candidate progress](../metadata/CANDIDATE_PROGRESS.json) for exact scope.
