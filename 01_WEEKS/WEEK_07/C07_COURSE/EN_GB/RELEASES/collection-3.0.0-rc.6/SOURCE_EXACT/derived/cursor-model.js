/* C07-D01: fixed numeric snapshot model. Not SQL, a server or canonical Example04. */
(function(root){'use strict';
const fixture=Object.freeze([{id:2,rank:10},{id:3,rank:20},{id:1,rank:30}].map(Object.freeze));
function checked(rows,size,after){
 if(!Array.isArray(rows)||rows.length>1000||!Number.isInteger(size)||size<1||size>20)throw new TypeError('Bounded rows and page size 1..20 required');
 const ids=new Set();for(const r of rows){if(!r||Object.keys(r).sort().join(',')!=='id,rank'||!Number.isSafeInteger(r.id)||r.id<1||!Number.isFinite(r.rank)||ids.has(r.id))throw new TypeError('Unique positive IDs and finite numeric ranks required');ids.add(r.id);}
 if(after!==null&&(!after||Object.keys(after).sort().join(',')!=='id,rank'||!Number.isSafeInteger(after.id)||after.id<1||!Number.isFinite(after.rank)))throw new TypeError('Cursor must be the rank/ID tuple');
 return rows.map(x=>({...x})).sort((a,b)=>a.rank-b.rank||a.id-b.id);
}
function page(rows,size=2,after=null){const sorted=checked(rows,size,after);return sorted.filter(r=>after===null||r.rank>after.rank||(r.rank===after.rank&&r.id>after.id)).slice(0,size);}
function wrongIdPage(rows,size=2,after=null){const sorted=checked(rows,size,after);return sorted.filter(r=>after===null||r.id>after.id).slice(0,size);}
const API=Object.freeze({fixture,page,wrongIdPage});if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.C07Cursor=API;
})(typeof globalThis!=='undefined'?globalThis:this);
