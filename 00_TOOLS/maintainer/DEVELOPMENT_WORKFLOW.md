# Development workflow while the repository is incomplete

The repository is currently under active construction. Validation, GitHub Pages
and weekly release publication must not run automatically.

## During development

1. Upload public files through the browser.
2. Keep `validate.yml`, `pages.yml` and `release-week.yml` manual-only.
3. Keep Dependabot version-update pull requests disabled.
4. Do not regenerate repository identity after every commit.
5. Do not publish weekly GitHub Releases from a changing tree.
6. Do not promote alternative release candidates on the Pages landing page.

## Final freeze

1. Complete the intended public corpus.
2. Remove temporary flat alternative ZIP aliases and their sidecars.
3. Change `metadata/development-state.json` and repository metadata to `final`.
4. Regenerate the repository manifest and package ID once.
5. Run the full local validator.
6. Select **Settings → Pages → GitHub Actions**.
7. Run **Deploy GitHub Pages** manually once.
8. Publish weekly Releases only after the Pages workflow is green.

Historical failed jobs must not be re-run because they refer to older repository
states and validators.
