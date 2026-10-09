import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {Dispatcher} from '../canonical/05-correlated-dispatcher/ws-dispatcher.mjs';
import {assessCourseEnvironment} from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({operation:'example03',cwd:process.cwd(),command:'node demonstrations/03-canonical-dispatcher-trace.mjs'});
if(environment.exitCode)process.exit(environment.exitCode);
const socket=new EventEmitter();const sent=[];let immediate=true;let pendingAtSend;
socket.send=data=>{const message=JSON.parse(data);sent.push(message);pendingAtSend=dispatcher.pendingCount;if(immediate)socket.emit('message',JSON.stringify({requestId:message.requestId,result:message.payload.text}));};
const dispatcher=new Dispatcher(socket);
try{
 const first=await dispatcher.request('display',{text:'immediate bulletin'},{timeout:1000});
 assert.equal(pendingAtSend,1);assert.equal(first,'immediate bulletin');
 immediate=false;
 const left=dispatcher.request('display',{text:'left bulletin'},{timeout:1000});
 const right=dispatcher.request('display',{text:'right bulletin'},{timeout:1000});
 const [a,b]=sent.slice(-2);socket.emit('message',JSON.stringify({requestId:b.requestId,result:b.payload.text}));socket.emit('message',JSON.stringify({requestId:a.requestId,result:a.payload.text}));
 const values=await Promise.all([left,right]);assert.deepEqual(values,['left bulletin','right bulletin']);
 const timeoutOutcome=await dispatcher.request('display',{text:'unobserved remote work'},{timeout:10}).then(()=>({resolved:true}),error=>({error:error.message}));
 assert.deepEqual(timeoutOutcome,{error:'request_timeout'});assert.equal(dispatcher.pendingCount,0);
 const remainingListeners={message:socket.listenerCount('message'),close:socket.listenerCount('close')};
 console.log(JSON.stringify({evidenceClass:'UNCHANGED_PUBLIC_DISPATCHER_WITH_OWNED_SOCKET_FACADE',pendingAtImmediateSend:1,reversedResults:values,timeoutOutcome,pendingAfterTimeout:dispatcher.pendingCount,remainingListeners,limits:['EventEmitter facade, no WebSocket/network','canonical dispatcher is ID-only, no expected-type gate','no abort support or automatic global-listener teardown','local timeout gives no evidence of remote cancellation']},null,2));
}finally{dispatcher.dispose();socket.removeAllListeners();}
