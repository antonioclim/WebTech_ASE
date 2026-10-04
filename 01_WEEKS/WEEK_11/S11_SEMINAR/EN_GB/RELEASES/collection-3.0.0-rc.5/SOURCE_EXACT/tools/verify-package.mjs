import { ROOT, checkPackage, runCLI } from './verifier-core.mjs';
runCLI(() => { if (process.argv.length !== 2) throw new Error('This command takes no arguments.'); return { verdict: 'PACKAGE_IDENTITY_PASS', ...checkPackage(ROOT), limitation: 'Unsigned internal coherence. Compare the archive SHA-256 with the teacher delivery receipt for external provenance.' }; });
