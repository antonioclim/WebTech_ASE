/* NEW S09 v1.2.0 offline UI. Imported text is rendered only with textContent/value. */
(function(){'use strict';
const S=JSON.parse(document.getElementById('ui-schema').textContent),C=globalThis.S09FormCore,$=id=>document.getElementById(id);
const key='TW2026_S09_FORM_DRAFT_v1.2.0';
let provenance='USER_ENTERED_UNVERIFIED_DRAFT',revision=0,importSerial=0,autoTimer,lastPrint='draft';
const nodes=Object.create(null);
function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function message(text){$('ui-message').textContent=text;}
for(const section of S.sections){
 const box=el('section');box.id='section-'+section.id;box.append(el('h2',section.title),el('p',section.intro));
 for(const field of section.fields){
  const wrap=el('div');wrap.className='field';const label=el('label',field.label+' ['+field.id+']');label.htmlFor=field.id;
  const help=el('p',field.help);help.id=field.id+'_help';help.className='help';
  if(field.origin==='NEW_V1_2_0_FIELD')help.append(el('span',' Added in v1.2.0.'));
  const input=el(field.kind==='select'?'select':field.kind==='textarea'?'textarea':'input');input.id=field.id;input.name=field.id;
  if(field.kind==='select')for(const value of field.options){const option=el('option',value||'Choose a truthful status…');option.value=value;input.append(option);}
  else if(field.kind==='textarea'){input.rows=5;input.maxLength=field.max;input.placeholder=field.placeholder;}
  else {input.type=field.kind==='checkbox'?'checkbox':'text';if(field.kind!=='checkbox'){input.maxLength=field.max;input.placeholder=field.placeholder;}}
  if(field.kind==='readonly_text'){input.readOnly=true;input.setAttribute('aria-readonly','true');}
  input.setAttribute('aria-describedby',field.id+'_help '+field.id+'_error');
  const error=el('p');error.id=field.id+'_error';error.className='error';
  wrap.append(label,help,input,error);box.append(wrap);nodes[field.id]=input;
 }
 $('ui-fields').append(box);
}
function values(){return Object.fromEntries(C.list(S).map(field=>[field.id,field.kind==='checkbox'?nodes[field.id].checked:nodes[field.id].value]));}
function clearErrors(){for(const field of C.list(S)){ $(field.id+'_error').textContent='';nodes[field.id].removeAttribute('aria-invalid');}}
function update(){const name=C.filename(values());$('ui-filename').textContent=name||'Proposed filename: enter GROUP | Surname | Firstname.';$('ui-provenance').textContent='Record provenance: '+provenance;}
function replaceFields(data,newProvenance){
 clearTimeout(autoTimer);revision++;importSerial++;const fresh=C.defaults(S);
 for(const field of C.list(S))if(Object.prototype.hasOwnProperty.call(data,field.id))fresh[field.id]=data[field.id];
 C.validateValues(fresh,S);
 for(const field of C.list(S)){if(field.kind==='checkbox')nodes[field.id].checked=fresh[field.id];else nodes[field.id].value=fresh[field.id];}
 provenance=newProvenance;lastPrint='draft';$('ui-print-output').replaceChildren();clearErrors();update();
 $('ui-post-state').textContent='Saved-PDF review: not observed by this form. Moodle submission: not observed by this form. Keep later actual observations in a separate personal or private record.';
}
function validate(mode,focus=true){
 clearErrors();const report=C.check(values(),S,mode);
 for(const error of report.errors){$(error.id+'_error').textContent=error.message;nodes[error.id].setAttribute('aria-invalid','true');}
 message(report.ok?report.state+' — structure only; no runtime certification, automatic mark or Moodle submission.':report.errors.length+' record issue(s). Your text is retained. A truthful draft remains exportable.');
 if(focus&&report.errors.length)nodes[report.errors[0].id].focus();return report;
}
function saveLocal(){
 try{localStorage.setItem(key,JSON.stringify(C.pack(values(),S,provenance)));$('ui-storage').textContent='Browser draft stored at this file origin. Export JSON as a portable backup.';}
 catch(error){$('ui-storage').textContent='LOCAL SAVE FAILED: '+error.message+'. Use Export JSON draft and confirm the downloaded file exists.';}
}
function exportJSON(){
 try{const text=JSON.stringify(C.pack(values(),S,provenance),null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');
  a.href=url;a.download=(C.filename(values())||'TW2026_S09_DRAFT.pdf').replace(/\.pdf$/,'.json');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  message('JSON download requested. Confirm the browser saved it. JSON is an unverified draft and is not the PDF or a Moodle submission.');}
 catch(error){message('EXPORT FAILED: '+error.message);}
}
function acceptImport(text,legacy){
 const imported=C.importDraft(text,S,legacy);
 replaceFields(imported.values,imported.provenance);
 message((legacy?'Old v1.1.0 draft migrated into all 54 fields. New fields start at their defaults.':'All 54 fields replaced from an unverified imported draft.')+' Declaration, privacy review and PDF-review state were reset. No experiment was re-executed and no approval or submission was authenticated.');
}
async function fileImport(event,legacy){
 const file=event.target.files[0];if(!file)return;
 try{if(file.size>S.maxImportBytes)throw Error('File exceeds 5,000,000 bytes.');
  if(!confirm('Replace the current record with this '+(legacy?'v1.1.0':'v1.2.0')+' draft? Export current work first. Personal attestations and review state will reset.'))return;
  const token=++importSerial,seen=revision,text=await file.text();
  if(token!==importSerial||seen!==revision)throw Error('The fields changed while the file was read. Export current work and select the file again.');
  acceptImport(text,legacy);
 }catch(error){message('IMPORT REJECTED: '+error.message+'. Existing fields are retained.');}finally{event.target.value='';}
}
function preparePrint(mode,announce=true){
 if(mode==='candidate'&&!validate('candidate',announce).ok)return false;
 const data=values(),record=C.check(data,S,'record'),target=$('ui-print-output');target.replaceChildren();
 target.append(el('h1','TW2026 S09 — Individual routing and document-delivery evidence'));
 target.append(el('p',mode==='candidate'?'FIRST PDF CANDIDATE — preconditions recorded; this file has not been observed saved or reviewed.':'TRUTHFUL DRAFT — required work may remain PENDING, BLOCKED or NOT_EXECUTED.'));
 target.append(el('p','Record check: '+record.state+'. This does not authenticate code, execution, Gemini evidence or Moodle submission.'));
 target.append(el('p',C.filename(data)||'Filename pending: incomplete identity'),el('p','Form v1.2.0 | '+provenance));
 target.append(el('p','HTML text-only route: a typed image filename does not insert a capture. Every cited capture must appear in the same PDF through the matching DOCX route.'));
 for(const section of S.sections){const box=el('section');box.append(el('h2',section.title));for(const field of section.fields){box.append(el('h3',field.label+' ['+field.id+']'));const value=field.kind==='checkbox'?(data[field.id]?'PERSONALLY DECLARED':'NOT DECLARED'):(data[field.id]||'PENDING / NOT ENTERED');const p=el('p',value);p.className='print-value';box.append(p);}target.append(box);}
 target.append(el('p','Save this PDF, reopen the exact saved file and inspect every page. Record saved-file review and later actual Moodle status separately, outside this first-export prerequisite.'));
 document.title=(C.filename(data)||'TW2026_S09_DRAFT.pdf').replace(/\.pdf$/,'');lastPrint=mode;
 if(announce)message('Print content prepared from the current 54 fields. Confirm the actual save separately; this form cannot observe saved-file or Moodle state.');return true;
}
function print(mode){if(mode==='candidate'){if(!validate('candidate').ok)return;nodes.pdf_status.value='FIRST_EXPORT_CANDIDATE_NOT_YET_REVIEWED';update();}if(preparePrint(mode))window.print();}
$('ui-core').addEventListener('click',()=>validate('core'));
$('ui-review').addEventListener('click',()=>validate('record'));
$('ui-export').addEventListener('click',exportJSON);
$('ui-save').addEventListener('click',saveLocal);
$('ui-import').addEventListener('change',event=>fileImport(event,false));
$('ui-migrate').addEventListener('change',event=>fileImport(event,true));
$('ui-restore').addEventListener('click',()=>{try{const text=localStorage.getItem(key);if(text===null)return message('No v1.2.0 browser draft was found at this file origin. Use the portable JSON import or explicit v1.1.0 migration.');if(confirm('Replace current fields with the saved browser draft? Export current work first.'))acceptImport(text,false);}catch(error){message('RESTORE FAILED: '+error.message+'. Use a portable JSON draft instead.');}});
$('ui-clear').addEventListener('click',()=>{
 if(!confirm('Clear all 54 fields to their defaults and remove this browser draft? Exported JSON/PDF files and other backups will remain.'))return;
 clearTimeout(autoTimer);$('ui-autosave').checked=false;let removed=true;try{localStorage.removeItem(key);}catch(_){removed=false;}
 replaceFields(C.defaults(S),'USER_ENTERED_UNVERIFIED_DRAFT');
 $('ui-storage').textContent=removed?'Autosave off. This browser draft was removed.':'LOCAL CLEAR FAILED. The stored browser draft may remain.';
 message('All 54 fields reset, including declaration, privacy and pre-export PDF state. '+(removed?'Exported files and other backups remain.':'Browser storage may still contain the old draft; exported files remain.'));
});
$('ui-autosave').addEventListener('change',()=>{if($('ui-autosave').checked)saveLocal();else {clearTimeout(autoTimer);$('ui-storage').textContent='Autosave off. Any existing browser draft is retained until you clear it.';}});
$('ui-fields').addEventListener('input',event=>{
 revision++;importSerial++;if(!['declaration','privacy_check','pdf_status'].includes(event.target.id)){nodes.declaration.checked=false;nodes.privacy_check.checked=false;nodes.pdf_status.value='DRAFT_NOT_REVIEWED';}
 if(event.target.id==='privacy_check')nodes.declaration.checked=false;
 lastPrint='draft';$('ui-print-output').replaceChildren();message('Edited. Review the current record and renew personal attestations before the first PDF candidate.');update();
 if($('ui-autosave').checked){clearTimeout(autoTimer);autoTimer=setTimeout(saveLocal,400);}
});
$('ui-print-draft').addEventListener('click',()=>print('draft'));
$('ui-print-candidate').addEventListener('click',()=>print('candidate'));
window.addEventListener('beforeprint',()=>{if(!preparePrint(lastPrint,false))preparePrint('draft',false);});
window.addEventListener('afterprint',()=>{lastPrint='draft';message('Print dialog closed. Confirm that the file was actually saved, then reopen and inspect it. No saved PDF or Moodle receipt was observed by this form.');});
window.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){event.preventDefault();print('draft');}});
replaceFields(C.defaults(S),'USER_ENTERED_UNVERIFIED_DRAFT');
})();
