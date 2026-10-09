import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
export function notes(db){db.exec('CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,title TEXT NOT NULL,owner TEXT NOT NULL,archived INTEGER NOT NULL CHECK(archived IN (0,1)))');if(db.prepare('SELECT COUNT(*) n FROM notes').get().n===0)db.prepare('INSERT INTO notes(title,owner,archived)VALUES(?,?,?)').run('Seeded once','Ada',0);}
export function memory(){
  const db=new DatabaseSync(':memory:');
  try{notes(db);return db;}
  catch(error){
    try{db.close();}catch(closeError){throw new AggregateError([error,closeError],'SQLite schema initialisation and owned connection closure failed',{cause:error});}
    throw error;
  }
}
// Sync callbacks still return synchronously. An async callback owns its directory until settlement.
export function ownedFile(operation){
  if(typeof operation!=='function')throw new TypeError('Owned SQLite operation must be a function');
  const directory=mkdtempSync(join(tmpdir(),'webtech-rc6-')),storage=join(directory,'owned.sqlite');
  let closeFailure=null;
  const control=Object.freeze({directory,storage,keepAfterCloseFailure(error){closeFailure??=error instanceof Error?error:new Error(String(error));}});
  function finish(value,error,failed=false){
    if(closeFailure){console.error('[OWNED_SQLITE_DIRECTORY_RETAINED_AFTER_CLOSE_FAILURE] '+directory);throw failed?error:closeFailure;}
    try{rmSync(directory,{recursive:true,force:true});console.error('[OWNED_SQLITE_DIRECTORY_REMOVED] '+directory);}
    catch(cleanupError){console.error('[OWNED_SQLITE_DIRECTORY_CLEANUP_FAILED] '+directory);if(failed)throw new AggregateError([error,cleanupError],'Owned SQLite operation and directory cleanup failed',{cause:error});throw cleanupError;}
    if(failed)throw error;
    return value;
  }
  let result;
  try{result=operation(storage,control);}
  catch(error){return finish(undefined,error,true);}
  try{
    if(result&&typeof result.then==='function')return Promise.resolve(result).then(value=>finish(value),error=>finish(undefined,error,true));
  }catch(error){return finish(undefined,error,true);}
  return finish(result);
}
export {DatabaseSync};
