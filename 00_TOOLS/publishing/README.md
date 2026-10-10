# Prepare exact source and classroom archives

The selected final target is `v4.0.0`, with the declared technical publication profile [`windows-observed-v4.0.0`](../../metadata/PUBLICATION_PROFILE.json). This profile records the actual selected Windows, browser and PDF observations and their limits. It does not claim general native acceptance, native macOS, completed student work or Moodle acceptance. General qualification remains **NOT_FINAL**. `publication_qualified: true` denotes source eligibility within this declared technical profile; it does not mean an archive was published.

The frozen [RC1 release](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) keeps its source tag and original four assets. Both builders reject `v4.0.0-rc.1`. Preparing new assets neither modifies that release nor creates, moves or publishes a tag.

Both public builders require an existing Python, Node and Git environment and the **exact clean complete Git checkout**. Pass its full lowercase commit SHA explicitly. A ZIP extraction, a dirty checkout, an untracked file, a different HEAD or hidden `assume-unchanged`/`skip-worktree` flags is insufficient. Every supplied file must match its committed Git blob and byte size. Archive permissions come from the authenticated Git tree, including on Windows, rather than from filename extensions.

| Builder | Prepared artifact |
| --- | --- |
| `build_student_collection.py` | Filtered classroom ZIP, SHA-256 sidecar, `FILES_MANIFEST.txt` and `BUILD_RECEIPT.json` |
| `build_current_collection.py` | Complete source ZIP, SHA-256 sidecar and `BUILD_RECEIPT.json`; this is separate from the classroom asset |

The output directory must **not exist** and must be outside the entire checkout. A symlink, an existing destination or an output inside/above the source stops the build. Existing files are preserved. Run from the repository root after the owner has committed the complete final source batch.

Windows PowerShell, final classroom assets:

```powershell
$ErrorActionPreference = 'Stop'
Get-Location
$webTechReleaseSha = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw 'STOP_NO_SOURCE_COMMIT' }
$webTechReleaseOutput = Join-Path (Split-Path (Get-Location).Path -Parent) ('WEBTECH_V4_ASSETS_' + [Guid]::NewGuid().ToString('N').Substring(0,8))
python .\00_TOOLS\publishing\build_student_collection.py --output-dir $webTechReleaseOutput --source-commit $webTechReleaseSha --version 4.0.0 --mode final --release-tag v4.0.0
if ($LASTEXITCODE -ne 0) { throw 'STOP_STUDENT_BUILD: preserve the diagnostic and any partial output.' }
"ASSETS_FOLDER=$webTechReleaseOutput"
Invoke-Item -LiteralPath $webTechReleaseOutput
```

The declared four final classroom assets are:

```text
WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip
WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip.sha256
FILES_MANIFEST.txt
BUILD_RECEIPT.json
```

For a separate complete-source archive, use the same source SHA and a different new output directory:

```powershell
$webTechSourceOutput = Join-Path (Split-Path (Get-Location).Path -Parent) ('WEBTECH_V4_SOURCE_' + [Guid]::NewGuid().ToString('N').Substring(0,8))
python .\00_TOOLS\publishing\build_current_collection.py --output-dir $webTechSourceOutput --source-commit $webTechReleaseSha --version 4.0.0 --mode final --release-tag v4.0.0
if ($LASTEXITCODE -ne 0) { throw 'STOP_SOURCE_BUILD: preserve the diagnostic and any partial output.' }
"SOURCE_ARCHIVE_FOLDER=$webTechSourceOutput"
```

A later review identity is supported only when explicitly selected: `--version 4.0.0 --mode review --release-tag v4.0.0-rc.N`, where `N` is an integer of at least 2. The tool does not choose a new RC number. Final mode accepts only `--release-tag v4.0.0`; mode/tag disagreement, malformed identities and RC1 stop before output creation.

The classroom filter omits exactly ten owner/automation files under `.github/`, `00_TOOLS/publishing/`, `00_TOOLS/maintainer/` and `00_TOOLS/acceptance/`. It rewrites only `00_TOOLS/README.md` and `INTEGRITY.md`, records their before/after SHA-256 identities in `metadata/DISTRIBUTION_DERIVATION.json` and regenerates only the two global distribution controls. All 30 teaching/setup units, all 40 required projects, all 38 unfinished learner targets, canonical sources, lockfiles, Word references, unit identities and committed modes are preserved. `CURRENT_QUALIFICATION.json` and `PUBLICATION_PROFILE.json` retain their exact source bytes.

Source and filtered distribution IDs differ. The build receipt records the authenticated source commit and tree, source ID, exact profile and its hash, derived ID, filtering and the actual packaging checks. The public builder never invents a commit for an uncommitted candidate. Private preparation may use a separately labelled validation artifact with `source_commit: null`; that cannot supply final release provenance.

The classroom build verifies its derived tree through Python and independent Node checks, then checks the ZIP CRC, inventory, every member byte and committed mode. The complete-source builder checks source contracts and all ZIP bytes/modes. Both reauthenticate the source after packaging. Fixed timestamps and ordering provide repeatable asset bytes with unchanged inputs and the same Python/zlib runtime.

Extract into a new folder and run the supplied integrity verification before publication. Packaging does not repeat the recorded 334-check browser batch, execute a native print dialog, save a PDF or test macOS. Its receipt must not be expanded into those claims. Build scripts install nothing, change no configuration, create no commits, dispatch no Actions and perform no publication. Publication remains an owner operation after the prepared asset set and source binding have been verified.
