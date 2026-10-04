// Narrow witnesses only. This file never implements either assessed transformation.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import { runtimeStatus } from '../../90_AUDIT/tools/runtime.mjs';
const code=process.argv[2];
const runtime=runtimeStatus();
if(!runtime.exact && !runtime.qaOverride){console.error(`STOP: exact runtime required (Node.js v24.21.0 and npm 11.19.0). Observed ${runtime.node} / ${runtime.npm}.`);process.exit(2);}
if(!runtime.exact && runtime.qaOverride)console.error(`QA ONLY: runtime mismatch ${runtime.node} / ${runtime.npm}.`);
function outcome(fn){try{return {returned:fn()};}catch(e){return {error:{name:e.name,message:e.message}};}}
function changed(before,after){return JSON.stringify(before)!==JSON.stringify(after);}
export async function observe(project,importer=specifier=>import(specifier)){
 if(project==='P01'){
  const {transformTasks}=await importer('../P01/student/src/transform-tasks.js');
  const valid=[{id:'B',title:' beta ',owner:'Ada',status:'open',estimate:2},{id:'A',title:' alpha ',owner:'Ada',status:'open',estimate:4}];
  const input=structuredClone(valid),before=structuredClone(input),refs=[...input],options={owner:'Ada',minimumEstimate:0};
  let result;const execution=outcome(()=>{result=transformTasks(input,options);return result;});
  const records=Array.isArray(result?.tasks)?result.tasks:null;
  const inherited=Object.assign(Object.create({owner:'Ada'}),{id:'I',title:' inherited ',status:'open',estimate:3});
  return {project,scope:'DERIVED_WITNESSES_NOT_CANONICAL_TESTS',validInputBefore:before,execution,inputChanged:changed(before,input),
    newOutputArray:records?records!==input:null,recordWitness:records?.length?records.every(x=>refs.every(y=>x!==y)):'INCONCLUSIVE_EMPTY_OR_MISSING_OUTPUT',
    inheritedOwner:outcome(()=>transformTasks([inherited])),stringEstimate:outcome(()=>transformTasks([{...valid[0],estimate:'2'}])),
    limit:'Two valid records and two boundary probes; no proof for every possible input. Empty output is not evidence of correct projection.'};
 }
 if(project==='P03'){
  const {unsafeNormalizeEvents}=await importer('../P03/student/src/unsafe-generated.js');
  const {normalizeEvents}=await importer('../P03/student/src/safe-normalizer.js');
  const valid=[{id:'B',occurredAt:'2026-02-01T00:00:00Z',active:false,durationMs:2},{id:'A',occurredAt:'2026-01-01T00:00:00Z',active:true,durationMs:1}];
  const unsafeInput=structuredClone(valid),before=structuredClone(unsafeInput),originalRefs=[...unsafeInput];const u=unsafeNormalizeEvents(unsafeInput);
  const safeInput=structuredClone(valid),safeBefore=structuredClone(safeInput),safeRefs=[...safeInput];let s;
  const safeExecution=outcome(()=>{s=normalizeEvents(safeInput);return s;});
  const inherited=Object.assign(Object.create({active:true}),{id:'I',occurredAt:'2026-01-01T00:00:00Z',durationMs:1});
  const mixed={...valid[0],active:'false',durationMs:'2'}; const same=valid.map(x=>({...x,occurredAt:'2026-01-01T00:00:00Z'}));
  return {project,scope:'DERIVED_WITNESSES_NOT_CANONICAL_TESTS',unsafeBefore:before,unsafeAfter:unsafeInput,unsafeOutput:u,
   unsafeInputChanged:changed(before,unsafeInput),unsafeOutputRecordsAreFresh:u.every(x=>originalRefs.every(y=>x!==y)),
   safeExecution,safeInputChanged:changed(safeBefore,safeInput),safeRecordWitness:Array.isArray(s)&&s.length?s.every(x=>safeRefs.every(y=>x!==y)):'INCONCLUSIVE',
   mixedTypes:{unsafe:outcome(()=>unsafeNormalizeEvents([structuredClone(mixed)])),safe:outcome(()=>normalizeEvents([structuredClone(mixed)]))},
   inheritedField:{unsafe:outcome(()=>unsafeNormalizeEvents([inherited])),safe:outcome(()=>normalizeEvents([inherited]))},
   equalTimestamps:{unsafe:outcome(()=>unsafeNormalizeEvents(structuredClone(same))),safe:outcome(()=>normalizeEvents(structuredClone(same)))},
   twoFrozenRecords:outcome(()=>normalizeEvents(Object.freeze(valid.map(x=>Object.freeze({...x}))))),
   limit:'Before/after snapshots are taken before each path. The original CLI order flag can compare data after mutation; singleton freezing is insufficient to expose every sort.'};
 }
 throw new Error('Use P01 or P03.');
}
if(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)try{console.log(JSON.stringify(await observe(code),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
