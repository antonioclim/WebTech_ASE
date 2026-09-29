(function(){'use strict';
const S=globalThis.S06_SCHEMA,C=globalThis.S06Core,$=id=>document.getElementById(id),key='TW2026_S06_FORM_1_v1.1.0';
let provenance='USER_ENTERED_UNVERIFIED_DRAFT',lastMode='core',autoTimer,revision=0,importSerial=0;
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
const fieldNodes={};
for(const section of S.sections){
 const box=el('section');box.id='section-'+section.id;box.append(el('h2',section.title),el('p',section.intro));
 for(const f of section.fields){
  const wrap=el('div');wrap.className='field';const label=el('label',f.label+' ['+f.id+']');label.htmlFor=f.id;
  const help=el('p',f.help);help.id=f.id+'_help';help.className='help';
  let input=el(f.kind==='select'?'select':f.kind==='textarea'?'textarea':'input');input.id=f.id;input.name=f.id;
  if(f.kind==='select')for(const value of f.options){const option=el('option',value||'Choose…');option.value=value;input.append(option);}
  else if(f.kind==='textarea'){input.rows=4;input.maxLength=f.max;}
  else {input.type=f.kind==='checkbox'?'checkbox':'text';if(f.kind!=='checkbox')input.maxLength=f.max;}
  input.setAttribute('aria-describedby',help.id+' '+f.id+'_error');
  const error=el('p');error.id=f.id+'_error';error.className='error';
  wrap.append(label,help,input,error);box.append(wrap);fieldNodes[f.id]=input;
 }
 $('fields').append(box);
}
function values(){return Object.fromEntries(C.list(S).map(f=>[f.id,f.kind==='checkbox'?fieldNodes[f.id].checked:fieldNodes[f.id].value]));}
function populate(data){revision++;for(const f of C.list(S)){if(f.kind==='checkbox')fieldNodes[f.id].checked=data[f.id];else fieldNodes[f.id].value=data[f.id];}clearErrors();update();}
function message(text){$('message').textContent=text;}
function update(){const name=C.filename(values());$('filename').textContent=name||'Enter group and both names to generate a filename.';$('provenance').textContent=provenance;}
function clearErrors(){for(const f of C.list(S)){$(f.id+'_error').textContent='';fieldNodes[f.id].removeAttribute('aria-invalid');}}
function validate(mode,focus=true){lastMode=mode;clearErrors();const r=C.check(values(),S,mode);for(const x of r.errors){$(x.id+'_error').textContent=x.message;fieldNodes[x.id].setAttribute('aria-invalid','true');}message(r.ok?r.state+' — this does not certify code, evidence or Moodle submission.':r.errors.length+' field issue(s). Your text has been retained.');if(focus&&r.errors.length)fieldNodes[r.errors[0].id].focus();return r;}
function saveLocal(){try{localStorage.setItem(key,JSON.stringify(C.pack(values(),S,provenance)));$('storage').textContent='Local browser draft stored. Export JSON as the portable backup.';}catch(e){$('storage').textContent='LOCAL SAVE FAILED: '+e.message+'. Export JSON instead.';}}
function exportJSON(){try{const text=JSON.stringify(C.pack(values(),S,provenance),null,2);const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=(C.filename(values())||'TW2026_S06_DRAFT.pdf').replace(/\.pdf$/,'.json');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message('JSON export requested. Confirm the browser saved the file; this is not a Moodle submission.');}catch(e){message('EXPORT FAILED: '+e.message);}}
function importText(text){const incoming=C.cleanImport(text,S);populate(incoming.values);provenance=incoming.provenance;update();message('Draft imported. No experiment was re-executed. Review every observation and renew the declaration.');}
function preparePrint(mode){const report=validate(mode);if(mode==='final'&&!report.ok)return false;
 const target=$('print-output');target.replaceChildren();target.append(el('h1','TW2026 S06 — Individual query and persistence evidence'));
 target.append(el('p',mode==='final'?'FINAL FORM — fields complete; evidence remains student-declared.':'CORE DRAFT / NOT FINAL — ORM/HTTP evidence, unfinished P02 and Gemini may remain pending.'));
 target.append(el('p',C.filename(values())||'Filename pending: identity incomplete'),el('p','Form v1.1.0 | '+provenance));
 const data=values();for(const s of S.sections){const box=el('section');box.append(el('h2',s.title));for(const f of s.fields){box.append(el('h3',f.label+' ['+f.id+']'));const value=f.kind==='checkbox'?(data[f.id]?'DECLARED':'NOT DECLARED'):(data[f.id]||'PENDING / NOT ENTERED');const p=el('p',value);p.className='print-value';box.append(p);}target.append(box);}
 document.title=(C.filename(data)||'TW2026_S06_DRAFT.pdf').replace(/\.pdf$/,'');return true;
}
$('core').addEventListener('click',()=>validate('core'));$('final').addEventListener('click',()=>validate('final'));
$('export').addEventListener('click',exportJSON);$('save').addEventListener('click',saveLocal);
$('restore').addEventListener('click',()=>{try{const text=localStorage.getItem(key);if(!text)return message('No saved browser draft was found at this file origin.');if(!confirm('Replace current fields with the saved local draft? Unsaved text will be replaced.'))return;importText(text);}catch(e){message('RESTORE FAILED: '+e.message);}});
$('import').addEventListener('change',async event=>{const f=event.target.files[0];if(!f)return;try{if(f.size>S.maxImportBytes)throw Error('Import exceeds 2,000,000 bytes.');if(!confirm('Replace current fields with the selected JSON draft? Export current work first.'))return;const token=++importSerial,seen=revision;const text=await f.text();if(token!==importSerial||seen!==revision)throw Error('Fields changed while import was being read. Export current work and retry.');importText(text);}catch(e){message('IMPORT REJECTED: '+e.message);}finally{event.target.value='';}});
$('clear').addEventListener('click',()=>{if(!confirm('Clear current fields and this browser draft? Exported JSON/PDF files and other backups will NOT be deleted.'))return;clearTimeout(autoTimer);$('autosave').checked=false;let removed=true;try{localStorage.removeItem(key);}catch(_){removed=false;}provenance='USER_ENTERED_UNVERIFIED_DRAFT';populate(C.defaults(S));message(removed?'Fields and this browser draft cleared. Exported files remain.':'Fields cleared, but browser storage could not be cleared. Exported files and possibly the stored draft remain.');$('storage').textContent=removed?'Autosave off.':'LOCAL CLEAR FAILED.';});
$('fields').addEventListener('input',()=>{revision++;message('Edited — recheck fields before final export.');update();if($('autosave').checked){clearTimeout(autoTimer);autoTimer=setTimeout(saveLocal,350);}});
$('autosave').addEventListener('change',()=>{if($('autosave').checked)saveLocal();else {clearTimeout(autoTimer);$('storage').textContent='Autosave off. Existing stored draft is not deleted.';}});
$('print-draft').addEventListener('click',()=>{if(preparePrint('core'))window.print();});
$('print-final').addEventListener('click',()=>{if(preparePrint('final'))window.print();});
window.addEventListener('beforeprint',()=>{if(!preparePrint(lastMode))preparePrint('core');});
window.addEventListener('afterprint',()=>{lastMode='core';});
// Rebuild on normal print so edits cannot be omitted from a previously prepared snapshot.
window.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){event.preventDefault();preparePrint('core');window.print();}});
window.S06Form={values,populate,validate,importText,preparePrint,saveLocal,exportJSON};populate(C.defaults(S));
})();
