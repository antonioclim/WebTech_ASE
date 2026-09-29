/* Shared pure validation used by the offline form and local tests. No network calls. */
(function(root){'use strict';
function list(schema){return schema.sections.flatMap(s=>s.fields);}
function defaults(schema){return Object.fromEntries(list(schema).map(f=>[f.id,f.default]));}
function validType(f,v){return f.kind==='checkbox'?typeof v==='boolean':typeof v==='string'&&v.length<=f.max&&(!f.options||f.options.includes(v));}
function cleanImport(text,schema){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>schema.maxImportBytes)throw Error('Import exceeds 2,000,000 bytes.');
 let data;try{data=JSON.parse(text);}catch(_){throw Error('Malformed JSON.');}
 if(!data||Array.isArray(data)||data.schema!==schema.schema||data.version!==schema.version||!data.values||Array.isArray(data.values)||typeof data.values!=='object')throw Error('Unsupported schema, version or values.');
 if(Object.keys(data).some(k=>!['schema','version','savedAt','values','provenance'].includes(k)))throw Error('Unknown import property.');
 const known=new Map(list(schema).map(f=>[f.id,f]));
 if(Object.keys(data.values).some(k=>!known.has(k)))throw Error('Unknown field.');
 const values=defaults(schema);
 for(const f of known.values()){
  if(!Object.hasOwn(data.values,f.id)||!validType(f,data.values[f.id]))throw Error('Missing, oversized or invalid field: '+f.id);
  values[f.id]=data.values[f.id];
 }
 values.declaration=false; // A prior declaration must not silently attest a newly imported draft.
 return {values,provenance:'IMPORTED_UNVERIFIED_DRAFT'};
}
function check(values,schema,mode){
 if(!['core','final'].includes(mode))throw Error('Unknown validation mode.');
 const errors=[];
 for(const f of list(schema)){
  const v=values[f.id];
  if(!validType(f,v)){errors.push({id:f.id,message:'Invalid type, selection or size.'});continue;}
  const required=mode==='final'||f.phase==='core';
  if(required&&(f.kind==='checkbox'?!v:!v.trim()))errors.push({id:f.id,message:'Complete '+f.label.toLowerCase()+'.'});
 }
 if(mode==='final'){
  const alt=values.final_mode==='TEACHER_APPROVED_ALTERNATIVE';
  if(!['STANDARD','TEACHER_APPROVED_ALTERNATIVE'].includes(values.final_mode)) errors.push({id:'final_mode',message:'Choose the standard route or record a separately obtained decision.'});
  if(alt && !/AUTHORISATION:\s*[^\n]{20,}/.test(values.alternative_ref||'')) errors.push({id:'alternative_ref',message:'Record AUTHORISATION: followed by the separate teacher, date, reference and exact scope. This form cannot grant or authenticate it.'});
  if(!alt){
   if(values.gemini_state!=='ACTUAL_INTERACTION') errors.push({id:'gemini_state',message:'Complete an actual bounded Gemini interaction. Synthetic practice remains practice.'});
   const evidence=String(values.evidence_class||'');
   if(!/ACTUAL_ORM_SQLITE/.test(evidence)||!/LOCAL_HTTP/.test(evidence)||evidence.trim().length<45) errors.push({id:'evidence_class',message:'Link actual ORM/SQLite and local HTTP evidence identifiers. Labels alone do not establish that either ran.'});
   const boundary=String(values.process_boundary||'');
   if(!/^(SAME_PROCESS_CONNECTION_REOPEN|SEPARATE_PROCESS_RESTART)\s*[:|;-]\s*\S/.test(boundary)) errors.push({id:'process_boundary',message:'State the observed connection/process boundary and its evidence reference.'});
   for(const id of ['observed','combined','search_literal','sorts','projection','invalid','repeated','recovery','lifecycle_command','close_reopen','reset','baseline','objective','regression']){
    if(/^(PENDING|UNKNOWN|NOT_EXECUTED|BLOCKED)(\b|_)/i.test(String(values[id]||'').trim())) errors.push({id,message:'This required observation remains pending. Save a core draft or record a separate teacher decision.'});
   }
  }
 }


 return {ok:!errors.length,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const group=part(v.group),surname=part(v.surname),given=part(v.given);return group&&surname&&given?'TW2026_S06_'+group+'_'+surname+'_'+given+'.pdf':null;}
function pack(values,schema,provenance='USER_ENTERED_UNVERIFIED_DRAFT'){
 const keys=new Set(list(schema).map(f=>f.id));if(Object.keys(values).some(k=>!keys.has(k)))throw Error('Unknown export field.');
 for(const f of list(schema))if(!validType(f,values[f.id]))throw Error('Cannot export invalid or oversized field: '+f.id);
 return {schema:schema.schema,version:schema.version,savedAt:new Date().toISOString(),values:{...values},provenance};
}
root.S06Core={list,defaults,cleanImport,check,filename,pack};
if(typeof module!=='undefined')module.exports=root.S06Core;
})(globalThis);
