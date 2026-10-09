# Build complete source and filtered teaching distributions

The final source candidate contains all 28 revised teaching units and two setup units. The stable target is **v4.0.0**. The Faza 0 qualification policy selects **v4.0.0-rc.1** for review while required interactive-browser, saved-PDF and native/reference qualification remains incomplete. A local build does not publish either identity, create a tag or replace the published 3.0.0 route.

Both builders use Python's standard library. The filtered teaching builder also invokes the supplied independent Node integrity checker; the complete-source builder performs its own Python and ZIP checks. Run them from the repository root. The destination must be new or empty and outside the entire checkout. The examples below use new sibling folders: inspect your actual working directory first, then choose another new name if a destination already contains files. Existing files are never overwritten.

| Builder | Purpose | Scope |
| --- | --- | --- |
| `build_current_collection.py` | Development and integration QA | Every supplied source file except Git internals, under `WEBTECH_ASE_CANDIDATE_v4.0.0/`. This is not the student release asset. |
| `build_student_collection.py` | Complete teaching review distribution | All 30 complete course/seminar/setup units, all 28 frontdoors and tutorials, shared guidance, resources, runtime support and the student integrity tools. Owner publishing, maintenance, acceptance recipes and `.github` files are omitted. |

Windows PowerShell:

```powershell
Get-Location
python .\00_TOOLS\publishing\build_current_collection.py --output-dir '..\WebTech_T07_SOURCE_QA'
if ($LASTEXITCODE -ne 0) { throw 'Source build stopped. Preserve its output and read the diagnostic.' }
python .\00_TOOLS\publishing\build_student_collection.py --output-dir '..\WebTech_T07_STUDENT_REVIEW'
if ($LASTEXITCODE -ne 0) { throw 'Student build stopped. Preserve its output and read the diagnostic.' }
```

macOS or Linux Bash:

```bash
pwd
python3 00_TOOLS/publishing/build_current_collection.py --output-dir '../WebTech_T07_SOURCE_QA'
python3 00_TOOLS/publishing/build_student_collection.py --output-dir '../WebTech_T07_STUDENT_REVIEW'
```

The optional source-commit argument binds the filtered build only when that exact full SHA is the clean checkout HEAD, every supplied path matches its committed Git blob and no assume-unchanged or skip-worktree flag hides changes. A status check alone is insufficient. Without this argument, the receipt explicitly says `UNBOUND_LOCAL_SOURCE_SNAPSHOT`; this development result is insufficient for release provenance. In a reviewed clean checkout, obtain the actual SHA and pass it unchanged:

Windows PowerShell:

```powershell
$webtechSourceSha = git rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'No source commit was obtained. Preserve the checkout.' }
python .\00_TOOLS\publishing\build_student_collection.py --output-dir '..\WebTech_T07_BOUND_REVIEW' --source-commit $webtechSourceSha
if ($LASTEXITCODE -ne 0) { throw 'Bound build stopped. Preserve its output and inspect the exact diagnostic.' }
```

macOS or Linux Bash:

```bash
webtechSourceSha=$(git rev-parse HEAD)
python3 00_TOOLS/publishing/build_student_collection.py --output-dir '../WebTech_T07_BOUND_REVIEW' --source-commit "$webtechSourceSha"
```

The filtered builder creates exactly four prepared public assets:

1. `WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1.zip`, with the complete workspace under `WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1/`
2. `WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1.zip.sha256`
3. `FILES_MANIFEST.txt`, the exact whole-distribution file manifest
4. `BUILD_RECEIPT.json`, binding the archive, source snapshot, distinct distribution identity, filters and verification limits

All teaching unit files, controls, canonical examples, lockfiles, Word references and unfinished learner targets retain their source bytes. Only `00_TOOLS/README.md` and `INTEGRITY.md` are rewritten for student guidance, with exact before/after hashes in `metadata/DISTRIBUTION_DERIVATION.json`. The whole-distribution manifest and ID are recalculated after that record is added. They use the retained control paths but identify this filtered distribution, not the original source repository. No validator exclusion is added to conceal missing or altered files.

Both builders verify source seals, the 30 unit identities, all 40 individual projects, scoped local routes, created ZIP CRCs, exact member inventory and every member byte. The filtered builder additionally verifies the complete derived tree with Python and Node and confirms that every unit remains byte-identical. Fixed paths, timestamps, compression and permissions give identical ZIP bytes when unchanged inputs are rebuilt with the same Python/zlib runtime.

Extract the final archive into a new folder and run the supplied integrity checks, all required route checks and the selected application commands against that extraction. A build receipt does not execute learner applications, render a browser or inspect a saved PDF. Those results require separate authentic evidence on the exact final bytes.

If a build stops, preserve the output and read the stated reason. A new retry uses a different empty destination. The tool installs nothing, changes no configuration, dispatches no Actions and performs no publication. Publication follows draft → attach the complete declared asset set → verify → publish as the qualified status allows. Do not consume the final v4.0.0 tag, promote Latest or redirect the default portal to an unavailable release.
