// Neutral gallery/visitor admissions: actual built-in SQLite, not the S07 JOIN target.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
try{
 db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE rooms(id INTEGER PRIMARY KEY,label TEXT NOT NULL);
 CREATE TABLE visitors(id INTEGER PRIMARY KEY,label TEXT NOT NULL);
 CREATE TABLE admissions(id INTEGER PRIMARY KEY,room_id INTEGER NOT NULL REFERENCES rooms(id),visitor_id INTEGER NOT NULL REFERENCES visitors(id),tier TEXT NOT NULL,UNIQUE(room_id,visitor_id));
 INSERT INTO rooms VALUES(2,'North'),(3,'South');INSERT INTO visitors VALUES(8,'Synthetic visitor');`);
 const insert=db.prepare('INSERT INTO admissions(id,room_id,visitor_id,tier) VALUES(?,?,?,?)');
 insert.run(1,2,8,'standard');insert.run(2,3,8,'guest');
 const refusals=[];
 for(const [id,room,visitor,tier,expectedErrcode]of [[3,2,8,'another',2067],[4,99,8,'standard',787],[5,null,8,'standard',1299]]){
  let failed=false;try{insert.run(id,room,visitor,tier)}catch(error){failed=true;assert.equal(error.code,'ERR_SQLITE_ERROR');assert.equal(error.errcode,expectedErrcode);refusals.push({id,room,visitor,errorCode:error.code,errcode:error.errcode,message:error.message})}assert.equal(failed,true);
 }
 const rows=db.prepare('SELECT id,room_id,visitor_id,tier FROM admissions ORDER BY id').all().map(row=>({...row}));
 assert.deepEqual(rows,[{id:1,room_id:2,visitor_id:8,tier:'standard'},{id:2,room_id:3,visitor_id:8,tier:'guest'}]);
 console.log(JSON.stringify({scope:'ACTUAL_BUILTIN_SQLITE_RELATIONSHIP_CONSTRAINTS_NOT_SEQUELIZE_OR_S07_QUERY',rows,refusals,limit:'Pair uniqueness, existing reference and non-null reference are different finite rules. Surrogate IDs do not enforce business uniqueness.'},null,2));
}finally{db.close();}
