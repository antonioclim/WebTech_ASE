# Final browser-upload checklist

Do not use this checklist while the repository status is `work-in-progress`.

- [ ] Complete the intended public corpus.
- [ ] Remove temporary flat alternative ZIP aliases and their `.sha256` sidecars.
- [ ] Confirm no teacher package or Moodle administration file was uploaded.
- [ ] Set repository status to `final`.
- [ ] Regenerate `REPOSITORY_SHA256SUMS.txt` once.
- [ ] Regenerate `REPOSITORY_PACKAGE_ID.txt` once.
- [ ] Run complete local validation and obtain `PASS_PUBLIC_REPOSITORY_FINAL`.
- [ ] Set **Settings → Pages → Source** to **GitHub Actions**.
- [ ] Run **Deploy GitHub Pages** manually exactly once.
- [ ] Confirm the repository, Pages payload and deployment jobs are green.
- [ ] Apply the repository settings checklist.
- [ ] Upload the social preview.
- [ ] Publish weekly releases only through the manual release workflow.
