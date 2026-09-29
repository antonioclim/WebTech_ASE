// Call the unchanged exported CLI directly; do not rely on URL pathname/Windows equality.
const [code,...args]=process.argv.slice(2);
try {
  if(code==='P01'){const {run}=await import('../projects/P01/student/src/cli.js');process.exitCode=run(args,console);}
  else if(code==='P02'){const {run}=await import('../projects/P02/student/src/cli.js');process.exitCode=run(args,console);}
  else if(code==='P03'){
    if(args.length)throw new Error('P03 has no command-line arguments.');
    const {run}=await import('../projects/P03/student/src/cli.js');process.exitCode=run(console);
  }else throw new Error('Use P01, P02 or P03.');
}catch(error){console.error(error.message);process.exitCode=1;}
