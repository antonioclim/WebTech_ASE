# Optional canonical example execution

The presentation and local lab do not require Node. These optional commands are for an already provisioned Day 0 environment. Do not install or download a runtime as part of this guide. The reference contract is Node `v24.21.0` and npm `11.19.0`; a mismatch remains a mismatch. No `npm install` or `npm ci` is needed because the five examples use only built-in Node APIs.

Open the public package folder in your existing editor and its integrated terminal. Confirm that `canonical` is a direct child of the terminal’s current folder. Then run:

```text
node --version
npm --version
```

When the intended environment is already available, run each example separately:

```text
node canonical/01-language-shape/example.js
node canonical/02-prototype-lookup/example.js
node canonical/03-identity-shallow-copy/example.js
node canonical/04-higher-order-pipeline/example.js
node canonical/05-generated-code-audit/example.js
```

The commands are identical in Windows PowerShell and macOS/Linux shells once the working folder is correct. They are local teaching commands, not Git commands. Do not request administrator rights. Do not change the canonical files or package metadata to suppress an error.

Expected behaviour: each example completes with exit code 0 and its own assertions satisfied. Example 01 prints a classification table; 02 prints own/inherited observations; 03 prints the original and updated record; 04 prints the selected view and total 6; 05 prints the audited record issues. Example 05 intentionally demonstrates bad data internally but its assertions should still complete successfully.

A missing command, syntax error, crash, non-zero process exit or policy block is not an expected pedagogical failure for these course examples. Record the command, runtime version and full message, then stop that execution route. Use the readable explanation rather than inventing a pass. Runtime provenance and platform acceptance are separate from file integrity.
