import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, PROJECTS, checkPackage, checkBoundary, relativePath, regularFile, digest } from './verifier-core.mjs';
import { requireEnvironment, rejectRuntimeInjection } from './environment-core.mjs';

const scalar = text => { const t = text.trim(); if (t === 'null') return null; if (t === 'true') return true; if (t === 'false') return false; if (/^-?\d+(?:\.\d+)?$/u.test(t)) return Number(t); if (t.startsWith('"')) { try { return JSON.parse(t); } catch {} } if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/gu, "'"); return t; };
export function parseTAP(text) {
  if (typeof text !== 'string' || !text.startsWith('TAP version 13\n') || /Bail out!|\b(?:uncaughtException|unhandledRejection)\b/iu.test(text)) throw new Error('Invalid, bailed or exceptional TAP.');
  if(text.includes('\r') || !text.endsWith('\n')) throw new Error('TAP must have canonical LF lines and a final newline.');
  let diagnosticOpen=false, diagnosticSeen=false, currentResult=false; let diagnosticKeys=new Set();
  for(const [i,line] of text.split('\n').entries()) {
    if(i===0 || line==='') continue;
    if(line==='  ---') { if(diagnosticOpen || diagnosticSeen || !currentResult) throw new Error('Nested, repeated or unowned TAP diagnostic block.'); diagnosticOpen=true; diagnosticSeen=true; diagnosticKeys=new Set(); continue; }
    if(line==='  ...') { if(!diagnosticOpen) throw new Error('Unopened TAP diagnostic terminator.'); diagnosticOpen=false; continue; }
    if(/^ +/u.test(line)) {
      if(!diagnosticOpen) throw new Error('Indented TAP outside a diagnostic block.');
      const key=/^ {2}([a-zA-Z_]+): /u.exec(line);
      if(key) { if(diagnosticKeys.has(key[1])) throw new Error('Duplicate TAP diagnostic key: '+key[1]); diagnosticKeys.add(key[1]); }
      else if(!/^ {4}/u.test(line)) throw new Error('Malformed TAP diagnostic line.');
      continue;
    }
    if(diagnosticOpen) throw new Error('Unterminated TAP diagnostic block.');
    if(/^(?:ok|not ok) [0-9]+ - /u.test(line)) { currentResult=true; diagnosticSeen=false; }
    else if(/^# Subtest:|^1\.\./u.test(line)) currentResult=false;
    if(/^# (?:tests|suites|pass|fail|cancelled|skipped|todo)\b/u.test(line) && !/^# (?:tests|suites|pass|fail|cancelled|skipped|todo) [0-9]+$/u.test(line)) throw new Error('Malformed reserved TAP counter.');
    if(/^# Subtest:/u.test(line) && !/^# Subtest: .+$/u.test(line)) throw new Error('Malformed reserved TAP announcement.');
    if(!/^(?:# .+|(?:ok|not ok) [0-9]+ - .+|1\.\.[0-9]+)$/u.test(line)) throw new Error('Unexpected or malformed top-level TAP line.');
  }
  if(diagnosticOpen) throw new Error('Unterminated TAP diagnostic block.');
  if (/^\s+(?:ok |not ok |# Subtest:|1\.\.)/mu.test(text)) throw new Error('Nested suites are outside the canonical flat test contract.');
  const records = [], linePattern = /^(ok|not ok) (\d+) - ([^\n]+)$/gmu;
  for (const match of text.matchAll(linePattern)) {
    const from = match.index + match[0].length, next = text.slice(from).search(/^(?:ok|not ok) \d+ - |^1\.\./mu), block = text.slice(from, next < 0 ? text.length : from + next), diagnostic = {};
    for (const d of block.matchAll(/^ {2}([a-zA-Z_]+): ([^\n]+)$/gmu)) diagnostic[d[1]] = scalar(d[2]);
    if (match[3].includes(' # ')) throw new Error('TAP directives or altered identities are refused.');
    records.push({ name: match[3], index: Number(match[2]), pass: match[1] === 'ok', diagnostic });
  }
  if (!records.length || records.some((r, i) => r.index !== i + 1)) throw new Error('Missing or non-contiguous TAP test records.');
  const plans = [...text.matchAll(/^1\.\.(\d+)$/gmu)]; if (plans.length !== 1 || Number(plans[0][1]) !== records.length) throw new Error('TAP plan/count mismatch.');
  const counters = {};
  for (const key of ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...text.matchAll(new RegExp('^# ' + key + ' (\\d+)$', 'gmu'))];
    if (matches.length !== 1) throw new Error('Missing or duplicate TAP counter: ' + key);
    counters[key] = Number(matches[0][1]);
  }
  if (counters.tests !== records.length || counters.suites !== 0 || counters.pass !== records.filter(r => r.pass).length || counters.fail !== records.filter(r => !r.pass).length || counters.cancelled || counters.skipped || counters.todo) throw new Error('TAP counters differ or contain cancelled/skipped/todo tests.');
  const announced = [...text.matchAll(/^# Subtest: ([^\n]+)$/gmu)].map(m => m[1]); if (JSON.stringify(announced) !== JSON.stringify(records.map(r => r.name))) throw new Error('Subtest announcements differ from result identities.');
  const observations=[...text.matchAll(/^# (\{.*\})$/gmu)].map(m=>JSON.parse(m[1])); return { records, counters, observations };
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
  return { verdict: mode === 'initial' ? 'EXPECTED_INITIAL_RESULTS' : 'ALL_CANONICAL_TESTS_PASS', tests: parsed.records, counters: parsed.counters, processExitCode: result.status, observations: parsed.observations };
}
export function runCanonicalSuite(suiteName, mode, root = ROOT) {
  rejectRuntimeInjection();
  const full=JSON.parse(regularFile(path.join(root,'tools','PROJECT_SUITE_CONTRACT.json'))), suite=full.suites[suiteName];
  if(!suite || full.root!==PROJECTS.p03.root || suite.realNetwork) throw new Error('Unknown suite or excluded network lane.');
  relativePath(suite.file);
  if(!/^(?:tests|checks)\/[^/]+\.mjs$/u.test(suite.file)) throw new Error('Only named local tests/checks files are accepted.');
  const project=path.join(root,...PROJECTS.p03.root.split('/')), suitePath=path.join(project,...suite.file.split('/'));
  if(!/^[0-9a-f]{64}$/u.test(suite.sha256) || digest(regularFile(suitePath))!==suite.sha256) throw new Error('Suite byte identity differs.');
  const result=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-concurrency=1',suite.file],{cwd:project,encoding:'utf8',timeout:15000,maxBuffer:8388608,windowsHide:true});
  return {suite:suiteName,executionClass:'REAL_JAVASCRIPT_FAKE_TRANSPORT_MODEL',contractProvenance:suite.evidence,...classifySuite(result,suite,mode)};
}
export async function verifyRoute(mode) {
  rejectRuntimeInjection(); if(!['initial','work'].includes(mode)) throw new Error('Unknown route.');
  const protection=checkPackage(ROOT,{allowAssessedEdits:mode==='work',allowGenerated:mode==='work'}), boundary=checkBoundary('p03'), environment=await requireEnvironment();
  const source_path='projects/p03/student/src/request-dispatcher.mjs', sourceFile=path.join(ROOT,...source_path.split('/')), sourceBefore=digest(regularFile(sourceFile));
  const names=mode==='initial'?['baseline','initialObjective','regression']:['baseline','objective','regression','E01','E02','E03','E04','E05','E06','support'];
  const results=names.map(name=>runCanonicalSuite(name,mode));
  if(digest(regularFile(sourceFile))!==sourceBefore) throw new Error('The assessed source changed during suite execution.');
  const finalProtection=checkPackage(ROOT,{allowAssessedEdits:mode==='work',allowGenerated:mode==='work'}), finalBoundary=checkBoundary('p03');
  return {verdict:mode==='initial'?'INITIAL_STATE_PASS':'WORK_RESULT_PASS',assessedPath:source_path,source_path,source_sha256:sourceBefore,sourceHashScope:'Exact assessed file bytes used throughout these suites; no semantic truth certificate.',protection,boundary,postSuiteIntegrity:{protection:finalProtection,boundary:finalBoundary},environment,totalTests:results.reduce((n,r)=>n+r.counters.tests,0),results,qualification:'Finite core/model observations only. P01 trace, real ws and PDF/Gemini/Moodle/native acceptance remain separate.'};
}
