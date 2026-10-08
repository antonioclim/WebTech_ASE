// LOCAL3 protected teaching probes. These bodies observe learner code; they do not implement it.
// The retained CLASSROOM_RC6 source-carrier name is intentional.
const probes = {
  "P01-exchange": async () => {
    const {observe}=await import("./experiments.mjs"); const {classifyExchanges}=await import("./targets/p01.mjs"); const actual=await observe("P01"); console.log(JSON.stringify({exchange:actual,classified:classifyExchanges(actual.rows)},null,2));
  },
  "P01-boundary": async () => {
    const {classifyExchanges}=await import("./targets/p01.mjs"); const rows=[{method:"GET",path:"/assets/example.css?edition=2",status:200,headers:{"content-type":"text/css; charset=utf-8"},body:"body{}"}]; const before=JSON.stringify(rows); console.log(JSON.stringify({output:classifyExchanges(rows),inputUnchanged:JSON.stringify(rows)===before},null,2));
  },
  "P02-boundary": async () => {
    const {greeting}=await import("./targets/p02.mjs"); console.log(JSON.stringify(greeting("GET","/api/greetings/%09%20"),null,2));
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
