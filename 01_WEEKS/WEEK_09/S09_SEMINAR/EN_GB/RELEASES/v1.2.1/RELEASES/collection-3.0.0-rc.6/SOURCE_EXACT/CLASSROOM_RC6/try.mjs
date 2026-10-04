if(process.version!=="v24.21.0"){console.error("BLOCKED_RUNTIME_MISMATCH");process.exit(2);}
import{readFileSync}from"node:fs";
import {noteRoute} from "./student/p01.mjs";
import {applyRefresh} from "./student/p02.mjs";
import {deliveryLane} from "./student/p03.mjs";
const implementations={P01:noteRoute,P02:applyRefresh,P03:deliveryLane};const[id,path]=process.argv.slice(2);if(!Object.hasOwn(implementations,id)||!path){console.error("Use node CLASSROOM_RC6/try.mjs PROJECT_ID path-to-individual-fixture.json");process.exit(2);}try{const raw=readFileSync(path);if(raw.length>100000)throw Error("limit");const input=JSON.parse(raw.toString("utf8"));const before=JSON.stringify(input);const output=implementations[id](input);console.log(JSON.stringify({project:id,scope:"INDIVIDUAL_BOUNDED_CLASSROOM_CASE",input,actual_output:output,input_unchanged:JSON.stringify(input)===before,truth_authenticated:false},null,2));if(JSON.stringify(input)!==before)process.exitCode=1;}catch(e){console.error("CLASSROOM_CASE_FAILED: inspect your local synthetic input and implementation; no private error is copied");process.exit(1);}
