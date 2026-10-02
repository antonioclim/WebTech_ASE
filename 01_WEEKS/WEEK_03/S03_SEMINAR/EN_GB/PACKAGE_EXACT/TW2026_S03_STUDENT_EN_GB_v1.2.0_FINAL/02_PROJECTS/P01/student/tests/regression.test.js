import assert from 'node:assert/strict';
import test from 'node:test';
import { run } from '../src/cli.js';
import { transformTasks } from '../src/transform-tasks.js';

test('input records and options are not mutated', () => {
  const tasks = Object.freeze([Object.freeze({ id: 'A', title: ' a ', owner: 'Ada', status: 'open', estimate: 1 })]);
  const options = Object.freeze({ owner: null, minimumEstimate: 0 });
  transformTasks(tasks, options);
  assert.equal(tasks[0].title, ' a '); assert.deepEqual(options, { owner: null, minimumEstimate: 0 });
});
test('CLI success output is valid JSON', () => {
  const output = []; const io = { log: (value) => output.push(value), error: () => {} };
  assert.equal(run([], io), 0); assert.doesNotThrow(() => JSON.parse(output[0]));
});
