/** Genuine-stack observer entrypoint. No installation, fake package or target implementation. */
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {projectRoot,preflight,guard,boundary} from './project.mjs';
import {observe,MODES} from './observe-core.mjs';
import {run} from './runner.mjs';
export async function execute(mode,{allowMemoryDatabase=false,allowNonreference=false}={}){
 if(!MODES.includes(mode))throw Error('Unknown observation');
 if(!allowMemoryDatabase)throw Error('Explicit --allow-memory-database required');
 const before=guard(await preflight('p02'),allowNonreference),root=projectRoot('p02');
 const {createDatabase,initializeDatabase}=await import(pathToFileURL(join(root,'src/database.js')));
 const {bookSeats}=await import(pathToFileURL(join(root,'src/book-seats.js')));
 const {unsafeBookSeats}=await import(pathToFileURL(join(root,'src/unsafe-book-seats.js')));
 const db=createDatabase();let result,runError,closeError;
 try{await initializeDatabase(db);result=await observe(db,bookSeats,unsafeBookSeats,mode);}catch(e){runError=e;}
 finally{try{await db.sequelize.close();}catch(e){closeError=e;}}
 if(runError||closeError)throw new AggregateError([runError,closeError].filter(Boolean),'Observation or database closure failed');
 result.evidenceClass='ACTUAL_ORM_SQLITE_WITH_DECLARED_OBSERVATION_HOOKS';result.preflight=before;result.afterBoundary=await boundary('p02');result.closed=true;result.referenceAcceptance=false;
 result.ok=result.ok&&result.afterBoundary.ok&&before.boundary.targetSha256===result.afterBoundary.targetSha256;
 result.status=result.ok?'PASS_BOUNDED_OBSERVATION':'FAIL_OBSERVATION';
 return result;
}
async function main(args){
 const [mode,...flags]=args;
 if(!MODES.includes(mode)||flags.some(f=>!['--allow-memory-database','--allow-nonreference','--worker'].includes(f))||new Set(flags).size!==flags.length)throw Error('Use success|callback|audit|unsafe|domains --allow-memory-database [--allow-nonreference]');
 if(!flags.includes('--allow-memory-database'))throw Error('Explicit --allow-memory-database required');
 // Preflight precedes the child. The genuine observer remains bounded even when user code hangs.
 guard(await preflight('p02'),flags.includes('--allow-nonreference'));
 if(flags.includes('--worker')){const r=await execute(mode,{allowMemoryDatabase:true,allowNonreference:flags.includes('--allow-nonreference')});console.log(JSON.stringify(r,null,2));return r.ok?0:1;}
 const result=await run(process.execPath,[fileURLToPath(import.meta.url),...args,'--worker'],{timeout:30000});
 process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 if(result.spawnError||result.timedOut||result.signal||result.overflow){console.error('EXECUTION_FAULT: '+JSON.stringify(result));return 2;}return result.exit===0?0:1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).then(c=>process.exitCode=c).catch(e=>{console.error('BLOCKED_OR_FAILED: '+e.message);process.exitCode=2;});
