import { readFileSync } from 'node:fs';
import { evaluateRecords } from './rule-engine.js';

export function run(args, io = console) {
  if (args.includes('--help')) { io.log('Usage: npm run evaluate -- [scenario.json]'); return 0; }
  try {
    const file = args[0] ?? new URL('../data/scenario.json', import.meta.url);
    const { records, rule } = JSON.parse(readFileSync(file, 'utf8'));
    io.log(JSON.stringify(evaluateRecords(records, rule), null, 2)); return 0;
  } catch (error) { io.error(error.message); return 1; }
}
if (process.argv[1] === new URL(import.meta.url).pathname) process.exitCode = run(process.argv.slice(2));
