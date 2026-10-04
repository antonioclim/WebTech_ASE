# Environment and dependency provisioning

Complete the selected Day 0 kit before running project commands. Its preflight output checks an environment; it does not confirm a working browser, institutional account or completed assignment. Stop on missing requirements and preserve the redacted report.

The Linux verification environment for this candidate used Node 24.21.0 and npm 11.19.0. Use the package's explicit environment contract; do not infer support for another version from a successful checksum. Windows and macOS require their own acceptance checks.

Provision each project before its timed seminar. Find its package.json and package-lock.json, inspect the scripts, and review dependency lifecycle requirements. From that exact project folder, `npm ci --ignore-scripts` acquires the pinned dependencies without running their install scripts. A failed acquisition is a stop condition. Do not substitute `npm install` or run a blind audit fix that changes the assessed source or lockfile.

Some projects require SQLite's native module. Acquisition with ignored scripts intentionally does not compile it. The lecturer should review and approve the exact native build route for the student's OS and Node ABI before class. A local Linux build is not a distributable Windows or macOS binary. Do not copy an arbitrary downloaded binary into the package.

Baseline tests check starter infrastructure. Objective tests intentionally expose unfinished assessed work. Regression tests check preserved behaviour. Record their outputs separately; a successful build or baseline does not complete the objective. Do not edit protected tests or expected hashes to make a report green.

If provisioning is blocked, preserve the error and contact the lecturer. A documented observation exercise can be used only where the package or lecturer permits it; do not fabricate test results or an AI dialogue. The environment collector's `--kits-dir` option is unavailable in the new setup edition and exits without generating evidence.
