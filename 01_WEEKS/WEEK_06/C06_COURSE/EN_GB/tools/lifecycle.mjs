/** Derived same-process connection-reopen witness. No user database path is accepted. */
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {preflight,requireReady,rootFor} from './examples.mjs';
export async function ownedWorkspace(operation){
 if(typeof operation!=='function')throw new TypeError('Operation required');
 const directory=await mkdtemp(path.join(tmpdir(),'tw-c06-')),storage=path.join(directory,'notes.sqlite');
 console.error('[TEMPORARY_WORKSPACE] '+directory);
 let result,error;const control={mayRemove:true};
 try{result=await operation(storage,control);}catch(e){error=e;}
 let cleanup='KEPT_AFTER_CLOSE_FAILURE';
 if(control.mayRemove){try{await rm(directory,{recursive:true,force:true});cleanup='OWNED_DIRECTORY_REMOVED';}catch(e){cleanup='CLEANUP_FAILED: '+e.message;error??=e;}}
 const out={directory,storage,result:result??null,error:error?.message||null,cleanup};
 return out;
}
export async function lifecycle({compatibility=false,allowTemporaryDatabase=false}={}){
 if(!allowTemporaryDatabase)throw new Error('Explicit temporary-database authorisation required');
 const check=requireReady('02',compatibility);const req=createRequire(path.join(rootFor('02'),'package.json'));
 // Native loading is deliberately after the prerequisite/authorisation guards.
 const sqlite=req('sqlite3');const {Sequelize,DataTypes}=req('sequelize');const marker='C06-'+randomUUID();
 const work=await ownedWorkspace(async(storage,control)=>{
  const stages=[];
  async function stage(label,reset,insert){
   const sequelize=new Sequelize({dialect:'sqlite',storage,logging:false,dialectModule:sqlite});
   let original;
   try{const Note=sequelize.define('CourseNote',{title:{type:DataTypes.STRING,allowNull:false,unique:true}},{tableName:'course_notes',timestamps:false});
    await sequelize.sync(reset?{force:true}:undefined);if(await Note.count()===0)await Note.create({title:'Seeded once'});if(insert)await Note.create({title:marker});
    const rows=await Note.findAll({order:[['id','ASC']],raw:true});stages.push({label,reset,pid:process.pid,rows});
   }catch(e){original=e;}finally{try{await sequelize.close();}catch(e){control.mayRemove=false;if(original)original=new AggregateError([original,e],'Operation and closure failed');else original=e;}}
   if(original)throw original;
  }
  await stage('create',false,true);await stage('reopen',false,false);await stage('explicit_reset',true,false);
  const survived=stages[1].rows.some(r=>r.title===marker),resetRemoved=!stages[2].rows.some(r=>r.title===marker);
  const signature=(await readFile(storage)).subarray(0,16).toString('latin1');
  return {stages,marker,survived,resetRemoved,sqliteSignature:signature,fileBytesAreSQLite:signature==='SQLite format 3\u0000',checksPassed:survived&&resetRemoved&&signature==='SQLite format 3\u0000'};
 });
 return {evidenceClass:'ORM_SQLITE_EXECUTION_ATTEMPT',boundary:'SAME_PROCESS_CONNECTION_REOPEN',secondProcess:false,powerLossTest:false,nonreference:!check.referenceNodeMatch,...work,success:!work.error&&work.cleanup==='OWNED_DIRECTORY_REMOVED'&&work.result?.checksPassed===true};
}
export async function main(argv=process.argv.slice(2)){
 if(argv.length===0||argv[0]==='preflight'){if(argv.length>1)throw new TypeError('No path or flags accepted by preflight');console.log(JSON.stringify(preflight('02'),null,2));return 0;}
 if(argv[0]!=='run'||argv.slice(1).some(x=>!['--allow-temporary-database','--compatibility'].includes(x))||new Set(argv).size!==argv.length)throw new TypeError('Use run --allow-temporary-database [--compatibility]; no database path accepted');
 const watchdog=setTimeout(()=>{console.error('LIFECYCLE_TIMEOUT: no successful observation or cleanup is claimed; the owned temporary path, if created, was printed above.');process.exit(124);},20000);watchdog.unref();try{const r=await lifecycle({allowTemporaryDatabase:argv.includes('--allow-temporary-database'),compatibility:argv.includes('--compatibility')});console.log(JSON.stringify(r,null,2));return r.success?0:1;}finally{clearTimeout(watchdog);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){main().then(code=>process.exitCode=code).catch(e=>{console.error('LIFECYCLE_BLOCK_OR_FAILURE: '+e.message);process.exitCode=2;});}
