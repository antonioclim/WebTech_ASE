import {assessEnvironment} from './environment.mjs';

// This selected S03 fixture needs nested copy isolation; other operations do not.
export async function assessSeminarEnvironment({requiresStructuredClone=false,...options}) {
  const report=await assessEnvironment(options);
  if(!report.exitCode&&requiresStructuredClone){
    try{
      if(typeof structuredClone!=='function')throw Error('STRUCTURED_CLONE_API_MISSING');
      const source={nested:{value:1},values:[1]},copy=structuredClone(source);
      if(!copy||copy===source||copy.nested===source.nested||copy.values===source.values||copy.nested?.value!==1||!Array.isArray(copy.values)||copy.values.length!==1||copy.values[0]!==1)throw Error('STRUCTURED_CLONE_COPY_FAILED');
      copy.nested.value=2;copy.values.push(2);
      if(source.nested.value!==1||source.values.length!==1)throw Error('STRUCTURED_CLONE_ISOLATION_FAILED');
      report.checks.push({feature:'structured-clone',status:'ENV_OK',operation:'Owned nested-record/array copy and mutation-isolation witness; not all structured-clone types qualified'});
    }catch(error){
      report.status='ENV_BLOCKED';report.exitCode=2;
      report.checks.push({feature:'structured-clone',status:'ENV_BLOCKED',reason:error.message,remedy:'Use a Node runtime providing working structuredClone; rerun this selected command.'});
      report.remedy='Repair the failed structuredClone capability for this selected operation and rerun; no npm package installation is required.';
    }
  }
  return report;
}
