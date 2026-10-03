/* Newly authored browser UI. Field values are rendered as text, never HTML. */
(function () {
  'use strict';
  const schema = globalThis.S07_SCHEMA, core = globalThis.S07Core;
  const $ = id => document.getElementById(id);
  const storageKey = 'TW2026_S07_FORM_v1.2.1', previousStorageKey = 'TW2026_S07_FORM_v1.2.0', legacyStorageKey = 'TW2026_S07_FORM_1_v1.1.0';
  const nodes = Object.create(null);
  let provenance = core.ENTERED, review = '', revision = 0, importSerial = 0, autosaveTimer, printMode = 'core';
  function node(tag, text) { const result = document.createElement(tag); if (text !== undefined) result.textContent = text; return result; }
  function notify(text) { $('message').textContent = text; }
  for (const section of schema.sections) {
    const box = node('section'); box.id = 'section-' + section.id;
    box.append(node('h2', section.title), node('p', section.intro));
    const navLink = node('a', section.title); navLink.href = '#' + box.id; $('section-nav').append(navLink);
    for (const field of section.fields) {
      const wrapper = node('div'); wrapper.className = 'field';
      const label = node('label', field.label); label.htmlFor = field.id;
      const badge = node('span', field.phase.toUpperCase()); badge.className = 'badge'; label.append(badge);
      const help = node('p', field.help); help.id = field.id + '_help'; help.className = 'help';
      const input = node(field.kind === 'textarea' ? 'textarea' : field.kind === 'select' ? 'select' : 'input');
      input.id = field.id; input.name = field.id;
      if (field.kind === 'select') {
        for (const value of field.options) { const option = node('option', value || 'Choose a state'); option.value = value; input.append(option); }
      } else if (field.kind === 'textarea') { input.rows = 4; input.maxLength = field.max; }
      else { input.type = field.kind === 'checkbox' ? 'checkbox' : 'text'; if (field.kind !== 'checkbox') input.maxLength = field.max; }
      if (field.id === 'seminar_id') input.readOnly = true;
      if (field.id === 'surname') input.autocomplete = 'family-name';
      if (field.id === 'given') input.autocomplete = 'given-name';
      const error = node('p'); error.id = field.id + '_error'; error.className = 'error';
      input.setAttribute('aria-describedby', help.id + ' ' + error.id);
      wrapper.append(label, help, input, error); box.append(wrapper); nodes[field.id] = input;
    }
    $('fields').append(box);
  }
  function values() {
    return Object.fromEntries(core.list(schema).map(field => [field.id, field.kind === 'checkbox' ? nodes[field.id].checked : nodes[field.id].value]));
  }
  function clearErrors() {
    for (const field of core.list(schema)) { $(field.id + '_error').textContent = ''; nodes[field.id].removeAttribute('aria-invalid'); }
    $('error-links').replaceChildren(); $('error-summary').hidden = true;
  }
  function update() {
    const data = values(), fields = core.list(schema);
    $('filename').textContent = core.filename(data) || 'Enter your group and both names to generate a filename.';
    $('provenance').textContent = provenance;
    $('import-review').textContent = review;
    const filled = phase => fields.filter(field => field.phase === phase && (field.kind === 'checkbox' ? data[field.id] : data[field.id].trim())).length;
    $('progress').textContent = 'Entered/reviewed: ' + filled('core') + '/26 core fields and ' + filled('final') + '/39 final fields. Presence is not verification.';
    if (!$('fallback-panel').hidden) $('fallback-text').value = core.plainText(data, schema, provenance);
  }
  function populate(data) {
    clearTimeout(autosaveTimer); revision++;
    for (const field of core.list(schema)) {
      if (field.kind === 'checkbox') nodes[field.id].checked = data[field.id]; else nodes[field.id].value = data[field.id];
    }
    clearErrors(); update();
  }
  function validate(mode, focus = true) {
    clearErrors(); const result = core.check(values(), schema, mode);
    for (const error of result.errors) {
      $(error.id + '_error').textContent = error.message; nodes[error.id].setAttribute('aria-invalid', 'true');
      const item = node('li'), link = node('a', error.message); link.href = '#' + error.id;
      link.addEventListener('click', event => { event.preventDefault(); nodes[error.id].focus(); }); item.append(link); $('error-links').append(item);
    }
    $('error-summary').hidden = result.errors.length === 0;
    notify(result.ok ? result.state + ' — observations and permissions are not authenticated. No upload has occurred.' :
      result.errors.length + ' field issue(s). All current text has been retained. You can save or print a truthful draft.');
    if (focus && result.errors.length) nodes[result.errors[0].id].focus();
    return result;
  }
  function saveLocal() {
    try {
      const draft = core.serialise(values(), schema, provenance); localStorage.setItem(storageKey, draft.text);
      $('storage').textContent = 'Browser draft stored at this origin (' + draft.bytes + ' UTF-8 bytes). Export JSON for a portable backup.';
    } catch (error) { $('storage').textContent = 'BROWSER SAVE FAILED: ' + error.message + ' All current fields remain. Use the plain-text backup.'; }
  }
  function download(text, name, type) {
    const url = URL.createObjectURL(new Blob([text], {type})), anchor = node('a');
    anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportJSON() {
    try {
      const draft = core.serialise(values(), schema, provenance);
      download(draft.text, (core.filename(values()) || 'TW2026_S07_DRAFT.pdf').replace(/\.pdf$/, '.json'), 'application/json');
      notify('JSON download requested (' + draft.bytes + ' UTF-8 bytes). Confirm that the saved file opens. This is a working backup, not a submission.');
    } catch (error) { notify('EXPORT FAILED: ' + error.message + ' No JSON download was requested.'); }
  }
  function importText(text) {
    const incoming = core.cleanImport(text, schema);
    provenance = incoming.provenance; review = incoming.review; populate(incoming.values);
    notify('Unverified draft imported from v' + incoming.sourceVersion + '. No activity was re-executed. Review all evidence and renew the Gemini state and declaration.');
  }
  function preparePrint(mode) {
    const result = validate(mode, mode === 'final');
    if (mode === 'final' && !result.ok) return false;
    const data = values(), output = $('print-output'); output.replaceChildren();
    output.append(node('h1', 'TW2026 S07 — Transactional booking and architecture decision record'));
    const status = node('p', mode === 'final' ? 'FINAL FIELDS COMPLETE — evidence remains student-declared and unverified by this form.' : 'TRUTHFUL DRAFT — incomplete evidence, ADR or Gemini activity may remain pending.'); status.className = 'print-meta'; output.append(status);
    output.append(node('p', core.filename(data) || 'Filename pending: TW2026_S07_GROUP_Surname_Firstname.pdf'), node('p', 'Candidate form v' + schema.version + ' | ' + provenance));
    if (review) output.append(node('p', review));
    for (const section of schema.sections) {
      const box = node('section'); box.append(node('h2', section.title));
      for (const field of section.fields) {
        box.append(node('h3', field.label + ' [' + field.id + ']'));
        const value = node('p', field.kind === 'checkbox' ? (data[field.id] ? 'DECLARED' : 'NOT DECLARED') : (data[field.id] || 'PENDING / NOT ENTERED'));
        value.className = 'print-value'; box.append(value);
      }
      output.append(box);
    }
    document.title = (core.filename(data) || 'TW2026_S07_DRAFT.pdf').replace(/\.pdf$/, '');
    return true;
  }
  function fallback() {
    $('fallback-text').value = core.plainText(values(), schema, provenance);
    $('fallback-panel').hidden = false; $('fallback-text').focus(); $('fallback-text').select();
  }
  $('worksheet').addEventListener('submit', event => event.preventDefault());
  $('core').addEventListener('click', () => validate('core'));
  $('final').addEventListener('click', () => validate('final'));
  $('save').addEventListener('click', saveLocal); $('export').addEventListener('click', exportJSON);
  $('restore').addEventListener('click', () => {
    try {
      const text = localStorage.getItem(storageKey) || localStorage.getItem(previousStorageKey) || localStorage.getItem(legacyStorageKey);
      if (!text) return notify('No S07 browser draft was found at this origin. Use an exported JSON backup.');
      if (!confirm('Replace current fields with the saved browser draft? Save current work first.')) return;
      importSerial++; importText(text);
    } catch (error) { notify('RESTORE REJECTED: ' + error.message + ' Current fields have been retained.'); }
  });
  $('import').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > schema.maxImportBytes) throw Error('JSON import exceeds 2,000,000 UTF-8 bytes.');
      if (!confirm('Replace current fields with this JSON draft? Save current work first.')) return;
      const serial = ++importSerial, seen = revision, text = await file.text();
      if (serial !== importSerial || seen !== revision) throw Error('Fields changed while the file was being read. Retry after saving current work.');
      importText(text);
    } catch (error) { notify('IMPORT REJECTED: ' + error.message + ' Current fields have been retained.'); }
    finally { event.target.value = ''; }
  });
  $('clear').addEventListener('click', () => {
    if (!confirm('Reset all current fields and all three S07 browser draft keys at this origin? Exported files and other origins will remain.')) return;
    clearTimeout(autosaveTimer); importSerial++; $('autosave').checked = false;
    let removed = true;
    try { localStorage.removeItem(storageKey); localStorage.removeItem(previousStorageKey); localStorage.removeItem(legacyStorageKey); } catch (_) { removed = false; }
    provenance = core.ENTERED; review = ''; printMode = 'core'; $('print-output').replaceChildren();
    $('fallback-text').value = ''; $('fallback-panel').hidden = true; populate(core.defaults(schema));
    $('storage').textContent = removed ? 'Browser draft keys cleared. Autosave is off.' : 'BROWSER CLEAR FAILED. A stored draft may remain. Autosave is off.';
    notify('Current form reset. ' + (removed ? 'Browser draft keys were cleared. ' : 'Browser storage could not be cleared. ') + 'Exported JSON, TXT and PDF files remain.');
  });
  $('fields').addEventListener('input', () => {
    revision++; clearErrors(); update(); notify('Edited. Recheck fields before preparing the final PDF.');
    if ($('autosave').checked) { clearTimeout(autosaveTimer); autosaveTimer = setTimeout(saveLocal, 400); }
  });
  $('autosave').addEventListener('change', () => {
    if ($('autosave').checked) saveLocal(); else { clearTimeout(autosaveTimer); $('storage').textContent = 'Autosave is off. Existing browser drafts remain until reset.'; }
  });
  $('text-backup').addEventListener('click', fallback);
  $('copy-text').addEventListener('click', async () => {
    const text = core.plainText(values(), schema, provenance); $('fallback-text').value = text;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text); notify('Plain-text backup copied. Paste it into a private local file and save.');
    } catch (_) { $('fallback-text').focus(); $('fallback-text').select(); notify('Use your system copy command on the selected text, then paste and save a private local file.'); }
  });
  $('download-text').addEventListener('click', () => {
    try { $('fallback-text').value = core.plainText(values(), schema, provenance); download($('fallback-text').value, (core.filename(values()) || 'TW2026_S07_DRAFT.pdf').replace(/\.pdf$/, '.txt'), 'text/plain;charset=utf-8'); notify('TXT backup download requested. Confirm that the saved file opens.'); }
    catch (error) { notify('TXT DOWNLOAD FAILED: ' + error.message + '. Select and copy the text instead.'); }
  });
  $('close-fallback').addEventListener('click', () => { $('fallback-panel').hidden = true; $('text-backup').focus(); });
  $('print-draft').addEventListener('click', () => { printMode = 'core'; if (preparePrint('core')) window.print(); });
  $('print-final').addEventListener('click', () => { if (preparePrint('final')) { printMode = 'final'; window.print(); } });
  window.addEventListener('beforeprint', () => { if (!preparePrint(printMode)) preparePrint('core'); });
  window.addEventListener('afterprint', () => { printMode = 'core'; });
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
      event.preventDefault(); printMode = 'core'; preparePrint('core'); window.print();
    }
  });
  globalThis.S07Form = Object.freeze({values, validate, importText, preparePrint, saveLocal, exportJSON, fallback});
  populate(core.defaults(schema));
})();
