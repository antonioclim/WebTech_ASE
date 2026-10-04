import {ROOT,checkBoundary,checkPackage,runCLI} from './verifier-core.mjs';
runCLI(()=>{if(process.argv.length!==2)throw new Error('This command takes no arguments.');return{verdict:'WORK_BOUNDARY_PASS',protection:checkPackage(ROOT,{allowAssessedEdits:true,allowGenerated:true}),...checkBoundary('p03')};});
