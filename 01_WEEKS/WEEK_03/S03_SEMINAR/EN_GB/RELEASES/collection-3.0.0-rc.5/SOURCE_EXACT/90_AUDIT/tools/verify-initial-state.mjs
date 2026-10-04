import { runGate } from "../../02_PROJECTS/tools/gate.mjs";
const allow=process.env.TW_QA_ALLOW_RUNTIME_MISMATCH==="1";const reports=["P01","P02","P03"].map(project=>runGate(project,"initial",{allowMismatch:allow}));
console.log(JSON.stringify({schema:"S03_INITIAL_STATE_1",reports,verdict:reports.every(r=>r.verdict.startsWith("PASS_INITIAL_STARTER_SIGNATURE"))?"PASS_INITIAL_STATE":"STOP_INITIAL_STATE"},null,2));
process.exit(reports.every(r=>r.verdict.startsWith("PASS_INITIAL_STARTER_SIGNATURE"))?0:2);
