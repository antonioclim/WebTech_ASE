// Neutral file boundary. Accepts no input database path and performs no reset.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
const directory=mkdtempSync(join(tmpdir(),'tw-c06-neutral-'));
const path=join(directory,'course.sqlite');let closeFailed=false;
const close=db=>{try{db.close();}catch(e){closeFailed=true;console.error('OWNED_CLOSE_FAILED_DIRECTORY_RETAINED',directory);throw e;}};
console.error('OWNED_DIRECTORY_CREATED',directory);
try {
 let db=new DatabaseSync(path),before;
 try {
  db.exec('CREATE TABLE course_entries(id INTEGER PRIMARY KEY,marker TEXT NOT NULL)');
  db.prepare('INSERT INTO course_entries(id,marker) VALUES(?,?)').run(17,'first');
  db.prepare('UPDATE course_entries SET marker=? WHERE id=?').run('Changed marker / Grace',17);
  before={...db.prepare('SELECT id,marker FROM course_entries WHERE id=?').get(17)};
 }finally{close(db);}
 db=new DatabaseSync(path);let reopened;
 try {reopened={...db.prepare('SELECT id,marker FROM course_entries WHERE id=?').get(17)};assert.deepEqual(reopened,before);assert.equal(reopened.marker,'Changed marker / Grace');}finally{close(db);}
 const signature=readFileSync(path).subarray(0,16).toString('utf8');assert.equal(signature,'SQLite format 3\0');
 console.log(JSON.stringify({scope:'SAME_PROCESS_ORDERLY_FILE_CLOSE_REOPEN',processId:process.pid,path,before,reopened,signature,limit:'No new process, crash, power loss or ORM execution.'},null,2));
}finally{if(!closeFailed){rmSync(directory,{recursive:true,force:true});assert.equal(existsSync(directory),false);console.error('OWNED_DIRECTORY_REMOVED',directory);}}
