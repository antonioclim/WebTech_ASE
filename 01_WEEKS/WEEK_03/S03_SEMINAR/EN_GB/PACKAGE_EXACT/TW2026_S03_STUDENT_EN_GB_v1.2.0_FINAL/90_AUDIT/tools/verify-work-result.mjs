import { runGate } from "../../02_PROJECTS/tools/gate.mjs";
const allow=process.env.TW_QA_ALLOW_RUNTIME_MISMATCH==="1";const projects=process.argv.slice(2).length?process.argv.slice(2):["P01","P03"];
const reports=projects.map(project=>runGate(project,"complete",{allowMismatch:allow}));
const ok=reports.every(r=>r.verdict.startsWith("PASS_COMPLETE_CANONICAL_CHECKS"));console.log(JSON.stringify({schema:"S03_WORK_RESULT_1",projects,reports,verdict:ok?"PASS_WORK_RESULT":"STOP_WORK_RESULT"},null,2));process.exit(ok?0:2);
