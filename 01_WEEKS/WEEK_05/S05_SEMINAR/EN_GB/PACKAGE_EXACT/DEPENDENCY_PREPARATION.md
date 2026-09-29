# Separate dependency-preparation boundary

The current local production did not install Express or execute its application suites. The lesson/form can be used offline as files. The API requires the prepared project-local dependencies before its actual run. This document is not approval to install or acquire a runtime.

The canonical package-lock.json fixes Express 5.1.0 and its resolved graph. Keep package.json and the lockfile unchanged. Never install Express globally or copy another project's node_modules tree. Available archived tarballs do not mean that an installation has occurred or that the resulting environment is qualified.

After a separate explicit setup authorisation and with the correct runtime and trusted dependency source in place, the project-local preparation command is `npm ci` inside `projects/p01`. It replaces existing node_modules and can require network/cache access. Therefore it is deliberately not included in any launcher/check script and was not executed here. Optional projects need their own local preparation only when chosen. The exact acquisition/offline-cache procedure remains a separate setup gate; this kit does not fabricate one.

When preparation is complete, return to the student root and run `node tools/project.mjs preflight p01`, measure `npm --version` separately and follow the guide. Node version match plus Express version resolution is not a full dependency-integrity or native-platform qualification.
