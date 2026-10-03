'use strict';
/* Newly authored S08 assessment UI. No React/project/test execution and no network. */
(() => {
  const schema = window.S08_FORM_SCHEMA;
  const fields = schema.sections.flatMap(section => section.fields);
  const byId = new Map(fields.map(field => [field.id, field]));
  const storageKey = 'tw2026.s08.v1.2.0.evidence-draft';
  const $ = id => document.getElementById(id);
  const controls = new Map(fields.map(field => [field.id, $(field.id)]));
  const localOptIn = $('local-opt-in');
  const status = $('form-status');
  const helpStatus = $('operation-status');
  const finalAllowedClasses = new Set(['REACT_TEST', 'REACT_BROWSER']);
  const reviewFields = new Set(['declaration', 'pdf_status', 'privacy_check', 'upload_checklist']);
  const honestLimitFields = new Set(['environment_limit', 'p03_limits', 'claim_limit']);
  let requestedPrintClass = '';
  let formRevision = 0;
  let importSerial = 0;
  function values() {
    return Object.fromEntries(fields.map(field => [field.id, field.kind === 'checkbox'
      ? controls.get(field.id).checked : controls.get(field.id).value]));
  }
  function blankValues() { return Object.fromEntries(fields.map(field => [field.id, field.default])); }
  function setValues(data) {
    fields.forEach(field => {
      const control = controls.get(field.id);
      if (field.kind === 'checkbox') control.checked = data[field.id];
      else control.value = data[field.id];
    });
  }
  function announce(message) { helpStatus.textContent = message; }
  function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function isRealDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return y >= 1900 && date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }
  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
    const instant = new Date(value);
    return !Number.isNaN(instant.getTime()) && instant.toISOString() === value;
  }
  function parseDraft(text) {
    // JSON.parse establishes grammar; this separate lexical pass rejects ambiguous duplicate keys.
    const data = JSON.parse(text);
    const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g) || [];
    const stack = [];
    for (const token of tokens) {
      if (token === '{') { stack.push({kind:'object', keys:new Set(), wantsKey:true}); continue; }
      if (token === '[') { stack.push({kind:'array'}); continue; }
      if (token === '}' || token === ']') { stack.pop(); continue; }
      const current = stack[stack.length - 1];
      if (!current || current.kind !== 'object') continue;
      if (token === ',') { current.wantsKey = true; continue; }
      if (current.wantsKey && token.startsWith('"')) {
        const key = JSON.parse(token);
        if (current.keys.has(key)) throw new Error('Duplicate JSON key: ' + key);
        current.keys.add(key); current.wantsKey = false;
      }
    }
    return data;
  }
  function validateEnvelope(data) {
    if (!isRecord(data)) throw new Error('Draft must be one JSON object.');
    const keys = ['schema', 'version', 'packageVersion', 'createdAt', 'fields'];
    if (Object.keys(data).length !== keys.length || Object.keys(data).some(key => !keys.includes(key)))
      throw new Error('Unknown or missing draft envelope key.');
    if (data.schema !== schema.schema || data.version !== schema.version || data.packageVersion !== schema.packageVersion)
      throw new Error('This draft has a different schema/version. Use an exported S08 v1.2.0 draft; no silent migration.');
    if (!isCanonicalTimestamp(data.createdAt))
      throw new Error('Invalid draft timestamp: use the canonical UTC timestamp exported by this form.');
    if (!isRecord(data.fields) || Object.keys(data.fields).length !== fields.length || Object.keys(data.fields).some(key => !byId.has(key)))
      throw new Error('Expected exactly 55 known field IDs. Unknown/missing fields are rejected.');
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(data.fields, field.id)) throw new Error('Missing field: ' + field.id);
      const value = data.fields[field.id];
      if (field.kind === 'checkbox') {
        if (typeof value !== 'boolean') throw new Error('Boolean required for ' + field.id);
      } else {
        if (typeof value !== 'string' || value.length > field.max) throw new Error('Invalid type/length for ' + field.id);
        if (field.kind === 'select' && !field.options.includes(value)) throw new Error('Unknown option for ' + field.id);
        if (field.kind === 'date' && value !== '' && !isRealDate(value)) throw new Error('Invalid calendar date for ' + field.id);
      }
    }
    return data.fields;
  }
  function envelope() {
    return {schema:schema.schema, version:schema.version, packageVersion:schema.packageVersion,
      createdAt:new Date().toISOString(), fields:values()};
  }
  function serialiseDraft() {
    const data = envelope();
    validateEnvelope(data);
    const text = JSON.stringify(data,null,2);
    const bytes = new Blob([text],{type:'application/json'}).size;
    if (bytes > schema.maxImportBytes)
      throw new Error('Draft is ' + bytes + ' UTF-8 bytes; the shared export/import/local-save limit is 2,000,000 bytes. Nothing was truncated. Shorten bounded excerpts or use the DOCX route; visible answers remain.');
    return text;
  }
  function invalidatePreparedOutput() {
    formRevision += 1;
    requestedPrintClass = '';
    $('draft-json-fallback').value = '';
  }
  function resetReview(data) {
    return {...data, declaration:false, pdf_status:'DRAFT_NOT_REVIEWED',
      privacy_check:'PENDING', upload_checklist:'PENDING'};
  }
  function persist() {
    if (!localOptIn.checked) return null; // Saving was not requested, distinct from a failed write.
    try { localStorage.setItem(storageKey, serialiseDraft()); return true; }
    catch (error) { localOptIn.checked = false; announce('Local draft was not updated and saving was disabled. ' + error.message + ' A previous stored draft may be older. Visible answers remain; clear old local data when finished.'); return false; }
  }
  function token(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, ''); }
  function suggestedFilename(data) {
    const parts = data.student_identity.split('|').map(part => token(part.trim()));
    return parts.length === 3 && parts.every(Boolean) ? 'TW2026_S08_' + parts.join('_') + '.pdf' : schema.submissionFilename;
  }
  function pendingText(value) { return /^\s*(?:PENDING|NOT_EXECUTED|BLOCKED|NOT_STARTED|UNKNOWN|TODO|IN_PROGRESS|N\/A)\b/i.test(value); }
  function evidenceGaps(data) {
    const gaps = [];
    try { validateEnvelope({schema:schema.schema, version:schema.version, packageVersion:schema.packageVersion,
      createdAt:new Date().toISOString(), fields:data}); }
    catch (error) { gaps.push('Invalid field format: ' + error.message); }
    for (const field of fields) {
      if (!field.requiredForFinalCandidate) continue;
      const value = data[field.id];
      if (field.kind === 'checkbox') { if (!value) gaps.push(field.label + ': declaration must be renewed.'); }
      else if (!value.trim()) gaps.push(field.label + ': blank.');
      else if (field.kind !== 'select' && field.kind !== 'date' && !honestLimitFields.has(field.id) && pendingText(value)) gaps.push(field.label + ': required evidence is explicitly pending/blocked.');
    }
    if (data.student_identity.split('|').length !== 3 || data.student_identity.split('|').some(part => !token(part.trim())))
      gaps.push('Identity: use GROUP | Surname | Firstname for the suggested filename.');
    if (!finalAllowedClasses.has(data.execution_class)) gaps.push('Actual React evidence is not recorded. An alternative requires separate teacher review; this selector cannot approve it.');
    if (data.p01_completion !== 'COMPLETE_RECORDED') gaps.push('Full P01 remains incomplete.');
    for (const id of ['baseline_result','objective_result','regression_result','build_result']) {
      if (!/ACTUAL_RECORDED:\s*PASS\b/.test(data[id]) || data[id].trim().length < 45)
        gaps.push(id + ': record actual PASS, command/named checks and an embedded evidence locator; the words alone do not prove execution.');
    }
    if (!/ACTUAL_RECORDED/.test(data.p03_checks) || !['BASELINE','OBJECTIVE','REGRESSION','BUILD'].every(name => new RegExp(name + ':\\s*PASS\\b').test(data.p03_checks)) || data.p03_checks.length < 100)
      gaps.push('P03 named baseline/objective/regression/build results with commands and locators are incomplete.');
    for (const id of ['transition_trace','persistence_trace','identity_trace','p03_diagnostic','p03_patch','p03_timeline','p03_guards','p03_errors','independent_check']) {
      if (data[id].trim().length < 40) gaps.push(id + ': add the named witness, result and evidence locator.');
    }
    if (data.gemini_mode !== 'ACTUAL_RECORDED') gaps.push('One actual sanitised bounded Gemini claim is required. Synthetic practice and alternative selectors do not satisfy or authorise it automatically.');
    if (data.gemini_claim.trim().length < 40 || data.gemini_prompt.trim().length < 25) gaps.push('Gemini prompt/claim extract needs the actual tool/date reference; no synthetic substitution.');
    if (!['ACCEPTED','REJECTED','PARTIALLY_ACCEPTED','UNKNOWN'].includes(data.verdict)) gaps.push('Choose an evidence-based Gemini verdict. UNKNOWN keeps its stated uncertainty.');
    if (!/^NONE(?:\s+REQUIRED)?(?:\s*[.;]\s*P02\s+OPTIONAL.*)?$/i.test(data.pending_work.trim())) gaps.push('Required remaining work must be completed or separately reviewed; optional P02 can remain undone. Use NONE or NONE REQUIRED; P02 OPTIONAL not done only when true.');
    if (data.privacy_check !== 'REVIEWED_NO_EXCLUDED_DATA') gaps.push('Privacy review is pending.');
    const firstExport = data.pdf_status === 'FINAL_CANDIDATE_NOT_YET_SAVED';
    if (firstExport) {
      if (data.upload_checklist !== 'PENDING') gaps.push('Before first candidate export keep upload_checklist PENDING: the saved PDF has not yet been reviewed.');
    } else if (data.upload_checklist !== 'PREFLIGHT_REVIEWED_NOT_MOODLE_RECEIPT') {
      gaps.push('After actual saved-PDF review complete the upload preflight before upload; no Moodle receipt belongs inside this PDF.');
    }
    if (!['FINAL_CANDIDATE_NOT_YET_SAVED','LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT'].includes(data.pdf_status)) gaps.push('Set your intended PDF candidate status after review.');
    if (data.teacher_exception.trim() && !/^NONE$/i.test(data.teacher_exception.trim())) gaps.push('Recorded teacher authorisation requires separate review. The form cannot approve or authenticate an exception.');
    return [...new Set(gaps)];
  }
  function refresh(showDetails = false) {
    const data = values();
    const complete = fields.filter(field => field.kind === 'checkbox' ? data[field.id] : data[field.id].trim()).length;
    $('field-progress').textContent = complete + '/55 fields have a value (completeness only).';
    $('pdf-filename').textContent = suggestedFilename(data);
    const gaps = evidenceGaps(data);
    status.textContent = gaps.length ? 'DRAFT / INCOMPLETE REQUIRED EVIDENCE — ' + gaps.length + ' preflight gaps.'
      : (data.pdf_status === 'FINAL_CANDIDATE_NOT_YET_SAVED'
        ? 'FINAL CANDIDATE BEFORE PDF SAVE: no detected structural gaps. Saved-PDF review and upload preflight remain PENDING. Evidence, authorisation, runtime and submission are not authenticated.'
        : 'LOCALLY REVIEWED CANDIDATE: no detected structural gaps. Evidence, saved-file review, authorisation, runtime and submission are not authenticated.');
    status.dataset.state = gaps.length ? 'draft' : 'candidate';
    if (showDetails || !$('validation-details').hidden) {
      const list = $('gap-list'); list.replaceChildren();
      gaps.forEach(gap => { const item=document.createElement('li'); item.textContent=gap; list.append(item); });
      $('validation-details').hidden = false;
      if (showDetails) $('validation-details').focus();
    }
    return gaps;
  }
  function makePrintView(classification) {
    const data=values();
    const container=$('print-evidence'); container.replaceChildren();
    const title=document.createElement('h1'); title.textContent='S08 individual evidence — ' + classification; container.append(title);
    const note=document.createElement('p'); note.textContent='Suggested filename: ' + suggestedFilename(data) + '. Local completeness checking cannot authenticate evidence or institutional submission. Exported: ' + new Date().toISOString(); container.append(note);
    schema.sections.forEach(section => {
      const group=document.createElement('section'); group.className='print-section';
      const heading=document.createElement('h2'); heading.textContent=section.title; group.append(heading);
      section.fields.forEach(field => {
        const item=document.createElement('div'); item.className='print-field';
        const label=document.createElement('h3'); label.textContent=field.label + ' [' + field.id + ']';
        const answer=document.createElement('div'); answer.className='print-answer';
        answer.textContent=field.kind==='checkbox' ? (data[field.id] ? 'DECLARED by student — not teacher approval' : 'NOT DECLARED') : (data[field.id] || '[BLANK / PENDING]');
        item.append(label,answer); group.append(item);
      }); container.append(group);
    });
    const end=document.createElement('p'); end.textContent='After saving: reopen the actual PDF, inspect every page and embedded evidence, then follow the separate Moodle guide. Draft is not submitted. A saved PDF is not a Moodle receipt.'; container.append(end);
  }
  fields.forEach(field => {
    controls.get(field.id).addEventListener(field.kind==='select'||field.kind==='checkbox' ? 'change':'input', () => {
      invalidatePreparedOutput();
      if (field.id !== 'declaration') $('declaration').checked=false;
      if (!reviewFields.has(field.id)) {
        $('pdf_status').value='DRAFT_NOT_REVIEWED';
        $('privacy_check').value='PENDING';
        $('upload_checklist').value='PENDING';
      }
      refresh(); persist();
    });
  });
  $('check-final').addEventListener('click',()=>refresh(true));
  $('export-draft').addEventListener('click',()=>{
    let text;
    try { text=serialiseDraft(); }
    catch (error) { $('draft-json-fallback').value=''; announce('Export stopped. ' + error.message); return; }
    $('draft-json-fallback').value=text;
    const blob=new Blob([text],{type:'application/json'});
    const url=URL.createObjectURL(blob); const link=document.createElement('a');
    link.href=url; link.download=suggestedFilename(values()).replace(/\.pdf$/,'.draft.json');
    document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000);
    announce('JSON draft export requested. If blocked, expand the manual JSON fallback, select all and save UTF-8 text with .json. Draft data is not a PDF or Moodle submission.');
  });
  $('import-draft').addEventListener('change',async event=>{
    const file=event.target.files[0]; if (!file) return;
    const serial=++importSerial;
    const revision=formRevision;
    try {
      if (file.size>schema.maxImportBytes) throw new Error('Draft exceeds the 2,000,000-byte limit.');
      if (typeof TextDecoder !== 'function' || typeof file.arrayBuffer !== 'function')
        throw new Error('Strict UTF-8 file decoding is unavailable. Use the DOCX route or a supported browser; no permissive import fallback.');
      const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());
      if (new Blob([text]).size>schema.maxImportBytes) throw new Error('Decoded draft exceeds the byte limit.');
      const incoming=validateEnvelope(parseDraft(text));
      if (serial !== importSerial || revision !== formRevision)
        throw new Error('A newer import or visible-answer change occurred while reading. Re-select the intended draft after reviewing the current answers.');
      invalidatePreparedOutput();
      setValues(resetReview(incoming)); refresh();
      const saved=persist();
      announce('Draft imported. Declaration, privacy review, PDF status and upload preflight were reset. Review every answer and renew each statement yourself.' + (saved === false ? ' ' + helpStatus.textContent : ''));
    } catch (error) { announce('Import rejected; visible answers unchanged. ' + error.message); }
    event.target.value='';
  });
  localOptIn.addEventListener('change',()=>{
    if (localOptIn.checked) {
      if (persist()) announce('Opt-in local saving enabled for this browser profile and this draft was saved. Keep an exported draft.');
    } else {
      try { localStorage.removeItem(storageKey); announce('Local saving disabled and this form’s stored draft removed. Visible answers remain.'); }
      catch(error) { announce('Local saving disabled. Browser denied stored-draft removal; previous local data may remain. Visible answers remain. Retry clearing stored data when access is available.'); }
    }
  });
  $('restore-local').addEventListener('click',()=>{
    try {
      const stored=localStorage.getItem(storageKey);
      if (!stored) { announce('No saved S08 v1.2.0 draft found for this browser profile.'); return; }
      if (new Blob([stored]).size>schema.maxImportBytes) throw new Error('Stored draft exceeds the byte limit.');
      const incoming=validateEnvelope(parseDraft(stored));
      invalidatePreparedOutput();
      setValues(resetReview(incoming)); refresh();
      const saved=persist();
      announce('Local draft restored; declarations and review states reset. Saving remains opt-in.' + (saved === false ? ' ' + helpStatus.textContent : ''));
    } catch(error) { announce('Local draft could not be restored; visible answers unchanged. ' + error.message); }
  });
  $('clear-local').addEventListener('click',()=>{
    localOptIn.checked=false;
    try { localStorage.removeItem(storageKey); announce('Stored S08 draft cleared and local saving disabled. Visible answers remain.'); }
    catch(error) { announce('Local saving disabled. Browser denied stored-draft removal; previous local data may remain. Visible answers remain; use JSON export and retry clearing stored data when access is available.'); }
  });
  $('reset-form').addEventListener('click',()=>{
    if (!window.confirm('Clear all 55 visible answers and this form’s saved draft? Export a JSON copy first if needed.')) return;
    invalidatePreparedOutput();
    setValues(blankValues()); localOptIn.checked=false;
    let removed=true;
    try { localStorage.removeItem(storageKey); } catch(error) { removed=false; }
    refresh(); announce(removed
      ? 'Blank form restored, stored draft removed and local saving disabled. No declaration or review remains selected.'
      : 'Blank form restored and local saving disabled. Browser denied stored-draft removal; previous local data may remain. No declaration or review remains selected. Retry clearing stored data when access is available.');
  });
  window.addEventListener('beforeprint',()=>{
    let classification=requestedPrintClass || 'DRAFT — browser print route; candidate preflight not requested';
    if (requestedPrintClass && !requestedPrintClass.startsWith('DRAFT')) {
      classification=evidenceGaps(values()).length
        ? 'DRAFT — current preflight has gaps; previous candidate request invalid'
        : (values().pdf_status === 'FINAL_CANDIDATE_NOT_YET_SAVED'
          ? 'FINAL CANDIDATE BEFORE PDF SAVE — upload preflight PENDING; not a Moodle receipt'
          : 'LOCALLY REVIEWED CANDIDATE — not an authenticated result or Moodle receipt');
    }
    makePrintView(classification);
    requestedPrintClass=''; // Consume this request even if the browser omits afterprint after cancellation.
  });
  window.addEventListener('afterprint',()=>{ requestedPrintClass=''; });
  $('print-draft').addEventListener('click',()=>{
    requestedPrintClass='DRAFT — required work/review may be incomplete';
    makePrintView(requestedPrintClass); window.print();
  });
  $('print-candidate').addEventListener('click',()=>{
    const gaps=refresh(true);
    if (gaps.length) { announce('Candidate printing stopped because required preflight gaps remain. Draft printing is available. A separately authorised alternative requires teacher review outside the form.'); return; }
    requestedPrintClass=values().pdf_status === 'FINAL_CANDIDATE_NOT_YET_SAVED'
      ? 'FINAL CANDIDATE BEFORE PDF SAVE — upload preflight PENDING; not a Moodle receipt'
      : 'LOCALLY REVIEWED CANDIDATE — not an authenticated result or Moodle receipt';
    makePrintView(requestedPrintClass); window.print();
  });
  $('copy-filename').addEventListener('click',async()=>{
    const text=suggestedFilename(values());
    try { if (!navigator.clipboard) throw new Error('clipboard unavailable'); await navigator.clipboard.writeText(text); announce('Suggested PDF filename copied.'); }
    catch(error) { announce('Clipboard unavailable. Select and copy the visible filename manually: ' + text); }
  });
  refresh();
})();
