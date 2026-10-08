import {DatabaseSync}from 'node:sqlite';import {mkdtempSync,rmSync}from 'node:fs';import {tmpdir}from 'node:os';import {join}from 'node:path';
export function notes(db){db.exec('CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,title TEXT NOT NULL,owner TEXT NOT NULL,archived INTEGER NOT NULL CHECK(archived IN (0,1)))');if(db.prepare('SELECT COUNT(*) n FROM notes').get().n===0)db.prepare('INSERT INTO notes(title,owner,archived)VALUES(?,?,?)').run('Seeded once','Ada',0);}
export function memory(){const db=new DatabaseSync(':memory:');notes(db);return db;}
export function ownedFile(operation){const directory=mkdtempSync(join(tmpdir(),'webtech-rc6-'));try{return operation(join(directory,'owned.sqlite'));}finally{rmSync(directory,{recursive:true,force:true});}}
export {DatabaseSync};
