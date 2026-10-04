# Week 01 qualification

Distribution **2.1.0-rc.2** is an English release candidate. C01 and S01 retain their existing RC1 object versions and ZIP bytes; their outer weekly distribution has new RC2 metadata. Completed solutions and mutation fixtures remain outside the student distribution.

The [current registry](../../90_RELEASES/CURRENT_OBJECTS.json) identifies the selected objects. The [Windows-path hotfix QA record](../../90_RELEASES/WINDOWS_PATH_HOTFIX_QA.json) distinguishes fresh hotfix checks from inherited evidence. The [original remediation record](../../90_RELEASES/REMEDIATION_WEEK_01_02.md) describes the RC1 work and its limits.

Returned Windows evidence established package-integrity passes for the unchanged C01, S01 and C02 ZIPs. S02 RC1 failed at its quoted root argument; that observation is not acceptance of RC2. Integrity alone does not close the native Windows gate.

All seven acceptance gates remain pending: native Windows, native macOS, manual browser/keyboard/zoom, Microsoft Word, live Moodle, a timed human pilot and owner acceptance. Headless Chromium on Linux does not close these gates. The intended 60-minute seminar core remains a design budget until the human pilot confirms it.

No workflow dispatch, tag, Release publication or Pages deployment accompanies this hotfix preparation. All workflows remain manual-only; only the owner executes them under the agreed procedure.
