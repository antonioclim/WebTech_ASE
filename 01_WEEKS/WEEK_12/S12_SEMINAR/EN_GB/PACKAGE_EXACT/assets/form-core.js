/* S12 pure form contract: no network, execution or evidence synthesis. */
(function(root){'use strict';
const list=s=>s.sections.flatMap(x=>x.fields), defaults=s=>Object.fromEntries(list(s).map(f=>[f.id,f.default]));
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
const validType=(f,v)=>f.kind==='checkbox'?typeof v==='boolean':typeof v==='string'&&v.length<=f.max&&(!f.options||f.options.includes(v));
function validateShape(v,s){if(!plain(v))throw Error('Values must be a plain object.');const fs=list(s),ids=new Set(fs.map(f=>f.id));if(Object.keys(v).some(k=>!ids.has(k)))throw Error('Unknown field.');for(const f of fs)if(!Object.hasOwn(v,f.id)||!validType(f,v[f.id]))throw Error('Missing, oversized or invalid field: '+f.id);}
function pack(v,s,provenance='USER_ENTERED_UNVERIFIED_DRAFT'){validateShape(v,s);if(!['USER_ENTERED_UNVERIFIED_DRAFT','IMPORTED_UNVERIFIED_DRAFT'].includes(provenance))throw Error('Invalid provenance.');return {schema:s.schema,version:s.version,savedAt:new Date().toISOString(),values:{...v},provenance};}
function cleanImport(text,s){if(typeof text!=='string'||new TextEncoder().encode(text).length>s.maxImportBytes)throw Error('Import exceeds the byte limit or is not text.');let x;try{x=JSON.parse(text);}catch{throw Error('Malformed JSON.');}if(!plain(x)||x.schema!==s.schema||x.version!==s.version)throw Error('Unsupported schema/version.');if(Object.keys(x).some(k=>!['schema','version','savedAt','values','provenance'].includes(k)))throw Error('Unknown import property.');if(typeof x.savedAt!=='string'||new Date(x.savedAt).toISOString()!==x.savedAt)throw Error('Invalid savedAt.');validateShape(x.values,s);const v={...x.values,privacy_redaction:false,declaration_truthful:false,pdf_review_status:'',submission_status:'',final_status:''};return {values:v,provenance:'IMPORTED_UNVERIFIED_DRAFT'};}
const unresolved=x=>/^(NOT_EXECUTED|PENDING|BLOCKED|FAIL|NOT_STARTED|IN_PROGRESS)(\b|_)/i.test(String(x||'').trim());
function filename(v){const p=String(v.student_code||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,50);return p?'TW2026_S12_'+p+'.pdf':null;}
function check(v,s,mode){if(!['core','final'].includes(mode))throw Error('Unknown mode.');const errors=[];try{validateShape(v,s);}catch(e){return {ok:false,errors:[{id:'student_code',message:e.message}],state:'INVALID_STRUCTURE'};}const add=(id,m)=>errors.push({id,message:m});for(const f of list(s)){if(f.phase==='core'||mode==='final'){if(f.kind==='checkbox'?!v[f.id]:!String(v[f.id]).trim())add(f.id,'Complete '+f.label.toLowerCase()+'.');}}
if(!filename(v))add('student_code','Enter a usable student code or approved alias.');
if(mode==='final'){
 if(v.p03_changed_path!=='student/src/request-dispatcher.mjs')add('p03_changed_path','Use the actual assessed .mjs path.');
 for(const id of ['p03_baseline_results','p03_objective_results','p03_regression_results','p03_integration_results','p03_reversed_order_trace','p03_sync_reply_trace','p03_timeout_trace','p03_abort_trace','p03_close_trace','p03_dispose_trace','p03_zero_pending','p03_zero_listeners_timers','p01_http_acceptance','p01_ws_registration','p01_targeted_result','p01_identity_binding','p01_cleanup_observation','gemini_response_excerpt','gemini_independent_check','gemini_verdict_correction']) if(unresolved(v[id])) add(id,'Required evidence remains unresolved; keep a draft.');
 if(v.pdf_review_status!=='FINAL_REVIEWED')add('pdf_review_status','Review the actual final PDF before final status.');
 if(!['READY_NOT_SUBMITTED','SUBMITTED_UNVERIFIED'].includes(v.submission_status))add('submission_status','Record the real readiness/submission state.');
 if(v.final_status!=='FINAL_FIELDS_COMPLETE_NOT_VERIFIED')add('final_status','Use final structural status only after the required fields are complete.');
 if(!v.privacy_redaction)add('privacy_redaction','Confirm redaction.');if(!v.declaration_truthful)add('declaration_truthful','Confirm truthful evidence.');
}
return {ok:errors.length===0,errors,state:errors.length?'INCOMPLETE':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};}
root.S12Core={list,defaults,validType,validateShape,pack,cleanImport,check,filename};if(typeof module!=='undefined')module.exports=root.S12Core;})(globalThis);
