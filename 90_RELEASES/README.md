# English Week 01–02 release candidates

The active English distribution is **2.1.0-rc.2**. [Current objects](CURRENT_OBJECTS.json) identifies one course and one seminar per week; [CURRENT_RELEASES.csv](CURRENT_RELEASES.csv) is its readable catalogue. S02 is **2.3.1 RC2**, with a Windows verifier-argument correction and consistent version labels. C01, S01 and C02 retain their original RC1 ZIP bytes and identities.

For a single download covering both weeks, use the [combined English student archive](assets/WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.2.zip) and its [SHA-256 sidecar](assets/WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.2.zip.sha256). Read the [combined distribution record](SCOPED_DISTRIBUTION.json) and [provenance clarification](DISTRIBUTION_PROVENANCE.md) for the exact input identities and distinct source roles.

| Week | English bundle | Instructions |
| --- | --- | --- |
| 01 | [Week 01 candidate](assets/WebTech_ASE_WEEK_01_EN_GB_v2.1.0-rc.2.zip) | [Week 01](../01_WEEKS/WEEK_01/README.md) |
| 02 | [Week 02 candidate](assets/WebTech_ASE_WEEK_02_EN_GB_v2.1.0-rc.2.zip) | [Week 02](../01_WEEKS/WEEK_02/README.md) |

Extract the outer bundle, then extract each selected object ZIP into a fresh writable folder. Use the named launcher; these four objects have no generic root `index.html`.

The [hotfix QA record](WINDOWS_PATH_HOTFIX_QA.json) distinguishes fresh observations from inherited checks. Returned Windows logs established integrity passes for the unchanged C01, S01 and C02 objects, while S02 RC1 failed at its quoted root argument. RC2 needs native retesting. All seven native, human and owner acceptance gates remain pending; these candidates are not FINAL.

## Retained history

The original [combined RC1 archive](assets/WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.1.zip), [Week 01 RC1](assets/WebTech_ASE_WEEK_01_EN_GB_v2.1.0-rc.1.zip) and [Week 02 RC1](assets/WebTech_ASE_WEEK_02_EN_GB_v2.1.0-rc.1.zip) remain byte-identical historical assets. RC1 contains the known S02 Windows launcher failure and is superseded for current checks.

The [whole-source study beta proposal](STUDY_SNAPSHOT_BETA_1.json) remains pinned to `6e5cc0a917429d7120f71fd153e8853f05729c9d`. Its source and RC1 attachment are historical snapshots; the [manual snapshot guide](../00_TOOLS/maintainer/STUDY_SNAPSHOT_PUBLISHING.md) explains their limitations. Preparation of RC2 does not replace that snapshot, create a tag or publish a Release.

[Original remediation](REMEDIATION_WEEK_01_02.md) · [Historical English catalogue](HISTORICAL_OBJECTS.md) · [Immutable release policy](IMMUTABLE_RELEASE_POLICY.md)

Romanian bundles remain legacy alternatives outside this English plan. Weeks 03–14 are outside this hotfix.

## Local review

```bash
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --weeks 01,02 --language EN_GB
python 00_TOOLS/publishing/build_scoped_distribution.py --verify
python 00_TOOLS/qa/validate_public_repo.py --strict --weeks 01,02 --language EN_GB
```

`RELEASE_PLAN.json` declares versions, languages, draft/prerelease state and required gates. All workflows remain manual-only. The owner decides when to execute them; final-publication resolution refuses pending gates.
