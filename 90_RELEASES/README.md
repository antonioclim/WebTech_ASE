# Public weekly release assets

Object ZIPs remain in each unit `DOWNLOAD` directory. Weekly bundles collect one
course and one seminar student package for one language.

`RELEASE_PLAN.json` is the machine-readable source used by the manual release
workflow. The four assets in `assets/` are final version 2.0.0 bundles. Published
tags and assets are immutable; a correction receives a new patch version.

Run before publishing:

```bash
python 00_TOOLS/publishing/build_week_bundle.py --verify-all
python 00_TOOLS/qa/validate_public_repo.py --strict
```
