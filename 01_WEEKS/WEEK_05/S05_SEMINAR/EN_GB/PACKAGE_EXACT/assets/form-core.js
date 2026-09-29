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
 const auth=(text)=>/AUTHORISATION:\s*[^\n]{20,}/.test(text||'');
 if(values.gemini_state!=='ACTUAL_INTERACTION'){
  if(values.gemini_state!=='TEACHER_APPROVED_ALTERNATIVE'||!auth(values.gemini_prompt)) errors.push({id:'gemini_state',message:'Actual Gemini interaction or separately documented teacher authorisation is required. This form cannot grant approval.'});
 }
 const source=String(values.source_class||'');
 if(!/^(LOCAL_HTTP|REAL_BROWSER)\b[\s|:;-]+\S/.test(source)&&!(source.startsWith('TEACHER_APPROVED_ALTERNATIVE')&&auth(source))) errors.push({id:'source_class',message:'Identify actual local HTTP evidence and its source. Models alone cannot satisfy this field; any alternative requires separate AUTHORISATION.'});
 if(!['NOT_USED_CLI_EVIDENCE','OBSERVED'].includes(values.browser_state)&&!(values.browser_state==='TEACHER_APPROVED_ALTERNATIVE'&&auth(values.source_class)))errors.push({id:'browser_state',message:'Declare observed browser use, the valid CLI evidence route or an explicitly authorised alternative.'});
 }

 return {ok:!errors.length,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const group=part(v.group),surname=part(v.surname),given=part(v.given);return group&&surname&&given?'TW2026_S05_'+group+'_'+surname+'_'+given+'.pdf':null;}
function pack(values,schema,provenance='USER_ENTERED_UNVERIFIED_DRAFT'){
 const keys=new Set(list(schema).map(f=>f.id));if(Object.keys(values).some(k=>!keys.has(k)))throw Error('Unknown export field.');
 for(const f of list(schema))if(!validType(f,values[f.id]))throw Error('Cannot export invalid or oversized field: '+f.id);
 return {schema:schema.schema,version:schema.version,savedAt:new Date().toISOString(),values:{...values},provenance};
}
root.S05Core={list,defaults,cleanImport,check,filename,pack};
if(typeof module!=='undefined')module.exports=root.S05Core;
})(globalThis);
