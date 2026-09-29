/** Observe supplied exports; this file does not translate the assessed query. */
import {resolve,join} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
import {preflight,guard,projectRoot} from './project.mjs';
import {inspect} from 'node:util';
export async function optionsWitness(builder){
 const input=Object.freeze({owner:' Ada ',archived:'false',sort:'title_asc',fields:'title,owner'}),before=JSON.stringify(input);
 const first=builder(input),second=builder(input);return {evidenceClass:'ACTUAL_MODULE_WITH_INSTALLED_SEQUELIZE_NOT_SQL',inputUnchanged:JSON.stringify(input)===before,optionsDistinct:first!==second,orderDistinct:first.order!==second.order,firstPairDistinct:Array.isArray(first.order)&&Array.isArray(second.order)&&first.order[0]!==second.order[0],options:inspect(first,{depth:8}),limitation:'No SQL executed by this options witness. A returned description does not prove rows.'};
}
export async function run({allowNonreference=false,allowMemoryDatabase=false}={}){
 if(!allowMemoryDatabase)throw Error('Explicit --allow-memory-database required');guard(await preflight('p02'),allowNonreference);
 const root=projectRoot('p02'),query=await import(pathToFileURL(join(root,'src/note-query.js'))),db=await import(pathToFileURL(join(root,'src/database.js')));const database=db.createDatabase();
 try{await db.initializeDatabase(database);const input={owner:' Ada ',archived:'false',sort:'title_asc',fields:'title,owner'};let calls=0;const find=database.Note.findAll.bind(database.Note);database.Note.findAll=(...args)=>{calls++;return find(...args);};
  const rows=(await database.Note.findAll(query.buildNoteQuery(input))).map(n=>n.get({plain:true}));const prior=calls;let rejected=null;
  try{await database.Note.findAll(query.buildNoteQuery({archived:'yes'}));}catch(e){rejected={name:e.name,code:e.code,queryValidationError:e instanceof query.QueryValidationError};}
  return {evidenceClass:'ACTUAL_ORM_SQLITE',storage:':memory:',rows,invalidBeforeModel:{rejected,calls:calls-prior},module:await optionsWitness(query.buildNoteQuery),limitation:'Direct module/model witness, not the Express route. Route call-count evidence is in the canonical objective suite.'};
 }finally{await database.sequelize.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const flags=process.argv.slice(2);if(flags.some(f=>!['--allow-nonreference','--allow-memory-database'].includes(f))||new Set(flags).size!==flags.length){console.error('Invalid flags');process.exitCode=2;}else {const t=setTimeout(()=>{console.error('OBSERVATION_TIMEOUT: no successful cleanup claim');process.exit(124);},20000);t.unref();run({allowNonreference:flags.includes('--allow-nonreference'),allowMemoryDatabase:flags.includes('--allow-memory-database')}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error('BLOCKED_OR_FAILED: '+e.message);process.exitCode=2;}).finally(()=>clearTimeout(t));}}
