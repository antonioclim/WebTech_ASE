# Prepare and publish the corrected RC8 classroom prerelease

The owner alone starts GitHub Actions. This document and the local resolver do not start a workflow. All workflows remain `workflow_dispatch` only. Published RC7 assets, the RC7 tag and all frozen RC6 source carriers remain unchanged.

RC8 is a narrowly derived classroom distribution. C07 now has carrier version `1.1.3-rc.8`, correcting ten documented stale hashes and strengthening the source inventory guard. All five canonical example scripts, dependency pins and lockfile bytes are unchanged. Four displaced controls are retained under `PREDECESSOR_RC6`. All fourteen seminar classroom contracts remain byte-identical. This correction does not change the retained whole-source RC6 or weekly ZIP selections.

## Local construction

Use reference Node.js `24.21.0` and Python with `00_TOOLS/qa/requirements.txt`. Run the repository and regression checks before release preparation:

```sh
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/qa/test_classroom_collection.py
python 00_TOOLS/qa/test_classroom_successor.py
```

Build only outside the repository, into an absent directory:

```sh
python 00_TOOLS/publishing/resolve_classroom_successor.py --plan 90_RELEASES/CLASSROOM_SUCCESSOR_RELEASE_PLAN.json --asset-dir ../webtech-classroom-rc8-assets --allow-preview --build --github-output ../webtech-classroom-rc8-fields.txt
```

The resolver independently verifies the exact payload closure, source preservation and C07 derivation, then produces exactly three assets:

- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.8.zip`
- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.8.zip.sha256`
- `SHA256SUMS.txt`

Neither local construction nor this resolver publishes, dispatches Actions, changes a tag or overwrites an existing release. Only the new wrapper and derived C07 identities change. The current selected source archives and their identities remain frozen.

## Owner-only Actions procedure

1. Finish review/integration of this successor commit. Obtain the full 40-character lowercase SHA of the exact commit on the chosen branch. Do not use an abbreviated hash or the RC7 source SHA.
2. Open repository **Actions** and choose **Prepare a draft corrected classroom RC8 prerelease** (`release-classroom-successor.yml`).
3. Click **Run workflow**. Select the branch containing the reviewed successor commit.
4. Tick the explicit **preview** checkbox. Paste the full reviewed commit SHA into **expected_source_sha**.
5. Click **Run workflow** once. The owner performs this action; the assistant must not start, retry or cancel it.
6. If the run succeeds, inspect the new draft release and its three uploaded assets. The tag is `classroom-en-gb-v3.0.0-rc.8`. Only the owner publishes the draft when desired. Keep prerelease status.

The workflow binds the run to the exact selected source, requires explicit preview, validates the repository and both regression suites, verifies all existing weekly containers, prepares the deterministic RC8 assets and refuses an existing tag or release. It has no final-release mode. A concurrent new tag is refused by the API. If a later step fails after tag creation, the tag can remain; a rerun refuses it. Inspect the run before deciding recovery. Do not delete or retarget the existing RC7 tag.

## Deferred acceptance and evidence

The owner's manual acceptance is deferred. No manual review form, invented observations or acceptance JSON is needed to prepare this draft prerelease. Deferral is not PASS. All ten broad qualification gates remain pending and the general verdict remains `NOT_FINAL`.

A preflight diagnostic can exit `0` while its JSON contains `ready:false`. Treat source authentication, dependency readiness and actual database/HTTP execution as separate observations. The C07 registry guard authenticates current selected source bytes; construction authenticates the documented historical hash transition. Local manifests are integrity controls rather than publisher signatures.

Native Windows/macOS, browser interaction/accessibility, Word layout, institutional Moodle submission, student workload and final acceptance require their own observations. Earlier bounded RC6 browser evidence transfers only to unchanged form contracts, not new RC8 package IDs or C07 controls.

Keep owner evidence, student records, browser profiles, downloaded runtimes, dependency trees and QA logs outside the public repository and release assets.
