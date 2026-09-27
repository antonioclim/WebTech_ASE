# GitHub Pages setup

The repository contains a static portal and an official GitHub Actions workflow.

1. Push the repository to `main`.
2. Open **Settings → Pages**.
3. Select **GitHub Actions** as the source.
4. Open **Actions → Deploy GitHub Pages**.
5. Run the workflow manually when no deployment is present.
6. Wait for the `github-pages` environment deployment to become green.
7. Open `https://antonioclim.github.io/WebTech_ASE/`.
8. Confirm that the Windows, macOS/Linux and four weekly bundle links download.

The workflow builds `_site` from public repository files only. It does not publish
`.github`, private staging material or local Git history.
