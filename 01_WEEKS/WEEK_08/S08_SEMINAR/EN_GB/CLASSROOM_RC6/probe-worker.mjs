// Protected worker for the owned bounded public PROBE.mjs command.
const probes = {
  "P01-reference": async () => {
    const {queueAdd}=await import("./student/p01.mjs"); const input={items:[{id:'keep-1',title:'Existing',read:true}],title:' New title ',id:'new-2'}; const before=JSON.stringify(input); const output=queueAdd(input); console.log(JSON.stringify({output,outputIsArray:Array.isArray(output),newArray:Array.isArray(output)&&output!==input.items,inputUnchanged:JSON.stringify(input)===before},null,2));
  }
};
const [selector,...extra]=process.argv.slice(2);if(extra.length||!Object.keys(probes).includes(selector)){console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector}));process.exit(2);}try{await probes[selector]();}catch(error){console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',classification:'EXECUTION_FAULT',probe:selector,name:error.name,message:error.message}));process.exitCode=2;}
