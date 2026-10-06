# RC10 static reading site: reconstruction, admission and owner deployment

The published classroom prerelease is [RC10](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10). Its three attachments and immutable source commit are recorded in [the publication receipt](../../90_RELEASES/CLASSROOM_RC10_PUBLICATION.json). Do not rerun the existing RC10 release workflow, replace attachments or move its tag to make the later repository seal match the published ZIP.

The Pages build is a separate static reading derivative. It reconstructs the current sealed RC10 core, preserves all thirty unit payloads, twenty-eight entry pages and fourteen tutorials byte for byte and adds explicit global publication guidance. Two setup entry copies add only reversible title wrapping CSS. It supplies no Node execution environment, local server or Moodle submission service. Students run commands and edit learner targets only in the complete extracted published classroom ZIP. The site does not change classroom recipes, the frozen release plan or the published release notes.

## Three identities and bounded evidence

- The published collection PACKAGE_ID is `1ae203d4bba59319b00406852fd36d283b17baea76bb905dbc7d7ae050a31156`, tied to source commit `b2bbe3edba9e4d9a1955c0b5edd5cf2247576416` and the original ZIP SHA-256 `a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9`.
- The current reconstructed core records the current repository seal. Its metadata and outer identity therefore differ from the published collection. Historical candidate status inside its unchanged metadata records reconstruction provenance. The separate publication receipt records the actual published status.
- The static reading site has its own outer `SHA256SUMS.txt` and `PACKAGE_ID.txt`. `SITE_SCOPE.json` declares every site addition, changed global file, immutable release fact and current source/core identity. This derivative is not a release attachment.

The finite publication receipt copy retains its exact source bytes. The accompanying publication note changes only three Markdown link targets: its download routes lead to the site README and download page and its maintainer procedure leads to the evolving `main` repository guide. That last URL is deliberately identified as current repository guidance rather than a pinned release-source link. SITE_SCOPE.json records the exact source/site hashes and three substitutions; all remaining publication prose is unchanged. Finite local Markdown links in this site README and note are checked separately from the unchanged historical unit Markdown.

Actual headless Linux Firefox observations at a 320-pixel viewport found horizontal overflow in both overview tables and the two underscored setup titles. The site therefore inserts exactly `h1{overflow-wrap:anywhere}` (26 bytes) before the sole closing style tag in each setup entry. Removing that exact rule restores its pinned core bytes; text, links and scripts are unchanged. Only the `index.html` and `COURSE_PLAN.html` global presentation derivatives add `table{table-layout:fixed;overflow-wrap:anywhere}` (48 bytes) to wrap their overview columns. SITE_SCOPE.json records all four CSS operations and source/site hashes. These scoped presentation corrections do not alter teaching payloads or establish native/manual browser acceptance.

The owner-started release preparation run recorded 15/15 RC10 focused tests and 2/2 Day 0 static tests, without failures, errors or skips. The earlier 52 local Firefox semantic cases were not repeated in that hosted run. Static consistency of the receipt does not authenticate GitHub anew or download its public binaries. Native Windows/macOS acceptance, manual browser work, native Word/PDF, live Moodle, a genuine cohort pilot and final owner acceptance remain unverified. General qualification remains `NOT_FINAL` with all ten broad gates pending.

## Local reconstruction and exact admission

Use an already reviewed checkout with its whole-source seal intact, Python 3.12 and Node.js 24.21.0. These commands require no network operation or installation. Choose a new output directory outside the checkout and separate report paths. The examples assume the repository directory is the current working directory.

```sh
python3 00_TOOLS/qa/publication_rc10_controls.py --report ../rc10-publication-consistency.json
python3 00_TOOLS/publishing/build_classroom_rc10_site.py --output ../rc10-reading-site --report ../rc10-site-build.json
python3 00_TOOLS/qa/validate_classroom_rc10_site.py --site ../rc10-reading-site --report ../rc10-site-validation.json
cd ../rc10-reading-site
node VERIFY_COLLECTION.mjs
```

The expected bounded statuses are `PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY`, `PASS_RC10_STATIC_SITE_BUILD_ONLY`, `PASS_RC10_STATIC_SITE_ONLY` and `PASS_INITIAL_BYTES_ONLY`. None means that classroom tasks are implemented, native layouts are correct or broad qualification passed. The exact validator checks inventory, every byte, executable modes, recorded publication facts, preserved teaching bytes, finite local targets and local HTML fragments. A self-resealed external edit can pass the local outer verifier while still being refused by exact source reconstruction.

The builder refuses destinations inside the source checkout, symlinks, overlapping site/report outputs, unknown files, changed bytes, incompatible executable modes and conflicting reports before output mutation. Identical-byte replay is admitted. Keep a conflicting output for inspection and select a genuinely new destination; do not delete evidence merely to force a PASS. Production checks the whole-source seal before and after site composition. Unit fixtures bypass only that separately checked seal and reconstruct one shared frozen core.

## Owner-started Pages deployment

1. Merge only the reviewed navigation/site promotion into `main`. The published RC10 tag and three attachments remain at their immutable original identities.
2. Open [repository Actions](https://github.com/antonioclim/WebTech_ASE/actions) and select the Pages workflow defined in `.github/workflows/pages.yml`.
3. Use **Run workflow**, select `main`, tick the explicit `preview` input and copy the full reviewed lowercase 40-character commit SHA into `expected_source_sha`. Use the exact SHA supplied with the promotion review; an empty value, an unreviewed newer commit or an unticked preview is refused. Start that workflow once. The assistant does not dispatch, rerun or cancel Actions.
4. Wait for its build and deployment jobs to finish. Supply the actual run URL for review. A source change alone is not evidence that Pages deployed.
5. After a successful deployment, inspect the URL returned by the deployment job. Confirm the RC10 notice and download guide, visit the Windows and macOS/Linux setup entries and at least one course and seminar route. The site should retain the explicit static scope and pending qualification notice.

Only an observed successful deployment establishes that these particular Pages bytes were hosted. It still does not qualify native platforms, project execution, Word/PDF, Moodle or teaching. Keep private evidence, handover capsules and audit logs outside public release attachments and the Pages payload.
