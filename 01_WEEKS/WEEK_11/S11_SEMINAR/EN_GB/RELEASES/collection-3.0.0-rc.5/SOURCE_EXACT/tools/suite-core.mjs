import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, PROJECTS, checkPackage, checkBoundary, relativePath, regularFile, digest } from './verifier-core.mjs';
import { requireEnvironment, rejectRuntimeInjection } from './environment-core.mjs';

const scalar = text => { const t = text.trim(); if (t === 'null') return null; if (t === 'true') return true; if (t === 'false') return false; if (/^-?\d+(?:\.\d+)?$/u.test(t)) return Number(t); if (t.startsWith('"')) { try { return JSON.parse(t); } catch {} } if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/gu, "'"); return t; };
export function parseTAP(text) {
  if (typeof text !== 'string' || !text.startsWith('TAP version 13\n') || !text.endsWith('\n') || text.includes('\r') || /Bail out!|\b(?:uncaughtException|unhandledRejection)\b/iu.test(text)) throw new Error('Invalid, bailed or exceptional TAP.');
  const lines = text.slice(0, -1).split('\n'), records = [], counters = {};
  const fields = new Set(['duration_ms', 'type', 'location', 'failureType', 'error', 'code', 'name', 'expected', 'actual', 'operator', 'stack']);
  const passFields = new Set(['duration_ms', 'type', 'location']);
  let position = 1;
  while (lines[position]?.startsWith('# Subtest: ')) {
    const announced = lines[position++].slice('# Subtest: '.length), result = /^(ok|not ok) (\d+) - (.+)$/u.exec(lines[position++] || '');
    if (!announced || !result || result[3] !== announced || announced.includes(' # ') || Number(result[2]) !== records.length + 1) throw new Error('Subtest identity, ordinal or directive differs.');
    const pass = result[1] === 'ok', diagnostic = {};
    if (lines[position] === '  ---') {
      position++;
      while (position < lines.length && lines[position] !== '  ...') {
        const field = /^ {2}([a-zA-Z_]+): ([^\n]+)$/u.exec(lines[position++] || '');
        if (!field || !fields.has(field[1]) || Object.hasOwn(diagnostic, field[1]) || (pass && !passFields.has(field[1]))) throw new Error('Malformed, duplicate, unknown or contradictory TAP diagnostic.');
        const key = field[1], value = field[2];
        if (value === '|-' || value === '|') {
          if (!['error', 'stack'].includes(key)) throw new Error('Unsupported structured TAP diagnostic.');
          const body = [];
          while (lines[position]?.startsWith('    ')) body.push(lines[position++].slice(4));
          if (!body.length) throw new Error('Empty TAP literal diagnostic.');
          diagnostic[key] = body.join('\n') + (value === '|' ? '\n' : '');
        } else diagnostic[key] = scalar(value);
      }
      if (lines[position++] !== '  ...') throw new Error('Unclosed TAP diagnostic block.');
    }
    if (Object.hasOwn(diagnostic, 'duration_ms') && (!Number.isFinite(diagnostic.duration_ms) || diagnostic.duration_ms < 0)) throw new Error('Invalid TAP duration.');
    if (Object.hasOwn(diagnostic, 'type') && diagnostic.type !== 'test') throw new Error('Nested or unsupported TAP test type.');
    for (const key of ['location', 'failureType', 'error', 'code', 'name', 'operator', 'stack']) if (Object.hasOwn(diagnostic, key) && typeof diagnostic[key] !== 'string') throw new Error('Invalid TAP diagnostic field type: ' + key);
    records.push({ name: announced, index: Number(result[2]), pass, diagnostic });
  }
  const plan = /^1\.\.(\d+)$/u.exec(lines[position++] || '');
  if (!records.length || !plan || Number(plan[1]) !== records.length) throw new Error('TAP plan/count mismatch or unexpected record.');
  let durationSeen = false;
  while (position < lines.length) {
    const line = lines[position++], counter = /^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$/u.exec(line);
    if (counter) {
      if (Object.hasOwn(counters, counter[1])) throw new Error('Duplicate TAP counter: ' + counter[1]);
      counters[counter[1]] = Number(counter[2]);
    } else if (/^# duration_ms \d+(?:\.\d+)?$/u.test(line) && !durationSeen) durationSeen = true;
    else throw new Error('Unknown, malformed or out-of-order TAP output.');
  }
  for (const key of ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) if (!Object.hasOwn(counters, key)) throw new Error('Missing TAP counter: ' + key);
  if (counters.tests !== records.length || counters.suites !== 0 || counters.pass !== records.filter(r => r.pass).length || counters.fail !== records.filter(r => !r.pass).length || counters.cancelled || counters.skipped || counters.todo) throw new Error('TAP counters differ or contain cancelled/skipped/todo tests.');
  return { records, counters };
}
export function classifySuite(result, contract, mode) {
  if (!contract || !Array.isArray(contract.tests) || contract.tests.some(n => typeof n !== 'string' || !n || n.includes('\n')) || new Set(contract.tests).size !== contract.tests.length || (Object.hasOwn(contract, 'count') && contract.count !== contract.tests.length)) throw new Error('Malformed canonical test identity/count contract.');
  if (!['initial', 'work'].includes(mode)) throw new Error('Unknown classification mode.');
  if (result.error || result.signal || result.status === null || result.stderr?.trim()) throw new Error('Infrastructure error, timeout, signal or stderr: ' + (result.error?.message || result.signal || result.stderr || 'missing exit status'));
  const parsed = parseTAP(result.stdout);
  if (JSON.stringify(parsed.records.map(r => r.name)) !== JSON.stringify(contract.tests)) throw new Error('Canonical test identities or order differ.');
  const fail = mode === 'initial' ? contract.initial.fail : [], pass = mode === 'initial' ? contract.initial.pass : contract.tests;
  if (!Array.isArray(fail) || !Array.isArray(pass) || pass.length + fail.length !== contract.tests.length || new Set([...pass, ...fail.map(f => f.name)]).size !== contract.tests.length) throw new Error('Incomplete or contradictory initial assertion contract.');
  for (const record of parsed.records) {
    if (pass.includes(record.name)) { if (!record.pass) throw new Error('A required passing test failed: ' + record.name); continue; }
    const signature = fail.find(f => f.name === record.name);
    if (!signature || record.pass) throw new Error('Unexpected starter result: ' + record.name);
    if (!(Object.hasOwn(signature, 'actual') && Object.hasOwn(signature, 'expected')) && !(signature.operator === 'throws' && typeof signature.error === 'string' && signature.error.startsWith('Missing expected exception'))) throw new Error('An intended failure needs an exact actual/expected pair or an exact missing-exception signature.');
    const d = record.diagnostic;
    if (d.failureType !== 'testCodeFailure' || d.code !== 'ERR_ASSERTION') throw new Error('An infrastructure/non-assertion failure is never an intended starter failure: ' + record.name);
    const missingThrowsOperator = signature.operator === 'throws' && signature.diagnosticOperator === 'ABSENT' && d.operator === undefined && typeof signature.error === 'string' && d.error === signature.error && signature.error.startsWith('Missing expected exception');
    if (signature.code !== 'ERR_ASSERTION' || !signature.operator || (d.operator !== signature.operator && !missingThrowsOperator)) throw new Error('Assertion class/operator differs: ' + record.name);
    for (const key of ['actual', 'expected', 'error']) if (Object.hasOwn(signature, key) && d[key] !== signature[key]) throw new Error('Assertion signature differs (' + key + '): ' + record.name);
  }
  if (result.status !== (fail.length ? 1 : 0)) throw new Error('Process exit status differs from the canonical assertion contract.');
  return { verdict: mode === 'initial' ? 'EXPECTED_INITIAL_RESULTS' : 'ALL_CANONICAL_TESTS_PASS', tests: parsed.records, counters: parsed.counters, processExitCode: result.status };
}
export function runCanonicalSuite(project, suiteName, mode, root = ROOT) {
  rejectRuntimeInjection();
  if (!Object.hasOwn(PROJECTS, project) || !['baseline', 'objective', 'regression', 'infrastructure', 'successorInputs'].includes(suiteName)) throw new Error('Unknown project or suite.');
  const contractPath = path.join(root, 'tools', 'PROJECT_SUITE_CONTRACT.json'), full = JSON.parse(regularFile(contractPath)), projectContract = full.projects[project], suite = projectContract?.suites?.[suiteName];
  if (!suite || projectContract.root !== PROJECTS[project].root) throw new Error('Unknown or inconsistent canonical project/suite contract.');
  relativePath(suite.file);
  if (!/^(?:tests|checks)\/[^/]+\.m?js$/u.test(suite.file)) throw new Error('Suite path must be a local, named tests/checks JavaScript file.');
  const suitePath = path.join(root, ...PROJECTS[project].root.split('/'), suite.file);
  if (!/^[0-9a-f]{64}$/u.test(suite.sha256) || digest(regularFile(suitePath)) !== suite.sha256) throw new Error('Canonical suite byte identity differs.');
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-concurrency=1', suite.file], { cwd: path.join(root, ...PROJECTS[project].root.split('/')), encoding: 'utf8', timeout: 45000, maxBuffer: 8388608, windowsHide: true });
  return { project, suite: suiteName, executionClass: suite.executionClass === 'ACTUAL_EXPRESS_REQUIRED' ? 'ACTUAL_EXPRESS' : 'PURE_FUNCTION', contractProvenance: suite.evidence, ...classifySuite(result, suite, mode) };
}
export async function verifyRoute(mode, selected = ['p02', 'p03']) {
  rejectRuntimeInjection();
  if (!['initial', 'work'].includes(mode) || selected.some(x => !['p02', 'p03'].includes(x))) throw new Error('Only mandatory S11 projects are evaluated here.');
  const protection = checkPackage(ROOT, { allowAssessedEdits: mode === 'work', allowGenerated: true });
  const boundaries = selected.map(id => checkBoundary(id));
  const environment = await requireEnvironment(ROOT), results = [];
  const contracts = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'PROJECT_SUITE_CONTRACT.json'), 'utf8'));
  for (const project of selected) {
    const suites = Object.keys(contracts.projects[project].suites);
    if (suites.some(s => !['baseline', 'objective', 'regression', 'infrastructure', 'successorInputs'].includes(s)) || ['baseline', 'objective', 'regression'].some(s => !suites.includes(s))) throw new Error('Missing canonical suite or unknown additional suite.');
    for (const suite of ['baseline', 'objective', 'regression', 'infrastructure', 'successorInputs'].filter(s => suites.includes(s))) results.push(runCanonicalSuite(project, suite, mode));
  }
  return { verdict: mode === 'initial' ? 'INITIAL_STATE_PASS' : 'WORK_RESULT_PASS', assessedProjects: selected, protection, boundaries, environment, results, qualification: 'Canonical execution only. Real-browser, TLS, native-platform, Moodle and owner gates remain separate.' };
}
