# Current v4.0.0 source tools

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
| [Offline build](publishing/README.md) | Preserve published assets; reproduce only from their frozen source |
| [Source maintenance](maintainer/README.md) | Refresh the distinct portal seals without changing published release identities |

All seven teaching tranches are complete with their stated limits. The stable v4.0.0 release has been verified; this separate postpublication portal promotion is the last source block within T07, with no T08. The [declared Windows publication profile](../metadata/PUBLICATION_PROFILE.json) records **PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS** for source technical eligibility. General qualification remains **NOT_FINAL**, broad native acceptance remains false and the ten historic whole-edition gates remain pending. macOS materials are retained but unexecuted and unqualified; scoped Linux observations do not qualify the whole platform. No checker installs software, dispatches Actions, publishes a release, merges a branch or contacts student accounts. [The actual publication record](../metadata/PUBLISHED_RELEASE.json) identifies v4.0.0 as the observed Latest stable classroom edition; 3.0.0 is a previous edition; the [frozen RC1 teaching review](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) remains a prerelease. Read [qualification scope](../00_START_HERE/QUALIFICATION.html) and [candidate progress](../metadata/CANDIDATE_PROGRESS.json) for the separate technical and publication states.
