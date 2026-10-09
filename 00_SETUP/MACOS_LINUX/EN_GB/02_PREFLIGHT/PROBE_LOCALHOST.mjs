import {probeHttp} from './environment.mjs';
try{const result=await probeHttp();console.log(JSON.stringify({ok:true,...result}));}catch(error){console.error(JSON.stringify({ok:false,status:'ENV_BLOCKED',error:error.code||error.message}));process.exitCode=2;}
