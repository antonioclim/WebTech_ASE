# Maintain the v4.0.0 candidate source

The repository keeps its familiar folder structure. `00_SETUP` contains the two Day 0 kits, `00_START_HERE` contains the current student routes and `01_WEEKS` contains all 14 course/seminar pairs. `00_TOOLS`, `assets` and `metadata` support this candidate. The Latest stable classroom edition remains 3.0.0; the [RC1 teaching review](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) is published as a prerelease; a prepared teaching corpus does not record a new publication.

The authoritative whole-repository controls are:

- `metadata/current-integrity/REPOSITORY_SHA256SUMS.txt`: UTF-8 lines sorted by relative POSIX path, with `sha256`, two spaces, the path and LF
- `metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt`: SHA-256 of those exact manifest bytes followed by LF

The manifest covers every current public file except those two self-controls. `.git` is excluded from inventory. Each course, seminar and setup kit also retains its own unit manifest and package ID. Collection metadata must match each unit's actual package ID and route.

For a reviewed source change, refresh affected unit controls first, update the matching IDs in `metadata/CLASSROOM_COLLECTION.json` and rebuild the whole-repository controls last. C01 uses `90_AUDIT/PAYLOAD_SHA256SUMS.txt`; C02's `06_AUDIT/SHA256SUMS.txt` includes its package-ID row and derives the ID from the remaining canonical rows. Other current units use their root `SHA256SUMS.txt` and `PACKAGE_ID.txt`. Preserve these distinct identity methods.

Before an owner publication:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict
```

Then use the [offline builder](../publishing/README.md) and review its receipt and archive. Both commands inspect bytes and static document routes; they do not execute learner applications or replace [acceptance observations](../acceptance/README.md).

Historical publisher recipes and snapshots belong with their archived editions. Do not redirect an old sealed recipe to current source or transfer historical acceptance claims to a new tree. Preserve old Git tags and published assets when maintaining the current checkout.

Follow the repository's existing copyright and public/private-content policies. Keep all instructor-only material and student submissions outside the public repository. All ten general qualification gates remain pending unless a separate, authentic acceptance record explicitly documents otherwise.

All seven teaching tranches end at T07. `next_phase: null` ends the tranche sequence; integration, filtered distribution checks, tag/release preparation, publication and portal promotion remain work within the same final phase until actually verified. Record the source commit, integrated commit, release tag target and any later portal commit separately. Do not insert a commit’s own SHA into the tree it identifies.

A student distribution is a declared derivation of the sealed source, with its own inventory and identities when content is filtered. Do not edit the whole-source manifest or remove files from its validator merely to admit that subset. Preserve the actual unit controls, edit boundaries, runtime dependencies and routes required by the retained student flow. Raw instructor sources, references, answers, maintainer QA corpora and private continuity belong outside public assets.
