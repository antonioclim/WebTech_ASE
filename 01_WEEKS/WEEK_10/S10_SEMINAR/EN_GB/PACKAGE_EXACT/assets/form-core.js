/* S10 pure form contract. No network, code evaluation or observation synthesis. */
(function(root){'use strict';
const list=s=>s.sections.flatMap(x=>x.fields);
const defaults=s=>Object.fromEntries(list(s).map(f=>[f.id,f.default]));
const provenanceSet=new Set(['USER_ENTERED_UNVERIFIED_DRAFT','IMPORTED_UNVERIFIED_DRAFT']);
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
function validType(f,v){return f.kind==='checkbox'?typeof v==='boolean':typeof v==='string'&&v.length<=f.max&&(!f.options||f.options.includes(v));}
function validateShape(values,s){
 if(!plain(values))throw Error('Values must be a plain object.');
 const fs=list(s),keys=new Set(fs.map(f=>f.id));
 if(Object.keys(values).some(k=>!keys.has(k)))throw Error('Unknown field.');
 for(const f of fs)if(!Object.hasOwn(values,f.id)||!validType(f,values[f.id]))throw Error('Missing, oversized or invalid field: '+f.id);
}
function pack(values,s,provenance='USER_ENTERED_UNVERIFIED_DRAFT'){
 validateShape(values,s);if(!provenanceSet.has(provenance))throw Error('Invalid provenance.');
 return {schema:s.schema,version:s.version,savedAt:new Date().toISOString(),values:{...values},provenance};
}
function cleanImport(text,s){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>s.maxImportBytes)throw Error('Import exceeds the 2,000,000-byte limit or is not text.');
 let x;try{x=JSON.parse(text);}catch(_){throw Error('Malformed JSON.');}
 if(!plain(x)||x.schema!==s.schema||x.version!==s.version)throw Error('Unsupported schema/version.');
 if(Object.keys(x).some(k=>!['schema','version','savedAt','values','provenance'].includes(k)))throw Error('Unknown import property.');
 if(typeof x.savedAt!=='string'||x.savedAt.length>40||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x.savedAt)||!Number.isFinite(Date.parse(x.savedAt))||new Date(x.savedAt).toISOString()!==x.savedAt)throw Error('Invalid savedAt metadata.');
 if(!provenanceSet.has(x.provenance))throw Error('Invalid provenance metadata.');
 validateShape(x.values,s);
 const values={...x.values,declaration:false,pdf_review:'DRAFT_NOT_REVIEWED',submission_state:'DRAFT'};
 return {values,provenance:'IMPORTED_UNVERIFIED_DRAFT'};
}
function priorRecord(text,scope){
 const t=String(text||'');const m=t.match(/AUTHORISATION:\s*teacher=([^;\n]{2,100});\s*date=(\d{4}-\d{2}-\d{2});\s*scope=(execution|gemini|both);\s*reference=([^;\n]{3,200});\s*replacement=([\s\S]{20,})/);
 if(!m||!(m[3]===scope||m[3]==='both'))return false;
 const d=Date.parse(m[2]+'T00:00:00.000Z');return Number.isFinite(d)&&new Date(d).toISOString().slice(0,10)===m[2];
}
const unresolved=t=>/^(PENDING|NOT_EXECUTED|BLOCKED|FAIL|NOT_STARTED|IN_PROGRESS)(\b|_)/i.test(String(t).trim());
function check(v,s,mode){
 if(!['core','final'].includes(mode))throw Error('Unknown validation mode.');
 const errors=[];try{validateShape(v,s);}catch(e){return {ok:false,errors:[{id:'student_ref',message:e.message}],state:'INVALID_STRUCTURE'};}
 const add=(id,message)=>errors.push({id,message});
 for(const f of list(s))if(f.phase==='core'||(mode==='final'&&f.phase==='final')){
  if(f.kind==='checkbox'?!v[f.id]:!v[f.id].trim())add(f.id,'Complete '+f.label.toLowerCase()+'.');
 }
 if(!filename(v))add('student_ref','Enter a usable minimal student reference and group for the proposed filename.');
 if(mode==='final'){
  const altExec=v.evidence_class.trim()==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  const altAI=v.ai_route==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  if(altExec&&!priorRecord(v.environment,'execution'))add('environment','Record separate prior execution authorisation and replacement evidence. The form cannot grant or authenticate it.');
  if(altAI&&!priorRecord(v.ai_correction_limit,'gemini'))add('ai_correction_limit','Record separate prior Gemini authorisation and replacement evidence. The selector does not approve it.');
  if(v.p01_status!=='COMPLETE_RECORDED')add('p01_status','The complete P01 task is required. Retain a draft while it is unfinished.');
  if(v.adr_status!=='COMPLETE_RECORDED')add('adr_status','Complete the required ADR record, not necessarily the full comparator.');
  if(!altExec){
   for(const k of ['REACT_TEST','REAL_BROWSER'])if(!new RegExp('\\b'+k+'\\b').test(v.evidence_class))add('evidence_class','The standard final record distinguishes actual '+k+' evidence. Models alone are not enough.');
   if(!v.named_checks.includes('ACTUAL_RECORDED')||!['BASELINE','OBJECTIVE','REGRESSION','BUILD'].every(k=>new RegExp('\\b'+k+':\\s*PASS\\b').test(v.named_checks)))add('named_checks','Record named actual P01 results with locators or retain a draft.');
  }
  for(const f of list(s))if(['core','final'].includes(f.phase)&&f.kind!=='checkbox'&&!['environment','adr_limits','unfinished_work','extension_status'].includes(f.id)&&unresolved(v[f.id]))add(f.id,'Required record remains unresolved. Keep a draft.');
  if(!altAI&&v.ai_route!=='ACTUAL_RECORDED')add('ai_route','A genuine bounded Gemini exchange is required on the standard route.');
  if(!/^REQUIRED:\s*NONE\s*(?:\n|$)/.test(v.unfinished_work.trim()))add('unfinished_work','State REQUIRED: NONE only after required P01, ADR and critique work is complete. List optional work separately.');
  if(!['FINAL_CANDIDATE_NOT_YET_SAVED','LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT'].includes(v.pdf_review))add('pdf_review','Select the real candidate/review state. This cannot verify a saved PDF.');
 }
 return {ok:errors.length===0,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const g=part(v.group),s=part(v.student_ref);return g&&s?'TW2026_S10_'+g+'_'+s+'.pdf':null;}
root.S10Core={list,defaults,validType,validateShape,pack,cleanImport,check,filename};
if(typeof module!=='undefined')module.exports=root.S10Core;
})(globalThis);
