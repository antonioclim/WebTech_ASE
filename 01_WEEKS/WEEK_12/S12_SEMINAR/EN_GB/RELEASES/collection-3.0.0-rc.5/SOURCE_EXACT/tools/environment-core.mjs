import { spawnSync } from 'node:child_process';
import { rejectRuntimeInjection } from './verifier-core.mjs';
export { rejectRuntimeInjection } from './verifier-core.mjs';
export const EXPECTED_RUNTIME=Object.freeze({node:'v24.21.0',npm:'11.19.0'});
export async function inspectEnvironment(){
 rejectRuntimeInjection();
 const npmResult=process.platform==='win32'?spawnSync('cmd.exe',['/d','/s','/c','npm --version'],{encoding:'utf8',timeout:10000,maxBuffer:1048576,windowsHide:true}):spawnSync('npm',['--version'],{encoding:'utf8',timeout:10000,maxBuffer:1048576});
 const npm=npmResult.status===0&&!npmResult.error&&!npmResult.signal?npmResult.stdout.trim():null;
 const errors=[];
 if(process.version!==EXPECTED_RUNTIME.node)errors.push('Node mismatch: expected '+EXPECTED_RUNTIME.node+', observed '+process.version+'.');
 if(npm!==EXPECTED_RUNTIME.npm)errors.push('npm mismatch or unavailable: expected '+EXPECTED_RUNTIME.npm+', observed '+String(npm)+'.');
 if(typeof AbortController!=='function'||typeof structuredClone!=='function')errors.push('Required built-in primitives are unavailable.');
 return {verdict:errors.length?'ENVIRONMENT_BLOCKED':'ENVIRONMENT_PASS',expected:EXPECTED_RUNTIME,observed:{node:process.version,npm,platform:process.platform,architecture:process.arch},executionLane:'DEPENDENCY_FREE_FAKE_TRANSPORT',dependenciesRequired:[],npmDiagnostics:String(npmResult.stderr ?? npmResult.error?.message ?? "").trim().slice(0,1000),errors,installsPerformed:0,networkOperations:0,limitation:'The separately prepared ws8.21.3 lane and native browser/Word/Moodle/Gemini remain unqualified.'};
}
export async function requireEnvironment(){const report=await inspectEnvironment();if(report.errors.length){const error=new Error(report.errors.join(' ')+' STOP and retain a BLOCKED draft; use the separately prepared local teaching environment.');error.report=report;throw error;}return report;}
