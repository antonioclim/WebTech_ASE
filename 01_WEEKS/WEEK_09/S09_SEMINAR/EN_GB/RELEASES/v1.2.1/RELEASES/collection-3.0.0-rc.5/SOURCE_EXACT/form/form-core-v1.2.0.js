/* NEW S09 v1.2.0 data-only form logic. No project execution or evidence synthesis. */
(function(root){'use strict';
const list=s=>s.sections.flatMap(section=>section.fields);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const defaults=s=>Object.fromEntries(list(s).map(f=>[f.id,f.default]));
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&[null,Object.prototype].includes(Object.getPrototypeOf(o));
const forbidden=new Set(['__proto__','prototype','constructor']);
function strictJSON(text,s){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>s.maxImportBytes)throw Error('Import exceeds 5,000,000 bytes or is not text.');
 let i=0,nodes=0;
 const fail=message=>{throw Error(message+' at character '+i+'.');};
 const space=()=>{while(/[\x20\t\r\n]/.test(text[i]||'\0'))i++;};
 function string(){const start=i++;while(i<text.length){const ch=text[i++];if(ch==='"'){try{return JSON.parse(text.slice(start,i));}catch(_){fail('Invalid JSON string');}}if(ch==='\\'){if(i>=text.length)fail('Unfinished escape');i++;}else if(ch.charCodeAt(0)<32)fail('Control character in string');}fail('Unfinished string');}
 function value(depth){
  if(depth>s.maxDepth)fail('Import nesting is too deep');if(++nodes>s.maxNodes)fail('Too many JSON values');space();const ch=text[i];
  if(ch==='"')return string();
  if(ch==='{'){
   i++;space();const out=Object.create(null),keys=new Set();if(text[i]==='}'){i++;return out;}
   while(i<text.length){if(text[i]!=='"')fail('Expected an object key');const key=string();if(key.length>128||forbidden.has(key))fail('Forbidden or oversized key');if(keys.has(key))fail('Duplicate object key');keys.add(key);if(keys.size>s.maxKeysPerObject)fail('Too many object keys');space();if(text[i++]!==':')fail('Expected colon');out[key]=value(depth+1);space();const end=text[i++];if(end==='}')return out;if(end!==',')fail('Expected comma or closing brace');space();}fail('Unfinished object');
  }
  if(ch==='['){i++;space();const out=[];if(text[i]===']'){i++;return out;}while(i<text.length){out.push(value(depth+1));space();const end=text[i++];if(end===']')return out;if(end!==',')fail('Expected comma or closing bracket');space();}fail('Unfinished array');}
  for(const [token,result]of [['true',true],['false',false],['null',null]])if(text.slice(i,i+token.length)===token){i+=token.length;return result;}
  const match=text.slice(i).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);if(match){i+=match[0].length;const number=Number(match[0]);if(!Number.isFinite(number))fail('Non-finite number');return number;}fail('Invalid JSON value');
 }
 const result=value(0);space();if(i!==text.length)fail('Trailing JSON data');return result;
}
function exactKeys(object,keys){if(!plain(object)||Object.keys(object).length!==keys.length||keys.some(k=>!own(object,k)))throw Error('Unknown or missing properties.');}
function validValue(field,value){
 if(field.kind==='checkbox')return typeof value==='boolean';
 if(typeof value!=='string'||value.length>field.max)return false;
 if(field.kind==='readonly_text')return value===field.default;
 return !field.options||field.options.includes(value);
}
function validateValues(values,s){const fields=list(s);exactKeys(values,fields.map(f=>f.id));for(const field of fields)if(!validValue(field,values[field.id]))throw Error('Invalid type, length or option for '+field.id+'.');return true;}
function metadata(record,s,legacy){
 exactKeys(record,['schema','version','savedAt','values','provenance']);
 const expected=legacy?s.legacyMigration:s;
 if(record.schema!==expected.schema||record.version!==expected.version)throw Error(legacy?'Only an exact v1.1.0 draft can use migration.':'Unsupported schema/version. Use the separate v1.1.0 migration control for an old draft.');
 if(typeof record.savedAt!=='string'||record.savedAt.length!==24||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.savedAt)||!Number.isFinite(Date.parse(record.savedAt))||new Date(record.savedAt).toISOString()!==record.savedAt)throw Error('Invalid savedAt metadata.');
 if(!expected.provenanceOptions.includes(record.provenance))throw Error('Invalid provenance metadata.');
}
function importDraft(text,s,legacy=false){
 const record=strictJSON(text,s);metadata(record,s,legacy);const fresh=defaults(s);
 if(legacy){const entries=Object.entries(s.legacyMigration.fields);exactKeys(record.values,entries.map(([id])=>id));for(const [id,field]of entries){if(!validValue(field,record.values[id]))throw Error('Invalid legacy value for '+id+'.');fresh[id]=record.values[id];}}
 else {validateValues(record.values,s);for(const field of list(s))fresh[field.id]=record.values[field.id];}
 fresh.declaration=false;fresh.privacy_check=false;fresh.pdf_status='DRAFT_NOT_REVIEWED';
 validateValues(fresh,s);
 return {values:fresh,provenance:legacy?'MIGRATED_UNVERIFIED_DRAFT':'IMPORTED_UNVERIFIED_DRAFT',review:'NOT_REVIEWED',submission:'NOT_OBSERVED'};
}
function pack(values,s,provenance){validateValues(values,s);if(!s.provenanceOptions.includes(provenance))throw Error('Invalid provenance.');return {schema:s.schema,version:s.version,savedAt:new Date().toISOString(),values:{...values},provenance};}
function part(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^[_ .]+|[_ .]+$/g,'').slice(0,45);}
function filename(values){const parts=String(values.student_identity||'').split('|').map(part);return parts.length===3&&parts.every(Boolean)?'TW2026_S09_'+parts.join('_')+'.pdf':null;}
function check(values,s,mode){
 if(!['core','record','candidate'].includes(mode))throw Error('Unknown record check.');
 const errors=[];try{validateValues(values,s);}catch(error){return {ok:false,state:'INVALID_RECORD_STRUCTURE',errors:[{id:'student_identity',message:error.message}]};}
 const add=(id,message)=>errors.push({id,message});
 const pendingAI=['','PENDING','NOT_EXECUTED','BLOCKED'].includes(values.gemini_mode);
 for(const field of list(s)){
  let required=mode==='core'?field.requiredCore:mode==='record'?field.requiredRecord:false;
  if(pendingAI&&['gemini_prompt','gemini_claim','independent_check','gemini_verdict','correction_limit'].includes(field.id))required=false;
  if(field.id==='teacher_exception')required=mode==='record'&&values.gemini_mode==='SEPARATELY_AUTHORISED_ALTERNATIVE';
  if(required&&(field.kind==='checkbox'?!values[field.id]:!values[field.id].trim()))add(field.id,'Record '+field.label.toLowerCase()+' or a truthful pending status.');
 }
 if(!filename(values))add('student_identity','Use GROUP | Surname | Firstname with all three parts.');
 if(mode==='candidate'){
  if(!values.privacy_check)add('privacy_check','Complete the personal privacy review before the first PDF candidate.');
  if(!values.declaration)add('declaration','Review and renew your personal accuracy declaration.');
  if(!values.pre_export_checklist.trim())add('pre_export_checklist','Record the pre-export checks. Do not claim saved-file review or Moodle submission yet.');
 }
 return {ok:errors.length===0,errors,state:errors.length?'RECORD_FIELDS_PENDING':mode==='core'?'CORE_DRAFT_FIELDS_COMPLETE':mode==='record'?'RECORD_FIELDS_COMPLETE_NOT_TECHNICALLY_QUALIFIED':'FIRST_PDF_PRECONDITIONS_RECORDED_NOT_SAVED'};
}
root.S09FormCore={list,defaults,strictJSON,validValue,validateValues,importDraft,pack,filename,check};
})(globalThis);
