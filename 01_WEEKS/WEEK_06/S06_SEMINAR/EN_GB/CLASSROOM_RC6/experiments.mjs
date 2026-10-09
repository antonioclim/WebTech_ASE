import assert from 'node:assert/strict';
import {initialiseNotes} from './targets/p01.mjs';
import {noteQuery} from './targets/p02.mjs';
import {saveReservation} from './targets/p03.mjs';
import {DatabaseSync,notes,memory,ownedFile} from './sqlite.mjs';

class OwnedTimeoutError extends Error {
 constructor(){super('Owned adapter did not settle within 5000 ms');this.name='TimeoutError';this.code='OWNED_ADAPTER_TIMEOUT';}
}
const bounded = async operation => {
 let timer;
 try {
  return await Promise.race([Promise.resolve(operation),new Promise((_,reject)=>{
   timer=setTimeout(()=>reject(new OwnedTimeoutError()),5000);
  })]);
 } finally { clearTimeout(timer); }
};
const rows = db => db.prepare('SELECT id,title,owner,archived FROM notes ORDER BY id').all().map(r=>({...r}));
function lifecycle() {
 return ownedFile((path,control)=>{
  const stages={};
  let db=new DatabaseSync(path);
  const close = () => {
   try { db.close(); }
   catch(error) { control.keepAfterCloseFailure(error); throw error; }
  };
  try {
   notes(db);initialiseNotes(db);
   db.prepare('INSERT INTO notes(title,owner,archived)VALUES(?,?,?)').run('Marker','Ada',0);
   stages.before=rows(db);
  } finally { close(); }
  db=new DatabaseSync(path);
  try {
   notes(db);initialiseNotes(db);stages.reopened=rows(db);
   initialiseNotes(db,{reset:true});stages.reset=rows(db);
   return {...stages,storage:'OWNED_REAL_SQLITE_FILE',scope:'SAME_PROCESS_CLOSE_REOPEN_NOT_CRASH_RECOVERY',processId:process.pid};
  } finally { close(); }
 });
}
function queryWitness() {
 const db=memory();
 try {
  db.prepare('INSERT INTO notes(title,owner,archived)VALUES(?,?,?)').run('Old','Ada',1);
  db.prepare('INSERT INTO notes(title,owner,archived)VALUES(?,?,?)').run('Other','Grace',0);
  const input=Object.freeze({owner:' Ada ',archived:'false',sort:'title_asc'});
  const options=noteQuery(input);
  const selected=db.prepare('SELECT id,title,owner,archived FROM notes'+(options.where?' WHERE '+options.where:'')+' ORDER BY '+options.order).all(...options.bindings).map(r=>({...r}));
  return {input,options,rows:selected,scope:'REAL_NODE_BUILTIN_SQLITE_NOT_SEQUELIZE'};
 } finally { db.close(); }
}
class ConflictError extends Error {}
function reservationStore(db) {
 db.exec('CREATE TABLE reservations(id INTEGER PRIMARY KEY,code TEXT NOT NULL UNIQUE)');
 return {ConflictError,async create({code}) {
  await new Promise(r=>setTimeout(r,1));
  try {
   const result=db.prepare('INSERT INTO reservations(code)VALUES(?)').run(code);
   return {id:Number(result.lastInsertRowid),code};
  } catch(error) {
   if(error.code==='ERR_SQLITE_ERROR'&&error.errcode===2067)throw new ConflictError('code');
   throw error;
  }
 }};
}
export const cases=[
 {id:'P01.reopen-and-reset',project:'P01',run:()=>{
  const x=lifecycle();
  assert.equal(x.reopened.filter(r=>r.title==='Marker').length,1);
  assert.equal(x.reopened.filter(r=>r.title==='Seeded once').length,1);
  assert.deepEqual(x.reopened,x.before,'Normal reopen preserves the existing rows');
  assert.deepEqual(x.reset.map(r=>r.title),['Seeded once']);
  assert.equal(x.reset[0].owner,'Ada');assert.equal(x.reset[0].archived,0);
 }},
 {id:'P02.real-filter-bindings',project:'P02',run:()=>{
  const x=queryWitness();
  assert.deepEqual(x.rows.map(r=>r.title),['Seeded once']);
  assert.deepEqual(x.options,{where:'owner=? AND archived=?',bindings:['Ada',0],order:'title ASC,id ASC'});
  assert.deepEqual(noteQuery({}),{where:'',bindings:[],order:'id ASC'});
  assert.deepEqual(noteQuery({archived:'true',sort:'id_asc'}),{where:'archived=?',bindings:[1],order:'id ASC'});
  const inherited=Object.create({owner:'Grace',archived:'true',sort:'title_asc'});
  assert.deepEqual(noteQuery(inherited),{where:'',bindings:[],order:'id ASC'});
  // A tied real SQL fixture contrasts contract order with its returned row IDs.
  const db=memory();
  try {
   db.prepare('INSERT INTO notes(id,title,owner,archived)VALUES(?,?,?,?)').run(8,'Equal','Ada',0);
   db.prepare('INSERT INTO notes(id,title,owner,archived)VALUES(?,?,?,?)').run(5,'Equal','Ada',0);
   const o=noteQuery({owner:'Ada',archived:'false',sort:'title_asc'});
   const ids=db.prepare('SELECT id FROM notes WHERE '+o.where+' ORDER BY '+o.order).all(...o.bindings).map(r=>r.id);
   assert.deepEqual(ids,[5,8,1]);
  } finally { db.close(); }
 }},
 {id:'P02.closed-invalid-input',project:'P02',run:()=>{
  let databaseCalls=0;
  const translateThenCall = query => { const result=noteQuery(query);databaseCalls++;return result; };
  for(const q of [{archived:false},{archived:'yes'},{sort:'title;DROP TABLE notes'},{owner:' '},{admin:'yes'},{owner:7},{archived:undefined},{sort:undefined}]) {
   assert.throws(()=>translateThenCall(q),TypeError);assert.equal(databaseCalls,0);
  }
  assert.deepEqual(translateThenCall({owner:'Ada;DROP TABLE notes'}),{where:'owner=?',bindings:['Ada;DROP TABLE notes'],order:'id ASC'});
  assert.equal(databaseCalls,1,'A valid value recovers after invalid input refusals');
 }},
 {id:'P03.real-write-and-conflict',project:'P03',run:async()=>{
  const db=memory();
  try {
   const store=reservationStore(db),result=await bounded(saveReservation(store,{code:' A7 '}));
   assert.deepEqual(result,{id:1,code:'A7'});
   assert.equal(db.prepare('SELECT COUNT(*) n FROM reservations').get().n,1);
   const stored=db.prepare('SELECT id,code FROM reservations WHERE code=?').get('A7');
   assert.deepEqual({...stored},result,'An independent SQL lookup confirms the saved representation');
   await assert.rejects(()=>bounded(saveReservation(store,{code:'A7'})),e=>e instanceof Error&&e.message==='reservation_exists'&&e.code==='reservation_exists');
  } finally { db.close(); }
 }},
 {id:'P03.validation-and-error-identity',project:'P03',run:async()=>{
  let calls=0;const error=Error('unexpected'),store={ConflictError,create:async()=>{calls++;throw error;}};
  for(const input of [{code:' '},{code:7},{},Object.create({code:'A'})]) {
   await assert.rejects(()=>bounded(saveReservation(store,input)),TypeError);assert.equal(calls,0);
  }
  await assert.rejects(()=>bounded(saveReservation(store,{code:'A'})),e=>e===error);
  const conflict=new ConflictError('declared');
  await assert.rejects(()=>bounded(saveReservation({ConflictError,create:async()=>{throw conflict;}},{code:'A'})),e=>e!==conflict&&e instanceof Error&&e.message==='reservation_exists'&&e.code==='reservation_exists');
 }},
 {id:'P03.awaited-completion',project:'P03',run:async()=>{
  let release,called=0,released=false;
  const row={id:7,code:'A'},pending=saveReservation({ConflictError,create:()=>{called++;return new Promise(r=>release=r);}},{code:'A'});
  let settled=false;
  Promise.resolve(pending).then(()=>settled=true,()=>settled=true);
  try {
   await Promise.resolve();await Promise.resolve();
   assert.equal(called,1);assert.equal(settled,false);assert.equal(typeof release,'function');
   release(row);released=true;
   const result=await bounded(pending);assert.deepEqual(result,row);assert.notEqual(result,row);
   result.code='Changed public copy';assert.equal(row.code,'A');
  } finally { if(!released&&typeof release==='function')release(row); }
  // A later rejected adapter must retain the unexpected error object.
  let reject,rejectedReleased=false;
  const error=Error('delayed unexpected'),rejected=saveReservation({ConflictError,create:()=>new Promise((_,r)=>reject=r)},{code:'A'});
  const outcome=Promise.resolve(rejected).then(value=>({fulfilled:true,value}),error=>({fulfilled:false,error}));
  try {
   await Promise.resolve();assert.equal(typeof reject,'function');
   reject(error);rejectedReleased=true;
   const result=await bounded(outcome);assert.equal(result.fulfilled,false);assert.equal(result.error,error);
  } finally { if(!rejectedReleased&&typeof reject==='function')reject(error); }
 }}
];
export async function observe(project) {
 if(project==='P01')return lifecycle();
 if(project==='P02')return queryWitness();
 if(project==='P03') {
  const db=memory();
  try {
   const store=reservationStore(db),result=await bounded(saveReservation(store,{code:' A7 '}));let conflict;
   try { await bounded(saveReservation(store,{code:'A7'})); }
   catch(e) { if(e instanceof OwnedTimeoutError)throw e;conflict={name:e.name,code:e.code,message:e.message,category:e.message==='reservation_exists'&&e.code==='reservation_exists'?'MAPPED_DECLARED_CONFLICT':'CAPTURED_TARGET_ERROR_NOT_EXPECTED_CONFLICT'}; }
   return {result,conflict,rows:db.prepare('SELECT * FROM reservations').all().map(r=>({...r})),scope:'GENUINE_SQLITE_WRITE_SUPPLIED_ASYNC_ADAPTER_NOT_ORM'};
  } finally { db.close(); }
 }
 return {P01:await observe('P01'),P02:await observe('P02'),P03:await observe('P03')};
}
