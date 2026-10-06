# Published RC10 classroom prerelease: identity, reproduction and current routes

RC10 is the current **published English classroom prerelease**, version `3.0.0-rc.10`, with general qualification `NOT_FINAL`. The owner published [release 405127973](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10) at `2026-10-06T21:27:43Z`, or 7 October 2026 at 00:27:43 in Europe/Bucharest. Its tag `classroom-en-gb-v3.0.0-rc.10` points to commit `b2bbe3edba9e4d9a1955c0b5edd5cf2247576416`.

Use the [current student portal](../../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/README.md), [publication receipt](../../90_RELEASES/CLASSROOM_RC10_PUBLICATION.json) and [publication observations and limitations](../../90_RELEASES/RC10_PUBLICATION.md). The receipt binds the actual public release, source commit and three uploaded asset identities. Later changes to repository navigation or Pages do not change that frozen release source.

## Preserve the published identities

The owner-started [preparation run 37528444879](https://github.com/antonioclim/WebTech_ASE/actions/runs/37528444879) completed successfully before publication. It ran fifteen focused RC10 tests and two static Day 0 form tests. The later public observation found `draft=false` and `prerelease=true`, the same three uploaded assets and the exact reviewed target commit. Release text differs from the prepared notes only by thirty-five LF separators represented as CRLF. This is not a claim that public release text is byte-identical to the LF source file.

The existing RC10 tag and release must not be recreated, retargeted or overwritten. Do not rerun draft preparation: its guard refuses the existing identity. The older [RC10 candidate-preparation procedure](CLASSROOM_RC10_PUBLISHING.md) remains a preserved procedure for the reviewed source, rather than a current claim that RC10 is unpublished. RC9 and its publication evidence remain retained predecessors.

The public assets are exactly:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip` | 4357345 | `a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9` |
| `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256` | 111 | `79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a` |
| `SHA256SUMS.txt` | 229 | `6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2` |

The observation compared GitHub's uploaded digest and size metadata with byte-verified local preparation outputs. It did not independently download or extract the public ZIP. Students can verify their own download against the sidecar before extraction.

## Reproduce the frozen release locally

Use the exact published source, rather than evolving `main`. In an existing clean clone, fetch the published tag and create a separate worktree. These commands read the public repository and create local files; they do not start Actions or change a remote object.

```sh
git fetch origin tag classroom-en-gb-v3.0.0-rc.10
git rev-parse classroom-en-gb-v3.0.0-rc.10
git worktree add --detach ../webtech-rc10-published-source b2bbe3edba9e4d9a1955c0b5edd5cf2247576416
cd ../webtech-rc10-published-source
git rev-parse HEAD
```

Both identity commands must report `b2bbe3edba9e4d9a1955c0b5edd5cf2247576416`. Stop if they differ or a command fails. Keep the current worktree and any partial local output for diagnosis. Do not reuse an existing conflicting destination.

Use Python with the pinned dependency in `00_TOOLS/qa/requirements.txt` and Node.js `24.21.0`. From this published worktree, install the Python requirement in your chosen isolated environment and prepare the assets outside the checkout:

```sh
python -m pip install --requirement 00_TOOLS/qa/requirements.txt
node --version
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/publishing/resolve_classroom_rc10.py --plan 90_RELEASES/CLASSROOM_RC10_RELEASE_PLAN.json --asset-dir ../webtech-rc10-reproduced-assets --allow-preview --build --github-output ../webtech-rc10-reproduced-fields.txt
```

`node --version` must report `v24.21.0`. The published source PACKAGE_ID is `9e26cc2c51616e4c2064ac8a317372e5f4e45c45903d1752bb829dd1c1124825`. The resolver must report the exact archive digest and three-asset inventory above. Its preview flags describe the preserved preparation contract; they do not change the already published release back into a draft. A successful resolver run authenticates packaging and scope, rather than creating a new publication or qualifying all applications.

## Verify current navigation and prepare Pages separately

The current source links students to RC10 and records its published identity. It preserves the historical RC6 reference sections and all frozen predecessor material. Run the static publication and navigation checks from the current source checkout:

```sh
python 00_TOOLS/qa/publication_rc10_controls.py
python 00_TOOLS/qa/current_navigation.py
python 00_TOOLS/qa/test_publication_controls.py
```

The navigation regression tests retain the separate RC9 receipt refusal checks. Updating the current route does not rewrite RC9's historical publication receipt or its release assets. Source integrity must be checked separately against the current source seal.

Read [the RC10 Pages preparation and owner deployment guide](CLASSROOM_RC10_PAGES.md) for the separately derived static reading preview. A source update, release publication or successful local site build does not deploy Pages. The previously observed public Pages site remains RC9 until the owner starts the reviewed RC10 deployment and its actual result is verified. Only the owner may start, retry or cancel GitHub Actions.

## Qualification and private evidence

All ten general qualification gates remain pending. The recorded hosted checks did not repeat the earlier fifty-two local Firefox form checks and do not establish native Windows/macOS acceptance, manual browser use, native PDF export, Word rendering, live Moodle submission, genuine learner LLM work, linguistic fluency, classroom timing or final owner acceptance. Pending is not PASS.

The archive contains thirty selected units, fourteen seminar tutorials, forty required individual microprojects, thirty optional Word references and thirty-eight declared editable files. Students use the attached classroom ZIP, extract the complete collection and open `WEBTECH_ASE_EN_GB_CLASSROOM_RC10/index.html`, then `START_HERE.html`. GitHub's automatic source archives contain the development repository and are a different distribution.

Keep personal records, student submissions, owner acceptance receipts, private audit capsules, runtime installations, dependency trees, browser profiles and logs outside the public repository, Pages site and release assets.
