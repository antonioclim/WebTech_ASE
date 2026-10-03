import {ROOT,checkBoundary,checkPackage,rejectRuntimeInjection} from './verifier-core.mjs';
import {requireEnvironment} from './environment-core.mjs';
import {runCanonicalSuite} from './suite-core.mjs';
try { rejectRuntimeInjection(); if(process.argv.length!==3 || !/^E0[1-6]$/u.test(process.argv[2]))throw new Error('Choose exactly one case: E01 through E06. No override is accepted.'); checkPackage(ROOT,{allowAssessedEdits:true,allowGenerated:true});checkBoundary('p03');await requireEnvironment();console.log(JSON.stringify({verdict:'OBSERVATION_CASE_PASS',case:process.argv[2],result:runCanonicalSuite(process.argv[2],'work'),limitation:'Fake transport/model; this does not prove remote cancellation or actual ws integration.'},null,2)); }
catch(error){console.error('OBSERVATION_BLOCKED_OR_FAILED: '+error.message);if(error.report)console.log(JSON.stringify(error.report,null,2));process.exitCode=2;}
