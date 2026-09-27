# GitHub Pages setup

The repository uses one owner-triggered Pages workflow. It validates the complete
repository before it builds or deploys the site.

1. Finish every browser upload or hotfix commit.
2. Open **Settings → Pages**.
3. Select **GitHub Actions** as the source.
4. Open **Actions → Deploy GitHub Pages**.
5. Select **Run workflow → main → Run workflow** exactly once.
6. Confirm the log contains `VERDICT: PASS_PUBLIC_REPOSITORY_FINAL`.
7. Wait for the `github-pages` deployment to become green.
8. Open `https://antonioclim.github.io/WebTech_ASE/`.
9. Confirm that the Windows, macOS/Linux and four weekly bundle links download.

The workflow does not run automatically after each browser commit. The separate
validation workflow is a manual diagnostic fallback and should not be run when
the Pages workflow has already passed.
