import React,{useState} from "react";
import {queueAdd} from "../student/p01.mjs";
import {capacityView} from "../student/p02.mjs";
import {mayPublish} from "../student/p03.mjs";
import cases from "../support/cases.json";
const implementations={P01:queueAdd,P02:capacityView,P03:mayPublish};
export function MicroprojectPlayer({projectId}) {
 const c=cases.find(x=>x.project_id===projectId); const [selected,setSelected]=useState(0);const [result,setResult]=useState("NOT_RUN");const [error,setError]=useState("");
 function run(){try{const input=structuredClone(c.inputs[selected]);const output=implementations[projectId](input);setResult(JSON.stringify(output));setError("");}catch(e){setError("CLASSROOM_ACTION_FAILED");setResult("FAILED");}}
 return <section><h2>{projectId} bounded experiment</h2><label>Fixture for {projectId}<select aria-label={"Fixture "+projectId} value={selected} onChange={e=>{setSelected(Number(e.target.value));setResult("NOT_RUN");setError("");}}>{c.inputs.map((x,i)=><option key={i}value={i}>Case {i+1}</option>)}</select></label><pre>{JSON.stringify(c.inputs[selected],null,2)}</pre><button type="button"onClick={run}>{"Run "+projectId}</button><output aria-label={"Result "+projectId}>{result}</output><p role="status">{error}</p></section>;
}
export default function App(){return <main><h1>Individual classroom experiment</h1><p>Supplied React shell, student-authored bounded functions. This is not the retained full application. Write your prediction before each action.</p>{cases.map(c=><MicroprojectPlayer key={c.project_id}projectId={c.project_id}/>)}</main>;}
