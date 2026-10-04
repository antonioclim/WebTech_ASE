# Source and derivation

S02 v2.3.1 RC2 derives from the immutable English RC1 object at source commit `7f88fecfa972bfb41d4fffec3e47616842c7e067`. The RC1 student ZIP SHA-256 is `6f1f20ab87880d44d45a31908599379cf5f77de0af8df11f8286648c5069b4dd`; its PACKAGE_ID is `26d9097cb09b63ec93cbcf43943845670027b4d8ee74cd78b837401c093bb746`. RC1 remains available in that Git history.

The sole functional hotfix is one added dot in `VERIFY_PACKAGE.cmd`: `-Root "%~dp0."` replaces `-Root "%~dp0"`. The directory argument therefore ends with a dot before its closing quote rather than a backslash. The PowerShell verifier, its integrity rules, all other launchers and the editable CSS starter are unchanged. Version labels, source receipts and identity controls are rebuilt for this successor.

The owner supplied a native Windows RC1 log showing `Resolve-Path` rejected a Root value ending in a literal quote. RC2 native Windows verification remains pending until the owner runs the new package. A local command-line parsing model or Linux package check cannot close that gate.

RC1 originally derived from student ZIP v2.3.0 at source commit `1850118b3f619b233f89941802212fe59d8d5dfe`, with SHA-256 `df2387fff966c15b7abf9251cdf3bcfbd4229d6773738e1a9aa2e816627540b6`. Its Responsive Card/Grid Reconstruction outcome, single editable CSS file and teaching/runtime remediation are retained. Current qualification is stated in `PUBLIC_PACKAGE_STATUS.json` and `STUDENT_SAFE_QA_SUMMARY.md`; historical checks do not establish current acceptance.
