# LOCAL3 corrective candidate recipe

This additive recipe derives a separately identified `3.0.0-rc.10-local.3` candidate from the two exact published LOCAL2 assets. It corrects the private-evidence route, finite listener shutdown, the S04 static-read error path and the declared classroom timing. It supplies named teaching probes without learner answers.

All 40 individual microprojects remain required. Each has a planned 30–45-minute work block. Shared setup, genuine bounded AI critique, the reviewed PDF and the final recap add 30 minutes: 90–120 minutes for two projects or 120–165 minutes for three. These are unpiloted plans. The existing RC6 carrier paths and evidence-record schemas are retained as versioned ancestry.

The classroom and static profiles have different collection identities. Static pages are for reading and navigation; executable project work uses the matching complete classroom archive. Private JSON, draft probes and PDFs belong outside the entire extracted collection.

The local builder uses Python 3.10+ and the standard library. Both input ZIPs are authenticated by complete byte size, SHA256, ZIP inventory and their original package identity. Apply only the reviewed patch allowlist. The builder reseals current classroom controls, unit identities and collection identities, preserving the original changed bytes under `PROVENANCE/LOCAL2/`. Learner targets, test contracts, dependency locks, audited course capsules and historical RC9/RC10 records are retained.

Build from a clean, sealed repository into a new output directory outside the checkout:

```text
python 00_TOOLS/publishing/local3/build_repository_candidate.py --output /absolute/path/outside/checkout/webtech-local3
```

For offline inputs, also provide `--classroom-base` and `--static-base` with the exact published LOCAL2 ZIPs. The repository wrapper checks the regenerated payloads against `inputs/EXPECTED_PAYLOADS.json` and binds its external build receipt to the actual committed source and repository package identity.

The separate `local3-candidate.yml` workflow is manual only. The owner must select the reviewed source and enter its full commit SHA. It runs the existing whole-source strict validator before building and admitting the candidate. It does not create releases, change tags or deploy Pages. No workflow is dispatched by this recipe.

General qualification remains **NOT_FINAL** and all ten general gates remain `pending`. Local structural checks and supplemental Node 24.19 observations do not qualify reference Node 24.21.0, rendered browser behaviour, native platforms, PDF layout, Word, live Moodle or student learning outcomes. A future publication receipt must identify the actual published assets separately from build metadata.
