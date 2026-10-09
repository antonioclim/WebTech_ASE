import {assessActivityEnvironment} from './activity-environment.mjs';
import {fileURLToPath} from 'node:url';
const [selected='http',...extra]=process.argv.slice(2),cwd=fileURLToPath(new URL('../',import.meta.url));
if(extra.length||!['core','http'].includes(selected)){console.error('Use node CLASSROOM_RC6/preflight.mjs [core|http]');process.exitCode=64;}else{const report=await assessActivityEnvironment({unit:'S05',operation:'preflight-'+selected,cwd,command:'node CLASSROOM_RC6/preflight.mjs '+selected,usesHttp:selected==='http',usesHttpTimeout:selected==='http'});console.log(JSON.stringify(report,null,2));process.exitCode=report.exitCode;}
