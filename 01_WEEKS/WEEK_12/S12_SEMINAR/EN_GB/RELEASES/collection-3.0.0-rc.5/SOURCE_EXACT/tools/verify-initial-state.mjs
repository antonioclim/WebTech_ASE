import {verifyRoute} from './suite-core.mjs';
try{if(process.argv.length!==2)throw new Error('This command takes no arguments and has no override.');console.log(JSON.stringify(await verifyRoute('initial'),null,2));}catch(error){console.error('INITIAL_STATE_BLOCKED: '+error.message);if(error.report)console.log(JSON.stringify(error.report,null,2));process.exitCode=2;}
