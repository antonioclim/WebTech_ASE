# RC2 native Windows package-integrity evidence review

The returned owner observations establish **four successful native Windows
package-integrity verifiers** for distribution **2.1.0-rc.2**. The recorded run
began at **2026-10-04 10:23:39 UTC** and ended at **10:23:41 UTC**, on Windows
11 Pro x64 build 10.0.26200, with exact Node v24.21.0 and npm 11.19.0.

| Object | Pristine files checked | Native verifier exit | Verdict |
| --- | ---: | ---: | --- |
| C01 RC1 | 37 | 0 | PASS_PACKAGE_INTEGRITY_EXACT_SET |
| S01 RC1 | 88 | 0 | PASS_PACKAGE_INTEGRITY_EXACT_SET |
| C02 RC1 | 50 | 0 | PASS_PACKAGE_INTEGRITY_EXACT_SET_AND_ID |
| S02 RC2 | 81 | 0 | PASS_PACKAGE_INTEGRITY_EXACT_SET |

The summary binds the frozen RC2 combined ZIP, all four package identities and
the exact 256-file preflight pin. Its observations match the four returned stdout
logs, including the corrected S02 package ID, byte counts and expected markers.
No timeout, signal or forced termination is recorded. The record is internally
consistent owner-supplied evidence; the reviewing assistant did not execute it.

The original WIN-S02-01 failure is resolved in this observed native scenario.
The package path includes `#`; it has no literal spaces. The unchanged collector
runs each verifier with that package as its current directory. Invocation from
a different directory and a package directory containing spaces remain unobserved
native regressions. A space in the Node installation path does not prove a space
in the package-root argument.

The separately pasted STOP_DIRECTORY_MISSING is a precondition stop from a
different collection attempt. It cannot describe this successful collected run;
its timestamp and order were not supplied. STOP_RETURN_PACKAGE belongs to the
full evidence-return helper, which requires an exported acceptance form. It does
not invalidate native integrity success. A summary and verifier logs suffice
for incident review; the complete return helper applies after wider manual checks.

## Qualification and immutable evidence

All seven qualification gates remain pending. Integrity does not establish
starter-test execution, completed student work, application start/stop, manual
browser interaction, macOS, Word, Moodle, a human pilot or owner acceptance.
NOT_FINAL is therefore correct. No repeated integrity run is required merely
because these gates remain open.

The original [hotfix QA](WINDOWS_PATH_HOTFIX_QA.json) is retained as a pre-retest
record. This [supplementary receipt](NATIVE_WINDOWS_INTEGRITY_RC2.json) records the
new native integrity result. Student ZIPs, weekly/combined archives, manifests,
registry, release plan and catalog remain frozen. Private paths and raw owner
logs are excluded from the public repository. No Actions, tag, Release or
deployment is initiated by recording this evidence.
