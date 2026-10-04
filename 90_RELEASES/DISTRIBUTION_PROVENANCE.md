# Week 01–02 English distribution provenance

The active filtered candidate is **2.1.0-rc.2**. Its selected student archives are present in payload commit `b631bc9400012c59527a72f6676d94f307460780`, tree `3119127801a15cc067fa4e1333feec707576e390`. S02 is 2.3.1 RC2; C01, S01 and C02 retain their exact RC1 ZIP bytes. Distribution metadata and bundles are committed after this payload snapshot. This scope covers only Weeks 01–02 EN.

## Source identities and roles

| Identity | Role |
| --- | --- |
| `1850118b3f619b233f89941802212fe59d8d5dfe` | Original pre-remediation audit baseline. |
| `6e5cc0a917429d7120f71fd153e8853f05729c9d` | Historical reviewed RC1 payload; retained whole-source study-beta branch snapshot. |
| `7f88fecfa972bfb41d4fffec3e47616842c7e067` | Main snapshot preceding this Windows hotfix; contains the frozen RC1 distribution and known S02 launcher defect. |
| `b631bc9400012c59527a72f6676d94f307460780` | Reviewed payload snapshot containing all four selected archives, including corrected S02 RC2. |

RC2 `CURRENT_OBJECTS.json`, `RELEASE_PLAN.json` and bundle `RELEASE.json` use `source_commit_role: reviewed-payload` and bind `source_commit` to the actual payload snapshot. The catalog declares the baseline and hotfix parent separately. The payload commit does not claim to contain subsequently assembled distribution metadata or to establish native platform acceptance.

Historical RC1 metadata retained the audit baseline in its `source_commit`. The original RC1 archives, sidecars, recipes and `LOCAL_QA_WEEK01_02.json` remain unchanged. The RC1 catalog and metadata are retrievable at the pinned pre-hotfix main snapshot above. RC1 evidence must not be presented as a fresh RC2 execution.

## What the checksums establish

`SCOPED_DISTRIBUTION.json` binds the exact combined ZIP, frozen metadata inputs and selected object archives. Its verifier checks the outer ZIP, complete nested file sets, manifest hashes and package identity derivations without running student code. The combined `PACKAGE_ID.txt` hashes `SHA256SUMS.txt`, binding the four inner ZIPs. The outer SHA-256 also covers the wrapper README and RELEASE.json.

`WINDOWS_PATH_HOTFIX_QA.json` retains the observed RC1 incident and pre-retest local RC2 checks. The supplementary `NATIVE_WINDOWS_INTEGRITY_RC2.json` records the owner's successful native execution of all four verifiers, including the corrected S02 launcher, with an exact 256-file preflight. The observed package path includes `#` and has no spaces; invocation from another current directory was not supplied. The portable argument model does not replace those unobserved native regressions. All seven broader qualification gates remain pending. Integrity, rendered DOCX checks and headless browser observations do not close those gates.

Repository-level `REPOSITORY_SHA256SUMS.txt` and `REPOSITORY_PACKAGE_ID.txt` remain receipts for the frozen 2.0.1 baseline. They do not describe the current work tree. No workflow execution, tag, Release or deployment accompanies this candidate. The whole-source beta proposal remains separate from the filtered RC2.
