export function classifyTestRun(run,{expectedNames=[],expectedVector=null,initial=false,allowIncomplete=false}={}) {
  if(run.error||run.signal||run.status===null)return 'FAIL_EXECUTOR';
  if(!Array.isArray(expectedNames)||!expectedNames.length||new Set(expectedNames).size!==expectedNames.length||expectedNames.some(n=>typeof n!=='string'||!n))return 'FAIL_CASE_AUTHORITY';
  let events;try {events=(run.stdout||'').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));}catch{return 'FAIL_REPORTER';}
  if(!events.length||events.some(e=>!e||Object.keys(e).sort().join(',')!=='errors,name,type'||!['test:pass','test:fail'].includes(e.type)||typeof e.name!=='string'||!Array.isArray(e.errors)||e.errors.some(err=>!err||Object.keys(err).sort().join(',')!=='code,failureType,name'||[err.code,err.failureType,err.name].some(v=>v!==null&&typeof v!=='string'))||(e.type==='test:pass'&&e.errors.length)||(e.type==='test:fail'&&!e.errors.length)))return 'FAIL_REPORTER';
  if(expectedNames.length && (events.length!==expectedNames.length||new Set(events.map(e=>e.name)).size!==events.length||events.some(e=>!expectedNames.includes(e.name))))return 'FAIL_CASE_SET';
  if(initial&&(!expectedVector||Object.keys(expectedVector).length!==expectedNames.length||expectedNames.some(n=>!Object.hasOwn(expectedVector,n)||!['test:pass','test:fail'].includes(expectedVector[n]))))return 'FAIL_STARTER_VECTOR_AUTHORITY';
  if(initial&&expectedVector&&events.some(e=>expectedVector[e.name]!==e.type))return 'FAIL_STARTER_VECTOR';
  const failures=events.filter(e=>e.type==='test:fail');
  if(run.status===0)return failures.length?'FAIL_INCONSISTENT_REPORT':'PASS';
  if(run.status!==1||!failures.length)return 'FAIL';
  const allowed=new Set(expectedNames);
  const assertionOnly=failures.every(e=>allowed.has(e.name)&&e.errors.some(err=>err.code==='ERR_ASSERTION'||err.code==='ERR_ASSERTION_FAILURE')&&e.errors.every(err=>[null,'ERR_TEST_FAILURE','ERR_ASSERTION','ERR_ASSERTION_FAILURE'].includes(err.code)&&[null,'testCodeFailure'].includes(err.failureType)&&[null,'Error','AssertionError'].includes(err.name)));
  if(initial&&assertionOnly)return allowIncomplete?'INCOMPLETE_STARTER_NORMATIVE':'EXPECTED_STARTER_ASSERTION_FAILURE';
  return 'FAIL';
}
