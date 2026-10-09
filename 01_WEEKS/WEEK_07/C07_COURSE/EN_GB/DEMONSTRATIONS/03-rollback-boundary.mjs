// Neutral editorial revision: two SQL changes and a deliberately external JS record.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:'),externalRecords=[];
try{
 db.exec(`CREATE TABLE drafts(id INTEGER PRIMARY KEY,text TEXT NOT NULL);CREATE TABLE revisions(id INTEGER PRIMARY KEY,draft_id INTEGER NOT NULL,text TEXT NOT NULL);INSERT INTO drafts VALUES(1,'Original');CREATE TRIGGER reject_revision BEFORE INSERT ON revisions WHEN NEW.text='REFUSED' BEGIN SELECT RAISE(ABORT,'synthetic_revision_refusal');END;`);
 const snapshot=()=>({text:db.prepare('SELECT text FROM drafts WHERE id=?').get(1).text,revisions:db.prepare('SELECT COUNT(*) AS n FROM revisions').get().n});
 const observations=[];
 for(const [nextText,revisionText]of [['Rejected change','REFUSED'],['Accepted change','Accepted revision']]){
  const before=snapshot(),trace=[];let error=null;
  db.exec('BEGIN');trace.push('BEGIN');
  try{
   db.prepare('UPDATE drafts SET text=? WHERE id=?').run(nextText,1);trace.push('draft changed');
   externalRecords.push({attempt:nextText});trace.push('external JS record appended');
   trace.push('revision INSERT attempted');db.prepare('INSERT INTO revisions(draft_id,text) VALUES(?,?)').run(1,revisionText);
   db.exec('COMMIT');trace.push('COMMIT');
  }catch(fault){error=fault.message;db.exec('ROLLBACK');trace.push('ROLLBACK');}
  observations.push({before,after:snapshot(),trace,error,externalRecordCount:externalRecords.length});
 }
 assert.deepEqual(observations[0].after,{text:'Original',revisions:0});assert.match(observations[0].error,/synthetic_revision_refusal/);
 assert.deepEqual(observations[1].before,observations[0].after);assert.deepEqual(observations[1].after,{text:'Accepted change',revisions:1});assert.equal(externalRecords.length,2);
 console.log(JSON.stringify({scope:'ACTUAL_SERIAL_BUILTIN_SQLITE_ROLLBACK_AND_RECOVERY',observations,externalRecords,limit:'SQL restores this owned group; it does not erase JavaScript records. Synchronous COMMIT here does not model delayed ORM commit, competing writers, crash durability or bookSeats.'},null,2));
}finally{db.close();}
