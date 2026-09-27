# First upload guide — final release

Follow the steps in order. Do not upload the private instructor staging archive.

## A. Create an empty repository

1. Sign in to GitHub as `antonioclim`.
2. Select **New repository**.
3. Owner: `antonioclim`.
4. Repository name: `WebTech_ASE`.
5. Description:

   ```text
   Web Technologies teaching repository for ASE: setup, courses, seminars, offline student kits and evidence-based activities.
   ```
6. Visibility: **Public**.
7. Do not add a README, `.gitignore` or licence in the browser.
8. Create the repository.

## B. Extract the final upload archive

On Windows use:

```text
D:\#___MY_SPACE\Downloads\WebTech_ASE_UPLOAD
```

Extract `WebTech_ASE_GITHUB_READY_FINAL_v2.0.zip`. Open the extracted
`WebTech_ASE` directory. The correct directory contains:

```text
README.md
CITATION.cff
codemeta.json
00_START_HERE
00_SETUP
01_WEEKS
90_RELEASES
```

Do not initialise Git one directory above this directory or inside a student package.

## C. Validate before Git

Windows:

```bat
00_TOOLS\qa\RUN_VALIDATION.cmd
```

macOS/Linux:

```bash
bash 00_TOOLS/qa/RUN_VALIDATION.sh
```

Required final line:

```text
VERDICT: PASS_PUBLIC_REPOSITORY_FINAL
```

Stop on any failure. Do not push and hope GitHub will repair the repository.

## D. Initialise and commit locally

Run from the `WebTech_ASE` directory:

```bash
git init
git config user.name "Antonio Clim"
git config user.email "<YOUR_VERIFIED_GITHUB_EMAIL_OR_NOREPLY_ADDRESS>"
git add .
git status
git commit -m "Initial WebTech_ASE public repository: Day 0 and weeks 1-2"
git branch -M main
```

Use a verified GitHub email or the GitHub-provided no-reply address. The identity
setting above is repository-local rather than global.

## E. Connect and push

```bash
git remote add origin https://github.com/antonioclim/WebTech_ASE.git
git remote -v
git push -u origin main
```

Complete the browser sign-in requested by Git Credential Manager when needed.
Do not paste an account password into a token prompt.

## F. Check Actions

1. Open **Actions**.
2. Open **Validate public teaching repository**.
3. Wait for `validate-public-repository` to become green.
4. Open **Deploy GitHub Pages** and wait for both jobs to become green.
5. If either workflow fails, download the log and stop before publishing Releases.

## G. Apply settings

Follow `GITHUB_REPOSITORY_SETTINGS.md`. Upload
`assets/social-preview-1280x640.png` only after the repository exists.

## H. Publish weekly releases

Use `WEEKLY_RELEASE_PUBLISHING.md`. The workflow refuses an existing tag or
release. Do not publish an asset manually under the same final tag.

## I. Never upload

```text
WebTech_ASE_PRIVATE_STAGING_*.zip
teacher packages
answer keys
teacher consoles
student submissions
Moodle administration exports
internal QA archives
evidence bundles containing personal data
```
