import http from "node:http";
import express from "express";
import { WebSocketServer } from "ws";

export function createService() {
  const app=express(); const server=http.createServer(app); const sockets=new Set(); let status="running"; let pollCount=0;
  app.get("/jobs/1",(_req,res)=>{pollCount+=1;res.json({id:"1",status});});
  const wss=new WebSocketServer({server,path:"/jobs/1/events"});
  wss.on("connection",socket=>{sockets.add(socket);socket.send(JSON.stringify({id:"1",status}));socket.on("close",()=>sockets.delete(socket));});
  function complete(){status="completed";for(const socket of sockets)socket.send(JSON.stringify({id:"1",status}));}
  return {server,complete,metrics:()=>({pollCount,connections:sockets.size}),close:()=>new Promise(resolve=>wss.close(()=>server.close(resolve)))};
}
if(import.meta.url===`file://${process.argv[1]}`){const service=createService();service.server.listen(3000,()=>console.log("Polling and push service: http://localhost:3000"));setTimeout(service.complete,3000);}
