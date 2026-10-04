import assert from 'node:assert/strict';
import express from 'express';
import { DataTypes, Op, Sequelize } from 'sequelize';
const sequelize=new Sequelize({dialect:'sqlite',storage:':memory:',logging:false});
const Session=sequelize.define('Session',{title:{type:DataTypes.STRING,allowNull:false},level:{type:DataTypes.ENUM('beginner','advanced'),allowNull:false},startsAt:{type:DataTypes.DATE,allowNull:false}},{timestamps:false});
await sequelize.sync({force:true});
await Session.bulkCreate([
 {title:'CSS',level:'beginner',startsAt:'2026-03-01T09:00:00Z'},
 {title:'HTTP',level:'beginner',startsAt:'2026-03-01T09:00:00Z'},
 {title:'SQL',level:'advanced',startsAt:'2026-03-01T10:00:00Z'},
 {title:'Transactions',level:'advanced',startsAt:'2026-03-01T11:00:00Z'},
 {title:'CSS',level:'advanced',startsAt:'2026-03-01T09:00:00Z'}]);
const sorts={starts_asc:'startsAt',title_asc:'title'};
const app=express();
app.get('/api/sessions',async(req,res,next)=>{
 try {
  const limit=Number(req.query.limit??2),sort=req.query.sort??'starts_asc',level=req.query.level??null;
  if(!Number.isInteger(limit)||limit<1||limit>20||!Object.hasOwn(sorts,sort)|| (level!==null&&!['beginner','advanced'].includes(level)))return res.status(400).json({error:'invalid query'});
  const key=sorts[sort];let after=null;
  if(req.query.cursor!==undefined){
   if(typeof req.query.cursor!=='string'||req.query.cursor.length>2048)return res.status(400).json({error:'invalid cursor'});
   try{after=JSON.parse(Buffer.from(req.query.cursor,'base64url').toString('utf8'));}catch{return res.status(400).json({error:'invalid cursor'});}
   if(!after||after.schema!==1||after.sort!==sort||after.level!==level||!Number.isSafeInteger(after.id)||after.id<1||typeof after.value!=='string'|| (key==='startsAt'&&!Number.isFinite(Date.parse(after.value))))return res.status(400).json({error:'cursor context mismatch'});
  }
  if(req.query.afterId!==undefined)return res.status(400).json({error:'use the composite cursor'});
  const where=level?{level}:{};
  if(after){const value=key==='startsAt'?new Date(after.value):after.value;where[Op.or]=[{[key]:{[Op.gt]:value}},{[key]:value,id:{[Op.gt]:after.id}}];}
  const fetched=await Session.findAll({where,order:[[key,'ASC'],['id','ASC']],limit:limit+1});
  const rows=fetched.slice(0,limit),last=rows.at(-1);
  const cursor=fetched.length>limit?Buffer.from(JSON.stringify({schema:1,sort,level,id:last.id,value:key==='startsAt'?last.startsAt.toISOString():last.title})).toString('base64url'):null;
  res.json({data:rows,page:{next:cursor}});
 }catch(error){next(error);}
});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
try{
 for(const sort of Object.keys(sorts))for(const level of [null,'beginner','advanced'])for(const limit of [1,2]){
  const expected=(await Session.findAll({where:level?{level}:{},order:[[sorts[sort],'ASC'],['id','ASC']]})).map(x=>x.id);
  const found=[];let cursor=null;let iterations=0;
  do{assert(++iterations<=expected.length+1,'pagination must terminate');const q=new URLSearchParams({sort,limit:String(limit),...(level?{level}:{}),...(cursor?{cursor}:{})});const response=await fetch(`${base}/api/sessions?${q}`);assert.equal(response.status,200);const page=await response.json();found.push(...page.data.map(x=>x.id));cursor=page.page.next;}while(cursor);
  assert.deepEqual(found,expected,`complete, ordered, no duplicate pagination: ${sort}/${level}/${limit}`);
 }
 const page=await(await fetch(`${base}/api/sessions?limit=1&sort=title_asc`)).json();
 for(const suffix of ['sort=starts_asc','sort=title_asc&level=advanced'])assert.equal((await fetch(`${base}/api/sessions?cursor=${page.page.next}&${suffix}`)).status,400);
 for(const query of ['sort=id_desc','limit=0','limit=1.5','level=other','cursor=broken','afterId=2'])assert.equal((await fetch(`${base}/api/sessions?${query}`)).status,400);
 console.log('Verified composite cursor ordering, ties, filters, limits and context rejection.');
}finally{await new Promise(resolve=>server.close(resolve));await sequelize.close();}
