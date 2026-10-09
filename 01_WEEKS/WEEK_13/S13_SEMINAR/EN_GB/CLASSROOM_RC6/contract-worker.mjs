// Execute only the supplied finite fixture inputs to check the synchronous call boundary.
// Output correctness remains the responsibility of the unchanged public objective tests.
import {readFileSync} from 'node:fs';
const modules={P01:'./student/p01.mjs',P02:'./student/p02.mjs',P03:'./student/p03.mjs'};
try {
 const groups=JSON.parse(readFileSync(new URL('./support/cases.json',import.meta.url),'utf8'));
 for(const group of groups){
  const implementation=(await import(modules[group.project_id]))[group.export_name];
  if(typeof implementation!=='function')throw Error('TARGET_EXPORT_MISSING');
  for(const fixture of group.inputs){
   const output=implementation(structuredClone(fixture));
   if(output&&(typeof output==='object'||typeof output==='function')&&typeof output.then==='function')throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');
  }
 }
 console.log(JSON.stringify({status:'PASS_FINITE_SYNCHRONOUS_CALL_BOUNDARY',outputCorrectnessChecked:false}));
}catch(error){console.error(JSON.stringify({status:'STOP_TARGET_EXECUTION',classification:'EXECUTION_FAULT',reason:['TARGET_EXPORT_MISSING','TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT'].includes(error.message)?error.message:'Target import or call failed; inspect your local synthetic implementation',name:error.name}));process.exitCode=2;}
