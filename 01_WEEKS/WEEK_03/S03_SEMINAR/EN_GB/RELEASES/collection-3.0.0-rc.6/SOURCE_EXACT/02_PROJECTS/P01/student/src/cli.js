import { readFileSync } from 'node:fs';
import { transformTasks } from './transform-tasks.js';

// Keep argument parsing small and synchronous so this exercise stays focused on data transformation, not async I/O.
export function parseArguments(args) {
  if (args.includes('--help')) return { help: true };
  const options = { file: new URL('../data/tasks.json', import.meta.url), owner: null, minimumEstimate: 0 };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === '--file') options.file = args[++index];
    else if (flag === '--owner') options.owner = args[++index];
    else if (flag === '--minimum-estimate') options.minimumEstimate = Number(args[++index]);
    else throw new Error(`unknown argument: ${flag}`);
  }
  return options;
}

export function run(args, io = console) {
  const options = parseArguments(args);
  if (options.help) {
    io.log('Usage: npm run transform -- [--file path] [--owner name] [--minimum-estimate number]');
    return 0;
  }
  try {
    const tasks = JSON.parse(readFileSync(options.file, 'utf8'));
    io.log(JSON.stringify(transformTasks(tasks, options), null, 2));
    return 0;
  } catch (error) {
    io.error(error.message);
    return 1;
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) process.exitCode = run(process.argv.slice(2));
