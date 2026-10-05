# Prepare the filtered classroom prerelease

This route prepares `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.7.zip`, independently of the existing full RC6 collection and weekly publication routes. It does not modify the original course/setup carriers, seminar classroom bytes or selection registry. The source repository keeps its historical materials; the new student archive applies a separate explicit selection.

The authoritative files are [the filter policy](../../metadata/classroom-release-policy.json), [the release plan](../../90_RELEASES/CLASSROOM_RELEASE_PLAN.json) and [the release notes](../../90_RELEASES/NOTES_CLASSROOM_RC7.md). The existing source material is pinned to commit `cab9751b6af7ddc6d73961e7768db7c300c72434`; that historical material SHA is distinct from the reviewed current Git SHA required for publication.

## Local preparation

Use Python 3.12, Node.js 24.21.0 and the pinned parser in `00_TOOLS/qa/requirements.txt`. Run commands from the repository root. Choose a new output folder outside the source checkout: differing existing files are refused, not overwritten.

```sh
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/qa/test_classroom_collection.py
python 00_TOOLS/publishing/resolve_classroom_release.py --asset-dir ../CLASSROOM_RC7_ASSETS --allow-preview --build --github-output ../CLASSROOM_RC7_PREPARATION.txt
```

The resolver verifies the complete source identity, exact registry/policy hashes, retained object identities, editable-file boundaries, pending qualification gates, local navigation, the deterministic ZIP and precisely three assets. The preparation text is a local output record; it does not publish or trigger Actions. `--workflow-output` is reserved for the actual GitHub workflow environment and its `GITHUB_OUTPUT` path.

Expected assets:

1. `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.7.zip`
2. `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.7.zip.sha256`
3. `SHA256SUMS.txt`

The ZIP contains one root folder, `WEBTECH_ASE_EN_GB_CLASSROOM_RC7/`. After extraction, run `node VERIFY_COLLECTION.mjs` from that folder. Preserve the clean initial result. After declared student edits or dependency installation, `--allow-student-edits` checks protected bytes, permits only the 38 declared editable files and ignores declared generated dependency/build/evidence directories. It does not validate those ignored directories or assess learner code. Use the seminar's prescribed checks separately.

## Owner-only GitHub step

After reviewing the local results, record the full current commit SHA whose tree was verified. Open **Actions → Prepare a draft filtered classroom prerelease → Run workflow**. Select the reviewed branch, enable `preview` and paste that exact 40-character lowercase SHA into `expected_source_sha`.

The workflow file is [`.github/workflows/release-classroom.yml`](../../.github/workflows/release-classroom.yml).

The owner starts the run. There are no push, pull-request, schedule or release-event triggers. Explicit preview is mandatory. The checked-out `HEAD`, GitHub run SHA and supplied reviewed SHA must agree before preparation continues.

If the run succeeds, inspect the resulting draft at tag `classroom-en-gb-v3.0.0-rc.7`. Check all three assets, the notes, selected commit and both **draft** and **prerelease** flags. Publish that draft only if it is the reviewed result, keeping prerelease status. GitHub's automatic source-code downloads are separate and must not be offered as the classroom asset.

The workflow refuses an existing tag or release, including ambiguous lookup failures. It creates a new tag before the draft; a later failure can leave the tag without a release. It does not delete or retarget tags, overwrite assets or silently reuse a version. Review any failure and use a reviewed successor version or an explicitly authorised recovery.

## Qualification scope

This is `FILTERED_CLASSROOM_PRERELEASE_NOT_FINAL`. The inner classroom files remain RC6 because their bytes are identical. Generated RC7 entry pages, notices, collection controls and new seminar identities require their own observation; the old Windows browser evidence cannot certify them. All ten broad qualification gates remain pending. A local PASS is bounded to its stated checks and is not final owner acceptance.

The two unsupported inherited S03/S06 `serve` branches are explicitly excluded from the new entry route. Original historical publishing commands remain historical and must not be used to prepare this edition. In particular, the preserved RC2 `build_scoped_distribution.py` route currently imports names absent from the current `release_contract.py`; its CLI is not a validated alternative to this resolver.
