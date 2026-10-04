import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, lstatSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { verifyPackage } from './package-integrity.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projects = JSON.parse(readFileSync(join(ROOT, '90_AUDIT/PROJECT_BASELINES.json'), 'utf8'));
const target = { node: 'v24.21.0', npm: '11.19.0' };
// These are declared expected starter diagnostics, still unqualified until a real pinned stack runs.
const initialP01Failures = {
  'reducer normalizes shared transitions immutably and rejects unknown actions': /(?:^|\n)\s*Error: Workshop shared-state reducer not implemented/,
  'distant toolbar, cards, and summary synchronize through shared state': /TestingLibraryElementError:[\s\S]*Unable to find an element with the text:\s*Saved:\s*1/,
  'two provider instances do not share state': /TestingLibraryElementError:[\s\S]*Unable to find an element with the text:\s*Saved:\s*1/,
  'hooks fail clearly outside their provider': /AssertionError:[\s\S]*expected[\s\S]*to throw an error/,
  'source owns only track and saved IDs in Context reducer': /AssertionError:[\s\S]*to match[\s\S]*createContext/
};
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');

function npmVersion() {
  // Windows cannot spawn a .cmd file directly. This fixed command performs only version discovery.
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm --version'] : ['--version'];
  const r = spawnSync(command, args, { encoding: 'utf8', timeout: 5000, windowsHide: true });
  return r.status === 0 ? (r.stdout || r.stderr).trim().split(/\r?\n/)[0] : 'NOT_FOUND';
}
function runtime() {
  const r = { node: process.version, npm: npmVersion() };
  return { ...r, exact: r.node === target.node && r.npm === target.npm, qa: process.env.TW2026_ALLOW_RUNTIME_MISMATCH === '1' };
}
function provision(code) {
  const root = join(ROOT, projects[code].root), issues = [], versions = {};
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    try {
      const installed = JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'));
      versions[name] = installed.version;
      if (installed.name !== name || installed.version !== version) issues.push(`DEPENDENCY_VERSION ${name}: ${installed.version} != ${version}`);
    } catch { issues.push('DEPENDENCY_MISSING_OR_INVALID ' + name); }
  }
  for (const name of ['vite', 'vitest']) {
    try { toolPath(code, name); } catch (error) { issues.push(error.message); }
  }
  return { dependenciesProvisioned: issues.length === 0, versions, issues, limitation: 'Installed package metadata and executable presence are checked; this does not authenticate dependency bytes or installation provenance.' };
}
function toolPath(code, name) {
  const packageRoot = join(ROOT, projects[code].root, 'node_modules', name);
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[name];
  if (typeof bin !== 'string' || !bin) throw Error('TOOL_BIN_MISSING ' + name);
  const path = resolve(packageRoot, bin);
  if (!path.startsWith(resolve(packageRoot) + '/') && !path.startsWith(resolve(packageRoot) + '\\')) throw Error('TOOL_BIN_UNSAFE ' + name);
  if (!lstatSync(path).isFile()) throw Error('TOOL_BIN_NOT_FILE ' + name);
  return path;
}
function admission(code) {
  const r = runtime();
  if (!r.exact && !r.qa) { console.error(`STOP_RUNTIME_MISMATCH observed ${r.node}/${r.npm}; required ${target.node}/${target.npm}`); return 2; }
  const d = provision(code);
  if (!d.dependenciesProvisioned) { console.error(`STOP_DEPENDENCIES_NOT_PROVISIONED ${code}\n${d.issues.join('\n')}`); return 2; }
  if (!r.exact) console.error(`QA_ONLY_RUNTIME_MISMATCH ${r.node}/${r.npm}; standard qualification remains OPEN`);
  return 0;
}
function boundary(code) {
  const cfg = projects[code], root = join(ROOT, cfg.root), all = [];
  function walk(dir, rel = '') {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), stat = lstatSync(path), r = rel ? rel + '/' + name : name;
      if (stat.isSymbolicLink()) throw Error('SYMLINK ' + r);
      if (stat.isDirectory()) { if (!cfg.generated.includes(r)) walk(path, r); }
      else if (stat.isFile()) all.push(r);
      else throw Error('SPECIAL ' + r);
    }
  }
  walk(root);
  const allowed = new Set(cfg.allowed), changes = [], issues = [], actual = new Set(all);
  for (const r of all) {
    const h = hash(join(root, r));
    if (!Object.hasOwn(cfg.files, r)) (allowed.has(r) ? changes : issues).push({ path: r, status: 'ADDED' });
    else if (cfg.files[r] !== h) (allowed.has(r) ? changes : issues).push({ path: r, status: 'MODIFIED' });
  }
  for (const r of Object.keys(cfg.files)) if (!actual.has(r)) issues.push({ path: r, status: 'MISSING' });
  console.log(JSON.stringify({ status: issues.length ? 'BOUNDARY_FAIL' : 'BOUNDARY_ONLY_PASS', project: code, changes, issues, limitation: 'Source identity only; correctness and real-stack execution remain separate.' }, null, 2));
  return issues.length ? 2 : 0;
}
function runTool(code, name, args, timeout = 120000) {
  // Execute the installed JavaScript CLI through Node on every platform, avoiding .cmd shell quoting.
  const r = spawnSync(process.execPath, [toolPath(code, name), ...args], { cwd: join(ROOT, projects[code].root), encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.error) { console.error(r.error.code === 'ETIMEDOUT' ? 'FAIL_CLOSED_TIMEOUT' : r.error.message); return 2; }
  if (r.signal) { console.error('FAIL_CLOSED_SIGNAL ' + r.signal); return 2; }
  return r.status ?? 2;
}

// Reporter validation is pure and separately testable without claiming a Vitest execution.
export function validateSuiteReport(report, plan, expected, exitCode, root, expectedFailures = {}) {
  const issues = [], results = Array.isArray(report?.testResults) ? report.testResults : [];
  const assertions = results.flatMap(x => Array.isArray(x.assertionResults) ? x.assertionResults : []);
  const actual = assertions.map(x => ({ title: typeof x.title === 'string' ? x.title.trim() : '', status: x.status }));
  const expectedTitles = [...plan.titles], titles = actual.map(x => x.title);
  if (report?.numTotalTests !== expectedTitles.length) issues.push(`TOTAL ${report?.numTotalTests} != ${expectedTitles.length}`);
  if (report?.numPassedTests !== expected.pass) issues.push(`PASS ${report?.numPassedTests} != ${expected.pass}`);
  if (report?.numFailedTests !== expected.fail) issues.push(`FAIL ${report?.numFailedTests} != ${expected.fail}`);
  if ((report?.numPendingTests || 0) !== 0 || (report?.numTodoTests || 0) !== 0 || (report?.numRuntimeErrorTestSuites || 0) !== 0) issues.push('PENDING_TODO_OR_RUNTIME_ERROR');
  if (!report || report.success !== (expected.fail === 0)) issues.push('REPORT_SUCCESS_MISMATCH');
  // Vitest workers can complete files in either order; exact identities are checked as a set.
  if (titles.length !== expectedTitles.length || new Set(titles).size !== titles.length || [...titles].sort().some((t, i) => t !== [...expectedTitles].sort()[i])) issues.push('TEST_IDENTITY_MISMATCH');
  const expectedFiles = new Set(plan.files.map(f => resolve(root, f)));
  const actualFiles = results.map(x => typeof x.name === 'string' ? resolve(x.name) : '');
  if (actualFiles.length !== expectedFiles.size || new Set(actualFiles).size !== actualFiles.length || actualFiles.some(f => !expectedFiles.has(f))) issues.push('TEST_FILE_IDENTITY_MISMATCH');
  const status = expected.fail === expectedTitles.length ? 'failed' : 'passed';
  for (const f of results) if (f.status !== status) issues.push('TEST_FILE_STATUS_MISMATCH');
  if (report?.numTotalTestSuites !== expectedFiles.size || report?.numPassedTestSuites !== (status === 'passed' ? expectedFiles.size : 0) || report?.numFailedTestSuites !== (status === 'failed' ? expectedFiles.size : 0)) issues.push('TEST_SUITE_COUNTS_MISMATCH');
  for (const a of actual) if (a.status !== status) issues.push(`STATUS ${a.title}: ${a.status}`);
  for (const a of assertions) {
    const messages = a.failureMessages;
    if (status === 'passed') {
      if (!Array.isArray(messages) || messages.length !== 0) issues.push('UNEXPECTED_FAILURE_MESSAGES ' + a.title);
    } else {
      const pattern = expectedFailures[a.title];
      if (!(pattern instanceof RegExp) || !Array.isArray(messages) || messages.length !== 1 || typeof messages[0] !== 'string' || !pattern.test(messages[0])) issues.push('INITIAL_DIAGNOSTIC_MISMATCH ' + a.title);
      if (Array.isArray(messages) && messages.some(m => /(?:^|\n)\s*(?:TypeError|ReferenceError|SyntaxError|RangeError|AggregateError):/.test(String(m)))) issues.push('INITIAL_INFRASTRUCTURE_ERROR ' + a.title);
    }
  }
  const observedPass = actual.filter(a => a.status === 'passed').length, observedFail = actual.filter(a => a.status === 'failed').length;
  if (observedPass !== expected.pass || observedFail !== expected.fail) issues.push('ASSERTION_COUNTS_MISMATCH');
  if (expected.fail === 0 && exitCode !== 0) issues.push('EXIT expected 0');
  if (expected.fail !== 0 && exitCode !== 1) issues.push('EXIT expected 1 for characterised assertion failures');
  return { issues, actual };
}
function runSuite(code, suite, mode) {
  const cfg = projects[code], plan = cfg.suites[suite], root = join(ROOT, cfg.root), temp = mkdtempSync(join(tmpdir(), 'tw-s10-')), out = join(temp, 'vitest.json');
  try {
    const r = spawnSync(process.execPath, [toolPath(code, 'vitest'), 'run', ...plan.files, '--reporter=json', `--outputFile=${out}`], { cwd: root, encoding: 'utf8', timeout: 120000, windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
    if (r.error || r.signal || !existsSync(out)) {
      console.log(JSON.stringify({ project: code, suite, mode, classification: 'FAIL_CLOSED_INFRASTRUCTURE', error: r.error?.message ?? null, signal: r.signal ?? null, status: r.status, stdout: (r.stdout || '').slice(-4000), stderr: (r.stderr || '').slice(-4000) }, null, 2)); return 2;
    }
    let report;
    try { report = JSON.parse(readFileSync(out, 'utf8')); } catch (error) { console.error('FAIL_CLOSED_REPORT_PARSE ' + error.message); return 2; }
    const expected = mode === 'initial' ? cfg.expected[suite] : { pass: plan.titles.length, fail: 0 };
    const { issues, actual } = validateSuiteReport(report, plan, expected, r.status, root, mode === 'initial' && code === 'p01' && suite === 'objective' ? initialP01Failures : {}), observed = runtime();
    console.log(JSON.stringify({ project: code, suite, mode, classification: issues.length ? 'FAIL_CLOSED_SUITE_CONTRACT' : observed.exact ? 'PASS_SUITE_CONTRACT' : 'QA_ONLY_SUITE_CONTRACT', runtime: observed, summary: { total: report.numTotalTests, pass: report.numPassedTests, fail: report.numFailedTests, pending: report.numPendingTests || 0, todo: report.numTodoTests || 0, exitCode: r.status }, assertions: actual, issues }, null, 2));
    return issues.length ? 2 : 0;
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
function changed(code) { const cfg = projects[code]; return cfg.allowed.some(r => hash(join(ROOT, cfg.root, r)) !== cfg.files[r]); }
function success(label) { console.log((runtime().exact ? 'PASS_' : 'QA_ONLY_') + label); }

export function evaluateEnvironment(observed, states) {
  const requiredPass = observed.exact === true && states.p01?.dependenciesProvisioned === true;
  return { requiredPass, verdict: requiredPass ? 'PASS_EXACT_P01_ENVIRONMENT' : 'STOP_ENVIRONMENT_MISMATCH' };
}

export async function main() {
  const [cmd, code = 'p01', ...extra] = process.argv.slice(2);
  if (extra.length || !Object.hasOwn(projects, code)) { console.error('STOP_INVALID_COMMAND_OR_PROJECT'); return 2; }
  if (cmd === 'verify-package') return verifyPackage();
  if (cmd === 'check-env') {
    const observed = runtime(), states = Object.fromEntries(Object.keys(projects).map(k => [k, provision(k)]));
    const { requiredPass, verdict } = evaluateEnvironment(observed, states);
    console.log(JSON.stringify({ verdict, required: { ...target, project: 'p01' }, observed, projects: states, optionalProjects: ['p02', 'p03'], note: 'P02/P03 dependencies are needed only if those optional implementations are attempted. No installation or download is performed.' }, null, 2));
    return requiredPass ? 0 : 2;
  }
  if (cmd === 'boundary') return boundary(code);
  if (cmd === 'cleanup') { console.log('PASS_NO_PERSISTENT_HELPER_TO_CLEAN'); return 0; }
  if (!['verify-initial', 'test', 'build', 'start', 'verify-work'].includes(cmd)) { console.error('STOP_UNKNOWN_COMMAND'); return 2; }
  if (verifyPackage() || boundary(code)) return 2;
  if (cmd === 'verify-initial' && changed('p01')) { console.error('STOP_INITIAL_SOURCE_MODIFIED'); return 2; }
  if (admission(code)) return 2;
  if (cmd === 'verify-initial') {
    if (code !== 'p01') { console.error('STOP_INITIAL_ROUTE_REQUIRES_P01'); return 2; }
    for (const suite of ['baseline', 'objective', 'regression']) if (runSuite('p01', suite, 'initial')) return 2;
    success('INITIAL_STATE_EXACT_CONTRACT'); return 0;
  }
  if (cmd === 'test') { for (const suite of ['baseline', 'objective', 'regression']) if (runSuite(code, suite, 'complete')) return 2; success(code.toUpperCase() + '_COMPLETE_TEST_CONTRACT'); return 0; }
  if (cmd === 'build') { const result = runTool(code, 'vite', ['build']); if (!result) success(code.toUpperCase() + '_BUILD'); return result; }
  if (cmd === 'start') return runTool(code, 'vite', ['--host', '127.0.0.1'], 0);
  if (code !== 'p01') { console.error('STOP_WORK_ROUTE_REQUIRES_P01'); return 2; }
  for (const suite of ['baseline', 'objective', 'regression']) if (runSuite('p01', suite, 'complete')) return 2;
  let rc = runTool('p01', 'vite', ['build']); if (rc) return rc;
  for (const k of ['p02', 'p03']) if (changed(k)) {
    if (boundary(k) || admission(k)) return 2;
    for (const suite of ['baseline', 'objective', 'regression']) if (runSuite(k, suite, 'complete')) return 2;
    rc = runTool(k, 'vite', ['build']); if (rc) return rc;
  }
  success('WORK_RESULT'); return 0;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await main(); } catch (error) { console.error('FAIL_CLOSED_GATE ' + error.message); process.exitCode = 2; }
}
