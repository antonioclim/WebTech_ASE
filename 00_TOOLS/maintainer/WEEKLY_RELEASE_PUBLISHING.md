# Manual weekly releases: English Weeks 01 and 02

The active distribution is **2.1.0-rc.2**, a release candidate. Its local
qualification record distinguishes fresh hotfix checks and inherited results; seven native, human and owner gates remain pending in
`90_RELEASES/RELEASE_PLAN.json`. A merge makes the reviewed source available on
`main`; it does not qualify this candidate as FINAL or publish a Release.

Only the owner runs Actions for this remediation. All repository workflows use
`workflow_dispatch` only. This is the agreed operating procedure, not a claim
that GitHub permissions prevent every other writer from dispatching a workflow.

## Before a manual run

1. Confirm that the reviewed Week 01–02 EN pull request has been merged. Select
   `main` at the reviewed merge commit; if it has moved, inspect the intervening
   changes before using it. The workflow targets its captured `GITHUB_SHA`.
   If a future candidate changes workflow files, do not publish it from an unmerged branch:
   GitHub may require Workflows write permission when the release target changes
   workflow files relative to the default branch. The built-in token has only
   the declared Contents write permission.
2. Inspect `90_RELEASES/CURRENT_OBJECTS.json`, `WEEKLY_BUNDLES.csv` and
   `RELEASE_PLAN.json` at that same commit. The four selected object versions are
   C01 2.0.2-rc.1, S01 6.1.1-rc.1, C02 1.2.2-rc.1 and S02 2.3.1-rc.2.
3. The local review commands are scoped to this remediation:

   ```bash
   python 00_TOOLS/publishing/build_week_bundle.py --verify-all --weeks 01,02 --language EN_GB
   python 00_TOOLS/qa/validate_public_repo.py --strict --weeks 01,02 --language EN_GB
   ```

   These checks do not certify Weeks 03–14, Romanian alternatives or native
   platform acceptance. A green historical run is not evidence for a new commit.
4. Check that the selected candidate tag and Release do not already exist.
   The workflow also refuses reuse. If a run fails after creating a draft or
   uploading an asset, inspect the partial result before another run. Never
   delete or recreate an object merely to reuse its version; record the incident
   and prepare a new candidate version when a replacement is needed.

## Prepare the current draft prerelease

1. Open **Actions → Publish a weekly GitHub Release → Run workflow**.
2. Select branch **main** at the reviewed commit.
3. Select week **01** and explicitly enable **preview** (`true`).
4. Click **Run workflow** once. Inspect the new run, its commit and every step.
5. After success, open **Releases** while signed in and inspect the draft.
6. Repeat the procedure for week **02**, again with `preview=true`.

| Week | Candidate tag | Expected attached files |
| --- | --- | --- |
| 01 | `week-01-en-v2.1.0-rc.2` | `WebTech_ASE_WEEK_01_EN_GB_v2.1.0-rc.2.zip` and its `.zip.sha256` sidecar |
| 02 | `week-02-en-v2.1.0-rc.2` | `WebTech_ASE_WEEK_02_EN_GB_v2.1.0-rc.2.zip` and its `.zip.sha256` sidecar |

Read the exact RC2 ZIP hashes from `90_RELEASES/WEEKLY_BUNDLES.csv` and compare both `.zip.sha256` sidecars at the same reviewed commit. The retained RC1 hashes belong to different outer assets and must not be relabelled as RC2.

The workflow verifies deterministic bundles and the selected EN week, resolves
the declared assets and preserves both `draft=true` and `prerelease=true`.
Its successful completion prepares a draft; it does not make that draft public
to students. Each attached ZIP contains exactly its course ZIP, seminar ZIP and
distribution metadata. The automatically generated GitHub **Source code**
archives contain the repository, so they are not the filtered student download.

With `preview=false` (the default), current publication resolution must fail
with `FAIL_RELEASE_RESOLUTION` because the candidate and pending gates are not
publication-qualified. This refusal is expected, not a reason to bypass a gate.

## Inspect the draft and decide separately

Confirm the selected commit, tag, title, both attached filenames and SHA-256,
release notes, draft status and prerelease status. Keep the pending gates visible.
The owner may publish an honestly described prerelease after this inspection;
keep **This is a pre-release** selected and do not present it as FINAL. Publishing
the draft is a separate owner action from running the preparation workflow.

Before qualifying a new version as FINAL, collect actual evidence for native
Windows, native macOS, manual browser/keyboard/zoom, Microsoft Word, live Moodle,
a timed human pilot and owner acceptance. Update the qualification records,
regenerate the affected package identities and bundles, select a new release
version and review it. Do not relabel an existing candidate or change protected student metadata
to manufacture acceptance.

Release immutability is enforced by GitHub only when enabled and after
publication. Its repository setting has not been verified by this remediation;
the workflow's duplicate checks and hashes are not a substitute for that
setting. Consult the primary documentation below before publication if
platform-enforced immutability is required. Do not change other repository
settings as part of this procedure.

## Primary documentation

- [Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow?tool=webui)
- [GitHub CLI: gh release create](https://cli.github.com/manual/gh_release_create)
- [Managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [REST API: releases](https://docs.github.com/en/rest/releases/releases#create-a-release)
- [Immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases)
