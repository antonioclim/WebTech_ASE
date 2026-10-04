# Week 01–02 English remediation candidate

This is the historical **2.1.0-rc.1** remediation record. The [current catalogue](README.md) selects **2.1.0-rc.2** after the S02 native Windows verifier-argument failure. See [hotfix QA](WINDOWS_PATH_HOTFIX_QA.json) for the new checks and explicitly inherited evidence. The original local QA receipt and RC1 asset bytes are preserved.


This candidate corrects the English student distribution for C01, S01, C02 and S02. The previous release catalogue selected superseded seminar versions; it now derives from `CURRENT_OBJECTS.json`. Each object has one active ZIP and one byte-identical extracted copy. Historical English downloads and the duplicate standalone S01 guide are accessible through the pinned history catalogue.

The candidate also corrects English support material, strengthens the HTTP and CSS evidence contracts, reduces duplicated S01 form work, and makes S02 PDF export possible before post-export review. Completed solutions, adversarial mutations, student submissions and instructor-only Moodle administration do not belong in these student packages.

## Versions and scope

| Object | Candidate |
| --- | --- |
| C01 | 2.0.2 RC1 |
| S01 | 6.1.1 RC1 |
| C02 | 1.2.2 RC1 |
| S02 | 2.3.1 RC1 |

The filtered English distribution version is **2.1.0-rc.1**. Repository-wide citation and package identity remain tied to the stable baseline **2.0.1** while the repository is work in progress. Weeks 03–14 package bytes and Romanian alternatives are outside this remediation.

## Qualification contract

The registry and release plan keep separate gate results. Local exact-runtime tests use Node.js 24.21.0 and npm 11.19.0. Local rendered browser checks use Google Chrome for Testing headless on Linux. Those results cover the exercised cases, rather than every possible browser state or operating system.

Native Windows/macOS launchers, Microsoft Word, live Moodle upload/review, a timed human classroom pilot and owner acceptance remain pending. Human keyboard traversal and native browser zoom require explicit manual acceptance. A Linux PDF export or programmatic focus check does not close those gates. The seminar's proposed 60-minute core remains a design budget until piloted.

`VERIFY_INITIAL_STATE` must accept the deliberately incomplete starter only when its expected baseline/regression/objective counts match. `VERIFY_WORK_RESULT` checks the student's work, and reports an incomplete browser gate separately. Students must never change protected tests or integrity metadata to make a result pass. Static CSS checks can reject known mistakes; they cannot replace measured layout and manual interaction evidence.

## Local review commands

In the current checkout these commands validate the active RC2 candidate. To reproduce the historical RC1 record, use a separate checkout of `7f88fecfa972bfb41d4fffec3e47616842c7e067`, which retains the original RC1 registry, packaging records and assets.

```bash
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --weeks 01,02 --language EN_GB
python 00_TOOLS/qa/validate_public_repo.py --strict --weeks 01,02 --language EN_GB
python 00_TOOLS/publishing/resolve_release.py --help
python 00_TOOLS/publishing/build_pages_site.py --help
```

These commands are local. The release resolver must refuse final publication while required gates are pending. Its explicit preview mode is for reviewing draft/prerelease metadata. The release workflow offers an explicit `preview` input, defaulting to false. The owner can select it manually to prepare a draft prerelease candidate; resolved draft/prerelease flags are preserved. Pending gates block the default publication route.

No GitHub Actions workflow, Pages deployment, tag, Release publication, Moodle configuration or merge is performed during candidate preparation. The owner controls eventual manual workflow execution. Existing release assets are not overwritten.

## Assessment and fallback

The student criteria describe evidence quality without creating a new numeric marking policy. The lecturer supplies approved weights and deadlines through the course assessment policy. Supplied traces and offline simulations can support contract reasoning, but cannot be labelled as personally executed application or browser evidence. If a gate is unavailable, record `NOT EXECUTED`, the reason and the relevant limitation.

An earlier public S01 guide contained a completed assessed implementation. Removing it from the active candidate does not make previously public code secret: Git history remains accessible. Matching code or passing tests alone therefore cannot establish individual understanding. The student's own prediction, observation, explanation, disclosed assistance and limits remain necessary evidence under the lecturer's approved assessment policy.
