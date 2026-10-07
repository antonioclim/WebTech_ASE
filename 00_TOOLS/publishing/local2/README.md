# LOCAL2 candidate preparation

This additive recipe derives `3.0.0-rc.10-local.2` from the exact published RC10 classroom ZIP. It preserves all 38 learner-editable starter files, the 40 required microprojects, the 14 tutorials and the 30 collection objects. It applies 28 reviewed public source corrections and issues separate classroom and static reading identities. General qualification remains `NOT_FINAL`; all ten broad qualification gates remain pending.

The public correction manifest contains public code paths and hashes only. Private owner evidence and private integration reports are not build inputs. Existing RC10 generators, policies, release assets and frontdoors retain their historical bytes and authority.

Run from a clean, committed repository with Python 3.12 and exactly Node v24.21.0:

```sh
python 00_TOOLS/publishing/local2/build_repository_candidate.py --output /absolute/path/outside-the-checkout/webtech-local2
```

The wrapper admits the current repository seal, downloads the frozen predecessor using its pinned size and SHA-256, builds both profiles, admits their reviewed payload identities and runs 28 finite protected-source and untouched-starter controls. Output must be outside the repository. No source resealing occurs during a build. `--input-zip` supports an already downloaded exact predecessor. `--allow-uncommitted-local-source` is exclusively for local integration rehearsal and is refused in CI.

The predecessor is `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip`, 4357345 bytes, SHA-256 `a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9`, from tag `classroom-en-gb-v3.0.0-rc.10` in `antonioclim/WebTech_ASE`.

`inputs/EXPECTED_PAYLOADS.json` binds exact uncompressed payload identities, counts and ZIP roots. Compressed archive hashes are recorded for each actual build because the Python compression implementation can vary. Recipe Python hashes enter the derivation identity. The source Git commit and current repository identity are recorded outside the sealed payload, avoiding a self-referential identity cycle.

The manual-only `local2-candidate.yml` workflow requires the selected full commit SHA. It builds downloadable assets by default. Only the repository owner can explicitly enable its optional Pages publication, including a rerun. This replaces the repository's shared Pages site; it is not an isolated PR preview. The workflow creates no release and writes no repository contents. It must first exist on the default branch before GitHub exposes its manual run control.

Build metadata describes derivation and asserts no deployment. Actual publication requires an owner-selected run and its separate publication receipt. Passing these finite checks does not establish Windows, macOS, visual browser, accessibility, Word, Moodle or classroom acceptance.
