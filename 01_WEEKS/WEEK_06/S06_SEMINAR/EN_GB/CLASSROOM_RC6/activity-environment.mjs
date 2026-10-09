import {assessEnvironment} from './environment.mjs';

export async function assessActivityEnvironment({usesSqlite=false,...options}) {
  const report=await assessEnvironment({...options,features:usesSqlite?['sqlite']:['node-core'],usesNpm:false});
  if(!report.exitCode&&usesSqlite){
    let db;
    try{
      const support=await import('./sqlite.mjs');
      for(const name of ['DatabaseSync','notes','memory','ownedFile'])if(typeof support[name]!=='function')throw Error('SQLITE_SUPPORT_API_MISSING '+name);
      db=support.memory();
      const seed=db.prepare('SELECT title,owner,archived FROM notes ORDER BY id').all();
      if(seed.length!==1||seed[0].title!=='Seeded once'||seed[0].owner!=='Ada'||seed[0].archived!==0)throw Error('SQLITE_SUPPORT_SEED_OPERATION_FAILED');
      db.exec('CREATE TABLE environment_unique_probe(id INTEGER PRIMARY KEY,code TEXT NOT NULL UNIQUE)');
      const insert=db.prepare('INSERT INTO environment_unique_probe(code) VALUES (?)'),written=insert.run('owned-probe');
      if(Number(written.lastInsertRowid)!==1||Number(written.changes)!==1)throw Error('SQLITE_RUN_RESULT_API_FAILED');
      let conflict;
      try{insert.run('owned-probe');}catch(error){conflict=error;}
      if(conflict?.code!=='ERR_SQLITE_ERROR'||conflict?.errcode!==2067)throw Error('SQLITE_UNIQUE_ERROR_API_FAILED');
      db.close();db=null;
      report.checks.push({feature:'s06-sqlite-support',status:'ENV_OK',operation:'Actual local support import, owned memory schema/seed, write result and unique error API, close'});
    }catch(error){
      report.status='ENV_BLOCKED';report.exitCode=2;
      report.checks.push({feature:'s06-sqlite-support',status:'ENV_BLOCKED',reason:error.code||error.message,remedy:'Restore the supplied sqlite.mjs support and use a Node runtime with the named built-in SQLite behaviour; rerun this selected operation.'});
      report.remedy='Repair only the failed built-in SQLite/support requirement; no Sequelize/npm installation is required.';
    }finally{
      if(db){try{db.close();}catch(error){report.status='ENV_BLOCKED';report.exitCode=2;report.checks.push({feature:'s06-sqlite-close',status:'ENV_BLOCKED',reason:error.message,remedy:'Owned SQLite connection did not close; do not claim cleanup or PASS.'});}}
    }
  }
  return report;
}
