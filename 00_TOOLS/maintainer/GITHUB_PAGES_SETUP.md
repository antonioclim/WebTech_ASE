# GitHub Pages setup

The repository uses one owner-triggered Pages workflow. It validates the complete
repository before it builds or deploys the site.

## Current WIP rule

Do not run the workflow while `metadata/development-state.json` says
`work-in-progress`. Alternative release candidates are intentionally excluded from
the Pages payload.

## Final freeze procedure

1. Finish every browser upload and remove temporary aliases.
2. Regenerate repository identity.
3. Complete local validation.
4. Open **Settings → Pages**.
5. Select **GitHub Actions** as the source.
6. Open **Actions → Deploy GitHub Pages**.
7. Select **Run workflow → main → Run workflow** exactly once.
8. Confirm the log contains `VERDICT: PASS_PUBLIC_REPOSITORY_FINAL`.
9. Wait for the `github-pages` deployment to become green.
10. Open `https://antonioclim.github.io/WebTech_ASE/`.
11. Confirm the standard setup and weekly bundle links download.

The separate validation workflow is a manual diagnostic fallback. Historical
failed runs must not be re-run.
