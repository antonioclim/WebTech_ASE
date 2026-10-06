# RC9 publication record and verification scope

The English classroom prerelease [3.0.0-rc.9](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9) was published on **6 October 2026 at 07:29:24 UTC**, equivalent to 10:29:24 in Romania. Its release ID is `404427362`, its state is `draft=false` and its classification remains `prerelease=true`. Publication is an observed distribution event, not final classroom qualification.

Students should use the [published classroom download guide](../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED/README.md) and its [HTML instructions](../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED/START_HERE.html). The machine-readable [publication receipt](CLASSROOM_RC9_PUBLICATION.json) binds the observed release, workflow, source commit and three attachments.

## Published source and attachments

The tag `classroom-en-gb-v3.0.0-rc.9` points to the reviewed source commit `60d8f8b86eec812a79db92860dd6d13f16d91f5f`. The classroom collection has package identity `c8be1c0dfaa3dfb56ca8c7868d961654859f1e87ebb35b8511e0ea4773e77dd7`.

| Attached file | Bytes | SHA-256 |
| --- | ---: | --- |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip` | 3,933,082 | `fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee` |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256` | 110 | `96a8d22b0b7ce897ff1fa319aa356a06200b8f89e56fc1bec684ad1c240194cb` |
| `SHA256SUMS.txt` | 227 | `738c1dd6f45657182e3ffe2c6da461b6838c463e2d0ae93413df2e441cf4c040` |

The previous publication-verification phase downloaded all three public attachments with HTTP 200 and compared their bytes with the previously reviewed local files. All three were identical. It also checked the complete ZIP CRC, safe archive paths and the 1,344-file inventory. Running `node VERIFY_COLLECTION.mjs` in the extracted public collection reported `PASS_INITIAL_BYTES_ONLY`. This addendum records those observations; it does not claim that the public-download or runtime checks were newly rerun during this documentation update.

The attachment ZIP contains fourteen courses, fourteen seminar routes, two setup objects, forty bounded required microprojects, thirty-eight declared learner target files, fourteen HTML tutorials and thirty optional Word references. The task contracts and permitted learner targets have not been expanded or silently replaced by solutions.

## Preparation run and remaining limits

The owner started [Actions run 37428880875](https://github.com/antonioclim/WebTech_ASE/actions/runs/37428880875) at the reviewed commit. It completed successfully: **39 tests passed, one was explicitly skipped, zero failed and zero produced errors**. The skipped C09 HTTP case required existing exact Express 5.1.0 dependencies that were absent from the hosted runner. Its reported reason was:

> Set WEBTECH_RC9_EXPRESS_NODE_MODULES to existing exact Express 5.1.0 dependencies; no installation performed

The corresponding separately scoped local runtime check passed in the preceding local audit. That result does not turn the hosted skip into PASS. Neither the preparation workflow nor checksum verification constitutes execution of all original full applications or all classroom tasks.

The general verdict remains **`NOT_FINAL`**. All ten broad gates remain pending: `local_integrity`, `reference_runtime`, `headless_browser`, `native_windows`, `native_macos`, `manual_browser`, `word`, `moodle_live`, `human_pilot` and `owner_acceptance`. Named finite checks support their declared cases but do not satisfy the broader gates. No genuine student pilot, timed workload acceptance, native platform acceptance, live Moodle submission or final owner acceptance is inferred. The 60-minute teaching schedule remains an unpiloted planning estimate.

## Preserve the distribution and reproduce the correct source

The published tag and three attached files remain the established RC9 distribution. Do not rerun preparation to reuse the version, delete or retarget the tag or replace the attachments. The workflow refuses an existing RC9 identity. A materially different distribution requires a reviewed successor version.

The [release notes at the published commit](https://github.com/antonioclim/WebTech_ASE/blob/60d8f8b86eec812a79db92860dd6d13f16d91f5f/90_RELEASES/NOTES_CLASSROOM_RC9.md) and the [preparation procedure at that commit](https://github.com/antonioclim/WebTech_ASE/blob/60d8f8b86eec812a79db92860dd6d13f16d91f5f/00_TOOLS/maintainer/CLASSROOM_RC9_PUBLISHING.md) retain their authentic preparation-stage wording. They describe the source that produced the release. The sealed builder templates, candidate plan and recipes remain historical preparation inputs; the publication receipt is the current event record.

To reproduce the established release, follow the [current maintainer procedure](../00_TOOLS/maintainer/CLASSROOM_RC9_PUBLISHING.md) using a separate checkout at the exact published commit. Rebuilding from a later `main` with changed repository navigation or control metadata may produce different bytes. A new build from that different source must not be claimed to be the published asset until all bytes are actually compared.

Preserving an established distribution is our repository policy. It does not assert that GitHub's release immutability feature is enabled. The internal package identity and manifests authenticate the declared byte relationships; they are not a digital signature of the publisher.

## Student route

Download the attached classroom ZIP and both checksum files, verify the hashes, extract the complete archive to a new folder and open `WEBTECH_ASE_EN_GB_CLASSROOM_RC9/index.html`, followed by its `START_HERE.html`. Run the clean-byte verifier before editing. After changing only the declared learner targets or creating explicitly permitted generated files, use `node VERIFY_COLLECTION.mjs --allow-student-edits` and run the separate task checks. The verifier admits the stated edit scope; it does not grade the implementation or verify installed dependency contents.

GitHub's automatic **Source code** archives are development-source exports containing historical and maintainer materials. They are not the filtered classroom attachment. Optional full seminar applications are a separate advanced source scope outside the three-asset classroom release. The current GitHub Pages recipe is a separate static reading preview; this publication event does not establish a Pages deployment or live application hosting.
