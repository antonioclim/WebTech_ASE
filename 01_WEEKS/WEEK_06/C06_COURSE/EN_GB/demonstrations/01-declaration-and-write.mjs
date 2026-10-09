// Neutral course experiment: no assessed target or ORM dependency.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const declaredIntent={label:'a non-blank string',reference:'unique text'};
const db=new DatabaseSync(':memory:');
try {
 db.exec('CREATE TABLE course_artifacts(id INTEGER PRIMARY KEY,label TEXT NOT NULL,reference TEXT NOT NULL UNIQUE)');
 const schema=db.prepare('PRAGMA table_info(course_artifacts)').all().map(r=>({name:r.name,type:r.type,notNull:r.notnull,primaryKey:r.pk}));
 db.prepare('INSERT INTO course_artifacts(label,reference) VALUES(?,?)').run('', 'R1');
 const saved={...db.prepare('SELECT id,label,reference FROM course_artifacts WHERE reference=?').get('R1')};
 assert.equal(saved.label,'');
 let nullRefusal,uniqueRefusal;
 try {db.prepare('INSERT INTO course_artifacts(label,reference) VALUES(?,?)').run(null,'R2');}catch(e){nullRefusal={code:e.code,errcode:e.errcode};}
 try {db.prepare('INSERT INTO course_artifacts(label,reference) VALUES(?,?)').run('Other','R1');}catch(e){uniqueRefusal={code:e.code,errcode:e.errcode};}
 assert.deepEqual(nullRefusal,{code:'ERR_SQLITE_ERROR',errcode:1299});
 assert.deepEqual(uniqueRefusal,{code:'ERR_SQLITE_ERROR',errcode:2067});
 console.log(JSON.stringify({scope:'ACTUAL_BUILTIN_SQLITE_NOT_ORM_METADATA',declaredIntent,schema,saved,nullRefusal,uniqueRefusal,lesson:'A stated non-blank intention has no SQL CHECK here; NOT NULL and UNIQUE refuse different writes.'},null,2));
}finally{db.close();}
