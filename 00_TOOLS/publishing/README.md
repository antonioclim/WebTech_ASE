# Preserve the published v4.0.0 assets

The [published v4.0.0 release](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0) contains exactly these four classroom assets:

```text
WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip
WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip.sha256
FILES_MANIFEST.txt
BUILD_RECEIPT.json
```

[The publication record](../../metadata/PUBLISHED_RELEASE.json) records the observed release, tag, source and asset identities. The frozen release source is commit `f86668d6784e1b97b9057ae2e2080113efce45e3`, tree `773ef0725c7b4d7f01888ed2b7a95784d2b4d8c1`, source package ID `f7a74a10b456134a45fd1e306c0ee2e660a9871e0ff23be7874abaf1a82d6e97`. Its classroom package ID is `e1eae003ec1bbebec36f59e6885af69086722788893d65e638a02e305489063e`; the published classroom ZIP SHA-256 is `3fe88aa7d4c033110fc7e2aade270e3ebeac8c48a5668f057ee4dc93250c51e5`.

This later `main` copy is the **postpublication portal source**. It points readers to the already published assets. Its recalculated current-integrity identifies a distinct source tree and package ID. Its future owner commit is recorded externally after the owner creates it; it cannot become the retrospective source of the published ZIP. `PUBLICATION_PROFILE.json` and `CURRENT_QUALIFICATION.json` retain the exact preparation/evidence snapshot bytes from the frozen release source. The separate publication record supplies the later actual publication facts.

The declared technical profile remains [`windows-observed-v4.0.0`](../../metadata/PUBLICATION_PROFILE.json), with [its recorded limits](../../00_START_HERE/QUALIFICATION.html). General qualification remains **NOT_FINAL**, broad native acceptance remains false, and macOS remains **NOT_EXECUTED_NOT_QUALIFIED**. Actual publication does not complete student projects, native Word, Moodle or human acceptance.

Both builders in this portal stop when `metadata/PUBLISHED_RELEASE.json` is present, before source validation or output creation. They cannot prepare another classroom or complete-source archive under a v4.0.0 final or review identity from this later tree. The complete-source guard is shared through `snapshot_source`; a portal ZIP named `WEBTECH_ASE_COMPLETE_SOURCE_v4.0.0.zip` would imply the wrong release source. Reproduction uses the **builders committed in the frozen tag**, which do not contain the later portal record or guard. A future release requires its own explicitly chosen version and preparation process.

Preserve the v4.0.0 tag, the [RC1 tag and four original assets](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1), and the four final assets. The preservation rule is project policy; the publication record does not claim GitHub enforced an immutable release. Reproduction into a new local directory never replaces published assets or creates a new release.

## Reproduce from the frozen source

Use an existing local Git clone with Git, Python and Node already installed. These steps create a separate detached worktree and new output folders; they create no commits and launch no Actions. Run normal Windows PowerShell. Do not use the later portal builders or a ZIP extraction as the authenticated release source.

1. In File Explorer, open your local clone folder. Copy its full folder path. Paste this complete block into PowerShell and supply that path when asked; paths containing `#` or spaces are accepted as literal paths.

```powershell
$ErrorActionPreference = 'Stop'
$webTechRepository = (Read-Host 'Paste the full path of your existing WebTech_ASE Git clone').Trim().Trim('"')
Set-Location -LiteralPath $webTechRepository
$webTechReleaseSha = 'f86668d6784e1b97b9057ae2e2080113efce45e3'
git fetch origin tag v4.0.0
if ($LASTEXITCODE -ne 0) { throw 'STOP_TAG_FETCH: preserve the diagnostic; do not force or replace a tag.' }
$webTechTagSha = (git rev-parse 'v4.0.0^{commit}').Trim()
if ($LASTEXITCODE -ne 0 -or $webTechTagSha -ne $webTechReleaseSha) { throw 'STOP_FROZEN_TAG_SOURCE' }
$webTechReleaseCheckout = Join-Path (Split-Path (Get-Location).Path -Parent) ('WEBTECH_V4_FROZEN_' + [Guid]::NewGuid().ToString('N').Substring(0,8))
if (Test-Path -LiteralPath $webTechReleaseCheckout) { throw 'STOP_CHECKOUT_EXISTS' }
git worktree add --detach $webTechReleaseCheckout $webTechReleaseSha
if ($LASTEXITCODE -ne 0) { throw 'STOP_FROZEN_WORKTREE' }
Set-Location -LiteralPath $webTechReleaseCheckout
$webTechObservedHead = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $webTechObservedHead -ne $webTechReleaseSha) { throw 'STOP_FROZEN_HEAD' }
git status --short
if ($LASTEXITCODE -ne 0) { throw 'STOP_SOURCE_STATUS' }
"FROZEN_SOURCE=$webTechObservedHead"
"FROZEN_CHECKOUT=$webTechReleaseCheckout"
```

