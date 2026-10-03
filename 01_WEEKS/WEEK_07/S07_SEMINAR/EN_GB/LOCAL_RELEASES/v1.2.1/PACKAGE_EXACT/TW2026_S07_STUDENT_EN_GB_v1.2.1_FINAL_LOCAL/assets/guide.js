(()=>{
'use strict';
const $=id=>document.getElementById(id);
const KEY='tw2026-s07-guide-progress-v1';
const LIMIT=500000;
const ids=Array.from(document.querySelectorAll('.step-check')).map(n=>n.id);
let progressRevision=0,timerRemaining=3600000,timerJob=null,lastWall=0,lastMono=0;
const osRoutes={"Windows": "Suggested Windows route: use File Explorer to open the extracted copy, then VS Code File → Open Folder at the student root. Quote the full path containing spaces or #. Usual developer-tools entry: F12 or the browser menu. Current native wording is unqualified.", "macOS": "Suggested macOS route: use Finder to open the extracted copy, then VS Code File → Open Folder at the student root. Quote the full path in any shell. Use the browser’s usual developer-tools shortcut or its Tools/Develop menu. Current native wording is unqualified.", "Linux": "Suggested Linux route: use your file manager to open the extracted copy, then the editor’s Open Folder at the student root. Quote the full path in any shell. Usual developer-tools entry: F12 or the browser menu. Current native wording is unqualified."};
const browserRoutes={"Chrome": "Chrome proposal: in developer tools select Network, clear stale requests and inspect the actual supplied application request’s origin, method and response. A file: guide tab is not application HTTP evidence.", "Edge": "Edge proposal: in developer tools select Network, clear stale requests and inspect the actual supplied application request’s origin, method and response. A file: guide tab is not application HTTP evidence.", "Firefox": "Firefox proposal: in developer tools select Network, clear stale requests and inspect the actual supplied application request’s origin, method and response. Tab names and layout require actual-surface review.", "Other browser": "Other browser: locate its actual developer-tools/network route with the teacher. Do not infer native support from this guide. Use the observer’s labelled request record when genuine execution is ready."};
function status(text){$('guide-status').textContent=text}
function state(){return{schema:'tw2026.s07.guide-progress.v1',scope:'CHECKLIST_ONLY_NOT_ASSESSMENT_EVIDENCE',os:$('os').value,browser:$('browser').value,steps:Object.fromEntries(ids.map(id=>[id,$(id).checked]))}}
function update(){
  $('route-help').textContent=(osRoutes[$('os').value]||'Choose a supported OS route.')+' '+(browserRoutes[$('browser').value]||'Choose a supported browser route.');
  const n=ids.filter(id=>$(id).checked).length;
  $('progress').value=n;
  $('progress-label').textContent=n+' of '+ids.length+' guide steps checked. Checkmarks do not authenticate work.';
  $('route').textContent='Selected route: '+$('os').value+' · '+$('browser').value+'; actual versions belong in the evidence form.';
}
function persist(){
  update();
  if(!$('save-local').checked)return null;
  try{localStorage.setItem(KEY,JSON.stringify(state()));status('Guide progress saved locally. This is checklist state, not evidence.');return true}
  catch(e){status('Local saving unavailable. Current checkmarks remain visible; export a progress backup.');return false}
}
function validate(s){
  const keys=['schema','scope','os','browser','steps'];
  if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).length!==keys.length||!keys.every(k=>Object.prototype.hasOwnProperty.call(s,k))||s.schema!=='tw2026.s07.guide-progress.v1'||s.scope!=='CHECKLIST_ONLY_NOT_ASSESSMENT_EVIDENCE'||!s.steps||typeof s.steps!=='object'||Array.isArray(s.steps))throw Error('Wrong progress-backup format');
  if(!Array.from($('os').options).some(o=>o.value===s.os)||!Array.from($('browser').options).some(o=>o.value===s.browser))throw Error('Unknown route');
  if(Object.keys(s.steps).length!==ids.length||!ids.every(id=>Object.prototype.hasOwnProperty.call(s.steps,id)&&typeof s.steps[id]==='boolean'))throw Error('Missing step or invalid state');
  return{schema:s.schema,scope:s.scope,os:s.os,browser:s.browser,steps:Object.fromEntries(ids.map(id=>[id,s.steps[id]]))};
}
function parse(raw){
  if(new Blob([raw]).size>LIMIT)throw Error('Progress file too large');
  return validate(JSON.parse(raw));
}
function apply(s){$('os').value=s.os;$('browser').value=s.browser;for(const id of ids)$(id).checked=s.steps[id];update()}
function changed(){progressRevision++;persist()}
ids.forEach(id=>$(id).addEventListener('change',changed));
['os','browser'].forEach(id=>$(id).addEventListener('change',changed));
$('save-local').addEventListener('change',()=>{
  progressRevision++;
  if(!$('save-local').checked){status('Local saving disabled. Existing backup is retained until you explicitly remove it.');return}
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const candidate=parse(raw);
      if(JSON.stringify(candidate)!==JSON.stringify(state())&&!window.confirm('Load the stored guide checklist and replace the currently visible route and checkmarks? This is unverified progress only.')){
        $('save-local').checked=false;status('Stored progress was not loaded. Visible progress and the stored backup were retained; local saving is off.');return;
      }
      apply(candidate);status('Stored guide checklist loaded; it is unverified progress only.');
    }else persist();
  }catch(e){$('save-local').checked=false;status('Stored progress unavailable or invalid; visible state and the stored backup were retained. Local saving is off.');}
});
$('export-progress').addEventListener('click',()=>{
  let url=null;
  try{
    const blob=new Blob([JSON.stringify(state(),null,2)],{type:'application/json'});
    const a=document.createElement('a');url=URL.createObjectURL(blob);a.href=url;a.download='S07_GUIDE_PROGRESS.json';a.click();
    status('Progress download requested. Verify the file exists; this is not the evidence-form backup.');
  }catch(e){status('Download failed. Current checkmarks retained.')}
  finally{if(url!==null)setTimeout(()=>URL.revokeObjectURL(url),1000)}
});
$('import-progress').addEventListener('change',async e=>{
  const attempt=++progressRevision;
  const f=e.target.files[0];if(!f)return;
  try{
    if(f.size>LIMIT)throw Error('Progress file too large');
    const raw=await f.text();
    if(attempt!==progressRevision)return;
    const candidate=parse(raw);
    apply(candidate);
    const saved=persist();
    status(saved===false?'Checklist imported visibly, but local saving unavailable. Export a backup; this is progress only, not observed evidence.':'Checklist imported. It records progress only, not observed evidence.');
  }catch(err){if(attempt===progressRevision)status('Import refused: '+err.message+'. Existing visible state retained.')}
  finally{if(attempt===progressRevision)e.target.value=''}
});
$('reset-progress').addEventListener('click',()=>{
  if(!window.confirm('Clear these guide checkmarks and stored guide progress? Evidence-form data is separate.'))return;
  progressRevision++;
  for(const id of ids)$(id).checked=false;
  let removed=true;
  try{localStorage.removeItem(KEY)}catch(e){removed=false;$('save-local').checked=false}
  update();
  status(removed?'Guide progress cleared. Evidence-form data was not accessed.':'Visible guide checkmarks cleared, but the stored backup was not removed. Local saving is off; evidence-form data was not accessed.');
});
$('contrast').addEventListener('click',e=>{document.body.classList.toggle('contrast');e.target.setAttribute('aria-pressed',String(document.body.classList.contains('contrast')))});
$('projector').addEventListener('click',e=>{document.body.classList.toggle('projector');e.target.setAttribute('aria-pressed',String(document.body.classList.contains('projector')))});
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const n=$(b.dataset.copy);
  try{if(!navigator.clipboard)throw Error('clipboard unavailable');await navigator.clipboard.writeText(n.textContent);status('Command copied on this browser.')}
  catch(e){
    try{const range=document.createRange();range.selectNodeContents(n);const sel=window.getSelection();if(!sel)throw Error('selection unavailable');sel.removeAllRanges();sel.addRange(range);status('Clipboard blocked. Command selected; copy it manually with your browser shortcut.')}
    catch(selectionError){status('Clipboard and automatic selection are unavailable. Select and copy the visible command manually. Current progress is retained.')}
  }
}));
$('symptom').addEventListener('change',e=>{document.querySelectorAll('.recovery-panel').forEach(p=>p.hidden=p.id!=='recovery-'+e.target.value)});
function monoNow(){return typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now()}
function renderTime(){const seconds=Math.ceil(timerRemaining/1000);$('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function stopped(){$('timer-status').textContent='STOP: content minute 60. Save the real draft and pending work.'}
function syncTimer(){
  if(timerJob===null)return;
  const wall=Date.now(),mono=monoNow();
  const elapsed=Math.max(0,wall-lastWall,mono-lastMono);
  timerRemaining=Math.max(0,timerRemaining-elapsed);lastWall=wall;lastMono=mono;renderTime();
  if(timerRemaining===0){clearInterval(timerJob);timerJob=null;stopped()}
}
$('timer-start').addEventListener('click',()=>{
  if(timerJob!==null||timerRemaining===0)return;
  lastWall=Date.now();lastMono=monoNow();timerJob=setInterval(syncTimer,1000);
  $('timer-status').textContent='Manual content timer running. Elapsed time is recalculated when this page resumes; the teacher clock remains authoritative. This is not an attendance or evidence record.';
});
$('timer-pause').addEventListener('click',()=>{syncTimer();if(timerJob!==null)clearInterval(timerJob);timerJob=null;if(timerRemaining===0)stopped();else $('timer-status').textContent='Timer paused.'});
$('timer-reset').addEventListener('click',()=>{if(timerJob!==null)clearInterval(timerJob);timerJob=null;timerRemaining=3600000;renderTime();$('timer-status').textContent='Reset to 60 content minutes.'});
document.addEventListener('visibilitychange',syncTimer);
window.addEventListener('pageshow',syncTimer);
$('print-guide').addEventListener('click',()=>window.print());
update();renderTime();status('Guide enhanced controls ready. Local saving is off until selected; assessment form data is separate.');
})();
