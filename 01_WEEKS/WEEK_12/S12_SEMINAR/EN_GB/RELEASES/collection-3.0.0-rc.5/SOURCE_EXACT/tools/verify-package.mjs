import {ROOT,checkPackage,runCLI} from './verifier-core.mjs';
runCLI(()=>{if(process.argv.length!==2)throw new Error('This command takes no arguments.');return{verdict:'PACKAGE_IDENTITY_PASS',...checkPackage(ROOT),limitation:'Unsigned internal coherence. Compare the ZIP SHA-256 against the independently supplied teacher receipt for provenance.'};});
