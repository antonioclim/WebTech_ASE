# Whole-source study beta and next-release development

The proposed **Study snapshot Beta 1** pins the repository source at
`6e5cc0a917429d7120f71fd153e8853f05729c9d`, preserved on the source branch
`study-beta-1-source`. Do not add development commits or move this source
branch. Recheck its exact SHA before publication; branch protections and
platform-enforced immutability are not established by this procedure.
The development branch
`next-release` starts from that snapshot and can advance independently.
This proposed whole-source beta does not reset the repository's frozen **2.0.1**
baseline or the filtered English distribution **2.1.0-rc.1**.

Read the [proposal](../../90_RELEASES/STUDY_SNAPSHOT_BETA_1.json),
[public release notes](../../90_RELEASES/RELEASE_NOTES_STUDY_SNAPSHOT_BETA_1.md)
and [provenance](../../90_RELEASES/DISTRIBUTION_PROVENANCE.md).
The proposal records what was prepared. It does not claim that a release is
already published and is not an executable weekly-release plan.

## Before owner publication

1. Verify the combined student archive locally:

   ```bash
   python 00_TOOLS/publishing/build_scoped_distribution.py --verify
   python 00_TOOLS/publishing/build_week_bundle.py --verify-all --weeks 01,02 --language EN_GB
   python 00_TOOLS/qa/validate_public_repo.py --strict --weeks 01,02 --language EN_GB
   ```

2. Confirm the exact proposed source commit. In GitHub's release form, a new
   tag can target a branch. Select **`study-beta-1-source`**, and confirm that
   its head is the pinned commit. **Stop if that source branch has moved** and
   reconcile the candidate before publication. `main` may now advance through
   reviewed integration; do not use it or `next-release` as this beta target.
3. Confirm that the proposed tag does not already identify another source or
   release. Preserve existing published tags and assets.

## Manual GitHub route

Open the repository's Releases page and prepare a new draft. Use tag
`repo-beta-1-2026-10-04`, the title in the proposal and the complete public
release notes. Keep the pre-release option selected.

Attach exactly the combined student ZIP and its `.zip.sha256` sidecar named
in the proposal. The automatically generated Source code archives are the
whole tracked source snapshot, without Git history. They are not the filtered
student download. The source snapshot at the pinned commit predates this
additive packaging documentation; its four object archive hashes agree with
the attached student distribution.

Save the draft, review it and recheck the target before publishing. After
publication, confirm that the tag resolves to the pinned commit, the page is
marked as a pre-release and both attached files have their expected names.
Do not present publishing this beta as completing final owner acceptance.

No Actions are required for this manual whole-source beta route.
`release-week.yml` prepares separate Week 01 and Week 02 releases with their
own tags. Do not use it to create the proposed whole-source snapshot.
Only the owner executes Actions when they are separately needed.

## Development and the next edition

Continue scoped work on `next-release`, review the exact candidate and use a
pull request to integrate it into main. A new release pins the reviewed commit;
it does not rename the branch or move an older beta tag. Choose a new version
when downloadable content changes.

The Week 01–02 English local corrections remain release candidates while
the native Windows/macOS, manual browser, Word, live Moodle, human pilot and
owner gates are pending. A future whole-repository final freeze needs evidence
for that declared corpus. The current audit does not qualify other weeks or
Romanian packages. Record supported environments and actual results rather
than promising coverage of every plausible scenario.

## Primary documentation

- [Managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Source code archives](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)
- [Semantic Versioning](https://semver.org/)
