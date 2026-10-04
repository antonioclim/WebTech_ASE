export default async function* reporter(source) {
  for await(const event of source) {
    if(event.type!=='test:pass'&&event.type!=='test:fail')continue;
    const errors=[];let error=event.data.details?.error;
    for(let i=0;error&&i<6;i++,error=error.cause)errors.push({name:error.name||null,code:error.code||null,failureType:error.failureType||null});
    if(error)errors.push({name:'Error',code:'ERR_CAUSE_CHAIN_TRUNCATED',failureType:'testCodeFailure'});
    yield JSON.stringify({type:event.type,name:event.data.name,errors})+'\n';
  }
}
