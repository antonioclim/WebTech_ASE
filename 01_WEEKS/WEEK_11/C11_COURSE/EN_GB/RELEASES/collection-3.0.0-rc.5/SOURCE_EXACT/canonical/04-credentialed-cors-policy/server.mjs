import express from "express";
const allowedOrigins = new Set(["https://app.course.example", "https://admin.course.example"]);
export function createApp() { const app=express(); app.use((req,res,next)=>{const origin=req.get("origin");if(origin&&allowedOrigins.has(origin)){res.set("Access-Control-Allow-Origin",origin);res.set("Access-Control-Allow-Credentials","true");res.vary("Origin");}if(req.method==="OPTIONS"){res.set("Access-Control-Allow-Methods","GET");return res.sendStatus(204);}next();});app.get("/account",(_req,res)=>res.json({displayName:"Alice"}));return app; }
if(import.meta.url===`file://${process.argv[1]}`)createApp().listen(3000,()=>console.log("CORS service: http://localhost:3000"));
