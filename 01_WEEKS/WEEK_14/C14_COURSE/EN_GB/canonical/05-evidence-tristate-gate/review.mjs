import { fileURLToPath as rc9FileURLToPath } from "node:url";
import { resolve as rc9Resolve } from "node:path";
import{spawnSync}from"node:child_process";
const commandEvidence=(name,command,args,required)=>{const result=spawnSync(command,args,{encoding:"utf8"});return{name,state:result.error?"unknown":result.status===0?"pass":"fail",required,detail:result.error?.code??`exit ${result.status}`};};
export function collectEvidence({tlsReport}={}){return[commandEvidence("syntax",process.execPath,["--check",rc9FileURLToPath(new URL("./sample-app.mjs",import.meta.url))],true),commandEvidence("dependency-audit","missing-audit-tool",[],true),{name:"tls",state:tlsReport?"pass":"unknown",required:false,detail:tlsReport??"deployment-owned"}];}
export function gate(evidence){return{decision:evidence.some(item=>item.required&&item.state!=="pass")?"block":"pass",evidence};}
if(process.argv[1]&&rc9Resolve(process.argv[1])===rc9FileURLToPath(import.meta.url))console.table(gate(collectEvidence()).evidence);
