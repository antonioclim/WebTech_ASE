# Prepare the instruction-remediated RC10 classroom candidate

RC10 is a new documentary classroom candidate: version `3.0.0-rc.10`, tag `classroom-en-gb-v3.0.0-rc.10`, status `DOCUMENTARY_CLASSROOM_CANDIDATE_NOT_FINAL`. It is not yet published. The existing public RC9 release and its reading site remain the published routes until a separate owner decision establishes a successor.

The candidate retains thirty selected source units, fourteen seminar tutorials, forty required microprojects, thirty optional Word references and thirty-eight declared editable files. The new policy binds the exact documentary derivation to the authenticated published RC9 predecessor and to the current source inventory. All ten broad qualification gates remain pending. A successful local preparation is scoped evidence, with verdict `NOT_FINAL`.

The owner alone may start Actions after the final source review. The assistant must not dispatch, retry or cancel Actions. Every workflow remains manual. This guide describes a future owner operation and does not record a run, release creation, publication or final acceptance.

## Review the candidate locally

Use a checkout of the exact reviewed source, Python with the pinned dependency in `00_TOOLS/qa/requirements.txt` and Node.js `24.21.0`. Open a terminal at the repository root. The commands below perform local checks and do not start Actions.

```sh
python -m pip install --requirement 00_TOOLS/qa/requirements.txt
node --version
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --plan 90_RELEASES/FULL_COLLECTION_PLAN.json
python 00_TOOLS/qa/test_classroom_rc10.py
python -m unittest discover -s 00_TOOLS/qa -p test_rc10_day0_form.py
```

`node --version` must display `v24.21.0`. Stop on any failing check and inspect its actual output. A green run from another source commit does not validate this checkout. Whole-source validation checks the current inventory, preserved source, metadata and manual workflow definitions. Weekly verification checks retained historical containers without making their historical projects the active classroom route.

The focused RC10 checks validate the new documentary derivation, candidate inventory, refusal controls and Day 0 source/status contracts. The workflow does not repeat historical runtime suites by default for protected, unchanged code. Previous runtime observations must retain their original date, source and scope. The standard workflow discovery checks the form source and scope guards. Separate bounded browser observations can test form behaviour but are not native PDF-rendering or live Moodle acceptance results.

## Prepare exactly three local assets

Choose a new destination outside the source checkout. Run this exact command from the repository root:

```sh
python 00_TOOLS/publishing/resolve_classroom_rc10.py --plan 90_RELEASES/CLASSROOM_RC10_RELEASE_PLAN.json --asset-dir ../webtech-classroom-rc10-assets --allow-preview --build --github-output ../webtech-classroom-rc10-fields.txt
```

This local command builds and verifies exactly these assets:

- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip`
- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256`
- `SHA256SUMS.txt`

Its separate fields receipt is not a release asset. The resolver authenticates the current source before and after preparation, validates the candidate scope and internal manifests, independently checks ZIP closure and verifies every output byte. ZIP timestamps, ordering and modes are deterministic. It accepts only an explicit preview with real draft and prerelease booleans. No final-release mode exists.

An identical replay is allowed. A corrupt existing asset, unexpected file, unsafe destination or changed plan is refused without replacing existing bytes. Keep partial output for diagnosis. The local resolver does not create a Git tag, create a GitHub release, upload assets or publish anything.

Check the actual ZIP and sidecar in PowerShell. Replace no values in this command when using the destination above:

```powershell
$rc10AssetDirectory = '../webtech-classroom-rc10-assets'
$rc10ArchiveName = 'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip'
$rc10ArchivePath = Join-Path $rc10AssetDirectory $rc10ArchiveName
$rc10SidecarPath = Join-Path $rc10AssetDirectory ($rc10ArchiveName + '.sha256')
$rc10SidecarText = (Get-Content -LiteralPath $rc10SidecarPath -Raw).TrimEnd("`r", "`n")
$rc10ArchiveHash = (Get-FileHash -LiteralPath $rc10ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($rc10SidecarText -cne ($rc10ArchiveHash + '  ' + $rc10ArchiveName)) { throw 'RC10 archive and sidecar differ. Stop.' }
$rc10ActualNames = @(Get-ChildItem -LiteralPath $rc10AssetDirectory -File | Select-Object -ExpandProperty Name | Sort-Object)
$rc10ExpectedNames = @('SHA256SUMS.txt', $rc10ArchiveName, ($rc10ArchiveName + '.sha256')) | Sort-Object
if (Compare-Object -ReferenceObject $rc10ExpectedNames -DifferenceObject $rc10ActualNames) { throw 'RC10 asset directory has missing or unexpected files. Stop.' }
'RC10 archive sidecar and three filenames match; read the resolver report for complete validation.'
```

