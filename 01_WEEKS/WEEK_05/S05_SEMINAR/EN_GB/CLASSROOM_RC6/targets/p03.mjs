export function publicOutcome(outcome){
 // TODO: created=>201 Location /api/tasks/<id> and {data}; not_found=>404
 // {error:'task_not_found'}; conflict=>409 {error:'task_exists'}; any other
 // kind=>500 {error:'internal_error'} without leaked messages. headers{} otherwise.
 return {status:200,headers:{},body:outcome};
}
