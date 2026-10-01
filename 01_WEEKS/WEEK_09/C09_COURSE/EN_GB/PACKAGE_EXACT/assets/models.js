/* Finite teaching models. No React, network, native history or Express execution. */
(function(root){'use strict';
 function historyCase(replace){const entries=['/notes','/notes/new'];let cursor=1;
  if(replace)entries[cursor]='/notes/42';else{entries.splice(cursor+1);entries.push('/notes/42');cursor++;}
  const destination=entries[cursor];cursor--;return{entries,destination,back:entries[cursor],operation:replace?'replace':'push'};}
 function classifyFixture(f){
  if(f.transport==='rejected')return{status:'error',class:'TRANSPORT'};
  if(!f.ok)return{status:'error',class:'HTTP',httpStatus:f.status};
  if(f.parse==='rejected')return{status:'error',class:'PARSE'};
  const b=f.body;if(!b||typeof b!=='object'||Array.isArray(b)||!Object.prototype.hasOwnProperty.call(b,'data'))return{status:'error',class:'ENVELOPE'};
  const n=b.data;if(!n||typeof n!=='object'||Array.isArray(n)||!['string','number'].includes(typeof n.id)||typeof n.title!=='string')return{status:'error',class:'SHAPE'};
  return{status:'confirmed',data:n};
 }
 const cases={
 U01:()=>{const u=new URL('/notes/42?filter=archived','https://example.invalid');return{pathname:u.pathname,filter:u.searchParams.get('filter'),claim:'URL parsing only; no route matching.'};},
 U02:()=>historyCase(false),U03:()=>historyCase(true),
 F01:()=>({events:['1: draft title is "  Alpha  "','2: simulated wait completes','3: validate trim','4: navigate to /notes/42 with replace:true'],idSource:'FIXED_LOCAL_LITERAL_42',transportRequests:0,limit:'Finite replay of source policy, not an actual timer or router.'}),
 F02:()=>({input:'   ',trimmed:'',status:'Enter a title',navigation:null,confirmation:null}),
 F03:()=>classifyFixture({ok:true,body:{data:{id:1,title:'ALPHA'}}}),
 F04:()=>classifyFixture({ok:false,status:500,parse:'rejected'}),
 F05:()=>classifyFixture({transport:'rejected'}),
 F06:()=>classifyFixture({ok:true,parse:'rejected'}),
 F07:()=>classifyFixture({ok:true,body:{note:{id:1,title:'Alpha'}}}),
 F08:()=>classifyFixture({ok:true,body:{data:null}}),
 R01:()=>({events:['1: list A starts (generation 1)','2: list B starts (generation 2)','3: B settles and may publish','4: A settles; generation mismatch rejects publication'],published:['B'],claim:'Simplified refresh-versus-refresh guard; not all interleavings.'}),
 R02:()=>{let list=[{id:'1',title:'Seed'}];const old=list.map(x=>({...x}));list=[...list,{id:'3',title:'Confirmed'}];const afterConfirmation=list.map(x=>x.id);list=old;return{events:['1: old list snapshot is pending','2: create is confirmed and appended','3: pending snapshot replaces local list'],afterConfirmation,afterOldSnapshot:list.map(x=>x.id),serverDeletionObserved:false,claim:'An explicit value model of the audited local ordering gap, not a server or React trace.'};},
 D01:()=>({kind:'PREDICTION_WORKSHEET',rows:[['GET','/notes/42','text/html','document candidate after prior handlers'],['GET','/assets/missing.js','*/*','asset miss, not index success'],['GET','/api/missing','application/json','API miss remains API response'],['POST','/notes/42','text/html','not a GET/HEAD document candidate'],['GET','/notes/42','application/json','not an HTML navigation candidate']],limit:'Finite stated policy cases, not an Express implementation or Accept negotiation.'}),
 D02:()=>({assumption:'The supplied universal handler is reached after preceding handlers decline a missing asset.',path:'/assets/missing.js',broadFallbackPrediction:'index document can mask the asset miss',desiredBoundary:'missing asset remains missing',actualHttpExecuted:false}),
 D03:()=>({sourceOrder:['API router','static middleware','universal fallback'],apiTerminalControl:{status:404,code:'api_not_found'},claim:'The supplied API boundary completes its miss; do not manufacture an API failure by changing order.',actualHttpExecuted:false}),
 D04:()=>({source:'SOURCE:05 public/index.html',documentMarker:true,scriptElement:false,bootProven:false,claim:'Receiving the marker alone does not load or execute React.'}),
 D05:()=>({filename:'assets/app-a1b2c3.js',configuredAs:'FIXED_LITERAL',contentAddressingProven:false,requiredWitness:'Compare exact bytes against the preserved fixture; do not rebuild it for this task.'})};
 function run(id){if(!Object.prototype.hasOwnProperty.call(cases,id))throw new RangeError('Unknown model scenario');return{evidenceClass:'MODEL_NOT_REACT_OR_HTTP',scenario:id,logicalOrderNotMeasuredLatency:true,output:cases[id](),boundary:'No actual application, student observation, Gemini exchange, saved PDF or submission is established.'};}
 const api=Object.freeze({run,ids:Object.freeze(Object.keys(cases)),classifyFixture,historyCase});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;root.C09Models=api;
})(typeof window!=='undefined'?window:globalThis);
