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
 for(const [id,actual,ref] of [['gemini_state','ACTUAL_INTERACTION','gemini_context'],['browser_state','OBSERVED','browser_trace'],['p02_browser_state','OBSERVED','p02_result']]){
  if(values[id]===actual)continue;
  if(values[id]==='TEACHER_APPROVED_ALTERNATIVE'){
   if(!/AUTHORISATION:\s*[^\n]{20,}/.test(values[ref]||''))errors.push({id:ref,message:'Supply AUTHORISATION: teacher, date, scope and reference. This form cannot grant or authenticate approval.'});
  }else errors.push({id,message:'Actual evidence remains pending. An alternative needs separate explicit teacher authorisation.'});
 }
}
 return {ok:!errors.length,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const group=part(v.group),surname=part(v.surname),given=part(v.given);return group&&surname&&given?'TW2026_S04_'+group+'_'+surname+'_'+given+'.pdf':null;}
function pack(values,schema,provenance='USER_ENTERED_UNVERIFIED_DRAFT'){
 for(const f of list(schema))if(!validType(f,values[f.id]))throw Error('Cannot export invalid or oversized field: '+f.id);
 return {schema:schema.schema,version:schema.version,savedAt:new Date().toISOString(),values:{...values},provenance};
}
root.S04Core={list,defaults,cleanImport,check,filename,pack};
if(typeof module!=='undefined')module.exports=root.S04Core;
})(globalThis);
