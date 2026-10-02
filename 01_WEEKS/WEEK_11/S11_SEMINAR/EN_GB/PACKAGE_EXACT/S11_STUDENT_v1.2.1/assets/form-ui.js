(function () {
  'use strict';
  const schema = globalThis.S11_SCHEMA, core = globalThis.S11Core, $ = id => document.getElementById(id);
  const key = 'TW2026_S11_FORM_1_v1.2.1';
  let provenance = 'USER_ENTERED_UNVERIFIED_DRAFT', revision = 0, autoTimer = 0, importSerial = 0, preparedFinalRevision = null;
  const fieldNodes = {}, sectionProgress = {};
  function element(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
  function message(text) { $('message').textContent = text; }
  function cancelAutosave() { clearTimeout(autoTimer); autoTimer = 0; }
  function invalidatePrint() { preparedFinalRevision = null; $('print-output').replaceChildren(); }
  for (const section of schema.sections) {
    const box = element('section'); box.id = 'section-' + section.id; box.setAttribute('aria-labelledby', box.id + '-title');
    const title = element('h2', section.title); title.id = box.id + '-title'; title.tabIndex = -1;
    const progress = element('p'); progress.className = 'section-progress'; sectionProgress[section.id] = progress;
    box.append(title, element('p', section.intro), progress);
    const jump = element('a', section.title); jump.href = '#' + box.id;
    jump.addEventListener('click', () => title.focus()); $('section-jumps').append(jump);
    for (const field of section.fields) {
      const wrapper = element('div'); wrapper.className = 'field';
      const label = element('label', field.label + ' [' + field.id + ']'); label.htmlFor = field.id;
      const help = element('p', field.help); help.className = 'help'; help.id = field.id + '_help';
      let input;
      if (field.kind === 'select') { input = element('select'); for (const value of field.options) { const option = element('option', value || 'Choose…'); option.value = value; input.append(option); } }
      else if (field.kind === 'textarea') { input = element('textarea'); input.rows = 4; input.maxLength = field.max; }
      else { input = element('input'); input.type = field.kind === 'checkbox' ? 'checkbox' : 'text'; if (field.kind !== 'checkbox') input.maxLength = field.max; }
      input.id = field.id; input.setAttribute('aria-describedby', help.id + ' ' + field.id + '_error');
      const error = element('p'); error.id = field.id + '_error'; error.className = 'error';
      wrapper.append(label, help, input, error); box.append(wrapper); fieldNodes[field.id] = input;
    }
    const top = element('a', 'Return to form controls'); top.href = '#controls'; box.append(top); $('fields').append(box);
  }
  function values() { return Object.fromEntries(core.list(schema).map(field => [field.id, field.kind === 'checkbox' ? fieldNodes[field.id].checked : fieldNodes[field.id].value])); }
  function clearErrors() { for (const field of core.list(schema)) { $(field.id + '_error').textContent = ''; fieldNodes[field.id].removeAttribute('aria-invalid'); } }
  function update() {
    const record = values(), complete = field => field.kind === 'checkbox' ? record[field.id] : !!record[field.id].trim();
    $('filename').textContent = core.filename(record) || 'Enter a teacher-known alias and real group.';
    $('provenance').textContent = provenance;
    const all = core.list(schema), coreFields = all.filter(field => field.phase === 'core');
    $('progress').textContent = coreFields.filter(complete).length + '/12 core fields entered; ' + all.filter(complete).length + '/48 total fields entered. Counts do not verify evidence.';
    for (const section of schema.sections) sectionProgress[section.id].textContent = section.fields.filter(complete).length + '/' + section.fields.length + ' fields entered';
  }
  function populate(record) {
    revision++; invalidatePrint();
    for (const field of core.list(schema)) { if (field.kind === 'checkbox') fieldNodes[field.id].checked = record[field.id]; else fieldNodes[field.id].value = record[field.id]; }
    clearErrors(); update();
  }
  function validate(mode, focus = true) {
    clearErrors(); const result = core.check(values(), schema, mode);
    for (const error of result.errors) { $(error.id + '_error').textContent = error.message; fieldNodes[error.id].setAttribute('aria-invalid', 'true'); }
    message(result.ok ? result.state + ' — structure only; no certification of execution, truth, security, PDF saving or Moodle submission.' : result.errors.length + ' field issue(s). Your text remains available for a labelled draft.');
    if (focus && result.errors.length) fieldNodes[result.errors[0].id].focus();
    return result;
  }
  function saveLocal() {
    try { localStorage.setItem(key, JSON.stringify(core.pack(values(), schema, provenance))); $('storage').textContent = 'This S11 draft was stored locally. Export JSON as your portable backup; storage may be unavailable for file: URLs.'; }
    catch (error) { $('storage').textContent = 'LOCAL SAVE FAILED: ' + error.message + '. Your current text is retained; export JSON.'; }
  }
  function scheduleAutosave() {
    cancelAutosave();
    if ($('autosave').checked) autoTimer = setTimeout(() => { autoTimer = 0; if ($('autosave').checked) saveLocal(); }, 500);
  }
  function exportJSON() {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(core.pack(values(), schema, provenance), null, 2)], {type: 'application/json'}));
      const link = element('a'); link.href = url; link.download = (core.filename(values()) || 'TW2026_S11_DRAFT.pdf').replace(/\.pdf$/, '.json');
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      message('JSON export requested. Confirm the saved file; no Moodle upload occurred.');
    } catch (error) { message('EXPORT FAILED: ' + error.message); }
  }
  function importText(text) {
    const imported = core.cleanImport(text, schema); cancelAutosave(); provenance = imported.provenance; populate(imported.values);
    message('Unverified draft loaded. No observation was repeated. Review every field and renew both declarations.');
  }
  function buildPrint(mode) {
    const record = values(), result = core.check(record, schema, mode), target = $('print-output'); target.replaceChildren();
    target.append(element('h1', 'S11 individual evidence record'), element('p', 'v1.2.1 CANDIDATE · WIP/PREVIEW_NOT_FINAL · ' + (mode === 'final' && result.ok ? 'FINAL FIELD CANDIDATE — NOT VERIFIED' : 'DRAFT — NOT A COMPLETION CLAIM')));
    target.append(element('p', 'Provenance: ' + provenance + ' · Proposed filename: ' + (core.filename(record) || '[not yet available]')));
    target.append(element('p', 'This text record contains no embedded captures. Review the actual saved PDF. Structural completeness does not verify execution, truth, security, approval or Moodle submission.'));
    for (const section of schema.sections) { target.append(element('h2', section.title)); for (const field of section.fields) { const row = element('div'); row.className = 'print-field'; row.append(element('h3', field.label + ' [' + field.id + ']'), element('pre', field.kind === 'checkbox' ? (record[field.id] ? 'CHECKED' : 'UNCHECKED') : (record[field.id] || '[blank]'))); target.append(row); } }
  }
  function requestPrint(mode) {
    const result = validate(mode); if (mode === 'final' && !result.ok) return;
    preparedFinalRevision = mode === 'final' ? revision : null; buildPrint(mode); window.print();
  }
  window.addEventListener('beforeprint', () => {
    const finalCurrent = preparedFinalRevision === revision && core.check(values(), schema, 'final').ok;
    buildPrint(finalCurrent ? 'final' : 'core');
  });
  window.addEventListener('afterprint', () => { preparedFinalRevision = null; });
  for (const field of core.list(schema)) fieldNodes[field.id].addEventListener('input', () => {
    revision++; invalidatePrint();
    if (!['authorship_decl', 'redaction_decl', 'pdf_review', 'submission_status'].includes(field.id)) {
      fieldNodes.authorship_decl.checked = false; fieldNodes.redaction_decl.checked = false; fieldNodes.pdf_review.value = 'DRAFT_NOT_REVIEWED'; fieldNodes.submission_status.value = 'DRAFT';
    }
    provenance = 'USER_ENTERED_UNVERIFIED_DRAFT'; clearErrors(); update();
    message('Current draft changed. Earlier validation and print preparation are cleared; check the current fields again.');
    scheduleAutosave();
  });
  $('validate-core').onclick = () => validate('core'); $('validate-final').onclick = () => validate('final');
  $('save-local').onclick = saveLocal; $('export-json').onclick = exportJSON;
  $('load-local').onclick = () => { try { const text = localStorage.getItem(key); if (!text) throw Error('No v1.2.1 S11 draft was stored.'); importText(text); } catch (error) { message('LOAD FAILED: ' + error.message); } };
  $('import-file').onchange = async event => {
    const file = event.target.files[0]; if (!file) return;
    const serial = ++importSerial, startRevision = revision;
    try {
      if (!Number.isFinite(file.size) || file.size < 0 || file.size > schema.maxImportBytes) throw Error('File size exceeds the 2,000,000-byte import limit. No file text was read.');
      const text = await file.text();
      if (serial !== importSerial || revision !== startRevision) throw Error('A newer edit, reset or import occurred. This import was cancelled.');
      importText(text);
    } catch (error) { if (serial === importSerial) message('IMPORT FAILED: ' + error.message); }
    finally { if (serial === importSerial) event.target.value = ''; }
  };
  $('print-draft').onclick = () => requestPrint('core'); $('print-final').onclick = () => requestPrint('final');
  $('autosave').onchange = () => { cancelAutosave(); if ($('autosave').checked) saveLocal(); else $('storage').textContent = 'Autosave OFF; queued saves cancelled. Earlier stored data remains until you erase this S11 draft.'; };
  $('erase-local').onclick = () => {
    if (!$('erase-confirm').checked) { message('Confirm that any draft you need has been exported before erasing this S11 draft.'); $('erase-confirm').focus(); return; }
    cancelAutosave(); importSerial++; $('autosave').checked = false;
    let erased = true;
    try { localStorage.removeItem(key); } catch (error) { erased = false; $('storage').textContent = 'LOCAL ERASE FAILED: ' + error.message + '. Stored data may remain.'; }
    provenance = 'USER_ENTERED_UNVERIFIED_DRAFT'; populate(core.defaults(schema)); $('erase-confirm').checked = false; $('import-file').value = '';
    if (erased) $('storage').textContent = 'Only the v1.2.1 S11 local draft key was erased. Other forms and exported files were preserved.';
    message('Current form reset to blank; declarations and print state cleared. ' + (erased ? 'Local S11 erase completed.' : 'Stored-data erase could not be confirmed.')); fieldNodes.student_alias.focus();
  };
  function routeFieldHash() {
    let id;
    try { id = decodeURIComponent(String(window.location?.hash || '').slice(1)); } catch (_) { return; }
    if (!Object.hasOwn(fieldNodes, id)) return;
    const input = fieldNodes[id]; input.focus();
    if (typeof input.scrollIntoView === 'function') input.scrollIntoView({block: 'center'});
  }
  populate(core.defaults(schema));
  window.addEventListener('hashchange', routeFieldHash);
  routeFieldHash();
})();
