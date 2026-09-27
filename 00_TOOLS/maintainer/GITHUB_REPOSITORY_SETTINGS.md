# GitHub repository settings — final checklist

This checklist assumes the repository is `antonioclim/WebTech_ASE`.

## General

1. Set the description to:

   ```text
   Web Technologies teaching repository for ASE: setup, courses, seminars, offline student kits and evidence-based activities.
   ```
2. Leave the website blank until Pages deploys, then use
   `https://antonioclim.github.io/WebTech_ASE/`.
3. Enable **Issues**.
4. Disable **Discussions**, **Projects** and **Wiki** initially.
5. Enable squash merging only.
6. Automatically delete merged head branches.

## Topics

```text
web-technologies web-development javascript html css nodejs react teaching computer-science-education ase
```

## Actions

1. Allow GitHub-authored actions only.
2. The workflows pin every `actions/*` dependency to a full commit SHA.
3. The human-readable tag and verified SHA are recorded in
   `metadata/github-actions-lock.json`.
4. Set default workflow permissions to read-only. The manual release workflow
   requests `contents: write` only for its own job.
5. Dependabot may propose action or validator-dependency updates; review the new
   tag and SHA before merging.

## Pages

1. Open **Settings → Pages**.
2. Set Source to **GitHub Actions**.
3. Wait for **Deploy GitHub Pages** to pass.
4. Add the Pages URL to the repository About section.

## Social preview

Upload `assets/social-preview-1280x640.png` under **Settings → General → Social preview**.

## Releases

Enable release immutability before publishing the first weekly release. The
manual workflow refuses an existing Git tag and an existing GitHub Release.

## Main-branch ruleset

Create the repository and perform the first owner push before enabling the ruleset.
Then target `main` and configure:

- block force pushes;
- block deletion;
- require pull requests when collaborators are added;
- require the status check `validate-public-repository`;
- require conversation resolution;
- require linear history.

## Issue labels required by templates

Create or retain these exact labels:

```text
technical
content
```
