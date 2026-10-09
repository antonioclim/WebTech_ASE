import {openSync,fstatSync,readSync,closeSync,constants} from 'node:fs';
const implementations={P01:['./student/p01.mjs','acceptWorkerResult'],P02:['./student/p02.mjs','serviceWorkerLane'],P03:['./student/p03.mjs','trustedFrame']},[id,path,...extra]=process.argv.slice(2);
if(extra.length||!Object.hasOwn(implementations,id)||!path){console.error('INVALID_PROTECTED_TRY_WORKER_ARGUMENTS');process.exit(2);}
function readFixture(file){const descriptor=openSync(file,constants.O_RDONLY|(constants.O_NONBLOCK||0));try{const stat=fstatSync(descriptor);if(!stat.isFile())throw Error('FIXTURE_NOT_REGULAR_FILE');if(stat.size>100000)throw Error('FIXTURE_SIZE_LIMIT');const bytes=Buffer.alloc(100001);let length=0;while(length<bytes.length){const count=readSync(descriptor,bytes,length,bytes.length-length,null);if(count===0)break;length+=count;}if(length>100000)throw Error('FIXTURE_SIZE_LIMIT');return bytes.subarray(0,length);}finally{closeSync(descriptor);}}
let phase='FIXTURE_READ';
try {
 const raw=readFixture(path);
 phase='JSON_PARSE';
 const input=JSON.parse(raw.toString('utf8')),before=JSON.stringify(input),[module,name]=implementations[id];
 phase='TARGET_IMPORT';const implementation=(await import(module))[name];
 if(typeof implementation!=='function')throw Error('TARGET_EXPORT_MISSING');
 phase='TARGET_CALL';const output=implementation(input);
 if(output&&(typeof output==='object'||typeof output==='function')&&typeof output.then==='function')throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');
 phase='OUTPUT_SERIALISATION';console.log(JSON.stringify({project:id,scope:'INDIVIDUAL_BOUNDED_CLASSROOM_CASE',input,actual_output:output,input_unchanged:JSON.stringify(input)===before,truth_authenticated:false},null,2));
 if(JSON.stringify(input)!==before)process.exitCode=1;
}catch(error){console.error(JSON.stringify({status:'CLASSROOM_CASE_FAILED',classification:'INPUT_OR_TARGET_EXECUTION_FAULT',phase,name:error.name,reason:['FIXTURE_SIZE_LIMIT','FIXTURE_NOT_REGULAR_FILE','TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT'].includes(error.message)?error.message:phase==='FIXTURE_READ'&&['ENOENT','EACCES','EPERM','EISDIR','EMFILE','ENFILE'].includes(error.code)?error.code:phase==='JSON_PARSE'?'INVALID_JSON_INPUT':'Inspect the named phase of your local synthetic input and implementation; no private error detail is copied'}));process.exitCode=1;}
