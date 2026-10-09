// Finite teaching observations. No oracle or complete assessed implementation.
const entries={'P01-reference':['./student/p01.mjs','recipientKey'],'P02-lifecycle':['./student/p02.mjs','jobTransition'],'P03-replay':['./student/p03.mjs','settleOwned']};
const[selector,...extra]=process.argv.slice(2);
if(extra.length||!Object.hasOwn(entries,selector)){console.error('UNKNOWN_TEACHING_PROBE');process.exit(2);}
const[module,name]=entries[selector],implementation=(await import(module))[name];
const observe=input=>{const before=JSON.stringify(input),actualOutput=implementation(input);if(actualOutput&&typeof actualOutput.then==='function')throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');return{actualOutput,inputUnchanged:JSON.stringify(input)===before};};
let observations;
if(selector==='P01-reference'){
 const inputs=[{principalId:'a',connectionId:'desk'},{principalId:'b',connectionId:'desk'},{principalId:'a:b',connectionId:'c'},{principalId:'a',connectionId:'b:c'},{principalId:' a ',connectionId:' desk '},{principalId:'\t ',connectionId:'desk'},{principalId:7,connectionId:'desk'},{principalId:'a"\\b',connectionId:'c'}];
 observations=inputs.map(input=>{const result=observe(input);return{input,...result,outputIsString:typeof result.actualOutput==='string'};});
}else if(selector==='P02-lifecycle'){
 const state={status:'active',progress:65,reportId:'sample'};
 const progress=[64,65,80,100,101,'80'].map(progress=>({event:{type:'progress',progress},...observe({state:{...state},event:{type:'progress',progress}})}));
 const first=observe({state:{...state},event:{type:'completed'}});
 const usable=first.actualOutput&&typeof first.actualOutput==='object'&&!Array.isArray(first.actualOutput)&&typeof first.actualOutput.status==='string'&&typeof first.actualOutput.progress==='number';
 const late=usable?observe({state:first.actualOutput,event:{type:'progress',progress:70}}):{status:'NOT_EXECUTED',reason:'No usable actual first state; no dependent snapshot fabricated'};
 observations={progress,firstCompletion:first,lateProgressUsingActualState:late};
}else{
 const pending=[{id:'A',type:'calculate',metadata:'keep'},{id:'B',type:'export'}],reply={requestId:'B',type:'export.completed',result:false};
 const wrong=observe({pending:pending.map(x=>({...x})),reply:{...reply,type:'calculate.completed'}});
 const first=observe({pending:pending.map(x=>({...x})),reply:{...reply}});
 const usable=first.actualOutput&&typeof first.actualOutput==='object'&&Array.isArray(first.actualOutput.pending);
 const replay=usable?observe({pending:first.actualOutput.pending,reply:{...reply}}):{status:'NOT_EXECUTED',reason:'No usable actual first.pending; no dependent snapshot fabricated'};
 observations={wrongType:wrong,firstCompletion:first,replayUsingActualPendingAndSameReply:replay};
}
console.log(JSON.stringify({probe:selector,scope:'CORE_FUNCTION_OBSERVATION',observations,limits:['No personal-case oracle or author authentication','No HTTP/WebSocket/Redis/BullMQ execution','No Promise/timer/abort/listener/socket-cleanup qualification'],implementationQualification:false},null,2));
