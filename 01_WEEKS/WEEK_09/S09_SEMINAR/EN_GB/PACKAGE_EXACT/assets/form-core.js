/* S09 pure form contract. No network, code evaluation or observation synthesis. */
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
 for(const f of list(s))if(f.phase==='core'||(mode==='final'&&f.phase==='final')){
  if(f.kind==='checkbox'?!v[f.id]:!v[f.id].trim())add(f.id,'Complete '+f.label.toLowerCase()+'.');
 }
 if(!filename(v))add('student_identity','Use GROUP | Surname | GivenName, with all three parts.');
 if(mode==='final'){
  const altExec=v.evidence_class.trim()==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  const altAI=v.gemini_mode==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  if(altExec&&!authorised(v,'execution'))add('teacher_exception','Record a separate prior execution authorisation and replacement evidence. This form cannot grant or authenticate it.');
  if(altAI&&!authorised(v,'gemini'))add('teacher_exception','Record the prior Gemini alternative and replacement evidence. Selecting an alternative does not approve it.');
  if(v.p01_completion!=='COMPLETE_RECORDED')add('p01_completion','The complete P01 task is required; retain a draft while it is unfinished.');
  if(!altExec){
   for(const k of ['REACT_TEST','HTTP_LOOPBACK','REAL_BROWSER'])if(!v.evidence_class.includes(k))add('evidence_class','The standard final record distinguishes actual '+k+' evidence. Models alone do not qualify the task.');
   for(const [id,categories]of [['p01_test_results',['BASELINE','OBJECTIVE','REGRESSION','BUILD']],['p03_qualification',['BASELINE','OBJECTIVE','REGRESSION','HTTP','BROWSER']]]){
    if(!v[id].includes('ACTUAL_RECORDED')||!categories.every(k=>new RegExp('\\b'+k+':\\s*PASS\\b').test(v[id])))add(id,'Record named actual results and evidence locators or retain a draft. P03 must not rebuild the supplied client.');
   }
  }
  for(const f of list(s))if((f.phase==='core'||f.phase==='final')&&f.kind!=='checkbox'&&!['environment_limit','pending_work'].includes(f.id)&&unresolved(v[f.id]))add(f.id,'Required evidence remains unresolved. Keep a draft.');
  if(!altAI&&v.gemini_mode!=='ACTUAL_RECORDED')add('gemini_mode','A genuine bounded exchange is required on the standard route.');
  if(!/^REQUIRED:\s*NONE\s*(?:\n|$)/.test(v.pending_work.trim()))add('pending_work','State REQUIRED: NONE only after P01, P03 and AI checks are complete; list separate capstone work on another line.');
  if(!['FINAL_CANDIDATE_NOT_YET_SAVED','LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT'].includes(v.pdf_status))add('pdf_status','Use the actual candidate/review state, not an invented Moodle receipt.');
 }
 return {ok:errors.length===0,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
}
function part(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(v){const bits=String(v.student_identity||'').split('|').map(part);return bits.length===3&&bits.every(Boolean)?'TW2026_S09_'+bits.join('_')+'.pdf':null;}
root.S09Core={list,defaults,validType,validateShape,pack,cleanImport,check,filename};
if(typeof module!=='undefined')module.exports=root.S09Core;
})(globalThis);
