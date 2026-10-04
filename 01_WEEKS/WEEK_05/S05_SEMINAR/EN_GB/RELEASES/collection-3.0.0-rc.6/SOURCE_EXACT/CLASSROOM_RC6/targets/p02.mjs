export function terminalLogger({id,start,clock,logger}){
 // TODO: closure called with status; log {id,status,elapsed:clock()-start} once.
 // Multiple finish/close invocations must not create multiple terminal records.
 return status=>logger({id,status,elapsed:clock()-start});
}
