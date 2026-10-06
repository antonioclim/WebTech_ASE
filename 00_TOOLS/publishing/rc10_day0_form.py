#!/usr/bin/env python3
"""A deterministic, scoped Day 0 evidence form derived from the frozen RC9 form.

Only the recognised form bytes are accepted. Installation, preflight and local
server scripts are outside this derivative. No answers, declarations, grades,
browser storage or network requests are supplied by the rendered form.
"""
from __future__ import annotations

import hashlib
import html
import json
import re

SOURCE_SHA256 = '067d34153aa6e26bdc3664764c58dc0d3aac93700c80cc7f801b98470c73e5c6'
SETUP_IDS = ('SETUP_WINDOWS', 'SETUP_MACOS_LINUX')
TASK_FIELDS = (
    ('pred', 'My prediction'), ('falsify', 'What would falsify it?'),
    ('action', 'Action / input'), ('expected', 'Expected result'),
    ('observed', 'Observed result'), ('explain', 'Difference / explanation'),
)


def _textarea(name: str, label: str, hint: str = '') -> str:
    suffix = f'<span class="hint">{html.escape(hint)}</span>' if hint else ''
    return (f'<label for="{name}">{html.escape(label)}{suffix}</label>'
            f'<textarea id="{name}" name="{name}" maxlength="20000"></textarea>')


def _state(name: str) -> str:
    return (f'<label for="{name}">Actual activity state</label>'
            f'<select id="{name}" name="{name}"><option value="">Choose the actual state</option>'
            '<option>OBSERVED</option><option>FAILED</option><option>BLOCKED</option>'
            '<option>NOT_EXECUTED</option></select>')


def derive(original: bytes, ident: str) -> bytes:
    """Render one explicit new derivative of an exact released setup form.

    The two setup objects shared identical form bytes in RC9. Their new forms
    retain the five experiment labels and original evidence/AI scope; the
    object identifier makes private JSON imports cross-object safe.
    """
    if not isinstance(original, bytes) or not isinstance(ident, str):
        raise TypeError('Expected original bytes and a setup identifier')
    if ident not in SETUP_IDS:
        raise ValueError('Expected SETUP_WINDOWS or SETUP_MACOS_LINUX')
    if hashlib.sha256(original).hexdigest() != SOURCE_SHA256:
        raise ValueError('Input is not the exact recognised frozen RC9 Day 0 form')
    source = original.decode('utf-8', errors='strict')
    titles = re.findall(r'<title>(.*?)</title>', source)
    bodies = re.findall(r'<tbody>(.*?)</tbody>', source)
    if len(titles) != 1 or len(bodies) != 1:
        raise ValueError('Recognised source title or experiment table differs')
    tasks = [html.unescape(label) for label in re.findall(r'<tr><th>(.*?)</th>', bodies[0])]
    if len(tasks) != 5:
        raise ValueError('Recognised source must contain its original five experiments')
    title = html.unescape(titles[0])
    task_html = []
    names = ['family', 'given', 'group', 'date', 'os', 'kit', 'pid', 'node', 'browser']
    for number, label in enumerate(tasks, 1):
        state, blocker = f'state_{number}', f'blocker_{number}'
        names += [state, blocker] + [f'{key}_{number}' for key, _ in TASK_FIELDS]
        fields = ''.join('<div>' + _textarea(f'{key}_{number}', field_label) + '</div>'
                         for key, field_label in TASK_FIELDS)
        task_html.append(
            f'<fieldset><legend>{number}. {html.escape(label)}</legend>' + _state(state)
            + _textarea(blocker, 'Blocker or reason not executed and next safe action',
                        'Required for BLOCKED or NOT_EXECUTED. Leave observations empty if nothing was run.')
            + f'<div class="grid">{fields}</div></fieldset>')
    names += ['evidence', 'limitations', 'ai_state', 'ai_blocker', 'ai_prompt',
              'ai_claim', 'ai_verified', 'ai_verdict', 'ai_correction', 'reflection']
    identity = ''.join(
        f'<div><label for="{name}">{label}</label><input id="{name}" name="{name}" '
        + ('type="date"' if name == 'date' else 'type="text" maxlength="20000"') + '></div>'
        for name, label in [('family', 'Family name (all parts)'), ('given', 'Given names (all parts)'),
                            ('group', 'Group'), ('date', 'Date of this record'), ('os', 'Operating system'),
                            ('kit', 'Kit version read from the extracted setup kit'),
                            ('pid', 'Setup kit PACKAGE_ID (64 hexadecimal characters)'),
                            ('node', 'Node version actually observed (optional)'),
                            ('browser', 'Browser actually used (optional)')])
    ai = ''.join(_textarea(name, label) for name, label in [
        ('ai_prompt', 'Prompt actually used'), ('ai_claim', 'Actual Gemini claim or response'),
        ('ai_verified', 'My independent verification: action and actual result'),
        ('ai_correction', 'My correction, or why no correction is supported')])
    meta = {'schema': 'webtech-day0-private-draft/v1', 'setup': ident,
            'original_form_sha256': SOURCE_SHA256, 'title': title,
            'tasks': tasks, 'fields': names}
    metadata = json.dumps(meta, ensure_ascii=True, separators=(',', ':')).replace('<', '\\u003c')
    rendered = _HTML.replace('@@TITLE@@', html.escape(title)).replace('@@IDENTITY@@', identity)
    rendered = rendered.replace('@@TASKS@@', ''.join(task_html)).replace('@@AI@@', ai)
    rendered = rendered.replace('@@META@@', metadata)
    return rendered.encode('utf-8')


