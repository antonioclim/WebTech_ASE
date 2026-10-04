import { runtimeStatus } from "../../90_AUDIT/tools/runtime.mjs";
const [code,...args]=process.argv.slice(2);
const runtime=runtimeStatus();
if(!runtime.exact && !runtime.qaOverride){console.error(`STOP: exact runtime required (Node.js v24.21.0 and npm 11.19.0). Observed ${runtime.node} / ${runtime.npm}.`);process.exit(2);}
if(!runtime.exact && runtime.qaOverride)console.error(`QA ONLY: runtime mismatch ${runtime.node} / ${runtime.npm}.`);
try {
  if(code==='P01'){const {run}=await import('../P01/student/src/cli.js');process.exitCode=run(args,console);}
  else if(code==='P02'){const {run}=await import('../P02/student/src/cli.js');process.exitCode=run(args,console);}
  else if(code==='P03'){
    if(args.length)throw new Error('P03 has no command-line arguments.');
    const {run}=await import('../P03/student/src/cli.js');process.exitCode=run(console);
  }else throw new Error('Use P01, P02 or P03.');
}catch(error){console.error(error.message);process.exitCode=1;}
