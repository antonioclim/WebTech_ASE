import { inspectEnvironment } from './environment-core.mjs';
try {
  if (process.argv.length !== 2) throw new Error('This command takes no arguments and has no override.');
  const report = await inspectEnvironment(); console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) { console.error('STOP: strict environment gate failed. Retain a BLOCKED draft. No installation was performed.'); process.exitCode = 2; }
} catch (error) { console.error('STOP: ' + error.message); process.exitCode = 2; }
