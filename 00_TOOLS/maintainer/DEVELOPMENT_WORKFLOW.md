# Development and qualification while the repository is incomplete

The full repository is work in progress. Its stable citation and repository
identity remain **2.0.1**. The scoped English Week 01–02 distribution
**2.1.0-rc.2** is a separate candidate; it does not rename or certify the full
fourteen-week repository.

## Development and scoped integration

`next-release` is the continuing development branch. The [whole-source study
beta proposal](../../90_RELEASES/STUDY_SNAPSHOT_BETA_1.json) pins the existing
reviewed source commit independently of that moving branch. Follow the
[manual snapshot guide](STUDY_SNAPSHOT_PUBLISHING.md) for publication and the
[distribution provenance](../../90_RELEASES/DISTRIBUTION_PROVENANCE.md) for the
distinct audit baseline, historical RC1 payload and current reviewed hotfix payload identities.

1. Prepare changes on an isolated branch and review their exact scope.
2. Keep `validate.yml`, `pages.yml` and `release-week.yml` manual-only.
   Only the owner executes Actions for the Week 01–02 remediation.
3. Keep Dependabot version-update pull requests disabled.
4. Keep historical identities separate from the current object registry;
   do not regenerate the stable repository identity after every commit.
5. Preserve the deliberately incomplete seminar starters and their allowed-edit
   contracts. Keep completed solutions, private fixtures and student submissions
   outside the public student route.
6. Integrate locally reviewed candidates with their qualification status intact.
   A merge is source integration, not native acceptance, Release publication,
   Pages deployment or Moodle configuration.

## The current Week 01–02 English candidate

RC2 supersedes the S02 RC1 Windows verifier failure. The other three object ZIPs are unchanged. The frozen study-beta source remains at `6e5cc0a917429d7120f71fd153e8853f05729c9d`; its existing identities and historical asset bytes are preserved.

After the candidate is merged and its selected source commit is reviewed, the
owner can manually prepare a draft prerelease with `preview=true`. Follow
[Manual weekly releases](WEEKLY_RELEASE_PUBLISHING.md) for the exact branch,
week, tags, attached files and duplicate-refusal behaviour. The default
`preview=false` route rejects the candidate while its required gates are
pending. A successful draft-preparation run does not publish the draft.

The local remediation and checks cover only C01, S01, C02 and S02 EN. Native
Windows/macOS, manual browser/keyboard/zoom, Microsoft Word, Moodle, a human
pilot and owner acceptance remain separate. Historical workflow failures and
other weeks are not repaired or certified by a scoped candidate merge.

The existing general validation and Pages workflows have repository-wide
checks. Do not treat them as prerequisite proof for this scoped candidate, or
deploy Pages merely to prepare its draft. Repository-wide readiness and Pages
publication are separate work with their own review.

## A future repository-wide final freeze

1. Complete and review the intended public corpus.
2. Reconcile current object selection, historical alternatives and distribution
   aliases throughout that corpus.
3. Collect the relevant platform, browser, Word, Moodle and human acceptance
   evidence. Record genuine results and remaining limitations.
4. When that evidence qualifies the repository, update its development state and
   metadata, then regenerate its manifest and identity once.
5. Run and review the full local validator and Pages payload checks.
6. The owner may then configure Pages and run its deployment workflow manually,
   followed by any separately approved final Releases.

Do not rerun historical failed jobs as a substitute for checking the current
commit. A correction receives a new version and identity; existing published
release assets and history are preserved.
