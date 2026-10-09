// Finite teaching observations, without a complete assessed implementation or personal-case oracle.
import * as suppliedAdapter from './support/checklist-app.mjs';
const entries={'P01-follow-up':['./student/p01.mjs','persistenceWitness'],'P03-precedence':['./student/p03.mjs','evidenceGate']};
const [selector,...extra]=process.argv.slice(2);
if(extra.length||!Object.hasOwn(entries,selector)){console.error('UNKNOWN_TEACHING_PROBE');process.exit(2);}
const [module,name]=entries[selector],implementation=(await import(module))[name];
function observe(input,adapter){const before=JSON.stringify(input),actualOutput=implementation(input,adapter);if(actualOutput&&(typeof actualOutput==='object'||typeof actualOutput==='function')&&typeof actualOutput.then==='function')throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');return{actualOutput,inputUnchanged:JSON.stringify(input)===before};}
let observations;
if(selector==='P01-follow-up'){
 observations=[null,'missing-persistence'].flatMap(defect=>['  Cabinet inspection  ','  Second synthetic title  '].map(title=>{
  const calls=[],adapter={...suppliedAdapter,createChecklistSystem(options){calls.push({operation:'adapter.createChecklistSystem',defect:options?.defect??null});const system=suppliedAdapter.createChecklistSystem(options);return{...system,service:{...system.service,create(input){const result=system.service.create(input);calls.push({operation:'service.create',requestedTitle:input?.title,id:result.id,createdTitle:result.title});return result;}},repository:{...system.repository,find(id){const result=system.repository.find(id);calls.push({operation:'repository.find',requestedId:id,found:result!==null});return result;}}};}};
  const input={defect,title};return{input,...observe(input,adapter),actualAdapterCalls:calls};
 }));
}else{
 const rows=[['all required pass',[{id:'BUILD',state:'pass',required:true},{id:'DEPLOYMENT',state:'unknown',required:false}]],['required unknown with optional pass',[{id:'BUILD',state:'unknown',required:true},{id:'DEPLOYMENT',state:'pass',required:false}]],['required fail and unknown',[{id:'BUILD',state:'fail',required:true},{id:'AUDIT',state:'unknown',required:true}]],['unknown before fail',[{id:'AUDIT',state:'unknown',required:true},{id:'BUILD',state:'fail',required:true}]],['optional fail remains visible',[{id:'BUILD',state:'pass',required:true},{id:'DEPLOYMENT',state:'fail',required:false}]]];
 observations=rows.map(([caseName,rows])=>{const input={rows};return{caseName,input,...observe(input)};});
}
console.log(JSON.stringify({probe:selector,scope:selector==='P01-follow-up'?'ACTUAL_LOCAL_MAP_SERVICE_OBSERVATION':'CORE_EVIDENCE_AGGREGATION_OBSERVATION',observations,limits:['No personal-case oracle or author authentication','Map lifetime only, without restart durability, SQLite, HTTP or browser','Recorded evidence states do not authenticate the underlying checks or a deployment'],implementationQualification:false},null,2));
