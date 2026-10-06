# Historical RC6 weekly draft prereleases

This workflow prepares the retained whole-source English weekly candidates from `90_RELEASES/FULL_COLLECTION_PLAN.json`. It is a historical/advanced source route, not the remediated RC9 classroom download. For the active filtered classroom edition, follow [CLASSROOM_RC9_PUBLISHING.md](CLASSROOM_RC9_PUBLISHING.md).

The weekly plan remains `3.0.0-rc.6`, with fourteen weeks and its original source carriers. Its pending qualification gates do not change when this guide or the workflow is hardened. In particular, a new run of this historical plan does not repair old classroom controls or canonical example defects. Do not recommend its whole-source ZIP as the active filtered RC9 classroom edition.

Only the owner starts Actions after the final review phase. The workflow has `workflow_dispatch` as its sole trigger and no final-release mode. The assistant must not dispatch, retry or cancel it. Published assets, tags and releases must not be overwritten to reuse a candidate identity.

## Review before preparation

1. Inspect the reviewed repository commit and `90_RELEASES/FULL_COLLECTION_PLAN.json`. Select the intended week, its notes, two source objects and existing weekly ZIP. The plan supports Weeks 01–14 in `EN_GB`.
2. Check that this retained historical distribution is needed. If students need the remediated classroom route, use the RC9 procedure instead.
3. Use Node.js `24.21.0` and Python with `00_TOOLS/qa/requirements.txt`. From the reviewed checkout root, run the current commands:

   ```sh
   python -m pip install --requirement 00_TOOLS/qa/requirements.txt
   node --version
   python 00_TOOLS/publishing/build_week_bundle.py --verify-all --plan 90_RELEASES/FULL_COLLECTION_PLAN.json
   python 00_TOOLS/qa/validate_public_repo.py --strict
   git rev-parse HEAD
   ```

   `node --version` must display `v24.21.0`. The bundle check verifies all fourteen retained weekly ZIPs. The strict validator checks the current declared repository scope; it does not establish native Windows/macOS, live Moodle or human acceptance. The validator does not accept `--weeks` or `--language`; earlier instructions using those flags were incorrect.
4. Copy the full 40-character lowercase commit SHA from `git rev-parse HEAD`. The workflow must select this same reviewed commit. If the branch has moved, review its new source before using its SHA. Workflow changes should be integrated on the default branch before use of the manual Actions interface.
5. Confirm that the selected tag and release do not already exist. Existing objects and lookup errors stop the workflow. If a previous run created a tag or partial draft, inspect and record that partial state rather than deleting an object to reuse its version.

## Owner-only Actions procedure

1. Open **Actions → Prepare a draft historical RC6 weekly prerelease → Run workflow** (`release-week.yml`).
2. Select the branch containing the reviewed commit.
3. Select the intended **week**, from `01` to `14`.
4. Explicitly enable **preview**. The default is `false` and an unticked preview must stop the run.
5. Paste the exact reviewed 40-character commit SHA into **expected_source_sha**.
6. Start the run once. The owner performs this action.
7. Inspect the run's source commit and steps. After success, open **Releases** while signed in and inspect the new draft.

For Week `XX`, where `XX` is the selected two-digit week:

| Item | Historical RC6 identity |
| --- | --- |
| Tag | `week-XX-en-gb-v3.0.0-rc.6` |
| ZIP | `WebTech_ASE_WEEK_XX_EN_GB_v3.0.0-rc.6.zip` |
| Sidecar | `WebTech_ASE_WEEK_XX_EN_GB_v3.0.0-rc.6.zip.sha256` |

Read the exact selected bundle path and source hashes from `FULL_COLLECTION_PLAN.json` and compare the ZIP with its attached sidecar. Earlier RC1/RC2 weekly names and hashes belong to different distributions; do not relabel them.

The hardened workflow requires the captured `GITHUB_SHA`, checked-out `HEAD` and reviewed SHA input to match. It verifies retained weekly containers and the repository, resolves the selected week in preview mode and copies exactly the two verified assets outside the checkout. It requires `draft=true` and `prerelease=true`.

Remote tag lookup failures stop preparation. A release lookup succeeds only as an explicit absence check when the API returns `404`; other lookup failures stop preparation. The workflow creates a new tag atomically, confirms its remote target against the selected commit and uses `--verify-tag` when preparing the draft. Concurrency prevents overlapping preparation of the same historical week within this workflow. It does not certify repository-wide immutable-release settings.

## Inspect and publish separately

Confirm the exact commit, tag, title, two attached filenames, SHA-256, notes, draft status and prerelease status. The successful run prepares a draft; making it public is a separate owner decision. Keep **This is a pre-release** selected. Do not describe this retained candidate as FINAL or replace pending gates with inferred PASS values.

GitHub's automatic **Source code** archives contain the development repository and are not the selected weekly asset. The weekly ZIP contains its selected whole course and seminar packages plus distribution metadata. It differs from the filtered RC9 classroom collection.

A failure after tag creation may leave that tag or a partial draft. Reruns refuse the existing identity. Inspect the failure before recovery and use a reviewed successor version when a replacement is needed; do not delete, retarget or overwrite published or partial objects merely to reuse the candidate version.

Keep private owner evidence, student work, dependency installations and QA logs outside the public repository and release assets. Native Windows/macOS, interactive browser/keyboard/zoom, Microsoft Word, institutional Moodle, timed human pilot and owner acceptance remain separately observed domains.

## Primary documentation

- [GitHub: manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow?tool=webui)
- [GitHub REST API: Git references](https://docs.github.com/en/rest/git/refs)
- [GitHub CLI: API response headers](https://cli.github.com/manual/gh_api)
- [GitHub CLI: creating a release and verifying its tag](https://cli.github.com/manual/gh_release_create)
- [GitHub: managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
