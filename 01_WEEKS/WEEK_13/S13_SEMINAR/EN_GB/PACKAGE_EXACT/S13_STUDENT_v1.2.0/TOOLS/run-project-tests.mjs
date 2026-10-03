import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {classifyTestRun} from './test-result-classifier.mjs';
export function runProjectTests(root,project,mode,authority) {
  const paths={p01:'projects/p01/student',p02:'guided/p02/student',p03:'optional/p03/student',rh:'portfolio/regression-harness/student'};
  if(!Object.hasOwn(paths,project))throw new Error('BLOCKED_PROJECT: choose p01,p02,p03 or rh');
  if(!['initial','work'].includes(mode))throw new Error('BLOCKED_TEST_MODE: choose initial or work');
  const suites=project==='rh'?['baseline','regression']:['baseline','objective','regression'];
  let all=true;const rows=[];
  function execute(file,suite,normative=false) {
    const expectedNames=normative?authority.normative_names:authority.suite_names?.[project]?.[suite];
    if(!Array.isArray(expectedNames)||!expectedNames.length||new Set(expectedNames).size!==expectedNames.length||expectedNames.some(n=>typeof n!=='string'||!n))throw new Error('BLOCKED_SUITE_CASE_AUTHORITY: '+project+'/'+suite);
    const run=spawnSync(process.execPath,['--test','--test-timeout=8000','--test-reporter='+path.join(root,'TOOLS','json-test-reporter.mjs'),file],{cwd:normative?root:path.dirname(path.dirname(file)),encoding:'utf8',timeout:20000,maxBuffer:1024*1024});
    process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');
    const state=classifyTestRun(run,{initial:mode==='initial'&&(suite==='objective'||normative),allowIncomplete:normative,expectedNames,expectedVector:normative?authority.normative_starter_vector:suite==='objective'?authority.starter_objective_vectors[project]:null});
    rows.push({suite,state});if(!['PASS','EXPECTED_STARTER_ASSERTION_FAILURE'].includes(state))all=false;
  }
  for(const suite of suites)execute(path.join(root,paths[project],'tests',suite+'.test.mjs'),suite);
  if(project==='p01')execute(path.join(root,'normative_tests','p01-contract.test.mjs'),'independent_normative',true);
  if(project==='rh')rows.push({suite:'objective_HTTP',state:'NOT_EXECUTED_REQUIRES_SEPARATE_NATIVE_ROUTE'});
  console.log(JSON.stringify({project,result:all?'PASS_OR_DOCUMENTED_EXPECTED_STARTER':'INCOMPLETE_OR_FAIL',rows}));return all?0:1;
}
