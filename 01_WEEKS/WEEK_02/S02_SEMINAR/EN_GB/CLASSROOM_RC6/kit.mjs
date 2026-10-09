import {assessEnvironment,REFERENCE} from './environment.mjs';
import {readFileSync,lstatSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=dirname(fileURLToPath(import.meta.url));
const exact=process.version===REFERENCE.node;

function sha(path){
 const stat=lstatSync(path);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error('NON_REGULAR_SOURCE '+path);
 return createHash('sha256').update(readFileSync(path)).digest('hex');
}
function assertSourceSet(manifest){
 const found=[];
 function walk(dir,prefix=''){
  for(const item of readdirSync(dir,{withFileTypes:true})){
   const p=prefix+item.name;
   if(item.isDirectory())walk(join(dir,item.name),p+'/');
   else{
    if(item.isSymbolicLink()||!item.isFile())throw Error('NON_REGULAR_SOURCE '+p);
    found.push(p);
   }
  }
 }
 walk(root);
 const expected=[...Object.keys(manifest.protected),...Object.keys(manifest.targets),'SOURCE_MANIFEST.json'].sort();
 if(JSON.stringify(found.sort())!==JSON.stringify(expected))throw Error('CLASSROOM_SOURCE_SET_CHANGED');
}
function plainObject(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;}
function requireWorkerReport(report,action,project,config,exitStatus){
 if(!plainObject(report)||typeof report.status!=='string')throw Error('INVALID_WORKER_REPORT_SHAPE');
 if(action==='observe'){
  if(report.status==='OBSERVATION_EXECUTION_FAULT'){
   if(exitStatus!==2||typeof report.reason!=='string')throw Error('INVALID_OBSERVATION_FAULT_REPORT');
   return;
  }
  const observation=report.observations;
  if(report.status!=='PERSONAL_EXECUTION_OBSERVATION'||exitStatus!==0||report.qualification!==false||!plainObject(observation)||observation.project!==project||observation.evidenceClass!=='SOURCE_ONLY_NOT_RENDERED_BROWSER'||typeof observation.stylesheet!=='string'||typeof observation.manualRequired!=='string')throw Error('INVALID_OBSERVATION_REPORT');
  return;
 }
 if(report.seminar!==config.seminar||report.action!==action||report.project!==project||report.scope!==config.evidenceScope||!Array.isArray(report.cases)||!Number.isInteger(report.pass)||!Number.isInteger(report.fail)||report.pass<0||report.fail<0)throw Error('INVALID_CHECK_REPORT');
 const expected=config.initialAssertionFailures.filter(id=>project==='all'||id.startsWith(project+'.')).sort();
 const ids=report.cases.map(c=>{
  if(!plainObject(c)||typeof c.case!=='string'||typeof c.project!=='string'||c.project!==c.case.split('.')[0]||!['PASS','ASSERTION_FAIL','EXECUTION_FAULT'].includes(c.status))throw Error('INVALID_WORKER_CASE');
  if(c.status!=='PASS'&&typeof c.reason!=='string')throw Error('INVALID_WORKER_FAILURE_REASON');
  return c.case;
 }).sort();
 if(JSON.stringify(ids)!==JSON.stringify(expected))throw Error('WORKER_CASE_SET_CHANGED');
 const failed=report.cases.filter(c=>c.status!=='PASS');
 if(report.fail!==failed.length||report.pass!==report.cases.length-failed.length)throw Error('WORKER_COUNTS_CONTRADICT_CASES');
 if(report.status==='FAIL_CLASSROOM_CHECKS'){
  if(exitStatus!==1||failed.length===0)throw Error('INVALID_FAILED_CHECK_STATUS');
 }else if(action==='check'&&report.status==='PASS_BOUNDED_CLASSROOM_CHECKS'){
  if(exitStatus!==0||failed.length!==0)throw Error('INVALID_PASS_CHECK_STATUS');
 }else if(action==='initial'&&report.status==='PASS_ORIGINAL_STARTER_ASSERTIONS'){
  const actual=failed.filter(c=>c.status==='ASSERTION_FAIL').map(c=>c.case).sort();
  if(exitStatus!==0||failed.length!==actual.length||JSON.stringify(actual)!==JSON.stringify(expected)||JSON.stringify(report.expectedInitialFailures)!==JSON.stringify(expected)||JSON.stringify(report.actualInitialFailures)!==JSON.stringify(actual))throw Error('INVALID_ORIGINAL_STARTER_REPORT');
 }else throw Error('INVALID_WORKER_STATUS');
}

try{
 const config=JSON.parse(readFileSync(join(root,'contract.json'),'utf8'));
 if(!plainObject(config)||typeof config.seminar!=='string'||typeof config.evidenceScope!=='string'||typeof config.limitation!=='string'||!Array.isArray(config.projects)||config.projects.some(p=>!plainObject(p)||typeof p.id!=='string')||!Array.isArray(config.initialAssertionFailures)||config.initialAssertionFailures.some(id=>typeof id!=='string'))throw Error('INVALID_CLASSROOM_CONTRACT');
 const [action='help',project='all',...tail]=process.argv.slice(2);
 if(tail.length||!['initial','check','observe','serve'].includes(action)||!['all',...config.projects.map(p=>p.id)].includes(project))throw Error('Use node CLASSROOM_RC6/kit.mjs initial | check P01/P02/P03/all | observe P01/P02/P03/all | serve');
 const environment=await assessEnvironment({unit:'S02/'+project,operation:action,cwd:dirname(root),command:'node CLASSROOM_RC6/kit.mjs '+action+' '+project,features:action==='serve'?['http']:['node-core'],usesNpm:false});console.error(JSON.stringify(environment));if(environment.exitCode)process.exit(environment.exitCode);
 const manifestPath=join(root,'SOURCE_MANIFEST.json');
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
 if(!plainObject(manifest)||!plainObject(manifest.protected)||!plainObject(manifest.targets))throw Error('INVALID_CLASSROOM_MANIFEST');
 const manifestBefore=sha(manifestPath);
 assertSourceSet(manifest);
 for(const[p,digest]of Object.entries(manifest.protected))if(sha(join(root,p))!==digest)throw Error('PROTECTED_SOURCE_CHANGED '+p);
 for(const p of Object.keys(manifest.targets))sha(join(root,p));
 if(action==='initial')for(const[p,digest]of Object.entries(manifest.targets))if(sha(join(root,p))!==digest)throw Error('INITIAL_REQUIRES_ORIGINAL_STARTERS '+p);
 const before=Object.fromEntries(Object.keys(manifest.targets).map(p=>[p,sha(join(root,p))]));
 if(action==='serve'){
  const child=await import('./server.mjs');
  await child.serve();
 }else{
  const result=spawnSync(process.execPath,[join(root,'checks.mjs'),action,project],{cwd:root,env:process.env,encoding:'utf8',timeout:10000,maxBuffer:2000000});
  if(result.error||result.signal||result.status===null)throw Error('BOUNDED_CHILD_FAULT '+(result.error?.code||result.signal||'NO_EXIT_STATUS'));
  let report;
  try{report=JSON.parse(result.stdout);}catch{throw Error('UNPARSEABLE_WORKER_OUTPUT '+String(result.stderr).slice(0,200));}
  requireWorkerReport(report,action,project,config,result.status);
  if(sha(manifestPath)!==manifestBefore)throw Error('CONTROL_MANIFEST_CHANGED_DURING_CHECK');
  assertSourceSet(manifest);
  const after=Object.fromEntries(Object.keys(manifest.targets).map(p=>[p,sha(join(root,p))]));
  if(JSON.stringify(before)!==JSON.stringify(after))throw Error('TARGET_CHANGED_DURING_CHECK');
  for(const[p,digest]of Object.entries(manifest.protected))if(sha(join(root,p))!==digest)throw Error('PROTECTED_SOURCE_CHANGED_DURING_CHECK '+p);
  console.log(JSON.stringify({...report,referenceNode:REFERENCE.node,referenceNodeMatch:exact,observedNode:process.version,environmentStatus:environment.status,sourceBoundary:'PROTECTED_FILES_AND_STABLE_TARGET_BYTES',nativeQualification:false,completionTimePilot:false,limitation:config.limitation},null,2));
  process.exitCode=result.status;
 }
}catch(error){
 console.error(JSON.stringify({status:'STOP_CLASSROOM_BOUNDARY_OR_EXECUTION',reason:error.message,referenceNode:REFERENCE.node,referenceNodeMatch:exact,observedNode:process.version}));
 process.exitCode=2;
}