Expected result: `FROZEN_SOURCE=f86668d6784e1b97b9057ae2e2080113efce45e3`, a new `FROZEN_CHECKOUT` folder and no changed files from `git status --short`. If a `STOP` appears, preserve the diagnostic and stop. Do not edit the frozen checkout.

2. Build the four classroom assets with the historical committed builder. The output must be a new directory outside the entire checkout.

```powershell
$webTechReleaseOutput = Join-Path (Split-Path (Get-Location).Path -Parent) ('WEBTECH_V4_REPRODUCED_' + [Guid]::NewGuid().ToString('N').Substring(0,8))
python .\00_TOOLS\publishing\build_student_collection.py --output-dir $webTechReleaseOutput --source-commit $webTechReleaseSha --version 4.0.0 --mode final --release-tag v4.0.0
if ($LASTEXITCODE -ne 0) { throw 'STOP_STUDENT_BUILD: preserve the diagnostic and any partial output.' }
"ASSETS_FOLDER=$webTechReleaseOutput"
```

The builder authenticates the clean complete checkout, all committed Git blob bytes and sizes, and the actual committed modes. It rejects dirty or incomplete source, hidden index flags, symlinks, an existing destination and a destination inside/above the checkout. It preserves 30 teaching/setup units, 40 required projects and 38 unfinished learner targets. Filtering excludes exactly ten owner files, rewrites two common guides, adds the derivation record and regenerates the two global controls.

3. Compare all four outputs with the published asset hashes. The verified pair of local builds used the same source and build environment. Reproducing all four byte hashes also requires matching the recorded build environment, including Node v24.19.0 as observed by the published BUILD_RECEIPT.json, and the Python/zlib ZIP implementation. Fixed timestamps and ordering alone do not guarantee cross-environment equality: another Node runtime can change receipt bytes and another compressor can change ZIP bytes. A mismatch is a reproduction diagnostic, never permission to replace the published files. These optional steps do not ask the reader to install or change a runtime.

```powershell
$webTechPublishedHashes = [ordered]@{
    'WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip' = '3fe88aa7d4c033110fc7e2aade270e3ebeac8c48a5668f057ee4dc93250c51e5'
    'WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip.sha256' = 'b158b1795a3a5f7eeef1631264e1585f4752077b16bc08edb39d258c7dfe6057'
    'FILES_MANIFEST.txt' = 'e1eae003ec1bbebec36f59e6885af69086722788893d65e638a02e305489063e'
    'BUILD_RECEIPT.json' = 'a3a031a366a27579cd7fa538aaed66ecd5d360c93257a4e4c3dd75a9db3ec503'
}
if (@(Get-ChildItem -LiteralPath $webTechReleaseOutput -Force -File).Count -ne 4) { throw 'STOP_ASSET_COUNT' }
foreach ($webTechAssetName in $webTechPublishedHashes.Keys) {
    $webTechAssetPath = Join-Path $webTechReleaseOutput $webTechAssetName
    $webTechAssetHash = (Get-FileHash -LiteralPath $webTechAssetPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($webTechAssetHash -ne $webTechPublishedHashes[$webTechAssetName]) { throw "STOP_REPRODUCED_HASH: $webTechAssetName" }
}
'REPRODUCTION_VERIFIED=4_PUBLISHED_ASSET_HASHES'
Invoke-Item -LiteralPath $webTechReleaseOutput
```

Expected result: `REPRODUCTION_VERIFIED=4_PUBLISHED_ASSET_HASHES`. This verifies local reproduction; it performs no upload, tag move, publication or acceptance test.

4. If a complete-source preservation archive is needed, keep the same frozen checkout and source SHA but use another new output folder:

```powershell
$webTechSourceOutput = Join-Path (Split-Path (Get-Location).Path -Parent) ('WEBTECH_V4_SOURCE_' + [Guid]::NewGuid().ToString('N').Substring(0,8))
python .\00_TOOLS\publishing\build_current_collection.py --output-dir $webTechSourceOutput --source-commit $webTechReleaseSha --version 4.0.0 --mode final --release-tag v4.0.0
if ($LASTEXITCODE -ne 0) { throw 'STOP_SOURCE_BUILD: preserve the diagnostic and any partial output.' }
"SOURCE_ARCHIVE_FOLDER=$webTechSourceOutput"
```

`WEBTECH_ASE_COMPLETE_SOURCE_v4.0.0.zip` is a separate preservation artifact containing the frozen 1728 source files and their Git modes. It is **not a fifth classroom release asset**. Both historical builders reauthenticate source after packaging, check ZIP CRC and every member byte/mode, and retain the evidence/profile snapshot bytes. Packaging neither repeats browser/PDF observations nor extends the Windows profile or native macOS qualification.

The maintainer reproduction steps are optional; the published release is already available. No `next`, new publication, source commit or Actions run is required for a reader to download it. Report a reproduction failure with the complete `STOP` diagnostic and the existing source SHA. Future portal maintenance is an owner commit to the distinct portal source and never changes the published release provenance.
