// Protected worker for the bounded public PROBE.mjs command.
const probes = {
  "P01-boundary": async () => {
    const {taskBody}=await import("./targets/p01.mjs"); try { console.log(taskBody({title:"Review",completed:false,role:"admin"})); } catch(error) { console.log({name:error.name}); }
  },
  "P02-boundary": async () => {
    const {terminalLogger}=await import("./targets/p02.mjs"); const logs=[]; const end=terminalLogger({id:"N8",start:20,clock:()=>29,logger:row=>logs.push(row)}); end(204); end(500); end(499); console.log(JSON.stringify(logs,null,2));
  },
  "P03-boundary": async () => {
    const {publicOutcome}=await import("./targets/p03.mjs"); console.log(JSON.stringify(publicOutcome({kind:"database_fault",message:"SYNTHETIC_PRIVATE_DETAIL"}),null,2));
  }
};
const [selector,...extra]=process.argv.slice(2);
if(extra.length||!Object.keys(probes).includes(selector)){console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector,available:Object.keys(probes)}));process.exit(2);}
try{await probes[selector]();}catch(error){console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',probe:selector,name:error.name,message:error.message,classification:'EXECUTION_FAULT'}));process.exitCode=2;}
