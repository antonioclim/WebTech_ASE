const key="webtech:preferences";const fallback=Object.freeze({theme:"comfortable"});
function valid(value){return value?.version===1&&["comfortable","compact"].includes(value.theme);}
export function savePreference(theme){if(!["comfortable","compact"].includes(theme))throw new Error("unsupported theme");localStorage.setItem(key,JSON.stringify({version:1,theme}));}
export function loadPreference(){const raw=localStorage.getItem(key);if(raw===null)return fallback;try{const value=JSON.parse(raw);if(valid(value))return{theme:value.theme};}catch{}localStorage.removeItem(key);return fallback;}
const output=document.querySelector("#result");const show=()=>output.textContent=`Current theme: ${loadPreference().theme}`;
document.querySelector("#save").onclick=()=>{savePreference("compact");show();};document.querySelector("#corrupt").onclick=()=>{localStorage.setItem(key,"{broken");show();};document.querySelector("#load").onclick=show;
localStorage.removeItem(key);const missing=loadPreference().theme;savePreference("compact");const saved=loadPreference().theme;localStorage.setItem(key,JSON.stringify({version:0,theme:"compact"}));const recovered=loadPreference().theme;document.body.dataset.result=missing==="comfortable"&&saved==="compact"&&recovered==="comfortable"&&!localStorage.getItem(key)?"pass":"fail";show();
