import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { runtimeStatus } from '../../90_AUDIT/tools/runtime.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const plans = JSON.parse(readFileSync(new URL('./projects.json', import.meta.url), 'utf8'));

function walkHashes(base) {
  const out = {};
  function walk(current, relative = '') {
    for (const name of readdirSync(current).sort()) {
      const absolute = join(current, name);
      const rel = relative ? `${relative}/${name}` : name;
      const entry = lstatSync(absolute);
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${rel}`);
      if (entry.isDirectory()) walk(absolute, rel);
      else if (entry.isFile()) out[rel] = createHash('sha256').update(readFileSync(absolute)).digest('hex');
      else throw new Error(`Unsupported entry: ${rel}`);
    }
  }
  walk(base);
  return out;
}

export function inspectTree(base, plan, mode) {
  const actual = walkHashes(base);
  const problems = [];
  for (const [path, expectedHash] of Object.entries(plan.hashes)) {
    if (!(path in actual)) problems.push(`MISSING ${path}`);
    else if (actual[path] !== expectedHash && (mode === 'initial' || path !== plan.allowed)) problems.push(`CHANGED ${path}`);
  }
  for (const path of Object.keys(actual)) if (!(path in plan.hashes)) problems.push(`EXTRA ${path}`);
  return {
    ok: problems.length === 0,
    problems,
    allowedEdit: plan.allowed,
    allowedEditChanged: actual[plan.allowed] !== plan.hashes[plan.allowed]
  };
}

export function classify(result, names, expectedFailed) {
  const reasons = [];
  const text = result.stdout ?? '';
  if (result.error) reasons.push(`PROCESS_ERROR ${result.error.code ?? result.error}`);
  if (result.signal) reasons.push(`SIGNAL ${result.signal}`);
  if (result.stderr?.trim()) reasons.push('UNEXPECTED_STDERR');
  if (!text.startsWith('TAP version 13\n')) reasons.push('TAP_HEADER');
  if (/Bail out!|# (?:SKIP|TODO)\b/.test(text)) reasons.push('SKIP_TODO_OR_BAILOUT');

  const hits = [...text.matchAll(/^(not ok|ok) (\d+) - (.+)$/gm)];
  const failed = [];
  if (hits.length !== names.length) reasons.push('TEST_COUNT');
  hits.forEach((hit, index) => {
    if (Number(hit[2]) !== index + 1 || hit[3] !== names[index]) reasons.push(`TEST_IDENTITY ${index + 1}`);
    if (hit[1] === 'not ok') {
      failed.push(index);
      const end = hits[index + 1]?.index ?? text.length;
      const block = text.slice(hit.index, end);
      if (!/^  failureType: 'testCodeFailure'$/m.test(block) || !/^  code: 'ERR_ASSERTION'$/m.test(block)) {
        reasons.push(`NON_ASSERTION_FAILURE ${index + 1}`);
      }
    }
  });

  const summary = {};
  for (const key of ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...text.matchAll(new RegExp(`^# ${key} (\\d+)$`, 'gm'))];
    if (matches.length !== 1) reasons.push(`SUMMARY ${key}`);
    else summary[key] = Number(matches[0][1]);
  }
  if (JSON.stringify(failed) !== JSON.stringify(expectedFailed)) reasons.push('UNEXPECTED_FAILED_TESTS');
  if (summary.tests !== names.length || summary.pass !== names.length - failed.length || summary.fail !== failed.length || summary.suites !== 0 || summary.cancelled !== 0 || summary.skipped !== 0 || summary.todo !== 0) {
    reasons.push('SUMMARY_MISMATCH');
  }
  if (!new RegExp(`^1\\.\\.${names.length}$`, 'm').test(text)) reasons.push('PLAN');
  if (result.status !== (failed.length ? 1 : 0)) reasons.push('EXIT_STATUS');
  return {
    ok: reasons.length === 0,
    classification: reasons.length ? 'FAIL_CLOSED' : failed.length ? 'EXPECTED_BOUNDED_ASSERTION_FAILURE' : 'PASS',
    summary,
    failedTests: failed.map(index => names[index]),
    reasons
  };
}

function runSuite(root, files, names, expectedFailed) {
  const env = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' };
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  const args = ['--test', '--test-reporter=tap', '--test-concurrency=1', ...files];
  const start = Date.now();
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    env,
    timeout: 8000,
    killSignal: 'SIGKILL',
    maxBuffer: 2 * 1024 * 1024,
    windowsHide: true
  });
  return {
    command: [process.execPath, ...args],
    durationMs: Date.now() - start,
    exitCode: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error ? String(result.error) : null,
    ...classify(result, names, expectedFailed)
  };
}

export function runGate(code, mode = 'initial', options = {}) {
  if (!Object.hasOwn(plans, code) || !['initial', 'complete'].includes(mode)) throw new Error('Use P01, P02 or P03 and initial or complete.');
  const plan = plans[code];
  const projectRoot = options.projectRoot ?? join(ROOT, plan.path);
  const runtime = runtimeStatus();
  const allowMismatch = options.allowMismatch === true && runtime.qaOverride;
  const report = {
    schema: 'S04_GATE_2',
    project: code,
    mode,
    runtime,
    expected: { node: 'v24.21.0', npm: '11.19.0' },
    runs: []
  };
  if (!runtime.exact && !allowMismatch) {
    report.verdict = 'RUNTIME_GUARD_BLOCK';
    return report;
  }
  report.integrity = inspectTree(projectRoot, plan, mode);
  if (!report.integrity.ok) {
    report.verdict = 'EDIT_BOUNDARY_BLOCK';
    return report;
  }

  const suitePlan = [];
  if (mode === 'initial') {
    suitePlan.push(['baseline', ['tests/baseline.test.js'], plan.tests.baseline, []]);
    if (code === 'P01') suitePlan.push(['objective', ['tests/objective.test.js'], plan.tests.objective, plan.initial_failed.objective]);
    else suitePlan.push(['teaching', ['tests/teaching-objective.mjs'], plan.tests.teaching, plan.initial_failed.teaching]);
    suitePlan.push(['regression', ['tests/regression.test.js'], plan.tests.regression, []]);
  } else {
    suitePlan.push(
      ['baseline', ['tests/baseline.test.js'], plan.tests.baseline, []],
      ['objective', ['tests/objective.test.js'], plan.tests.objective, []],
      ['regression', ['tests/regression.test.js'], plan.tests.regression, []]
    );
    if (code !== 'P01') suitePlan.push(['teaching', ['tests/teaching-objective.mjs'], plan.tests.teaching, []]);
  }
  for (const [suite, files, names, expectedFailed] of suitePlan) {
    report.runs.push({ suite, ...runSuite(projectRoot, files, names, expectedFailed) });
  }
  const ok = report.runs.every(run => run.ok);
  report.verdict = ok
    ? (mode === 'initial' ? 'PASS_INITIAL_STARTER_SIGNATURE' : 'PASS_COMPLETE_CANONICAL_CHECKS')
    : 'FAIL_CLOSED';
  if (!runtime.exact && report.verdict.startsWith('PASS')) report.verdict += '_NONREFERENCE_RUNTIME';
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [code, mode] = process.argv.slice(2);
    const result = runGate(code, mode ?? 'initial', {
      allowMismatch: process.env.TW_QA_ALLOW_RUNTIME_MISMATCH === '1'
    });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.verdict.startsWith('PASS') ? 0 : 2;
  } catch (error) {
    console.error(`GATE ERROR: ${error.message}`);
    process.exitCode = 2;
  }
}
