#!/usr/bin/env python3
"""Deterministic RC9 usability derivative of the sealed RC6 classroom form.

The input must be byte-for-byte the recognised RC6 renderer output. The evidence
schema, META, project contracts and strict import validator remain unchanged.
No filesystem/network writes, browser storage, synthetic answers or grading.
"""
from __future__ import annotations

import html
import json
import re

import classroom_form


def _once(source: str, before: str, after: str) -> str:
    if source.count(before) != 1:
        raise ValueError("RC9 form source mismatch: expected one exact replacement")
    return source.replace(before, after, 1)


def _function(source: str, name: str, following: str, replacement: str) -> str:
    """Replace one recognised function block after full-template authentication."""
    start = "function " + name + "("
    end = "function " + following + "("
    if source.count(start) != 1 or source.count(end) != 1:
        raise ValueError("RC9 form function boundary mismatch")
    lo, hi = source.index(start), source.index(end)
    if hi <= lo:
        raise ValueError("RC9 form function order mismatch")
    return source[:lo] + replacement.rstrip() + "\n" + source[hi:]


def derive_form(data: bytes, seminar: str) -> bytes:
    """Derive an EN-GB form from one unchanged released RC6 form.

    Rejects wrong seminars, changed/unknown source, repeated derivation and any
    unanticipated template shape instead of silently patching arbitrary HTML.
    """
    if not isinstance(data, bytes) or not isinstance(seminar, str):
        raise TypeError("Expected bytes and a seminar string")
    if seminar not in classroom_form.PROJECT_IDS:
        raise ValueError("Expected seminar S01–S14")
    source = data.decode("utf-8", errors="strict")
    metas = re.findall(r"^const META=(.*);$", source, flags=re.MULTILINE)
    links = re.findall(r'<a id="legacy-form" href="([^"]+)"', source)
    if len(metas) != 1 or len(links) != 1:
        raise ValueError("Expected one recognised META and original-form link")
    meta = json.loads(metas[0])
    if not isinstance(meta, dict) or meta.get("seminar") != seminar:
        raise ValueError("Input META differs from the requested seminar")
    expected = classroom_form.render(seminar, meta.get("projects"), html.unescape(links[0]))
    if expected.encode("utf-8") != data:
        raise ValueError("Input is not the exact recognised released RC6 form")

    source = _once(source,
        ".print-value{white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;height:auto;max-height:none;overflow:visible;break-inside:auto}",
        ".print-value{white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;height:auto;max-height:none;overflow:visible;break-inside:auto}\n"
        ".field-count{font-size:.85em;margin:4px 0;color:#35495d}.field-error{color:#8d1909;font-weight:600;margin:4px 0}.field-error:empty{display:none}[aria-invalid=true]{border:2px solid #8d1909!important}#record-size-warning{color:#8d1909;font-weight:600}#pdf-filename{font-family:ui-monospace,monospace}")
    source = _once(source,
        "<h2>Current record status</h2>",
        "<h2>Save your evidence safely</h2>\n"
        '<p id="record-size" role="status" aria-live="polite" tabindex="-1">Formatted JSON: 0 / 65536 UTF-8 bytes maximum.</p><p id="record-size-warning"></p>\n'
        '<label for="pdf-filename">Filename for your single seminar PDF</label><p id="pdf-name-help" class="hint">This filename follows the seminar assignment convention. Copy it into the Save as PDF dialogue. Check the final filename yourself; this page cannot confirm that a PDF was saved.</p>'
        '<input id="pdf-filename" readonly aria-describedby="pdf-name-help"><button id="copy-pdf-name" type="button">Copy PDF filename</button>\n'
        "<h2>Current record status</h2>")
    source = _once(source,
        "<p>Printing expands every answer into plain text, including all textarea lines. Save one PDF using your seminar assignment filename, reopen the actual saved PDF and inspect every page before submitting it. Browser printing, paper size and the saved PDF still require your review. Text-only locators do not include screenshot files.</p>",
        "<h2>From actual observations to one PDF</h2>\n"
        "<ol><li>Run each required project yourself. Preserve your original prediction, then copy the relevant output you actually observed into ‘Actual result and copied output’. Record failures truthfully.</li>"
        "<li>In ‘Evidence locator and relevant copied evidence’, identify the matching project heading and output in this record. Add concise actual output where needed. For a browser task, describe the exact action and observed response. A prepared expected output is not evidence of your run.</li>"
        "<li>Record the genuine sanitised AI exchange and your own independent check. Keep private credentials, personal records and whole conversations out of this form.</li>"
        "<li>Save a JSON draft. Check that the downloaded file exists; this page has no automatic browser storage. If a field or the whole JSON is too large, shorten irrelevant quotations without deleting the material evidence, then save again.</li>"
        "<li>Review every result and renew the confirmations. Choose ‘Print completed scoped record’ only when all requirements are complete. Otherwise choose the clearly labelled draft or blocked PDF.</li>"
        "<li>In the print dialogue, choose Save as PDF. Use the displayed seminar PDF filename. Reopen the saved PDF and inspect every page, all output lines, the scope banner and your identity before uploading that one file to the seminar assignment.</li></ol>\n"
        "<p class=\"notice\">This form prints text evidence and does not embed screenshot files. Copied actual logs and precise observed browser actions are supported. If your lecturer additionally requires screenshots, capture your actual result, add a labelled screenshot page with your approved local document/PDF tool and merge it into the same final PDF using the institution’s local procedure. Reopen the merged PDF and check that each image is visible and legible. A filename or path alone does not include an image.</p>")

    # Every user control gets a stable error node. Text controls additionally
    # get an explicit byte limit/counter; native selects and booleans use their
    # existing finite contracts and are not misleadingly assigned text limits.
    limits = {"givenName": 256, "surname": 256, "group": 128,
              "studentDate": 10, "packageId": 64, "environment": 1536,
              "ai-tool": 128, "ai-date": 10, "ai-prompt": 2048,
              "ai-claim": 2048, "ai-independentCheck": 2048,
              "ai-evidence": 1536, "ai-reflection": 1536, "blockers": 3072}
    project_limits = {"prediction": 1024, "change": 1536, "command": 1536,
                      "actualResult": 3072, "negativeCase": 1536,
                      "evidence": 1536, "reflection": 1536}
    for project in meta["projects"]:
        limits.update({project["id"] + "-" + key: size for key, size in project_limits.items()})
    controls = re.findall(r'<(?:input|textarea|select)\b[^>]*\bid="([^"]+)"[^>]*\bdata-(?:material|confirm)\b[^>]*>', source)
    expected_controls = len(limits) + 6 + len(meta["projects"]) * 2
    if len(controls) != expected_controls or len(set(controls)) != len(controls):
        raise ValueError("Unexpected or duplicated released form controls")
    for field_id in controls:
        pattern = r'<(input|textarea|select)\b[^>]*\bid="' + re.escape(field_id) + r'"[^>]*>'
        matches = list(re.finditer(pattern, source))
        if len(matches) != 1:
            raise ValueError("Expected one exact field: " + field_id)
        match = matches[0]
        before = match.group(0)
        described = re.search(r'aria-describedby="([^"]*)"', before)
        description = (described.group(1) + " " if described else "")
        if field_id in limits:
            description += field_id + "-count "
        description += field_id + "-error"
        after = re.sub(r' aria-describedby="[^"]*"', "", before)
        after = after[:-1] + ' aria-describedby="' + description + '" aria-invalid="false">'
        # Insert after the whole control rather than inside textarea/select.
        if match.group(1) != "input":
            close = "</" + match.group(1) + ">"
            end = source.find(close, match.end())
            if end < 0:
                raise ValueError("Missing recognised field closing tag")
            before += source[match.end():end + len(close)]
            after += source[match.end():end + len(close)]
        if field_id in limits:
            after += '<p class="field-count" id="' + field_id + '-count">UTF-8: 0 / ' + str(limits[field_id]) + ' bytes maximum.</p>'
        after += '<span class="field-error" id="' + field_id + '-error"></span>'
        source = _once(source, before, after)

    source = _once(source,
        "let revision=0,importTicket=0,printMode='draft';",
        "let revision=0,importTicket=0,printMode='draft',unsaved=false;\n"
        "const GENERIC_TITLE=document.title;\n" + _UX_CONSTANTS)
    source = _once(source,
        "for(const k of ['givenName','surname','group','date','packageId'])if(!record.student[k].trim())list.push('Student '+k);",
        "for(const k of ['givenName','surname','group','date','packageId'])if(!record.student[k].trim())list.push(STUDENT_LABELS[k]);")
    source = _once(source,
        "for(const p of record.projects){if(p.status!=='completed')list.push(p.id+' is '+p.status);for(const k of projectKeys)if(!p[k].trim())list.push(p.id+' '+k);if(!p.confirmed)list.push(p.id+' personal confirmation');}",
        "for(const p of record.projects){if(p.status!=='completed')list.push(p.id+' is '+p.status);for(const k of projectKeys)if(!p[k].trim())list.push(p.id+' — '+PROJECT_LABELS[k]);if(!p.confirmed)list.push(p.id+' personal confirmation');}")
    source = _once(source,
        "for(const k of ['tool','date','prompt','claim','independentCheck','evidence','reflection'])if(!record.ai[k].trim())list.push('AI '+k);",
        "for(const k of ['tool','date','prompt','claim','independentCheck','evidence','reflection'])if(!record.ai[k].trim())list.push(AI_LABELS[k]);")
    source = _once(source,
        "for(const k of declarations)if(!record.declarations[k])list.push('Declaration '+k);",
        "for(const k of declarations)if(!record.declarations[k])list.push(DECLARATION_LABELS[k]);")
    source = _once(source,
        "for(const key of projectKeys)text(p[key],projectLimits[key],p.id+' '+key);",
        "for(const key of projectKeys)text(p[key],projectLimits[key],p.id+' — '+PROJECT_LABELS[key]);")
    source = _once(source,
        "for(const k of Object.keys(aiLimits))text(record.ai[k],aiLimits[k],'AI '+k);date(record.ai.date,'AI date');boolean(record.ai.confirmed,'AI confirmed');",
        "for(const k of Object.keys(aiLimits))text(record.ai[k],aiLimits[k],AI_LABELS[k]);date(record.ai.date,'Date of the actual AI exchange');boolean(record.ai.confirmed,'AI personal confirmation');")
    source = _function(source, "refresh", "strictParse", _REFRESH + "\n" + _UX_FUNCTIONS)
    source = _once(source,
        "clearConfirmations();revision++;refresh();feedback('Imported valid text and statuses. Every project, AI and manual confirmation has been reset. Recheck the actual evidence before renewing them.');",
        "clearConfirmations();revision++;unsaved=false;document.title=GENERIC_TITLE;refresh();feedback('Imported valid text and statuses. Every project, AI and manual confirmation has been reset. Recheck the actual evidence before renewing them.');")
    source = _function(source, "filename", "saveJSON", _FILENAME)
    source = _function(source, "saveJSON", "printText", _SAVE_JSON)
    source = _once(source,
        "for(const key of projectKeys)printText(section,key,p[key]);",
        "for(const key of projectKeys)printText(section,PROJECT_LABELS[key],p[key]);")
    source = _once(source,
        "for(const key of aiKeys)printText(section,key,record.ai[key]);",
        "for(const key of aiKeys)printText(section,AI_LABELS[key],record.ai[key]);")
    source = _once(source,
        "for(const key of declarations)printText(out,key,record.declarations[key]);",
        "for(const key of declarations)printText(out,DECLARATION_LABELS[key],record.declarations[key]);")
    source = _once(source,
        "document.title=filename()+(completed?'_ScopedRecord':'_DRAFT');return out;",
        "document.title=filename();return out;")
    source = _function(source, "printRecord", "reset", _PRINT)
    source = _once(source,
        "importTicket++;revision++;$('evidence-form').reset();clearConfirmations();$('print-output').replaceChildren();refresh();",
        "importTicket++;revision++;$('evidence-form').reset();clearConfirmations();unsaved=false;document.title=GENERIC_TITLE;$('print-output').replaceChildren();refresh();")
    source = _once(source,
        "if(el.hasAttribute('data-material'))clearConfirmations();refresh();",
        "if(el.hasAttribute('data-material')){clearConfirmations();unsaved=true;}refresh();")
    source = _once(source,
        "window.addEventListener('afterprint',()=>{printMode='draft';});",
        "window.addEventListener('afterprint',()=>{printMode='draft';document.title=GENERIC_TITLE;});\n"
        "window.addEventListener('beforeunload',event=>{if(unsaved){event.preventDefault();event.returnValue='';}});\n"
        "$('copy-pdf-name').addEventListener('click',()=>{void copyPDFName();});")
    source = _once(source,
        "snapshot,validate,strictParse,importText,importFile,buildPrintable,printRecord,reset,refresh,saveJSON});",
        "snapshot,validate,strictParse,importText,importFile,buildPrintable,printRecord,reset,refresh,saveJSON,pdfFilename,hasUnsavedChanges:()=>unsaved});")
    if re.findall(r"^const META=(.*);$", source, flags=re.MULTILINE) != metas:
        raise AssertionError("RC9 form transformation changed fixed metadata")
    return source.encode("utf-8")


