import { verifyRoute } from './suite-core.mjs';
try {
  const args = process.argv.slice(2); if (args.length !== 1 || !['p02', 'p03'].includes(args[0])) throw new Error('Choose p02 or p03. This command has no runtime override.');
  console.log(JSON.stringify(await verifyRoute('work', args), null, 2));
} catch (error) { console.error('CANONICAL_TESTS_BLOCKED: ' + error.message); if (error.report) console.log(JSON.stringify(error.report, null, 2)); process.exitCode = 2; }
