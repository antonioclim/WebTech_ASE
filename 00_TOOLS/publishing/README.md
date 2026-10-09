# Build the current collection offline

Run this command from the repository root. Python uses only its standard library. The output directory must be new or empty and separate from the entire repository.

Windows:

```powershell
python .\00_TOOLS\publishing\build_current_collection.py --output-dir 'C:\WebTech_CURRENT_v3_BUILD'
```

macOS or Linux:

```bash
python3 00_TOOLS/publishing/build_current_collection.py --output-dir "$HOME/WebTech_CURRENT_v3_BUILD"
```

The tool verifies source bytes, all unit identities, the 40 required projects and local document routes. It then creates:

- `WEBTECH_ASE_CURRENT_v3.0.0.zip`, containing the current folder structure under `WEBTECH_ASE_v3.0.0/`
- its `.sha256` sidecar
- `BUILD_RECEIPT.json`, which binds the archive to the current repository package ID

Paths, timestamps, compression and member permissions are fixed. Rebuilding unchanged source with the same Python/zlib runtime produces identical bytes. The tool also checks the created ZIP's CRCs, inventory and each member's bytes, then checks that the source stayed unchanged.

If a build stops, preserve the output directory and read the stated reason. The tool does not overwrite an existing non-empty output directory. Choose a new output directory for another build.

This is a newly built current-layout artifact. It does not replace, relabel or claim the byte identity of a previously published archive. Publication is a separate owner action after review. General qualification remains **NOT_FINAL**.