_UX_CONSTANTS = r'''const STUDENT_LABELS={givenName:'Given name',surname:'Surname',group:'Group',date:'Date of your classroom work',packageId:'Released PACKAGE_ID'};
const PROJECT_LABELS={prediction:'Prediction made before running',change:'Your own implementation or change',command:'Exact command or action you actually executed',actualResult:'Actual result and copied output',negativeCase:'Your own falsifying or boundary case',evidence:'Evidence locator and relevant copied evidence',reflection:'Explanation, limitation and reflection'};
const AI_LABELS={tool:'Actual AI tool and model/version information',date:'Date of the actual AI exchange',prompt:'Sanitised prompt you actually sent',claim:'Relevant claim you actually received',independentCheck:'Your independent check: action, evidence and observed outcome',outcome:'Your justified outcome for the AI claim',evidence:'Evidence of the actual AI exchange and independent check',reflection:'Reason for your AI verdict, correction and scope limit'};
const DECLARATION_LABELS={individualWork:'Individual work and declared assistance',truthfulEvidence:'Truthful commands, observations and AI evidence',scopeUnderstood:'Understanding of the bounded classroom scope'};
const FIELD_LIMITS={givenName:256,surname:256,group:128,studentDate:10,packageId:64,environment:1536,'ai-tool':128,'ai-date':10,'ai-prompt':2048,'ai-claim':2048,'ai-independentCheck':2048,'ai-evidence':1536,'ai-reflection':1536,blockers:3072};
for(const p of META.projects)for(const k of projectKeys)FIELD_LIMITS[p.id+'-'+k]=projectLimits[k];
Object.freeze(FIELD_LIMITS);
'''

