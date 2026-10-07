// LOCAL3 protected teaching probes. These bodies observe learner code; they do not implement it.
// The retained CLASSROOM_RC6 source-carrier name is intentional.
const probes = {
  "P01-boundary": async () => {
    const {memory}=await import("./sqlite.mjs"); const {initialiseNotes}=await import("./targets/p01.mjs"); const db=memory(); try { db.prepare("INSERT INTO notes(title,owner,archived) VALUES(?,?,?)").run("Own marker","Grace",0); initialiseNotes(db); console.log({normal:db.prepare("SELECT title FROM notes ORDER BY id").all()}); initialiseNotes(db,{reset:true}); console.log({reset:db.prepare("SELECT title FROM notes ORDER BY id").all()}); } finally { db.close(); }
  },
  "P02-boundary": async () => {
    const {noteQuery}=await import("./targets/p02.mjs"); try { console.log(noteQuery({sort:"random_order"})); } catch(error) { console.log({name:error.name}); }
  },
  "P03-boundary": async () => {
    const {saveReservation}=await import("./targets/p03.mjs"); let calls=0; class ConflictError extends Error {} const store={ConflictError,create:async()=>{calls++; return {id:9,code:"X"};}}; try { const result=await saveReservation(store,{code:"\t "}); console.log({unexpectedAcceptance:result,calls}); } catch(error) { console.log({name:error.name,calls}); }
  }
};
const [selector, ...extra] = process.argv.slice(2);
if (selector === undefined && extra.length === 0) {
  console.log('Use: node CLASSROOM_RC6/PROBE.mjs <selector>');
  console.log('Available selectors: ' + Object.keys(probes).join(', '));
  process.exit(0);
}
if (extra.length !== 0 || !Object.hasOwn(probes, selector)) {
  console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector:selector ?? null,available:Object.keys(probes)}));
  process.exit(2);
}
if (process.version !== 'v24.21.0') {
  console.error(JSON.stringify({status:'STOP_REFERENCE_NODE',expected:'v24.21.0',observed:process.version,probe:selector}));
  process.exit(2);
}
try {
  await probes[selector]();
} catch (error) {
  console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',probe:selector,name:error.name,message:error.message}));
  process.exitCode = 2;
}
