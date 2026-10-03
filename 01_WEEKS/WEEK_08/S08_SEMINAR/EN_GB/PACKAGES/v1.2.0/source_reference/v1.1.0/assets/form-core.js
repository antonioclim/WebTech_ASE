/* S08 pure form contract. No network, code evaluation or observation synthesis. */
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
 const values={...x.values,declaration:false,pdf_status:'DRAFT_NOT_REVIEWED'};
 return {values,provenance:'IMPORTED_UNVERIFIED_DRAFT'};
}
function authorised(v,scope){
 const t=v.teacher_exception||'';
 return /^AUTHORISATION:\s*teacher=.{2,100};\s*date=\d{4}-\d{2}-\d{2};\s*scope=(execution|gemini|both);\s*reference=.{3,200};\s*replacement=.{20,}/s.test(t)&&new RegExp('scope=('+scope+'|both);').test(t);
}
const unresolved=t=>/^(PENDING|NOT_EXECUTED|BLOCKED|FAIL|NOT_STARTED|IN_PROGRESS)(\b|_)/i.test(String(t).trim());
function check(v,s,mode){
 if(!['core','final'].includes(mode))throw Error('Unknown validation mode.');
 const errors=[];try{validateShape(v,s);}catch(e){return {ok:false,errors:[{id:'student_identity',message:e.message}],state:'INVALID_STRUCTURE'};}
 const add=(id,message)=>errors.push({id,message});
 for(const f of list(s))if((mode==='final'||f.phase==='core')&&(f.kind==='checkbox'?!v[f.id]:!v[f.id].trim()))add(f.id,'Complete '+f.label.toLowerCase()+'.');
 if(!filename(v))add('student_identity','Use GROUP | Surname | GivenName, with all three parts.');
 if(mode==='final'){
  const altExec=v.execution_class==='SEPARATELY_AUTHORISED_ALTERNATIVE',altAI=v.gemini_mode==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  if(altExec&&!authorised(v,'execution'))add('teacher_exception','Record a prior explicit execution authorisation and replacement evidence. The form cannot approve it.');
  if(altAI&&!authorised(v,'gemini'))add('teacher_exception','Record a prior explicit Gemini alternative authorisation and replacement evidence.');
  if(v.p01_completion!=='COMPLETE_RECORDED')add('p01_completion','Complete the full P01 obligation or keep a draft.');
  if(!altExec){
   if(v.execution_class!=='REACT_BROWSER')add('execution_class','The standard final route includes actual React tests and browser observations, not only a model.');
   for(const id of ['baseline_result','objective_result','regression_result','build_result','browser_result'])if(!/^ACTUAL_RECORDED:\s*PASS\b/.test(v[id]))add(id,'Use the actual command/observation, PASS result and evidence locator; otherwise preserve a draft.');
   if(!/ACTUAL_RECORDED/.test(v.p03_checks)||!['BASELINE','OBJECTIVE','REGRESSION','BUILD'].every(k=>new RegExp(k+':\\s*PASS\\b').test(v.p03_checks)))add('p03_checks','Record the four actual P03 result categories and locators; incomplete or failing work remains a draft.');
  }
  for(const id of ['p01_prediction','ownership_map','fixture','edit_boundary','transition_trace','persistence_trace','identity_trace','p01_diff','p03_prediction','p03_diagnostic','p03_patch','p03_timeline','p03_guards','p03_errors','independent_check','gemini_prompt','gemini_claim','learning_transfer','evidence_index'])if(unresolved(v[id]))add(id,'Required evidence or analysis remains unresolved; save a draft.');
  if(!altAI&&v.gemini_mode!=='ACTUAL_RECORDED')add('gemini_mode','Record a real bounded Gemini exchange. Synthetic practice is not an actual exchange.');
  if(v.pending_work.trim()!=='NONE')add('pending_work','Required work is still listed. Keep a draft; optional P02 is not a completion gate.');
  if(!['FINAL_CANDIDATE_NOT_YET_SAVED','LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT'].includes(v.pdf_status))add('pdf_status','Select the actual final-candidate/PDF-review state without asserting Moodle submission.');
 }
 return {ok:errors.length===0,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const bits=String(v.student_identity||'').split('|').map(part);return bits.length===3&&bits.every(Boolean)?'TW2026_S08_'+bits.join('_')+'.pdf':null;}
root.S08Core={list,defaults,validType,validateShape,pack,cleanImport,check,filename};
if(typeof module!=='undefined')module.exports=root.S08Core;
})(globalThis);
