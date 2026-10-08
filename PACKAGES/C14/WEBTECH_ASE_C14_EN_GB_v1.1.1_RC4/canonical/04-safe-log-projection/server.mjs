import { fileURLToPath as rc9FileURLToPath } from "node:url";
import { resolve as rc9Resolve } from "node:path";
import express from"express";
export function createApp({write=event=>console.log(JSON.stringify(event)),clock=()=>new Date().toISOString()}={}){const app=express();app.use(express.json());app.use((req,res,next)=>{const started=performance.now();res.on("finish",()=>write({timestamp:clock(),level:"info",event:"http.response",requestId:req.get("x-request-id")??"missing",method:req.method,path:req.path,status:res.statusCode,durationMs:Math.round(performance.now()-started)}));next();});app.post("/login",(_req,res)=>res.status(401).json({error:"invalid_credentials"}));return app;}
if(process.argv[1]&&rc9Resolve(process.argv[1])===rc9FileURLToPath(import.meta.url))createApp().listen(3000,()=>console.log("Logging service: http://localhost:3000"));
