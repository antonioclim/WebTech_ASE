import {assessActivityEnvironment} from './activity-environment.mjs';
import {fileURLToPath} from 'node:url';
const [selected='sqlite',...extra]=process.argv.slice(2),cwd=fileURLToPath(new URL('../',import.meta.url));
if(extra.length||!['core','sqlite'].includes(selected)){console.error('Use node CLASSROOM_RC6/preflight.mjs [core|sqlite]');process.exitCode=64;}else{const report=await assessActivityEnvironment({unit:'S06',operation:'preflight-'+selected,cwd,command:'node CLASSROOM_RC6/preflight.mjs '+selected,usesSqlite:selected==='sqlite'});console.log(JSON.stringify(report,null,2));process.exitCode=report.exitCode;}