The resolver also validates `SHA256SUMS.txt` exactly against the two other assets. Read the actual preparation report for the ZIP digest, repository source package ID, file count and navigation scope. A digest printed by this guide would become stale when the reviewed source inventory changes, so no provisional candidate digest is presented as an established publication identity.

## Obtain the exact reviewed commit SHA

Finish the source review and integration first. The manual workflow must be present on the default branch for GitHub's Actions interface. Review the final integrated commit; if that branch moves afterwards, review the new commit before preparing a draft.

In the exact reviewed checkout, run:

```sh
git rev-parse HEAD
```

Copy all forty lowercase hexadecimal characters. This is the Git commit containing the final RC10 workflow, builder, policy, plan, notes, tests and source seal. It is not the original teaching-material commit, the RC9 tag commit, a package identity, a ZIP digest or a short Git hash.

## Owner-only draft preparation after final review

No run is required during local documentary preparation. When the owner chooses to prepare the reviewed draft:

1. Open the repository's **Actions** tab.
2. Select **Prepare a draft instruction-remediated classroom RC10 prerelease**, file `release-classroom-rc10.yml`.
3. Click **Run workflow** and select the branch containing the exact reviewed commit.
4. Enable **preview**. It defaults to `false`; an unticked preview stops the run.
5. Paste the full reviewed commit SHA into **expected_source_sha**.
6. Start the run once. The owner performs this action.
7. Check the run's commit and all step outputs. Stop on any failure and preserve the actual result.
8. After success, open **Releases** while signed in. Inspect the new draft `classroom-en-gb-v3.0.0-rc.10`, its target commit, prerelease flag, notes and exactly the three asset filenames above.
9. Download the attached ZIP and checksums from the draft, compare their bytes and digests with the reviewed preparation outputs and inspect the extracted student route before deciding to publish.

The workflow requires checked-out `HEAD`, `GITHUB_SHA` and the supplied SHA to agree. It uses the actions pinned in `metadata/github-actions-lock.json`, Python `3.12`, exact Node `24.21.0` and the pinned YAML parser. It validates the whole source and historical carriers, runs the focused candidate tests and uses the new RC10 resolver to build outside the checkout.

Before remote creation, it refuses existing RC10 tags and releases. A tag-lookup error stops the run. Release absence requires an explicit HTTP `404`; authentication, network or other lookup failures stop preparation. The new tag creation is atomic and cannot overwrite an existing ref. The workflow checks the resulting remote ref and uses `--verify-tag` when creating the draft. Its RC10 concurrency group prevents overlapping runs within this workflow.

A failure after tag creation may leave a new RC10 tag or partial draft. A rerun refuses that existing identity. Do not delete, retarget, recreate or overwrite remote objects automatically to reuse the version. Record the partial result; a replacement distribution needs a reviewed successor version. These workflow controls do not establish repository-wide release immutability settings.

## Publication and qualification remain separate

The workflow creates a **draft prerelease**, which does not make the student download public. Publishing the reviewed draft is a separate owner decision in GitHub's release editor. Retain **This is a pre-release** and the `NOT_FINAL` declaration. Do not promote pending gates using packaging results, historical observations or inferred success.

After publication, students use the attached RC10 ZIP, extract the complete collection and open `WEBTECH_ASE_EN_GB_CLASSROOM_RC10/index.html`, then `START_HERE.html`. GitHub's automatic source archives are development source, not the filtered classroom package. The existing public RC9 Pages site continues to show RC9; preparing or publishing an RC10 release does not deploy Pages or prove that the site contains RC10.

The candidate changes documentary guidance and the Day 0 evidence form. It preserves runtime targets, protected original source, the required-project inventory and the permitted learner edits. The policy and derivative manifest state the exact admitted changes. Optional original projects, advanced-source artifacts and Word references retain their separate scope.

Keep student details, evidence PDFs, acceptance receipts, synthetic audit records, browser profiles, installed dependencies, downloaded runtimes and private logs outside the public repository and its release assets. Native Windows/macOS, manual browser use, Word rendering, live Moodle, timed student workload and owner acceptance remain deferred until actually observed. No acceptance forms are forced as part of this preparation.

## Primary documentation

- [GitHub: manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow?tool=webui)
- [GitHub REST API: Git references](https://docs.github.com/en/rest/git/refs)
- [GitHub CLI: API response headers](https://cli.github.com/manual/gh_api)
- [GitHub CLI: creating a release and verifying its tag](https://cli.github.com/manual/gh_release_create)
- [GitHub: managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

The new collection verification control changes only the single RC9 distribution-version literal to RC10. Every integrity operation remains byte-identical. `RC10_COLLECTION_DERIVATION.json` records its before/after hashes alongside current delivery-page changes; course and seminar runtime code, test sources, learner targets and dependency pins remain exact.
