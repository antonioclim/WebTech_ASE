import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { run } from '../src/cli.js';

test('fixture is a JSON array', () => assert.ok(Array.isArray(JSON.parse(readFileSync(new URL('../data/tasks.json', import.meta.url))))));
test('help and missing file behavior work', () => {
  const output = []; const io = { log: (value) => output.push(value), error: (value) => output.push(value) };
  assert.equal(run(['--help'], io), 0); assert.match(output[0], /Usage/);
  assert.equal(run(['--file', '/definitely/missing.json'], io), 1);
});
