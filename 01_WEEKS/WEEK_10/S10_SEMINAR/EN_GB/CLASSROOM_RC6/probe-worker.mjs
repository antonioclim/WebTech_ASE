const [selector,...extra]=process.argv.slice(2);
if(extra.length||selector!=='P01-reference'){
  console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector}));process.exit(2);
}
try{
  const {workshopTransition}=await import('./student/p01.mjs');
  const input={state:{track:'web',savedIds:['kept'],sort:'title'},action:{type:'track/selected',track:'data'}};
  const before=JSON.stringify(input),savedBefore=JSON.stringify(input.state.savedIds),sortBefore=input.state.sort;
  const output=workshopTransition(input);
  if(output&&(typeof output==='object'||typeof output==='function')&&typeof output.then==='function'){
    throw Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');
  }
  const outputIsStateObject=Boolean(output&&typeof output==='object'&&!Array.isArray(output)&&
    Object.hasOwn(output,'track')&&Object.hasOwn(output,'savedIds')&&Array.isArray(output.savedIds)&&!output.error);
  console.log(JSON.stringify({scope:'SUPPLIED_UNRELATED_PROPERTY_MODEL_ONLY',inputBefore:JSON.parse(before),input,output,
    outputIsStateObject,unrelatedPropertyPreserved:outputIsStateObject&&output.sort===sortBefore,
    inputUnchanged:JSON.stringify(input)===before,inputSavedIdsUnchanged:JSON.stringify(input.state.savedIds)===savedBefore,
    frameworkReducerExecuted:false},null,2));
}catch(error){
  console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',classification:'EXECUTION_FAULT',probe:selector,
    name:error.name,reason:error.message==='TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT'?error.message:undefined,message:error.message}));
  process.exitCode=2;
}
