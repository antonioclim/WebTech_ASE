# English Week 01–02 release candidates

The active English distribution is **2.1.0-rc.1**. [Current objects](CURRENT_OBJECTS.json) identifies exactly one course and one seminar per week; [CURRENT_RELEASES.csv](CURRENT_RELEASES.csv) is the corresponding readable catalogue. These are release candidates with explicit qualification gates, not qualified final releases.

For a single download covering both weeks, use the [combined English student archive](assets/WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.1.zip) and its [SHA-256 sidecar](assets/WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.1.zip.sha256). It contains the same four unchanged RC1 object ZIPs. Read the [combined distribution record](SCOPED_DISTRIBUTION.json) and [provenance clarification](DISTRIBUTION_PROVENANCE.md): the older `source_commit` field names the pre-remediation baseline, not the reviewed RC1 payload snapshot.

| Week | English bundle | Instructions |
| --- | --- | --- |
| 01 | [Week 01 candidate](assets/WebTech_ASE_WEEK_01_EN_GB_v2.1.0-rc.1.zip) | [Week 01](../01_WEEKS/WEEK_01/README.md) |
| 02 | [Week 02 candidate](assets/WebTech_ASE_WEEK_02_EN_GB_v2.1.0-rc.1.zip) | [Week 02](../01_WEEKS/WEEK_02/README.md) |

Extract the outer bundle, then extract its selected course or seminar ZIP. Each object also has its own `DOWNLOAD` archive and exact extracted tree. Use its named launcher; these four objects have no generic root `index.html`.

[Remediation and qualification](REMEDIATION_WEEK_01_02.md) · [Historical English catalogue](HISTORICAL_OBJECTS.md) · [Immutable release policy](IMMUTABLE_RELEASE_POLICY.md)

The retained v2.0.0 Romanian bundles are legacy alternatives outside this English candidate plan. Existing published tags and Release assets remain immutable. No tag, Release or Pages deployment is implied by these repository files.

Local review:

```bash
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --weeks 01,02 --language EN_GB
python 00_TOOLS/publishing/build_scoped_distribution.py --verify
python 00_TOOLS/qa/validate_public_repo.py --strict --weeks 01,02 --language EN_GB
```

`RELEASE_PLAN.json` supplies explicit versions, languages, draft/prerelease state and pending required gates. All workflows remain manual-only. The owner decides when to run them; the final-publication resolver refuses pending gates.

The [whole-source study beta proposal](STUDY_SNAPSHOT_BETA_1.json) is separate from the weekly plans. Its [manual publication guide](../00_TOOLS/maintainer/STUDY_SNAPSHOT_PUBLISHING.md) pins the source commit and keeps the filtered student asset distinct from GitHub's complete Source code archives. Preparation of these files does not publish a release.