_HTML = r'''<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>@@TITLE@@</title><style>
:root{color-scheme:light;--ink:#172026;--accent:#0f5b6e;--line:#8a9ca6}*{box-sizing:border-box}
body{margin:0;background:#f7f8fa;color:var(--ink);font:16px/1.5 system-ui,sans-serif}
main{max-width:1050px;margin:auto;padding:24px}h1{line-height:1.2;overflow-wrap:anywhere}
h2{margin-top:26px}fieldset{min-width:0;background:white;border:1px solid var(--line);padding:16px;margin:20px 0}
legend{font-weight:700;padding:0 6px}.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:15px}
label{display:block;font-weight:600;margin:9px 0 4px}.hint{display:block;font-size:.9em;font-weight:400}
input,textarea,select{width:100%;font:inherit;padding:8px;border:1px solid var(--line);background:white;border-radius:4px}
textarea{min-height:115px;resize:vertical}input[type=checkbox]{width:auto;margin-right:8px}
.notice{background:#e9f4f7;border-left:5px solid var(--accent);padding:14px}.actions{display:flex;flex-wrap:wrap;gap:9px;margin:18px 0}
button{font:inherit;border:1px solid #52616a;background:white;border-radius:4px;padding:10px;cursor:pointer}
button.primary{background:var(--accent);color:white}button:focus-visible,a:focus-visible{outline:3px solid #a35200;outline-offset:3px}
[aria-invalid=true]{outline:2px solid #a52222}.filename,pre{white-space:pre-wrap;overflow-wrap:anywhere}
#status{font-weight:600}#print-output{display:none}.error{color:#8d1909}.print-value{white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 12px}
.print-label{font-weight:700;margin:10px 0 2px}p,li{overflow-wrap:anywhere}
@media(max-width:650px){main{padding:14px}.grid{grid-template-columns:minmax(0,1fr)}fieldset{padding:10px}}
@media print{@page{size:A4 portrait;margin:12mm}body{background:white;font-size:10pt}main{padding:0;max-width:none}
#editable-area{display:none}#print-output{display:block}h1,h2,h3{break-after:avoid}.print-value{font-family:inherit}#print-banner{font-weight:700;border:2px solid #172026;padding:10px}}
</style></head><body><main>
<div id="editable-area"><h1>@@TITLE@@</h1>
<p class="notice">RC10 scoped evidence-form derivative. This form checks recorded completeness only. It does not verify that an experiment happened, certify readiness, award a grade, save a PDF or confirm Moodle submission.</p>
<p>Your data stays in this page until you export a private JSON backup or use browser printing. There is no automatic browser storage and this page makes no network requests. Reloading or closing can lose unsaved work. Keep exported evidence in your own private folder, outside the protected setup kit and public repositories.</p>
<h2>How to record actual work</h2><ol>
<li>Use the setup guide's existing five activities below. Write your prediction before the action, then record what actually happened. This form adds no new experiment or assessed S01 implementation.</li>
<li>Choose <strong>OBSERVED</strong> when the named action was run and you recorded its result. Choose <strong>FAILED</strong> when the attempted action failed or contradicted the expected result. A failed observation is valid evidence of that attempt.</li>
<li>Choose <strong>BLOCKED</strong> when a prerequisite, permission or unavailable service prevented the activity, or <strong>NOT_EXECUTED</strong> when you did not attempt it. Record the cause and next safe action. Do not invent output or an AI exchange.</li>
<li>For the existing critical Gemini audit, record one actual sanitised exchange and your own independent check. If access or a check was unavailable, record its actual incomplete state.</li>
<li>Save a private JSON backup. For incomplete work, print the clearly labelled draft or blocked record. Use the completed evidence action only after all required activities were actually attempted and the evidence and declarations are present. Complete evidence can contain failures; it does not mean that the environment is ready.</li>
<li>Choose Save as PDF in the browser dialogue, use the filename suggestion, reopen the saved PDF and inspect every page and output line. Verify privacy and the actual Moodle submission separately according to the real Assignment.</li></ol>
<form id="form" novalidate>
<h2>A. Identification</h2><p>Enter family and given names separately. No name order is inferred. Leave unavailable kit details blank in an incomplete record and explain the missing prerequisite.</p><div class="grid">@@IDENTITY@@</div>
<h2>B–C. Predictions and experiments</h2>
<p>For an attempted activity (OBSERVED or FAILED), all six original prediction/action/result fields are required. For a blocked or unexecuted activity, explain the cause and the next safe action; keep any genuine partial work and do not add an invented result.</p>
@@TASKS@@
<h2>D. Evidence and supported claim</h2><label for="evidence">What the actual evidence supports and where it can be found</label><textarea id="evidence" name="evidence" maxlength="20000"></textarea>
<p class="hint">Copy concise sanitised actual output and identify its activity. A path alone does not include a screenshot or file. This PDF prints text; add genuinely required screenshots separately with the institution's approved local procedure and review the same final PDF.</p>
<label for="limitations">What this record does not prove, including unresolved blockers</label><textarea id="limitations" name="limitations" maxlength="20000"></textarea>
<h2>E. Critical Gemini audit</h2>
<label for="ai_state">Actual AI activity state</label><select id="ai_state" name="ai_state"><option value="">Choose the actual state</option><option>OBSERVED</option><option>FAILED</option><option>BLOCKED</option><option>NOT_EXECUTED</option></select>
<label for="ai_blocker">AI blocker or reason not executed and next safe action</label><textarea id="ai_blocker" name="ai_blocker" maxlength="20000"></textarea>
@@AI@@
<label for="ai_verdict">My verdict after the independent check</label><select id="ai_verdict" name="ai_verdict"><option value="">Choose a verdict if you performed the check</option><option>ACCEPTED</option><option>REJECTED</option><option>PARTLY ACCEPTED</option><option>UNKNOWN</option></select>
<p class="hint">UNKNOWN can be an honest inconclusive check. For a FAILED request, an incomplete record can describe the actual failure and next safe action in the AI blocker field, retaining only the genuine partial prompt or response. Leave an unavailable response or unperformed independent check blank. This remains incomplete; do not tick a declaration for work you did not perform.</p>
<h2>F. Technical reflection</h2><label for="reflection">What I learnt, what remains unresolved and my next action</label><textarea id="reflection" name="reflection" maxlength="20000"></textarea>
<h2>G. Scoped declarations</h2>
<label><input id="truth" type="checkbox">I have recorded only my actual observations and genuine partial work, and have identified activities I did not execute. This declaration does not claim that every activity was completed.</label>
<label><input id="privacy" type="checkbox">I reviewed this record and included no credentials, access tokens, private conversations or unrelated sensitive data.</label>
<p>The following additional declarations are required only for a completed evidence record:</p>
<label><input id="experiments_owned" type="checkbox">I personally performed every named experiment marked OBSERVED or FAILED.</label>
<label><input id="ai_used" type="checkbox">I actually submitted the recorded prompt to Gemini and recorded its real sanitised response.</label>
<label><input id="ai_checked" type="checkbox">I personally performed the independent check described above and recorded its actual result.</label>
</form>
<h2>Private backup and PDF</h2><p>Text fields are limited to 20,000 characters each. The private JSON backup is limited to 1 MiB of UTF-8 data. Shorten irrelevant material without removing the evidence needed to support your claim. Imported text and statuses must match this setup form; importing resets all declarations so that you review them again.</p>
<p>PDF filename suggestion (copy it into the native Save as PDF dialogue and check the actual saved name):</p><p class="filename" id="filename"></p>
<div class="actions"><button id="validate" type="button">Check completed-record requirements</button><button id="print-draft" type="button">Print draft or blocked record</button><button id="print-complete" type="button" class="primary">Print completed evidence record</button><button id="save-json" type="button">Save private JSON backup</button><button id="reset" type="button">Clear this page</button></div>
<label for="import-json">Import your private JSON backup (review it first)</label><input id="import-json" type="file" accept=".json,application/json">
<p id="status" role="status" aria-live="polite"></p>
<p class="notice">Native browser printing remains available. Any print that does not meet the completed-record requirements is labelled incomplete or undeclared. Neither PDF export nor this completeness check proves readiness, truthfulness, acceptance or submission.</p>
</div><section id="print-output" aria-label="Printable actual evidence record"></section>
<script>
'use strict';
const META=@@META@@;
const form=document.getElementById('form'),MAX_BYTES=1048576,MAX_CHARS=20000;
const names=META.fields,states=['','OBSERVED','FAILED','BLOCKED','NOT_EXECUTED'];
const verdicts=['','ACCEPTED','REJECTED','PARTLY ACCEPTED','UNKNOWN'];
const confirmations=['truth','privacy','experiments_owned','ai_used','ai_checked'];
const genericTitle=document.title;let requestedMode='draft',revision=0,importTicket=0,unsaved=false;
const $=id=>document.getElementById(id);
function feedback(message,bad=false){$('status').textContent=message;$('status').classList.toggle('error',bad);}
function safePart(value,fallback){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||fallback;}
function filename(){return 'TW2026_DAY0_'+safePart($('group').value,'GROUP')+'_'+safePart($('family').value,'Family')+'_'+safePart($('given').value,'Given')+'.pdf';}
function updateFilename(){$('filename').textContent=filename();}
function snapshot(){const fields={};for(const name of names)fields[name]=$(name).value;return {schema:META.schema,setup:META.setup,fields};}
function plainObject(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;}
function exactKeys(value,expected){return plainObject(value)&&Object.keys(value).length===expected.length&&expected.every(key=>Object.prototype.hasOwnProperty.call(value,key));}
function validDate(value){if(!value)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [year,month,day]=value.split('-').map(Number);if(year<1||month<1||month>12||day<1)return false;const leap=year%4===0&&(year%100!==0||year%400===0);return day<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1];}
function uniqueJSONKeys(text){
 const tokens=text.match(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\]:,]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)||[];let cursor=0;
 function walk(){const token=tokens[cursor++];if(token==='{'){const seen=new Set();if(tokens[cursor]==='}'){cursor++;return;}for(;;){const key=JSON.parse(tokens[cursor++]);if(seen.has(key))throw new Error('Duplicate JSON key: '+key);seen.add(key);cursor++;walk();if(tokens[cursor++]==='}')break;}}else if(token==='['){if(tokens[cursor]===']'){cursor++;return;}for(;;){walk();if(tokens[cursor++]===']')break;}}}
 walk();
}
function strictParse(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)throw new Error('JSON must be text of at most 1 MiB.');
 const record=JSON.parse(text);uniqueJSONKeys(text);
 if(!exactKeys(record,['schema','setup','fields'])||record.schema!==META.schema||record.setup!==META.setup||!exactKeys(record.fields,names))throw new Error('JSON schema, setup identifier or exact field set differs.');
 for(const name of names){const value=record.fields[name];if(typeof value!=='string'||value.length>MAX_CHARS)throw new Error('Invalid text type or length for '+name+'.');if((name.startsWith('state_')||name==='ai_state')&&!states.includes(value))throw new Error('Invalid activity state.');}
 if(!verdicts.includes(record.fields.ai_verdict)||!validDate(record.fields.date))throw new Error('Invalid verdict or calendar date.');
 if(record.fields.pid&&!/^[0-9a-fA-F]{64}$/.test(record.fields.pid))throw new Error('Non-empty PACKAGE_ID must have 64 hexadecimal characters.');
 return record;
}
function clearDeclarations(){for(const id of confirmations)$(id).checked=false;}
function importText(text){const record=strictParse(text);for(const name of names)$(name).value=record.fields[name];clearDeclarations();requestedMode='draft';revision++;unsaved=false;$('print-output').replaceChildren();updateFilename();feedback('Imported text and actual states. All declarations have been reset. Review your evidence before renewing them.');return true;}
function requiredIssues(mode){
 const data=snapshot().fields,issues=[];
 function need(name,label=name){if(!data[name].trim())issues.push({id:name,label});}
 for(const name of ['family','given','group','date'])need(name,({family:'Family name',given:'Given names',group:'Group',date:'Record date'})[name]);
 if(!validDate(data.date))issues.push({id:'date',label:'A valid calendar date'});
 if(data.pid&&!/^[0-9a-fA-F]{64}$/.test(data.pid))issues.push({id:'pid',label:'A valid setup PACKAGE_ID'});
 for(let i=1;i<=META.tasks.length;i++){
  const state=data['state_'+i],attempted=state==='OBSERVED'||state==='FAILED';need('state_'+i,META.tasks[i-1]+' actual state');
  if(attempted){for(const key of ['pred','falsify','action','expected','observed','explain'])need(key+'_'+i,META.tasks[i-1]+' — '+({pred:'prediction',falsify:'falsification condition',action:'actual action',expected:'expected result',observed:'actual observed result',explain:'difference or explanation'})[key]);}
  else if(state==='BLOCKED'||state==='NOT_EXECUTED')need('blocker_'+i,META.tasks[i-1]+' blocker or reason and next action');
  if(mode==='complete'&&!attempted)issues.push({id:'state_'+i,label:META.tasks[i-1]+' was not reported as attempted'});
 }
 need('ai_state','AI actual state');const aiAttempted=data.ai_state==='OBSERVED'||data.ai_state==='FAILED';
 if(data.ai_state==='OBSERVED'||(mode==='complete'&&aiAttempted)){for(const name of ['ai_prompt','ai_claim','ai_verified','ai_verdict','ai_correction'])need(name,({ai_prompt:'Actual Gemini prompt',ai_claim:'Actual Gemini response',ai_verified:'Actual independent check and result',ai_verdict:'AI verdict',ai_correction:'Supported AI correction or explanation'})[name]);}
 else if(['FAILED','BLOCKED','NOT_EXECUTED'].includes(data.ai_state))need('ai_blocker','AI actual failure, blocker or reason and next action');
 for(const name of ['evidence','limitations','reflection'])need(name,({evidence:'Evidence and supported claim',limitations:'Limits of the evidence',reflection:'Technical reflection and next action'})[name]);
 for(const id of ['truth','privacy'])if(!$(id).checked)issues.push({id,label:id==='truth'?'Truthful scoped declaration':'Privacy review declaration'});
 if(mode==='complete'){
  for(const name of ['os','kit','pid'])need(name,({os:'Operating system',kit:'Actual setup kit version',pid:'Actual setup PACKAGE_ID'})[name]);
  if(!aiAttempted)issues.push({id:'ai_state',label:'The actual AI exchange and independent check remain incomplete'});
  for(const id of ['experiments_owned','ai_used','ai_checked'])if(!$(id).checked)issues.push({id,label:({experiments_owned:'Personal experiment declaration',ai_used:'Genuine Gemini exchange declaration',ai_checked:'Personal independent-check declaration'})[id]});
 }
 return issues;
}
function validate(mode='complete'){if(!['draft','complete'].includes(mode))throw new Error('Unknown print scope.');const issues=requiredIssues(mode);for(const el of form.querySelectorAll('input,textarea,select'))el.setAttribute('aria-invalid',issues.some(item=>item.id===el.id)?'true':'false');feedback(issues.length?'Missing or unresolved: '+issues.map(item=>item.label).join('; '):mode==='complete'?'Completed-record requirements are present. This does not verify truth or successful readiness.':'An honest draft or blocked record can be printed. It remains incomplete.',issues.length>0);return issues;}
function addText(parent,label,value){const heading=document.createElement('p');heading.className='print-label';heading.textContent=label;const body=document.createElement('pre');body.className='print-value';body.textContent=value||'[not recorded]';parent.append(heading,body);}
function buildPrintable(mode='draft'){
 const complete=mode==='complete'&&requiredIssues('complete').length===0;
 const declared=$('truth').checked&&$('privacy').checked,record=snapshot(),data=record.fields;
 const out=$('print-output');out.replaceChildren();const title=document.createElement('h1');title.textContent=META.title;out.append(title);
 const banner=document.createElement('p');banner.id='print-banner';banner.textContent=complete?'COMPLETE EVIDENCE RECORD — ALL REQUIRED ACTIVITIES REPORTED AS ATTEMPTED':declared?'INCOMPLETE / DRAFT OR BLOCKED RECORD — ALL ACTIVITIES ARE NOT DECLARED COMPLETE':'UNDECLARED PRIVATE DRAFT — NOT A COMPLETED EVIDENCE RECORD';out.append(banner);
 addText(out,'Scope and limits','This is a learner-reported '+META.setup+' record. Completeness is not proof that work happened, that every outcome was successful, that the environment is ready, that a grade was awarded or that Moodle accepted a submission. FAILED means an actual failed attempt, not successful readiness.');
 const counts=states.slice(1).map(state=>state+': '+names.filter(name=>name.startsWith('state_')||name==='ai_state').filter(name=>data[name]===state).length).join('; ');addText(out,'Reported activity states (five experiments and the AI activity)',counts);
 for(const [name,label] of [['family','Family name'],['given','Given names'],['group','Group'],['date','Record date'],['os','Operating system'],['kit','Kit version'],['pid','Setup PACKAGE_ID'],['node','Observed Node version'],['browser','Browser used']])addText(out,label,data[name]);
 for(let i=1;i<=META.tasks.length;i++){const h=document.createElement('h2');h.textContent=i+'. '+META.tasks[i-1];out.append(h);addText(out,'Actual activity state',data['state_'+i]);addText(out,'Blocker or reason and next action',data['blocker_'+i]);for(const [key,label] of [['pred','My prediction'],['falsify','What would falsify it?'],['action','Action / input'],['expected','Expected result'],['observed','Observed result'],['explain','Difference / explanation']])addText(out,label,data[key+'_'+i]);}
 for(const [name,label] of [['evidence','Evidence and supported claim'],['limitations','What this does not prove'],['ai_state','Actual Gemini activity state'],['ai_blocker','AI blocker or reason and next action'],['ai_prompt','Actual Gemini prompt'],['ai_claim','Actual Gemini response'],['ai_verified','Actual independent verification'],['ai_verdict','AI verdict'],['ai_correction','My supported correction or explanation'],['reflection','Technical reflection and next action']])addText(out,label,data[name]);
 for(const [id,label] of [['truth','Truthful scoped declaration'],['privacy','Privacy review'],['experiments_owned','Personally performed named attempted experiments'],['ai_used','Actual Gemini exchange'],['ai_checked','Personally performed independent check']])addText(out,label,$(id).checked?'DECLARED BY THE LEARNER':'NOT DECLARED');
 if(!complete)addText(out,'Completed-record requirements still unresolved',requiredIssues('complete').map(item=>item.label).join('; ')||'Completion was not requested; this remains a draft.');
 addText(out,'Suggested PDF filename',filename());return {complete,banner:banner.textContent};
}
function printRecord(mode){if(validate(mode).length)return false;requestedMode=mode;buildPrintable(mode);document.title=filename().replace(/\.pdf$/,'');window.print();return true;}
function saveJSON(){try{const text=JSON.stringify(snapshot(),null,2)+'\n';strictParse(text);const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename().replace(/\.pdf$/,'_private_backup.json');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);unsaved=false;feedback('Private JSON download requested. Check the actual downloaded file and keep it outside the protected kit. Declarations are not included in the backup.');return true;}catch(error){feedback('Backup refused: '+error.message,true);return false;}}
function reset(){importTicket++;revision++;form.reset();clearDeclarations();requestedMode='draft';unsaved=false;$('print-output').replaceChildren();$('import-json').value='';document.title=genericTitle;updateFilename();feedback('This page has been cleared. Exported private files have not been deleted.');}
for(const name of names)$(name).addEventListener('input',()=>{revision++;clearDeclarations();requestedMode='draft';unsaved=true;$('print-output').replaceChildren();updateFilename();});
for(const id of confirmations)$(id).addEventListener('change',()=>{revision++;requestedMode='draft';});
$('validate').addEventListener('click',()=>validate('complete'));
$('print-draft').addEventListener('click',()=>printRecord('draft'));
$('print-complete').addEventListener('click',()=>printRecord('complete'));
$('save-json').addEventListener('click',saveJSON);
$('reset').addEventListener('click',()=>{if(confirm('Clear this page? Unsaved entries will be lost.'))reset();});
$('import-json').addEventListener('change',async()=>{const file=$('import-json').files[0];if(!file)return;const ticket=++importTicket,startRevision=revision;try{if(file.size>MAX_BYTES)throw new Error('File exceeds 1 MiB.');const text=await file.text();if(ticket!==importTicket||revision!==startRevision)throw new Error('The page changed while reading the backup; import was cancelled.');importText(text);}catch(error){feedback('Import refused; existing entries were preserved: '+error.message,true);}finally{$('import-json').value='';}});
window.addEventListener('beforeprint',()=>buildPrintable(requestedMode));
window.addEventListener('afterprint',()=>{requestedMode='draft';document.title=genericTitle;});
window.addEventListener('beforeunload',event=>{if(unsaved){event.preventDefault();event.returnValue='';}});
window.WebTechDay0=Object.freeze({snapshot,strictParse,importText,validate,buildPrintable,printRecord,saveJSON,reset,filename});
updateFilename();
</script></main></body></html>
'''
