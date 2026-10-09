import {assessEnvironment,runBounded} from './environment.mjs';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
import {join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function assessOptionalEnvironment({unit,operation,cwd,command,root,profile,usesHttp=profile==='express',usesTestRunner=false,source={files:0,errors:[]}}){
 const environment=await assessEnvironment({unit,operation,cwd,command,features:usesHttp?['http']:['node-core'],usesNpm:false});
 if(!environment.exitCode&&usesTestRunner){
  const cli=await runBounded(process.execPath,['--test-isolation=none','--version'],{cwd,timeoutMs:5000,maxBytes:65536});
  const ok=cli.ok&&cli.stdout.trim()===process.version;
  environment.checks.push({feature:'node-test-isolation',status:ok?'ENV_OK':'ENV_BLOCKED',operation:'Actual parser accepts --test-isolation=none; test files stay in the owned child',reason:ok?null:cli.reason||cli.signal||'NODE_TEST_ISOLATION_FLAG_UNAVAILABLE'});
  if(!ok){environment.status='ENV_BLOCKED';environment.exitCode=2;}
 }
 const require=createRequire(join(root,'package.json')),pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8')),lock=JSON.parse(readFileSync(join(root,'package-lock.json'),'utf8')),dependencies=[];
 for(const name of Object.keys(pkg.dependencies||{})){
  const expected=lock.packages?.['node_modules/'+name]?.version;let actual=null,resolved=null,error=null;
  try{resolved=require.resolve(name+'/package.json');if(!realpathSync(resolved).startsWith(realpathSync(root)+sep+'node_modules'+sep))throw Error('DEPENDENCY_NOT_PROJECT_LOCAL');actual=JSON.parse(readFileSync(resolved,'utf8')).version;if(actual!==expected)throw Error('LOCKED_DEPENDENCY_VERSION_MISMATCH');}
  catch(failure){error=failure.code||failure.message;}
  dependencies.push({name,expected,actual,resolved,error});
 }
 let probe=null;
 if(dependencies.some(x=>x.error)||source.errors.length){environment.status='ENV_BLOCKED';environment.exitCode=2;environment.checks.push({feature:'optional-'+profile,status:'ENV_BLOCKED',reason:source.errors.length?'CANONICAL_SOURCE_CHANGED':'PROJECT_LOCAL_DEPENDENCY_UNAVAILABLE',dependencies,source,remedy:'Use only an independently prepared matching optional example. No installation or lockfile rewrite is performed; independent core operations can continue.'});}
 else if(!environment.exitCode){
  probe=await runBounded(process.execPath,[fileURLToPath(new URL('./optional-probe.mjs',import.meta.url)),profile,root],{cwd:root,timeoutMs:5000,maxBytes:65536});
  let check;
  if(probe.ok){try{check=JSON.parse(probe.stdout);}catch{check={status:'ENV_BLOCKED',feature:'optional-'+profile,reason:'UNPARSEABLE_OPTIONAL_PROBE_OUTPUT'};}}
  else check={status:'ENV_BLOCKED',feature:'optional-'+profile,reason:probe.reason||probe.signal||'OPTIONAL_PROBE_EXIT_ERROR',exitCode:probe.exitCode,stderr:probe.stderr};
  environment.checks.push(check);if(check.status!=='ENV_OK'){environment.status='ENV_BLOCKED';environment.exitCode=2;}
 }
 if(environment.exitCode)environment.remedy='Read the affected optional dependency/source/API failure and recheck this example; core direct-Node routes do not require Express, Sequelize, sqlite3 or npm.';
 return {environment,dependencies,source,probe,ready:environment.exitCode===0,scope:'Selected actual optional API probes on observed runtime; not complete dependency-tree, reference or native-platform qualification'};
}
