# First upload guide — browser only

This guide assumes that the repository owner will use only a web browser, File
Explorer/Finder and copy-and-paste. Git, GitHub Desktop, PowerShell, Terminal and
shell commands are not required for the initial upload.

## 1. Use the dedicated browser-upload pack

Do not try to upload all repository files in one operation. GitHub's web upload
accepts at most 100 files at a time and at most 25 MiB per file. The separate
browser-upload pack contains numbered batches below both limits.

The pack name is:

```text
WebTech_ASE_BROWSER_ONLY_UPLOAD_PACK_v2.0_FINAL.zip
```

Each numbered batch contains an `UPLOAD_CONTENTS` directory. Open that directory,
select everything inside it and drag the selected items into GitHub. Do not drag
the outer batch directory itself.

## 2. Create an empty repository

1. Sign in to GitHub as `antonioclim`.
2. In the upper-right corner choose **New repository**.
3. Owner: `antonioclim`.
4. Repository name: `WebTech_ASE`.
5. Description:

   ```text
   Web Technologies teaching repository for ASE: setup, courses, seminars, offline student kits and evidence-based activities.
   ```
6. Visibility: **Public**.
7. Leave **Add a README** off.
8. Do not add a `.gitignore`.
9. Do not choose a licence.
10. Select **Create repository**.

Do not enable a branch protection rule or ruleset yet. GitHub does not allow web
uploads directly to a protected branch.

## 3. Upload the batches in exact order

For the first batch, use the **uploading an existing file** link on GitHub's Quick
Setup page. For every later batch use **Add file → Upload files**.

For each batch:

1. Extract the batch ZIP.
2. Open its `UPLOAD_CONTENTS` directory.
3. Select every visible item inside that directory.
4. Drag the selection onto GitHub's upload page.
5. Wait until GitHub finishes listing every file.
6. Paste the commit message supplied in `COMMIT_MESSAGES.txt`.
7. Select **Commit directly to the `main` branch**.
8. Select **Commit changes**.
9. Return to the repository root.
10. Continue with the next batch.

Do not rename, edit, open-and-save or reformat files before uploading them. Web
uploads do not apply `.gitattributes`; the supplied files already contain their
required line endings and exact bytes.

The `.github` workflows and final repository integrity metadata are deliberately
in the last batch. Validation therefore starts only after the complete repository
has been uploaded.

## 4. Run one GitHub Actions workflow only after the upload is complete

The validation and Pages workflows are deliberately manual. Uploading files must
not start one workflow per browser commit.

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Open **Actions → Deploy GitHub Pages**.
4. Select **Run workflow → main → Run workflow** exactly once.
5. Do not separately run **Validate public teaching repository** unless the Pages
   job reports a validation failure. The Pages workflow already verifies weekly
   bundles, validates the complete repository, builds the site and validates the
   Pages payload before deployment.

The required validation verdict in the log is:

```text
VERDICT: PASS_PUBLIC_REPOSITORY_FINAL
```

Do not re-run either historical failed run. They refer to repository version
2.0.0 before the post-upload validator correction.

## 5. Copy repository metadata

On the repository home page select the gear icon next to **About** and paste the
values from `COPY_PASTE_REPOSITORY_METADATA.txt` in the browser-upload pack.

Upload this image as the social preview in repository settings:

```text
assets/social-preview-1280x640.png
```

## 6. Apply branch rules only after the initial upload

After every batch is present and Actions are green, follow
`GITHUB_REPOSITORY_SETTINGS.md`. A ruleset created before the batch upload may
block browser commits to `main`.

## 7. Publish weekly Releases from the browser

1. Open **Actions**.
2. Open **Publish a weekly GitHub Release**.
3. Select **Run workflow**.
4. Choose week `01` or `02`.
5. Run the workflow.
6. Confirm the new tag and Release under **Releases**.

The workflow reads the exact assets and version from `90_RELEASES/RELEASE_PLAN.json`.
Do not manually replace an asset under an existing final tag.

## 8. Never upload

```text
WebTech_ASE_PRIVATE_STAGING_*.zip
teacher packages
answer keys
teacher consoles
student submissions
Moodle administration exports
internal QA archives
private evidence bundles
```
