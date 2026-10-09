// Neutral gallery collections: one actual SQL statement can return a fan-out.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
try{
 db.exec(`PRAGMA foreign_keys=ON;CREATE TABLE galleries(id INTEGER PRIMARY KEY,label TEXT);CREATE TABLE exhibits(id INTEGER PRIMARY KEY,gallery_id INTEGER REFERENCES galleries(id));CREATE TABLE labels(id INTEGER PRIMARY KEY,gallery_id INTEGER REFERENCES galleries(id));INSERT INTO galleries VALUES(7,'Synthetic gallery');INSERT INTO exhibits VALUES(1,7),(2,7),(3,7);INSERT INTO labels VALUES(8,7),(9,7),(10,7),(11,7);`);
 const ownerId=7;let executions=0;
 const query=db.prepare('SELECT e.id AS exhibitId,l.id AS labelId FROM galleries g JOIN exhibits e ON e.gallery_id=g.id JOIN labels l ON l.gallery_id=g.id WHERE g.id=? ORDER BY e.id,l.id');
 executions++;const rows=query.all(ownerId).map(row=>({...row}));
 assert.equal(executions,1);assert.equal(rows.length,12);assert.equal(new Set(rows.map(row=>row.exhibitId)).size,3);assert.equal(new Set(rows.map(row=>row.labelId)).size,4);
 console.log(JSON.stringify({scope:'ACTUAL_BUILTIN_SQLITE_INDEPENDENT_COLLECTION_FAN_OUT',ownerId,boundValue:ownerId,executions,rowsReturned:rows.length,rows,limit:'One selected statement does not measure latency, total work or ORM graph reconstruction. This is not the assessed junction projection.'},null,2));
}finally{db.close();}
