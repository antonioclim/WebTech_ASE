// Fixed neutral SQL report, no public query translator or target imports.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
try {
 db.exec('CREATE TABLE course_invoices(id INTEGER PRIMARY KEY,owner TEXT NOT NULL,paid INTEGER NOT NULL,amount INTEGER NOT NULL)');
 const insert=db.prepare('INSERT INTO course_invoices(id,owner,paid,amount) VALUES(?,?,?,?)');
 insert.run(22,'Ada',0,50);insert.run(21,'Ada',0,50);insert.run(23,'Lin',0,70);insert.run(24,'Ada',1,80);
 const sql='SELECT id,amount FROM course_invoices WHERE owner=? AND paid=? ORDER BY amount DESC,id ASC';
 const bindings=['Ada',0],rows=db.prepare(sql).all(...bindings).map(r=>({...r}));
 assert.deepEqual(rows,[{id:21,amount:50},{id:22,amount:50}]);
 const suspicious='Ada;DROP TABLE course_invoices',refusedMatch=db.prepare(sql).all(suspicious,0);
 assert.equal(refusedMatch.length,0);assert.equal(db.prepare('SELECT COUNT(*) n FROM course_invoices').get().n,4);
 const report=db.prepare('SELECT COUNT(*) count FROM course_invoices WHERE owner=? AND paid=?').get(...bindings);
 const caseRules=db.prepare('SELECT lower(?) ascii,lower(?) nonAscii,? LIKE ? wildcard').get('ABC','ÀBC','a%b','%');
 assert.equal(caseRules.ascii,'abc');assert.equal(caseRules.nonAscii,'Àbc');assert.equal(caseRules.wildcard,1);
 console.log(JSON.stringify({scope:'ACTUAL_BOUND_BUILTIN_SQLITE_FIXED_REPORT',sql,bindings,rows,report:{...report},suspiciousValue:suspicious,refusedMatch,caseRules:{...caseRules},javascriptLower:'ÀBC'.toLowerCase(),limit:'Fixed reviewed structure only; no assessed translator, HTTP or Sequelize replacement/bind execution.'},null,2));
}finally{db.close();}
