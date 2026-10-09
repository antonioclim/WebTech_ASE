/* New C05 teaching derivations. No Express, network, assessed router or full P02 pipeline. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.C05Demos=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const scenarios=Object.freeze([
  {id:'route-list',title:'Route: collection with query',kind:'route',method:'GET',path:'/api/tasks?completed=true'},
  {id:'route-member',title:'Route: member identity',kind:'route',method:'GET',path:'/api/tasks/t-1'},
  {id:'route-post',title:'Route: intentional POST placeholder',kind:'route',method:'POST',path:'/api/tasks'},
  {id:'route-unmatched',title:'Route: unsupported collection DELETE',kind:'route',method:'DELETE',path:'/api/tasks'},
  {id:'json-valid',title:'Boundary: normalise a valid title',kind:'body',media:'application/json',raw:'{"title":"  Read the contract  "}'},
  {id:'json-array',title:'Boundary: parsed array',kind:'body',media:'application/json',raw:'[]'},
  {id:'json-primitive',title:'Boundary: valid JSON primitive',kind:'body',media:'application/json',raw:'null'},
  {id:'json-malformed',title:'Boundary: invalid JSON syntax',kind:'body',media:'application/json',raw:'{"title":'},
  {id:'json-blank',title:'Boundary: blank string',kind:'body',media:'application/json',raw:'{"title":"  "}'},
  {id:'json-number',title:'Boundary: number is not a title',kind:'body',media:'application/json',raw:'{"title":42}'},
  {id:'json-extra',title:'Boundary: unknown field',kind:'body',media:'application/json',raw:'{"title":"Read","extra":true}'},
  {id:'media-text',title:'Boundary: unsupported media',kind:'body',media:'text/plain',raw:'{"title":"Read"}'},
  {id:'promise-returned',title:'Returned promise: owned rejection',kind:'promise'},
  {id:'response-no-content',title:'Contract checker: content with 204',kind:'response',status:204,body:'{}'}
 ]);
 function bodyModel(media,raw){
  // This models a selected policy on a fixed fixture, not the full Express parser.
  if(media!=='application/json')return {stage:'media',decision:'rejected',reason:'media_not_accepted_by_model'};
  let value;try{value=JSON.parse(raw);}catch(_){return {stage:'syntax',decision:'rejected',reason:'invalid_JSON_syntax'};}
  if(value===null||typeof value!=='object')return {stage:'strict-parser-policy',decision:'rejected',reason:'valid_primitive_rejected_by_model_policy'};
  if(Array.isArray(value))return {stage:'application-shape',decision:'rejected',reason:'array_not_title_object'};
  if(Object.keys(value).some(k=>k!=='title'))return {stage:'fields',decision:'rejected',reason:'unknown_field'};
  if(typeof value.title!=='string'||value.title.trim()==='')return {stage:'title',decision:'rejected',reason:'nonblank_string_required'};
  return {stage:'normalisation',decision:'accepted',normalised:{title:value.title.trim()}};
 }
 function routeModel(method,target){
  const [path,query='']=target.split('?');const input={method,pathname:path,query};
  if(path==='/api/tasks'&&method==='GET')return {...input,selected:'collection',note:'Example02 query conversion is permissive, not strict validation.'};
  if(path==='/api/tasks'&&method==='POST')return {...input,selected:'placeholder',sourceExpectedStatus:501};
  if(/^\/api\/tasks\/[^/]+$/.test(path)&&method==='GET')return {...input,selected:'member',member:path.split('/').pop()};
  return {...input,selected:'example02_fallback',sourceExpectedStatus:404};
 }
 function timing(start,commit,terminal,event){
  if(![start,terminal].every(Number.isFinite)||!(commit===null||Number.isFinite(commit)))throw new TypeError('Finite clock values required');
  if(!['finish','close-before-commit'].includes(event))throw new TypeError('Unknown terminal model');
  if(event==='finish'&&commit===null)throw new TypeError('Finish scenario needs a commit');
  if(event==='close-before-commit'&&commit!==null)throw new TypeError('Pre-commit close cannot have a commit');
  if(terminal<start||(commit!==null&&(commit<start||terminal<commit)))throw new RangeError('Use nondecreasing model instants');
  const captured=Math.max(0,(commit===null?terminal:commit)-start);
  return {evidenceClass:'TEACHING_MODEL',capturedDurationMs:captured,elapsedToTerminalMs:terminal-start,committedTimingHeader:commit===null?null:String(captured),terminalRecordCount:1,outcome:event==='finish'?'completed':'aborted',limit:'Illustrative calculation only. Not the reference pipeline, a measured clock or HTTP.'};
 }
 async function run(id){
  const s=scenarios.find(x=>x.id===id);if(!s)throw new RangeError('Unknown scenario');let result;
  if(s.kind==='route')result=routeModel(s.method,s.path);
  else if(s.kind==='body')result=bodyModel(s.media,s.raw);
  else if(s.kind==='response')result={decision:s.status===204&&s.body!==''?'contract_violation':'not_rejected_by_this_check',status:s.status,body:s.body,scope:'One declared no-content rule, not an HTTP implementation.'};
  else {const trace=[];async function service(){throw new Error('synthetic');}async function handler(){return await service();}try{await handler();}catch(_){trace.push('caller observed returned rejection');}result={trace,scope:'JavaScript promise ownership, no Express dispatch.'};}
  return {scenario:s.id,evidenceClass:'TEACHING_MODEL',input:s,result,limit:'Current local derivation only. Not Express, HTTP, the assessed Task API or a full P02 solution.'};
 }
 return Object.freeze({scenarios,run,timing,bodyModel,routeModel});
});
