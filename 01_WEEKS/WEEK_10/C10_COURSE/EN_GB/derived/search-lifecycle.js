/* C10 derived teaching helper. Plain JS only: no Redux, thunks, entities or assessed slice. */
(function(root){
 'use strict';
 function initial(){return {requestId:null,status:'idle',items:[],error:null};}
 function transition(state,event){
  if(!state || typeof state!=='object' || !Array.isArray(state.items)) throw new TypeError('Invalid search-model state');
  if(!event || typeof event!=='object' || typeof event.type!=='string') throw new TypeError('Invalid search-model event');
  if(event.type==='reset')return initial();
  if(!['pending','fulfilled','rejected'].includes(event.type))throw new Error('Unsupported search-model event');
  if(typeof event.id!=='string'||!event.id.trim())throw new TypeError('Request identity must be a non-empty string');
  if(event.type==='pending')return {...state,requestId:event.id,status:'loading',error:null};
  if(state.requestId!==event.id)return state;
  if(event.type==='fulfilled'){
   if(!Array.isArray(event.items)||!event.items.every(x=>typeof x==='string'))throw new TypeError('Expected a string list');
   return {...state,requestId:null,status:'succeeded',items:[...event.items],error:null};
  }
  return {...state,requestId:null,status:'failed',error:'Could not complete the model search'};
 }
 const api=Object.freeze({initial,transition});if(typeof module==='object'&&module.exports)module.exports=api;else root.C10SearchLifecycle=api;
})(typeof globalThis==='object'?globalThis:this);
