# Prepare the remediated RC9 classroom draft prerelease

RC9 is the remediated English classroom successor to RC8. Its version is `3.0.0-rc.9` and its tag is `classroom-en-gb-v3.0.0-rc.9`. It remains a prerelease with the general verdict `NOT_FINAL`. A successful packaging check is scoped evidence; it does not constitute native platform, institutional Moodle, workload or final owner acceptance.

The owner alone starts Actions after the final review phase. This guide, the builders and the resolvers do not start a workflow. The assistant must not dispatch, retry or cancel Actions. All workflow triggers remain `workflow_dispatch` only. Historical RC6, RC7 and RC8 releases and source carriers retain their identities.

## Review and local preparation

Use Python with the pinned dependencies in `00_TOOLS/qa/requirements.txt` and the exact reference Node.js `24.21.0`. Run the following commands from the root of the reviewed repository checkout:

```sh
python -m pip install --requirement 00_TOOLS/qa/requirements.txt
node --version
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --plan 90_RELEASES/FULL_COLLECTION_PLAN.json
python 00_TOOLS/qa/test_classroom_rc9.py
python -m unittest discover -s 00_TOOLS/qa -p test_rc9_forms.py
python 00_TOOLS/qa/test_rc9_code.py
```

`node --version` must display `v24.21.0`. Stop on any failing check and inspect its actual output. A previous green run for another commit does not validate the selected source. The weekly verification above checks preserved historical containers, rather than making their contents the active RC9 classroom edition.

The code suite may explicitly skip an optional Express case when its separate dependencies are unavailable. A skip is not PASS for that optional runtime. The workflow does not install every course dependency. Read the actual test output and the separately scoped local runtime evidence.

Choose a destination outside the checkout that does not already exist. This copy-paste command uses `../webtech-classroom-rc9-assets`:

```sh
python 00_TOOLS/publishing/resolve_classroom_rc9.py --plan 90_RELEASES/CLASSROOM_RC9_RELEASE_PLAN.json --asset-dir ../webtech-classroom-rc9-assets --allow-preview --build --github-output ../webtech-classroom-rc9-fields.txt
```

The destination contains exactly these release assets:

- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip`
- `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256`
- `SHA256SUMS.txt`

The local command constructs and verifies assets. It does not create a tag, create a release, upload files or publish anything. Use the collection's integrity verifier before learner edits and its explicitly permitted edit mode after learner changes. The internal `PACKAGE_ID` and manifests authenticate the declared bytes; they are not a digital signature of the publisher.

## Obtain the reviewed commit SHA

Complete the final source review and integration before a run. Workflow changes should be available on the default branch for the manual Actions interface. If the branch moves after review, review the new commit before using it.

Run this read-only command in the exact reviewed checkout:

```sh
git rev-parse HEAD
```

Copy all 40 lowercase hexadecimal characters from its output. The input is the commit that contains the reviewed RC9 workflow, plan, source and release notes. It is not the RC8 material SHA, a ZIP checksum or a short Git hash. No fixed SHA is supplied here because the reviewed final commit has not yet been established by this guide.

## Owner-only draft preparation in Actions

1. Open the repository's **Actions** tab.
2. Select **Prepare a draft remediated classroom RC9 prerelease**, whose file is `release-classroom-rc9.yml`.
3. Click **Run workflow** and select the branch containing the exact reviewed commit.
4. Enable **preview**. Its default is `false`; an unticked preview must stop the run.
5. Paste the full reviewed commit SHA into **expected_source_sha**.
6. Start the run once, after the final review phase. The owner performs this action.
7. Inspect the run's commit and every step. If any step fails, inspect the reason and any partial remote objects before considering recovery.
8. After success, open **Releases** while signed in and inspect the newly prepared draft `classroom-en-gb-v3.0.0-rc.9`. Confirm its target commit, prerelease flag, notes and exactly the three filenames above. Compare the ZIP's SHA-256 with both its sidecar and `SHA256SUMS.txt`.

The workflow requires `git rev-parse HEAD`, `GITHUB_SHA` and **expected_source_sha** to be equal. It validates the reviewed source, runs RC9 regression/refusal checks and builds assets outside the checkout. It refuses an existing tag or release. A tag-lookup network error or a release-lookup result other than an explicit `404` stops preparation. Creation of the new ref is atomic; the workflow then checks that the remote tag points to the selected commit and uses `--verify-tag` when preparing the draft. Concurrency prevents overlapping RC9 preparation runs within this workflow.

A failure after tag creation may leave the new tag or a partial draft. A rerun refuses that existing identity. Do not delete, retarget or overwrite an object merely to reuse the RC9 version. Record the partial result and use a reviewed successor version when recovery requires a replacement distribution. Workflow controls do not establish that repository-wide GitHub release immutability has been enabled.

## Publishing is a separate owner decision

The preparation run creates a **draft prerelease**. It does not make the download public for students. After inspecting the concrete draft, the owner may publish it using GitHub's release editor while retaining **This is a pre-release**. Do not represent the candidate as FINAL and do not replace the pending qualification gates with inferred PASS results.

Student instructions should point to the attached RC9 ZIP after publication. GitHub's automatic **Source code** archives contain the development repository and historical materials. They are not the filtered classroom download. Students extract the complete RC9 asset, open `WEBTECH_ASE_EN_GB_CLASSROOM_RC9/index.html` and follow its `START_HERE.html`.

Keep student records, owner evidence, synthetic audit data, browser profiles, installed dependency trees, downloaded runtimes and logs outside the public repository and release assets. Retained advanced source is a separate route; its historical defects must not be presented as fixed merely because the classroom ZIP excludes it.

## Optional advanced-source derivation

The core classroom download excludes the original full seminar applications. Their sealed historical carriers remain available only as explicitly labelled source references. Do not run the old S13 server or use the old optional S03/S06 branches as though the classroom correction had changed their bytes.

The separate maintainer recipe applies recorded RC9 corrections to the advanced source without overwriting its immutable predecessor. After the final source checks, construct its independent ZIP and report outside the checkout:

```sh
python 00_TOOLS/publishing/build_advanced_rc9.py --zip ../WEBTECH_ASE_EN_GB_ADVANCED_SOURCE_v3.0.0-rc.9.zip --report ../webtech-rc9-advanced-report.json
```

The optional ZIP covers only the retained full source for S03, S06, S07, S09 and S13. Extract it into a distinct folder, open a terminal in its `WEBTECH_ASE_EN_GB_ADVANCED_RC9` root and run:

```sh
node VERIFY_ADVANCED.mjs
```

The outer check authenticates the derived clean bytes and reports `PASS_OPTIONAL_ADVANCED_CLEAN_BYTES_ONLY` when they match. Its general qualification remains `NOT_FINAL`. It does not complete the required classroom tasks, exercise every application or establish native acceptance.

Some inherited RC6 whole-package commands remain incompatible with the recorded classroom-file exclusions:

| Retained advanced unit | Historical command that is not the derived acceptance route |
| --- | --- |
| S06 | `node tools/cli.mjs package` |
| S09 | `node tools/S09_VERIFY_PACKAGE_v1_2_0.mjs --verify-package` |
| S13 | `node TOOLS/entry.mjs package` |

Do not interpret those historical verifier failures as an observed PASS, bypass their guards or edit protected files to silence them. Use the new outer verifier for the exact derived artifact and read separately scoped runtime results. Project-local databases and dependency prerequisites remain applicable.

Inspect the build report's actual inventory, derivations and verification scope before running an advanced example. This ZIP is not one of the three core classroom release assets and the RC9 workflow does not attach or publish it. Preparing it does not establish completion of the full original applications, a live deployment or native acceptance. Retain each recipe's own manifest and package identity.

## Optional current RC9 GitHub Pages preview

The current manual Pages workflow uses the RC9 builder and exact site validator. The old RC6 site recipes remain historical source. The new site is a **static reading and navigation preview**, separate from the three release assets. It does not run Node applications, start loopback servers or accept Moodle submissions. All thirty unit payloads and their entry pages retain the core classroom bytes; the site adds a visible homepage scope banner, `.nojekyll`, `SITE_SCOPE.json` and a resealed outer manifest/identity.

From the reviewed repository root, construct and check a local site outside the checkout:

```sh
python 00_TOOLS/qa/test_classroom_rc9_site.py
python 00_TOOLS/publishing/build_classroom_rc9_site.py --output ../webtech-rc9-reading-site --report ../webtech-rc9-site-build.json
python 00_TOOLS/qa/validate_classroom_rc9_site.py --site ../webtech-rc9-reading-site --report ../webtech-rc9-site-validation.json
```

The build and validator reproduce the exact selected static bytes, inventory, file modes, site profile and local link targets. They do not deploy Pages or qualify application execution. Reports must be outside both the checkout and the generated site. Existing conflicting outputs and overlapping destinations are refused before local output mutation. From the generated site root, `node VERIFY_COLLECTION.mjs` verifies its resealed clean bytes; that integrity result is not a runtime PASS.

Only the owner may deploy this optional preview, after final review. In **Actions**, select **Deploy the RC9 static reading preview to GitHub Pages** (`pages.yml`), choose the reviewed branch, explicitly enable **preview** and paste the full reviewed commit SHA into **expected_source_sha**. The workflow refuses any mismatch between that input, `GITHUB_SHA` and checked-out `HEAD`. Do not start it merely to prepare the classroom release.

The source changes do not enable Pages or establish that repository hosting settings are correct. Pages configuration remains unobserved and the repository's declared Pages feature stays disabled until the owner makes a separate hosting decision. A successful actual deployment would publish a reading preview, not an RC9 ZIP release or final qualification. Inspect the run and the actual site before making a hosting claim.

## Scope of evidence

Read the audit and the final RC9 verification report for observed results. This procedure describes required operations rather than claiming that an Actions run has occurred. Native Windows/macOS behaviour, assistive technology and interactive accessibility, live Moodle submission, timed student workload and final owner acceptance retain their declared pending state until directly observed. Optional Word references require separate rendering observations. Deferral is not PASS.

## Primary documentation

- [GitHub: manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow?tool=webui)
- [GitHub REST API: Git references](https://docs.github.com/en/rest/git/refs)
- [GitHub CLI: API response headers](https://cli.github.com/manual/gh_api)
- [GitHub CLI: creating a release and verifying its tag](https://cli.github.com/manual/gh_release_create)
- [GitHub: managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
