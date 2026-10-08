# LOCAL3 finite reference runtime and browser evidence

The published [LOCAL3 prerelease](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10-local.3) has supplementary local execution evidence on Node 24.19.0. Its first S03 P01 check and observation contained infrastructure faults. Successful diagnostic repeats did not erase those failures and their cause remains unproven. This manual workflow adds a separate opportunity to test the exact published bytes on actual Node 24.21.0 and in Chromium and Firefox. Preparation is not a completed hosted run.

General qualification remains **NOT_FINAL**. All ten broad gates remain pending. The workflow cannot grant qualification, publish a release, change a tag or deploy Pages. Frozen RC10 navigation, LOCAL2 documentation and published LOCAL3 assets remain preserved.

## One owner-requested run

After integration and review of the resulting `main` commit, select **Actions → LOCAL3 reference runtime and browser evidence → Run workflow**, choose `main` and enter its complete reviewed lowercase 40-character SHA in `expected_source_sha`. Only `antonioclim` may start or rerun this workflow. No push or pull request event triggers it.

The job uses Ubuntu 24.04, Node 24.21.0, npm 11.19.0 and Playwright 1.62.1. Actions are pinned to complete commit SHAs. Browser packages resolve in a separate temporary directory; the first hosted installation retains its generated package lock as provenance. No pre-existing lock or fully reproducible dependency resolution is asserted. Chromium and Firefox binaries are installed by the pinned Playwright package.

The job has a 55-minute maximum. The runtime stage is capped at 18 minutes, browser installation at 10 minutes and browser execution at 24 minutes. The browser harness also stops scheduling cases after its 20-minute budget. A timed-out or unscheduled required stage cannot produce a passing aggregate.

`PUBLISHED_INPUTS.json` binds the existing release, build tag, eight attached file identities and two exact ZIP profiles. The two ZIPs are downloaded once each without credentials or retries. Extraction checks byte digests, CRC, the expected inventory, path safety and package identity. Both profiles are authenticated; execution and browser checks use the classroom profile.

`runtime_checks.py` requires the actual reference version without compatibility flags or version overrides. It runs the outer controls for S01–S14 and all 40 required projects, distinguishes the expected 38 unfinished targets from infrastructure faults and preserves the first S03 failure even when diagnostic repeats succeed. HTTP and lifecycle probes use only owned loopback listeners. Fault injection uses a separate working copy and all source bytes must be restored.

`browser_checks.cjs` requires the actual reference Node and pinned Playwright version. Chromium and Firefox cover the 14 evidence forms, C02 interactions and S02 owned-loopback observations. Cases retain synthetic inputs and screenshots; Chromium also retains a print-layout PDF. Inputs stay outside the collection. Network access is restricted to the selected files and the owned loopback origin. Complete before/after input inventories guard source preservation.

## Interpret the retained reports

Each required stage has a separate report. Missing reports, failed or skipped stages, unexpected runtime faults and failed browser cases make the workflow fail. Runtime failure does not suppress browser evidence when the authenticated inputs and browser installation are available. Diagnostic attempts are retained rather than replacing earlier failures.

Download the `webtech-local3-evidence-…` artefact and read `SUMMARY.json`, `SOURCE_QA.json`, `PUBLIC_INPUTS.json`, `runtime/runtime_report.json` and `browser/BROWSER_CHECKS.json` with their logs. The working copy and downloaded archives are excluded from the evidence upload. Each run and attempt has a separate artefact name and 14-day retention.

Finite hosted Linux checks do not establish native Windows or macOS acceptance, manual accessibility review, a native Save as PDF dialogue, Word compatibility, a live Moodle submission, teaching timing, a human pilot or owner acceptance. The print-layout PDF is a synthetic browser artefact. No learner solution or private submission is generated.

## Files

| File | Purpose |
| --- | --- |
| `fetch_published.py` | Authenticate the existing public inputs and extract bounded safe copies |
| `runtime_checks.py` | Execute untouched reference-runtime starter and server controls |
| `test_runtime_classification.py` | Regress failure classification and owned process controls |
| `browser_checks.cjs` | Collect independent finite Chromium and Firefox evidence |
| `package.json` | Pin the browser package and runtime versions |
| `summarize.py` | Require complete consistent receipts without changing qualification |
| `PUBLISHED_INPUTS.json` | Preserve the existing release and ZIP identities |

## Observed hosted runs: 8 October 2026

The preparation procedure above now has a separate [dated evidence record](../../../90_RELEASES/LOCAL3_HOSTED_EVIDENCE_20261008.md). Owner-dispatched run 37771566636, attempt 1, on reviewed source `a19a2758f2b1e2c9543465ee382c5ed828d38c3d` passed strict source QA, runtime 170/0 and all 356 finite browser probes. The preceding failed run remains recorded in that report. This later observation preserves the preparation-time and supplementary local evidence scopes above. General qualification remains **NOT_FINAL** with all ten broad gates pending. This documentary update requests no workflow rerun.
