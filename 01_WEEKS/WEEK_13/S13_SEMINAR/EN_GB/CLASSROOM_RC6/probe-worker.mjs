// Finite teaching observations of the learner's actual functions, without a solution or personal-case oracle.
const entries={'P01-result':['./student/p01.mjs','acceptWorkerResult'],'P02-routing':['./student/p02.mjs','serviceWorkerLane'],'P03-generation':['./student/p03.mjs','trustedFrame']};
const [selector,...extra]=process.argv.slice(2);
if(extra.length||!Object.hasOwn(entries,selector)){console.error('UNKNOWN_TEACHING_PROBE');process.exit(2);}
const [module,name]=entries[selector],implementation=(await import(module))[name];
function snapshot(input){return JSON.stringify({input,replyOwnKeys:input.reply?Object.keys(input.reply):null,replyPrototypeResult:input.reply&&!Object.hasOwn(input.reply,'result')?Object.getPrototypeOf(input.reply)?.result:undefined});}
function observe(input){const before=snapshot(input),actualOutput=implementation(input);if(actualOutput&&(typeof actualOutput==='object'||typeof actualOutput==='function')&&typeof actualOutput.then==='function')throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');return{actualOutput,inputUnchanged:snapshot(input)===before};}
let observations;
if(selector==='P01-result'){
 const rows=[['own zero',{type:'analysis.completed',requestId:'A',result:0}],['own false',{type:'analysis.completed',requestId:'A',result:false}],['own null',{type:'analysis.completed',requestId:'A',result:null}],['own opaque',{type:'analysis.completed',requestId:'A',result:'opaque'}],['missing result',{type:'analysis.completed',requestId:'A'}],['inherited result',Object.assign(Object.create({result:0}),{type:'analysis.completed',requestId:'A'})],['stale ID',{type:'analysis.completed',requestId:'B',result:0}],['wrong type',{type:'analysis.progress',requestId:'A',result:0}]];
 observations=rows.map(([caseName,reply])=>({caseName,resultOwnership:Object.hasOwn(reply,'result')?'own':('result'in reply?'inherited':'absent'),visibleResult:reply.result,input:{currentId:'A',reply},...observe({currentId:'A',reply})}));
}else if(selector==='P02-routing'){
 const base={controlled:true,origin:'https://course.example',url:'https://course.example/api/tasks/t1',method:'GET'};
 const rows=[['current same-origin GET',{}],['uncontrolled',{controlled:false}],['foreign origin',{url:'https://other.example/api/tasks/t1'}],['origin suffix',{url:'https://course.example.attacker.invalid/api/tasks/t1'}],['POST',{method:'POST'}],['lowercase method',{method:'get'}],['missing ID',{url:'https://course.example/api/tasks/'}],['extra segment',{url:'https://course.example/api/tasks/t1/details'}]];
 observations=rows.map(([caseName,change])=>{const input={...base,...change};return{caseName,input,...observe(input)};});
}else{
 const registered={source:'frameA',origin:'https://a.example',generation:2},message={source:'frameA',origin:'https://a.example',generation:2,type:'fragment.ready',version:1};
 const rows=[['all fields current',{}],['wrong source',{source:'frameB'}],['wrong origin',{origin:'https://a.example.attacker.invalid'}],['stale generation',{generation:1}],['wrong type',{type:'fragment.progress'}],['numeric version mismatch',{version:2}],['string version',{version:'1'}]];
 observations=rows.map(([caseName,change])=>{const input={registered:{...registered},message:{...message,...change}};return{caseName,input,...observe(input)};});
}
console.log(JSON.stringify({probe:selector,scope:selector==='P01-result'?'CORE_FUNCTION_WITH_JAVASCRIPT_PROTOTYPE_OBSERVATION':'CORE_FUNCTION_OBSERVATION',observations,limits:['No personal-case oracle or author authentication','No native Worker, Service Worker, iframe, Window authentication or browser scheduling','JSON does not encode inherited properties; that row is created directly in JavaScript'],implementationQualification:false},null,2));
