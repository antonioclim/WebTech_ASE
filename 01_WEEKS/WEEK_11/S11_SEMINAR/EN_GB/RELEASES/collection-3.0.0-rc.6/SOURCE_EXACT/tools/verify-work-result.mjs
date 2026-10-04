import { verifyRoute } from './suite-core.mjs';
try { if (process.argv.length !== 2) throw new Error('This command takes no arguments and has no override.'); console.log(JSON.stringify(await verifyRoute('work'), null, 2)); }
catch (error) { console.error('WORK_RESULT_BLOCKED: ' + error.message); if (error.report) console.log(JSON.stringify(error.report, null, 2)); process.exitCode = 2; }
