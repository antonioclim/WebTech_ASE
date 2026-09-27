# Publishing a final weekly GitHub Release

The workflow is manual, deterministic and fail-closed.

1. Confirm that `main` is green.
2. Confirm release immutability is enabled.
3. Run locally:

   ```bash
   python 00_TOOLS/publishing/build_week_bundle.py --verify-all
   ```
4. Inspect `90_RELEASES/RELEASE_PLAN.json`.
5. Open **Actions → Publish a weekly GitHub Release**.
6. Select week `01` or `02`.
7. Run the workflow.

The version and tag are fixed by the release plan:

```text
week-01-v2.0.0
week-02-v2.0.0
```

The workflow refuses both an existing tag and an existing release. Never delete
and recreate either object merely to reuse a version. A correction receives a new
patch version, new asset filenames and updated checksums.
