// Bounded parent invokes this worker; it owns only memory and ephemeral loopback resources.
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {createServer} from 'node:http';
const [profile,root,...extra]=process.argv.slice(2);
if(extra.length||!['express','orm'].includes(profile)||!root)throw Error('INVALID_OPTIONAL_PROBE_ARGUMENTS');
const require=createRequire(join(root,'package.json'));
async function probe(){
 if(profile==='express'){
  const express=require('express');if(typeof express!=='function')throw Error('EXPRESS_CONSTRUCTOR_API_MISSING');
  const app=express();for(const name of ['use','get','post','listen'])if(typeof app[name]!=='function')throw Error('EXPRESS_APP_API_MISSING '+name);
  app.get('/environment-probe',(req,res)=>res.status(200).send('owned-express-probe'));
  const server=createServer(app),sockets=new Set();server.on('connection',s=>{sockets.add(s);s.once('close',()=>sockets.delete(s));});
  const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),4000);
  try{
   if(typeof server.closeAllConnections!=='function')throw Error('HTTP_CLOSEALLCONNECTIONS_API_MISSING');
   await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});
   const response=await fetch(`http://127.0.0.1:${server.address().port}/environment-probe`,{signal:controller.signal});
   if(response.status!==200||await response.text()!=='owned-express-probe')throw Error('EXPRESS_HTTP_OPERATION_FAILED');
  }finally{clearTimeout(deadline);controller.abort();for(const s of sockets)s.destroy();if(server.listening)await new Promise(r=>server.close(r));}
  return 'Actual project-local Express construction, registration, ephemeral HTTP200 and owned close';
 }
 const sqlite=require('sqlite3'),{Sequelize,DataTypes}=require('sequelize');
 if(typeof sqlite.Database!=='function'||typeof Sequelize!=='function'||!DataTypes?.STRING)throw Error('ORM_NATIVE_API_MISSING');
 const sequelize=new Sequelize({dialect:'sqlite',storage:':memory:',logging:false,dialectModule:sqlite});
 try{
  for(const name of ['define','sync','authenticate','close'])if(typeof sequelize[name]!=='function')throw Error('SEQUELIZE_API_MISSING '+name);
  await sequelize.authenticate();const Model=sequelize.define('EnvironmentProbe',{label:{type:DataTypes.STRING,allowNull:false}},{timestamps:false});
  await sequelize.sync();await Model.create({label:'owned-orm-probe'});const rows=await Model.findAll({raw:true});
  if(rows.length!==1||rows[0].label!=='owned-orm-probe')throw Error('ORM_SQLITE_OPERATION_FAILED');
 }finally{await sequelize.close();}
 return 'Actual project-local Sequelize/sqlite3 memory schema/write/read/close; no file or npm activity';
}
try{console.log(JSON.stringify({status:'ENV_OK',feature:'optional-'+profile,operation:await probe(),observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));}
catch(error){console.error(JSON.stringify({status:'ENV_BLOCKED',feature:'optional-'+profile,reason:error.code||error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));process.exitCode=2;}