_REFRESH = r'''function refresh(){
 updateCounters();showValidation(false,false);
 try{const r=validate(snapshot());const todo=missing(r);$('record-status').textContent=r.status.toUpperCase()+(r.status==='completed'?' — scoped classroom record only; not a grade.':' — not complete.\n'+todo.join('\n'));}
 catch(e){$('record-status').textContent='DRAFT — invalid or unfinished record.\n'+e.message;}
}'''

_UX_FUNCTIONS = r'''function fieldLabel(id){
 if(id==='studentDate')return STUDENT_LABELS.date;if(STUDENT_LABELS[id])return STUDENT_LABELS[id];
 if(id==='environment')return 'Actual environment and version evidence';if(id==='blockers')return 'Actual blockers or unfinished work';
 if(id.startsWith('ai-'))return AI_LABELS[id.slice(3)]||'Actual AI access or confirmation';
 const project=META.projects.find(p=>id.startsWith(p.id+'-'));if(project)return project.id+' — '+(PROJECT_LABELS[id.slice(4)]||'project status or confirmation');
 return DECLARATION_LABELS[id]||'Record field';
}
function formattedBytes(record){return bytes(JSON.stringify(record,null,2)+'\n');}
function updateCounters(){
 for(const [id,limit]of Object.entries(FIELD_LIMITS))$(id+'-count').textContent='UTF-8: '+bytes($(id).value)+' / '+limit+' bytes maximum.';
 const count=formattedBytes(snapshot());$('record-size').textContent='Formatted JSON: '+count+' / '+MAX_BYTES+' UTF-8 bytes maximum.';
 $('record-size-warning').textContent=count>MAX_BYTES?'The formatted JSON is too large to save. Shorten irrelevant quotations without deleting material evidence. Your current answers are preserved.':'';
 $('pdf-filename').value=pdfFilename();
}
function fieldIssues(requireCompleted){
 const issues=new Map(),record=snapshot(),add=(id,message)=>{if(!issues.has(id))issues.set(id,message);};
 for(const [id,limit]of Object.entries(FIELD_LIMITS))try{text($(id).value,limit,fieldLabel(id));}catch(e){add(id,e.message);}
 for(const id of ['studentDate','ai-date'])try{date($(id).value,fieldLabel(id));}catch(e){add(id,e.message);}
 if($('packageId').value&&!/^[a-f0-9]{64}$/.test($('packageId').value))add('packageId','Copy exactly 64 lowercase hexadecimal characters from this released package’s PACKAGE_ID.txt.');
 if(requireCompleted)for(const id of ['givenName','surname','group','studentDate','packageId','environment'])if(!$(id).value.trim())add(id,'Provide '+fieldLabel(id).toLowerCase()+'.');
 for(const p of record.projects){
  if(requireCompleted&&p.status!=='completed')add(p.id+'-status','This project is unfinished. Select COMPLETED only after you have completed its actual contract.');
  if(requireCompleted||p.status==='completed')for(const k of projectKeys)if(!p[k].trim())add(p.id+'-'+k,'Enter your actual '+PROJECT_LABELS[k].toLowerCase()+'. If unfinished, return the project status to DRAFT or BLOCKED.');
  if(requireCompleted&&!p.confirmed)add(p.id+'-confirmed','Review your actual project work, then renew this personal confirmation.');
 }
 if(requireCompleted){
  if(record.ai.access!=='available')add('ai-access','A genuine bounded AI exchange remains unfinished or blocked. Preserve a draft rather than inventing an exchange.');
  for(const k of ['tool','date','prompt','claim','independentCheck','evidence','reflection'])if(!record.ai[k].trim())add('ai-'+k,'Provide your actual '+AI_LABELS[k].toLowerCase()+'.');
  if(!record.ai.confirmed)add('ai-confirmed','Review the actual exchange and independent check, then renew your personal confirmation.');
  for(const id of declarations)if(!record.declarations[id])add(id,'Review the record before renewing this manual declaration.');
 }
 return issues;
}
function showValidation(requireCompleted,focusFirst){
 for(const el of document.querySelectorAll('[data-material],[data-confirm]')){el.setAttribute('aria-invalid','false');$(el.id+'-error').textContent='';}
 const issues=fieldIssues(requireCompleted);for(const [id,message]of issues){$(id).setAttribute('aria-invalid','true');$(id+'-error').textContent=message;}
 if(focusFirst){if(issues.size)$(issues.keys().next().value).focus();else if(formattedBytes(snapshot())>MAX_BYTES)$('record-size').focus();}
 return issues;
}
async function copyPDFName(){
 const field=$('pdf-filename');field.value=pdfFilename();
 try{if(!navigator.clipboard||typeof navigator.clipboard.writeText!=='function')throw Error('Clipboard API unavailable');await navigator.clipboard.writeText(field.value);feedback('PDF filename copied. Use it in the Save as PDF dialogue and check the saved file.');}
 catch(e){field.focus();field.select();feedback('PDF filename selected. Press Ctrl+C on Windows/Linux or Command+C on macOS, then use that name in the Save as PDF dialogue.');}
}'''

