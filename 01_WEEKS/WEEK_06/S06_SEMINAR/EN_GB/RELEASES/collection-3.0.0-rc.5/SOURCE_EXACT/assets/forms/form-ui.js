/* Offline DOM adapter: text-only evidence, explicit storage and complete plain-text print snapshots. */
(function(){'use strict';
const S=globalThis.S06_SCHEMA,C=globalThis.S06Core,$=id=>document.getElementById(id),key='TW2026_S06_FORM_v1.2.0';
let provenance=C.freshProvenance(),lastMode='core',autoTimer,revision=0,importSerial=0;
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
const nodes={};
for(const section of S.sections){
 const box=el('section');box.id='section-'+section.id;box.append(el('h2',section.title),el('p',section.intro));
 for(const f of section.fields){
  const wrap=el('div');wrap.className='field';const label=el('label',f.label+' ['+f.id+']');label.htmlFor=f.id;
  const phase=el('span',f.phase==='core'?'Core draft field':'Final field');phase.className='phase';label.append(phase);
  const help=el('p',f.help);help.id=f.id+'_help';help.className='help';
  const input=el(f.kind==='select'?'select':f.kind==='textarea'?'textarea':'input');input.id=f.id;input.name=f.id;
  if(f.kind==='select')for(const value of f.options){const option=el('option',value||'Choose…');option.value=value;input.append(option);}
  else if(f.kind==='textarea'){input.rows=5;input.maxLength=f.max;input.spellcheck=false;}
  else{input.type=f.kind==='checkbox'?'checkbox':'text';if(f.kind!=='checkbox')input.maxLength=f.max;}
  input.setAttribute('aria-describedby',help.id+' '+f.id+'_error');const error=el('p');error.id=f.id+'_error';error.className='error';
  wrap.append(label,help,input,error);box.append(wrap);nodes[f.id]=input;
 }
 $('fields').append(box);
 const link=el('a',section.title);link.href='#'+box.id;$('sections').append(link);
}
function values(){return Object.fromEntries(C.list(S).map(f=>[f.id,f.kind==='checkbox'?nodes[f.id].checked:nodes[f.id].value]));}
function populate(data){revision++;for(const f of C.list(S)){if(f.kind==='checkbox')nodes[f.id].checked=data[f.id];else nodes[f.id].value=data[f.id];}clearErrors();update();}
function message(text){$('message').textContent=text;}
function update(){const name=C.filename(values());$('filename').textContent=name||'Enter group, surname and first name to generate the filename.';$('provenance').textContent=provenance.state+(provenance.sourceVersion?' | imported source v'+provenance.sourceVersion:'');$('migration').textContent=provenance.missingAddedFields.length?'Added fields were blank at migration: '+provenance.missingAddedFields.join(', ')+'. Review these and every imported observation; no new execution or original prediction was created.':'';}
function clearErrors(){for(const f of C.list(S)){$(f.id+'_error').textContent='';nodes[f.id].removeAttribute('aria-invalid');}}
function validate(mode,focus=true){lastMode=mode;clearErrors();const r=C.check(values(),S,mode);for(const x of r.errors){$(x.id+'_error').textContent=x.message;nodes[x.id].setAttribute('aria-invalid','true');}message(r.ok?r.state+' — structure only; this does not certify code, evidence, teacher approval or Moodle submission.':r.errors.length+' field issue(s). Your text remains in the form.');if(focus&&r.errors.length)nodes[r.errors[0].id].focus();return r;}
function saveLocal(){try{localStorage.setItem(key,JSON.stringify(C.pack(values(),S,provenance)));$('storage').textContent='Local browser draft stored. Export JSON as the portable backup and confirm that it saved.';}catch(e){$('storage').textContent='LOCAL SAVE FAILED: '+e.message+'. Export JSON instead.';}}
function exportJSON(){try{const text=JSON.stringify(C.pack(values(),S,provenance),null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=(C.filename(values())||'TW2026_S06_DRAFT.pdf').replace(/\.pdf$/,'.json');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message('JSON export requested. Find the saved file in your browser download folder and confirm its name. This is a private draft, not a Moodle submission.');}catch(e){message('EXPORT FAILED: '+e.message);}}
function importText(text,allowLegacy=false){const incoming=C.cleanImport(text,S,{allowLegacy});clearTimeout(autoTimer);$('autosave').checked=false;populate(incoming.values);provenance=incoming.provenance;update();message(incoming.provenance.sourceVersion==='1.1.0'?'v1.1.0 migrated explicitly. New fields remain blank and declaration is reset. Imported evidence is unverified; no predictions or observations were fabricated.':'Draft imported. Declaration reset and autosave off. Review all observations before renewing it; no experiment was re-executed.');}
function preparePrint(mode){const report=validate(mode,false);if(mode==='final'&&!report.ok){nodes[report.errors[0].id].focus();return false;}
 const target=$('print-output');target.replaceChildren();target.append(el('h1','S06 Query API individual evidence'));
 target.append(el('p',mode==='final'?'FINAL FIELDS COMPLETE NOT VERIFIED — evidence remains student-declared.':'CORE DRAFT NOT FINAL — pending observations and incomplete implementation remain explicitly labelled.'));
 const data=values();target.append(el('p',C.filename(data)||'Filename pending: identity incomplete'),el('p','Form schema v1.2.0 | '+provenance.state+(provenance.sourceVersion?' | imported source v'+provenance.sourceVersion:'')));
 if(provenance.missingAddedFields.length)target.append(el('p','Migration record: these additions began blank: '+provenance.missingAddedFields.join(', ')+'.'));
 for(const s of S.sections){const box=el('section');box.append(el('h2',s.title));for(const f of s.fields){box.append(el('h3',f.label+' ['+f.id+']'));const v=f.kind==='checkbox'?(data[f.id]?'DECLARED BY STUDENT':'NOT DECLARED'):(data[f.id]||'PENDING / NOT ENTERED');const p=el('p',v);p.className='print-value';box.append(p);}target.append(box);}
 target.append(el('p','This document is not a programme test result, authenticated teacher decision or Moodle receipt. No screenshots are required; bounded actual text excerpts are supported.'));
 document.title=(C.filename(data)||'TW2026_S06_DRAFT.pdf').replace(/\.pdf$/,'');return true;
}
$('core').addEventListener('click',()=>validate('core'));$('final').addEventListener('click',()=>validate('final'));$('export').addEventListener('click',exportJSON);$('save').addEventListener('click',saveLocal);
$('restore').addEventListener('click',()=>{try{const text=localStorage.getItem(key);if(!text)return message('No v1.2.0 draft found at this file origin. Browser/device/origin changes can hide another draft; import your exported JSON instead.');if(!confirm('Replace current fields with the saved local draft? Export unsaved work first.'))return;importText(text);}catch(e){message('RESTORE FAILED: '+e.message);}});
$('import').addEventListener('change',async event=>{const f=event.target.files[0];if(!f)return;try{if(f.size>S.maxImportBytes)throw Error('Import exceeds 2,000,000 bytes.');if(!confirm('Replace current fields with this JSON draft? Export current work first. Any declaration will be reset.'))return;const token=++importSerial,seen=revision,allowLegacy=$('allow-legacy').checked,text=await f.text();if(token!==importSerial||seen!==revision)throw Error('Fields changed while import was read. Export current work and retry.');importText(text,allowLegacy);}catch(e){message('IMPORT REJECTED: '+e.message);}finally{event.target.value='';}});
$('clear').addEventListener('click',()=>{if(!confirm('Clear current fields and this browser draft? Exported files, other versions and backups will remain.'))return;clearTimeout(autoTimer);$('autosave').checked=false;let removed=true;try{localStorage.removeItem(key);}catch(_){removed=false;}provenance=C.freshProvenance();populate(C.defaults(S));message(removed?'Fields and this v1.2.0 browser draft cleared. Exported files and other-version drafts remain.':'Fields cleared, but this browser draft could not be cleared. Exported files and possibly stored data remain.');$('storage').textContent=removed?'Autosave off.':'LOCAL CLEAR FAILED.';});
$('fields').addEventListener('input',()=>{revision++;message('Edited — recheck fields and inspect the newly saved PDF.');update();if($('autosave').checked){clearTimeout(autoTimer);autoTimer=setTimeout(saveLocal,350);}});
$('autosave').addEventListener('change',()=>{if($('autosave').checked)saveLocal();else{clearTimeout(autoTimer);$('storage').textContent='Autosave off. Existing stored draft remains until you clear it.';}});
$('print-draft').addEventListener('click',()=>{if(preparePrint('core'))window.print();});$('print-final').addEventListener('click',()=>{if(preparePrint('final'))window.print();});
window.addEventListener('beforeprint',()=>{if(!preparePrint(lastMode))preparePrint('core');});window.addEventListener('afterprint',()=>{lastMode='core';});
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();preparePrint('core');window.print();}});
window.S06Form={values,populate,validate,importText,preparePrint,saveLocal,exportJSON};populate(C.defaults(S));
})();
