export function resourceResponse(method,outcome,{sessionId,attendeeId}){
 // TODO PUTcreated=>201+Location /api/sessions/<sid>/registrations/<aid>,{data};
 // PUTexisting=>200,{data}; DELETEremoved/absent=>204,no body; unknown=>405.
 // Return {status,headers,body}, headers{} except creation; null body for204.
 void method;void outcome;void sessionId;void attendeeId;return {status:405,headers:{},body:{error:'method_not_allowed'}};
}
