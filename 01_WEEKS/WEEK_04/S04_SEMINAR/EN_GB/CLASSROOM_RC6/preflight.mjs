import {assessEnvironment} from './environment.mjs';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
if(process.argv.length!==2){console.error('Use node CLASSROOM_RC6/preflight.mjs');process.exitCode=64;}else{const report=await assessEnvironment({unit:'S04',operation:'preflight',cwd,command:'node CLASSROOM_RC6/preflight.mjs',features:['node-core'],usesNpm:false});console.log(JSON.stringify(report,null,2));process.exitCode=report.exitCode;}