_FILENAME = r'''function filename(){const r=snapshot();const part=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'_').slice(0,60)||'UNFILLED';return 'TW2026_'+META.seminar+'_'+part(r.student.group)+'_'+part(r.student.surname)+'_'+part(r.student.givenName);}
function pdfFilename(){return filename()+'.pdf';}'''

_SAVE_JSON = r'''function saveJSON(){
 try{showValidation(false,true);const r=validate(snapshot());const encoded=JSON.stringify(r,null,2)+'\n';if(bytes(encoded)>MAX_BYTES)throw Error('Formatted JSON exceeds 64 KiB; shorten irrelevant quotations without removing material evidence');
  const url=URL.createObjectURL(new Blob([encoded],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename()+'_Classroom_Draft.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);unsaved=false;
  feedback('JSON draft download requested locally. Check that the file was saved. This is not evidence submission or an automatic grade.');
 }catch(e){showValidation(false,true);feedback('Save refused; your current answers were preserved. '+e.message);}
}'''

_PRINT = r'''function printRecord(completed){
 try{showValidation(completed,true);const record=validate(snapshot());buildPrintable(record,completed);printMode=completed?'completed':'draft';window.print();
  feedback(completed?'Print dialogue requested for the scoped record. Use the displayed PDF filename and inspect the actual saved PDF before submission.':'Print dialogue requested for an explicitly unfinished draft. It does not fulfil the incomplete requirements.');return true;
 }catch(e){showValidation(completed,true);feedback('Print refused; your current answers were preserved. '+e.message);return false;}
}'''
