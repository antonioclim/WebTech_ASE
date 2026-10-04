/* Derived offline validation/migration. No experiment is executed and no observation authenticated. */
(function(root){'use strict';
const MAX_BYTES=2000000, OWN=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const STATES=['USER_ENTERED_UNVERIFIED_DRAFT','IMPORTED_UNVERIFIED_DRAFT','MIGRATED_V1_1_0_UNVERIFIED_DRAFT'];
function list(schema){return schema.sections.flatMap(s=>s.fields);}
function defaults(schema){return Object.fromEntries(list(schema).map(f=>[f.id,f.default]));}
function validType(f,v){return f.kind==='checkbox'?typeof v==='boolean':typeof v==='string'&&v.length<=f.max&&(!f.options||f.options.includes(v));}
function object(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function validProvenance(p){
 if(typeof p==='string')return STATES.includes(p)||p==='IMPORTED_UNVERIFIED_DRAFT';
 return object(p)&&Object.keys(p).every(k=>['state','sourceVersion','missingAddedFields'].includes(k))&&STATES.includes(p.state)&&(p.sourceVersion===null||['1.1.0','1.2.0'].includes(p.sourceVersion))&&Array.isArray(p.missingAddedFields)&&p.missingAddedFields.every(i=>typeof i==='string'&&/^[a-z_]+$/.test(i));
}
function freshProvenance(){return {state:'USER_ENTERED_UNVERIFIED_DRAFT',sourceVersion:null,missingAddedFields:[]};}
function cleanImport(text,schema,options={}){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>Math.min(schema.maxImportBytes,MAX_BYTES))throw Error('Import exceeds 2,000,000 bytes.');
 let data;try{data=JSON.parse(text);}catch(_){throw Error('Malformed JSON.');}
 if(!object(data)||data.schema!==schema.schema||typeof data.version!=='string'||!object(data.values))throw Error('Unsupported schema, version or values.');
 if(Object.keys(data).some(k=>!['schema','version','savedAt','values','provenance'].includes(k)))throw Error('Unknown import property.');
 if(OWN(data,'savedAt')&&(typeof data.savedAt!=='string'||!Number.isFinite(Date.parse(data.savedAt))))throw Error('Invalid savedAt metadata.');
 if(OWN(data,'provenance')&&!validProvenance(data.provenance))throw Error('Invalid provenance metadata.');
 const legacy=data.version===schema.legacyVersion;
 if(data.version!==schema.version&&!legacy)throw Error('Unsupported version.');
 if(legacy&&options.allowLegacy!==true)throw Error('v1.1.0 requires explicit migration consent. Enable the migration option, then import again.');
 const fields=legacy?schema.legacyFieldDefinitions:list(schema),known=new Map(fields.map(f=>[f.id,f]));
 if(Object.keys(data.values).some(k=>!known.has(k)))throw Error('Unknown field.');
 const values=defaults(schema);
 for(const f of fields){if(!OWN(data.values,f.id)||!validType(f,data.values[f.id]))throw Error('Missing, oversized or invalid field: '+f.id);values[f.id]=data.values[f.id];}
 values.declaration=false;
 const added=list(schema).filter(f=>!known.has(f.id)).map(f=>f.id);
 return {values,provenance:{state:legacy?'MIGRATED_V1_1_0_UNVERIFIED_DRAFT':'IMPORTED_UNVERIFIED_DRAFT',sourceVersion:data.version,missingAddedFields:added}};
}
function check(values,schema,mode){
 if(!['core','final'].includes(mode))throw Error('Unknown validation mode.');
 if(!object(values))return {ok:false,errors:[{id:'surname',message:'Values must be a field object.'}],state:'INCOMPLETE'};
 const errors=[],known=new Set(list(schema).map(f=>f.id)),add=(id,message)=>errors.push({id,message});
 const safeText=id=>typeof values[id]==='string'?values[id]:'';
 if(Object.keys(values).some(k=>!known.has(k)))add('surname','Unknown field in current form data.');
 for(const f of list(schema)){
  const v=values[f.id];if(!validType(f,v)){add(f.id,'Invalid type, selection or size.');continue;}
  if((mode==='final'||f.phase==='core')&&(f.kind==='checkbox'?!v:!v.trim()))add(f.id,'Complete '+f.label.toLowerCase()+'.');
 }
 if(safeText('evidence_date').trim()){const date=safeText('evidence_date'),parsed=new Date(date+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)add('evidence_date','Use a valid YYYY-MM-DD for the actual record date.');}
 const seminarId=safeText('seminar_id').trim();
 if(seminarId&&seminarId!=='S06')add('seminar_id','Check the kit and enter S06 for this form.');
 const packageId=safeText('package_id').trim();
 if(packageId&&!/^[a-f0-9]{64}$/i.test(packageId))add('package_id','Copy the 64 hexadecimal characters from student PACKAGE_ID.txt; do not enter the process PID.');
 if(mode==='final'){
  const alt=safeText('final_mode')==='TEACHER_APPROVED_ALTERNATIVE';
  if(!['STANDARD','TEACHER_APPROVED_ALTERNATIVE'].includes(safeText('final_mode')))add('final_mode','Choose the standard route or record a separately obtained teacher decision.');
  if(alt&&!/^AUTHORISATION:\s*[^\n]{20,}/.test(safeText('alternative_ref')))add('alternative_ref','Record AUTHORISATION: with the separately obtained teacher, date, reference, affected requirements and replacement evidence. The form cannot grant or authenticate this decision.');
  if(!alt){
   if(safeText('alternative_ref').trim()!=='NONE')add('alternative_ref','For STANDARD write NONE. A replacement route requires a separate teacher decision.');
   if(safeText('gemini_state')!=='ACTUAL_INTERACTION')add('gemini_state','Complete one actual bounded Gemini interaction. Synthetic practice or a pending service remains a draft.');
   const evidence=safeText('evidence_class');
   if(!/^ACTUAL_ORM_SQLITE\s*:\s*\S+/m.test(evidence)||!/^LOCAL_HTTP\s*:\s*\S+/m.test(evidence))add('evidence_class','On separate lines link ACTUAL_ORM_SQLITE: evidence-id and LOCAL_HTTP: evidence-id. These labels do not authenticate execution.');
   if(!/^(SAME_PROCESS_CONNECTION_REOPEN|SEPARATE_PROCESS_RESTART)\s*[:|;-]\s*\S/.test(safeText('process_boundary').trim()))add('process_boundary','State the observed connection/process boundary followed by its evidence reference.');
   const pending=/^(PENDING|UNKNOWN|NOT_EXECUTED|BLOCKED|EXPECTED_FROM_SOURCE|SYNTHETIC_PRACTICE)(\b|_)/i;
   for(const id of ['observed','combined','search_literal','sorts','projection','invalid','repeated','no_query','recovery','lifecycle_command','close_reopen','reset','baseline','objective','regression','gemini_check','export_inspection'])if(pending.test(safeText(id).trim()))add(id,'Required observation or inspection remains pending/expected. Save a core draft or record a separately obtained teacher decision.');
  }
 }
 return {ok:errors.length===0,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE_NOT_VERIFIED':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const group=part(v.group),surname=part(v.surname),first=part(v.given);return group&&surname&&first?'TW2026_S06_'+group+'_'+surname+'_'+first+'.pdf':null;}
function pack(values,schema,provenance=freshProvenance()){
 if(!object(values))throw Error('Invalid export values.');
 const keys=new Set(list(schema).map(f=>f.id));if(Object.keys(values).some(k=>!keys.has(k)))throw Error('Unknown export field.');
 for(const f of list(schema))if(!validType(f,values[f.id]))throw Error('Cannot export invalid or oversized field: '+f.id);
 if(!validProvenance(provenance))throw Error('Invalid export provenance.');
 return {schema:schema.schema,version:schema.version,savedAt:new Date().toISOString(),values:{...values},provenance:typeof provenance==='string'?{state:provenance,sourceVersion:null,missingAddedFields:[]}:{...provenance,missingAddedFields:[...provenance.missingAddedFields]}};
}
root.S06Core={list,defaults,cleanImport,check,filename,pack,freshProvenance};if(typeof module!=='undefined')module.exports=root.S06Core;
})(globalThis);
