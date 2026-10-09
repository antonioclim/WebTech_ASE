import {assessEnvironment} from './environment.mjs';
import {fileURLToPath} from 'node:url';
// LOCAL3 protected teaching probes. These bodies observe learner code; they do not implement it.
// The retained CLASSROOM_RC6 source-carrier name is intentional.
const probes = {
  "P01-boundary": async () => {
    const {loadSummary}=await import("./targets/p01.mjs"); try { console.log(await loadSummary(async()=>({ok:false,status:503,json:async()=>({})}))); } catch(error) { console.log({name:error.name,message:error.message}); }
  },
  "P02-boundary": async () => {
    const {delegatedAction}=await import("./targets/p02.mjs"); console.log(delegatedAction({closest:()=>null},{contains:()=>true}));
  },
  "P03-boundary": async () => {
    const {isRetryable}=await import("./targets/p03.mjs"); try { console.log(isRetryable({kind:"http",status:503.5})); } catch(error) { console.log({name:error.name}); }
  }
};
const [selector, ...extra] = process.argv.slice(2);
if (selector === undefined && extra.length === 0) {
  console.log('Use: node CLASSROOM_RC6/PROBE.mjs <selector>');
  console.log('Available selectors: ' + Object.keys(probes).join(', '));
  process.exit(0);
}
if (extra.length !== 0 || !Object.keys(probes).includes(selector)) {
  console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector:selector ?? null,available:Object.keys(probes)}));
  process.exit(2);
}
const environment=await assessEnvironment({unit:'S04/'+selector,operation:'teaching-probe',cwd:fileURLToPath(new URL('../',import.meta.url)),command:'node CLASSROOM_RC6/PROBE.mjs '+selector,features:['node-core'],usesNpm:false});console.error(JSON.stringify(environment));if(environment.exitCode)process.exit(environment.exitCode);
try {
  await probes[selector]();
} catch (error) {
  console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',probe:selector,name:error.name,message:error.message}));
  process.exitCode = 2;
}
