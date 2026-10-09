// LOCAL3 protected teaching probes. These bodies observe learner code; they do not implement it.
// The retained CLASSROOM_RC6 source-carrier name is intentional.
const probes = {
  "P01-boundary": async () => {
    const {taskSummary}=await import("./targets/p01.mjs"); try { console.log(taskSummary([{id:"N9",title:"Not selected",owner:"Grace",status:"done",estimate:"6"}])); } catch(error) { console.log({name:error.name}); }
  },
  "P02-boundary": async () => {
    const {compileLeaf}=await import("./targets/p02.mjs"); const predicate=compileLeaf({field:"estimate",operator:"atLeast",value:5}); console.log({own:predicate({estimate:8}),inherited:predicate(Object.create({estimate:8})),string:predicate({estimate:"8"})});
  },
  "P03-boundary": async () => {
    const {normaliseEvents}=await import("./targets/p03.mjs"); try { console.log(normaliseEvents([{id:"C9",time:2,active:"false",duration:1}])); } catch(error) { console.log({name:error.name}); }
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
