import { fileURLToPath as rc9FileURLToPath } from "node:url";
import { resolve as rc9Resolve } from "node:path";
import express from"express";
export const normalizeTitle=value=>{const title=String(value??"").trim();if(!title)throw new Error("title_required");return title;};
export function createRepository(){const rows=[];return{insert(task){const saved={id:String(rows.length+1),...task};rows.push(saved);return saved;},all(){return rows.map(row=>({...row}));}};}
export function createApp(repository){const app=express();app.use(express.json());app.post("/tasks",(req,res)=>{try{const task=repository.insert({title:normalizeTitle(req.body?.title)});res.location(`/tasks/${task.id}`).status(201).json(task);}catch{res.status(400).json({error:"invalid_task"});}});return app;}
if(process.argv[1]&&rc9Resolve(process.argv[1])===rc9FileURLToPath(import.meta.url))createApp(createRepository()).listen(3000,()=>console.log("Layered-test service: http://localhost:3000"));
