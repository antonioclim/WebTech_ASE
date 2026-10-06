# RC10 publication record and verification scope

The English classroom [3.0.0-rc.10 prerelease](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10) was published on **6 October 2026 at 21:27:43 UTC**, equivalent to **7 October 2026 at 00:27:43 in Romania**. Release `405127973` has `draft=false` and `prerelease=true`. Publication records availability; the general qualification remains **`NOT_FINAL`**.

Students should use the [RC10 download guide](../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/README.md) or its [HTML instructions](../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/START_HERE.html). The [machine-readable publication receipt](CLASSROOM_RC10_PUBLICATION.json) records the exact source, assets, hosted observations and limitations. The existing RC9 publication record remains an independent predecessor record.

## Exact source and three attachments

The tag `classroom-en-gb-v3.0.0-rc.10` resolves directly to reviewed commit `b2bbe3edba9e4d9a1955c0b5edd5cf2247576416`. Its source repository package identity is `9e26cc2c51616e4c2064ac8a317372e5f4e45c45903d1752bb829dd1c1124825`. The filtered classroom collection package identity is `1ae203d4bba59319b00406852fd36d283b17baea76bb905dbc7d7ae050a31156`.

| Attached file | Bytes | SHA-256 |
| --- | ---: | --- |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip` | 4,357,345 | `a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9` |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256` | 111 | `79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a` |
| `SHA256SUMS.txt` | 229 | `6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2` |

The GitHub publication observation at 21:28:55 UTC confirmed the same three uploaded asset identities, sizes and upload-time SHA-256 digests as the reviewed draft. These digests and sizes match the previously byte-verified local assets. Actual hosted preparation and resolver output were also reviewed. This phase did **not** download a separate public remote binary or recheck a remote ZIP's CRC. Earlier local ZIP CRC, safe-path, inventory and collection-verifier observations remain local observations. Equality of the recorded digests is the declared asset-identity method; it is not a claim of an independently executed public-download check or a digital signature of the publisher.

The classroom ZIP contains 1,452 payload files, fourteen course entries, fourteen seminar routes, two setup objects, forty required bounded microprojects, thirty-eight declared learner target files, fourteen HTML tutorials and thirty optional Word references. Required task counts and learner edit scope are unchanged by publication.

## Hosted preparation and qualification limits

The owner-started [run 37528444879](https://github.com/antonioclim/WebTech_ASE/actions/runs/37528444879), attempt 1, completed successfully at the exact published commit. **Fifteen focused RC10 tests passed in 133.180 seconds** and **two static Day 0 form tests passed in 0.009 seconds**, with zero failures, errors or skips in both suites. The actual hosted resolver reported PASS for the 1,452-file payload and the ZIP identity above.

The fifty-two Firefox semantic checks passed separately in the preceding local phase. They were **not repeated in this hosted workflow**. Static form checks are not interactive browser checks. No result here establishes execution of every full historical application, every student task, native Word/PDF output or a real Moodle submission.

All ten broad qualification gates remain pending: `local_integrity`, `reference_runtime`, `headless_browser`, `native_windows`, `native_macos`, `manual_browser`, `word`, `moodle_live`, `human_pilot` and `owner_acceptance`. Publication and scoped checks do not promote these gates. Deferred manual observations remain deferred. The 60-minute classroom schedule remains an unpiloted planning estimate.

Run the local receipt consistency check from the repository root:

```sh
python 00_TOOLS/qa/publication_rc10_controls.py
```

Its success status is `PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY`. This checks the receipt against recorded identities and the retained candidate plan. It makes no network calls, downloads no assets, dispatches no Actions and grants no qualification.

## Preserve the published inputs and reproduce the exact commit

Publication preserved the RC10 tag, uploaded attachment identities and preparation notes. The release body differs from the source notes only because 35 LF line separators became CRLF. Its raw SHA-256 is `6ec7778b66c0fc2ba00a45c12a950e43b00cc68af74dc0bf9beb688db3f6e291`; normalising CRLF to LF yields source-notes SHA-256 `8f1c82fad5a4a3b31573c0ce920727f177ba03af565cdca29d459c368984d796`.

The release notes and frozen candidate plan retain their authentic preparation-stage wording, including draft-only preparation. This publication receipt is the separate event record. The RC9 tag, release body and three attachment identities were preserved. Neither release is to be retargeted, recreated or silently replaced.

Follow the [published RC10 maintainer procedure](../00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md) to reproduce from a separate checkout at **`b2bbe3edba9e4d9a1955c0b5edd5cf2247576416`**. Use the [builder and preparation instructions at that exact commit](https://github.com/antonioclim/WebTech_ASE/blob/b2bbe3edba9e4d9a1955c0b5edd5cf2247576416/00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHING.md), its frozen recipes and the authenticated published RC9 predecessor required by the builder. Later `main` contains publication navigation and different repository control metadata; rebuilding from that different source may produce different bytes. It must not be presented as the published attachment without an actual complete byte comparison.

Do not rerun preparation to reuse RC10, replace attachments or move its tag. A changed distribution needs a separately reviewed successor version. Preserving published identities is repository policy; it does not assert that GitHub release immutability is enabled.

## Student route and static preview

Download all three attached files, verify their hashes, extract the entire archive to a new empty folder and open `WEBTECH_ASE_EN_GB_CLASSROOM_RC10/index.html`, followed by `START_HERE.html`. Run `node VERIFY_COLLECTION.mjs` before editing. After changing only declared learner targets or creating explicitly permitted generated files, use `node VERIFY_COLLECTION.mjs --allow-student-edits` and the separate task checks. The edit-mode verifier checks scope and protected bytes; it does not grade the implementation or inspect installed dependency contents.

GitHub's automatic **Source code** archives are development-source exports containing historical and maintainer materials. They are separate from the filtered classroom attachment. The Pages recipe is a separate static reading preview. Publication of RC10 does not establish deployment of that preview or live hosting of seminar applications. A subsequent owner-started deployment requires its own observed outcome.
