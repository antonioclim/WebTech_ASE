import express from "express";
import initSqlJs from "sql.js";

const escapeHtml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
function safeHttpUrl(value) { try { const url=new URL(value); return ["http:","https:"].includes(url.protocol) ? url.href : "/images/default.png"; } catch { return "/images/default.png"; } }

export async function createApp() {
  const SQL=await initSqlJs(); const db=new SQL.Database(); db.run("CREATE TABLE profiles (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO profiles VALUES (1, 'Alice'), (2, 'Mallory');");
  const app=express();
  app.get("/search",(req,res)=>{const statement=db.prepare("SELECT id, name FROM profiles WHERE name LIKE ?");statement.bind([`%${req.query.q??""}%`]);const rows=[];while(statement.step())rows.push(statement.getAsObject());statement.free();res.json(rows);});
  app.get("/card",(req,res)=>{const name=escapeHtml(req.query.name??"Anonymous");const avatar=escapeHtml(safeHttpUrl(req.query.avatar??""));res.type("html").send(`<article><img src="${avatar}" alt=""><p>${name}</p></article>`);});
  return app;
}
if(import.meta.url===`file://${process.argv[1]}`)(await createApp()).listen(3000,()=>console.log("Security-context service: http://localhost:3000"));
