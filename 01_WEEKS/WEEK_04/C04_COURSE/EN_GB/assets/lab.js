/* C04 local laboratory. Export/import is not an assessment or truth validator. */
(function () {
  'use strict';
  const byId = id => document.getElementById(id), engine = window.C04Demos;
  const select = byId('scenario'), prediction = byId('prediction'), message = byId('message');
  let entries = [], busy = false, armed = false, unbind = null, count = 0;
  const list = byId('event-list'), form = byId('practice-form'), outer = byId('form-region');
  for (const [value, label] of Object.entries(engine.choices)) {
    const option = document.createElement('option'); option.value = value; option.textContent = label; select.appendChild(option);
  }
  const controlled = ['run', 'clear', 'import', 'arm', 'bind', 'unbind', 'practice-submit'];
  function setBusy(value) { busy = value; for (const id of controlled) byId(id).disabled = value; select.disabled = value; }
  function validPrediction() {
    const value = prediction.value.trim();
    if (!value || value.length > 4000) throw new Error('Enter a prediction before the action (1–4000 characters).');
    if (entries.length >= 100) throw new Error('The 100-record session limit is reached. Export and clear first.');
    return value;
  }
  function draw() { byId('log').textContent = entries.length ? JSON.stringify(entries, null, 2) : 'No session records.'; }
  function append(kind, output, origin, pred) {
    entries.push({ kind, prediction: pred, output, origin, observedAt: new Date().toISOString() }); draw();
  }
  async function run() {
    if (busy) return;
    let pred;
    try { pred = validPrediction(); } catch (error) { message.textContent = error.message; prediction.focus(); return; }
    const name = select.value; armed = false; byId('event-state').textContent = unbind ? 'Bound; not armed for recording.' : 'Unbound; not armed.';
    setBusy(true); message.textContent = 'Controlled operation in progress; no real HTTP request.';
    try {
      const result = await engine.run(name);
      append(name, result, 'MODEL_OR_INJECTED', pred);
      message.textContent = 'Local controlled demonstration recorded. This is not real HTTP or an S04 test result.';
    } catch (error) { message.textContent = 'Demonstration failed: ' + error.message; }
    finally { setBusy(false); }
  }
  function arm() {
    if (busy) return;
    try { validPrediction(); armed = true; byId('event-state').textContent = unbind ? 'Bound and armed for one interaction.' : 'Unbound: action will not call the list handler. Rebind to record.'; }
    catch (error) { message.textContent = error.message; prediction.focus(); }
  }
  function recordEvent(value) {
    count++; byId('callback-count').textContent = String(count);
    byId('event-last').textContent = JSON.stringify(value, null, 2);
    if (!armed || busy) { byId('event-state').textContent = 'Observed callback; not added to the prediction log. Arm before the next action.'; return; }
    try {
      append('event', value, value.isTrusted ? 'BROWSER_EVENT_TRUSTED' : 'BROWSER_EVENT_SCRIPTED', validPrediction());
      message.textContent = 'Event fields copied during the callback; inspect origin and isTrusted.';
    } catch (error) { message.textContent = error.message; }
    armed = false; byId('event-state').textContent = 'Bound; arm again before another recorded interaction.';
  }
  function bind() {
    if (busy) return;
    if (!unbind) unbind = engine.bindEvents(list, recordEvent);
    byId('event-state').textContent = 'Bound once; arm a prediction before recording.';
  }
  function release() {
    if (busy) return;
    if (unbind) unbind(); unbind = null; armed = false;
    byId('event-state').textContent = 'Unbound. Clicking list buttons must not increase the callback count.';
  }
  function formObserved(event) {
    const value = { currentTarget: event.currentTarget.id, defaultPrevented: event.defaultPrevented,
      isTrusted: event.isTrusted === true, observation: 'Submit reached the ancestor despite default prevention.' };
    byId('form-last').textContent = JSON.stringify(value, null, 2);
    if (armed && !busy) {
      try { append('form', value, value.isTrusted ? 'BROWSER_EVENT_TRUSTED' : 'BROWSER_EVENT_SCRIPTED', validPrediction()); }
      catch (error) { message.textContent = error.message; }
      armed = false;
      byId('event-state').textContent = unbind ? 'Bound; arm again before another recorded interaction.' : 'Unbound; not armed.';
    }
  }
  function validateImport(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'entries,schema' || data.schema !== 'C04_LAB_1' || !Array.isArray(data.entries) || data.entries.length > 100) throw new Error('Unsupported schema or record count.');
    return data.entries.map(entry => {
      const keys = ['kind','observedAt','origin','output','prediction'];
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || Object.keys(entry).sort().join(',') !== keys.join(',')) throw new Error('Unexpected record fields.');
      if (!(Object.hasOwn(engine.choices, entry.kind) || ['event','form'].includes(entry.kind))) throw new Error('Unknown scenario.');
      if (typeof entry.prediction !== 'string' || !entry.prediction.trim() || entry.prediction.length > 4000 || typeof entry.observedAt !== 'string' || entry.observedAt.length > 40 || !Number.isFinite(Date.parse(entry.observedAt)) || typeof entry.origin !== 'string' || entry.origin.length > 80) throw new Error('Invalid record values.');
      if (!entry.output || typeof entry.output !== 'object' || Array.isArray(entry.output) || JSON.stringify(entry.output).length > 12000) throw new Error('Invalid or oversized output.');
      return { kind: entry.kind, prediction: entry.prediction, output: entry.output,
        observedAt: entry.observedAt, origin: 'IMPORTED_UNVERIFIED_RECORD' };
    });
  }
  byId('run').addEventListener('click', run);
  byId('arm').addEventListener('click', arm);
  byId('bind').addEventListener('click', bind);
  byId('unbind').addEventListener('click', release);
  form.addEventListener('submit', engine.preventForm);
  outer.addEventListener('submit', formObserved);
  byId('text-render').addEventListener('click', () => {
    engine.projectLabel(document, byId('text-result'), byId('label-text').value);
    byId('text-status').textContent = 'Assigned as textContent. This is a local DOM operation, not a Dashboard run.';
  });
  byId('export').addEventListener('click', () => {
    if (busy) { message.textContent = 'Finish the active run before exporting.'; return; }
    const blob = new Blob([JSON.stringify({ schema:'C04_LAB_1', entries }, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'C04_LAB_OBSERVATIONS.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = 'Export requested. Confirm the saved file in your browser; this page cannot confirm a disk write.';
  });
  byId('import').addEventListener('change', async event => {
    if (busy) return;
    const file = event.target.files && event.target.files[0]; if (!file) return;
    setBusy(true); armed = false;
    try {
      if (file.size > 2000000) throw new Error('File exceeds the 2 MB import limit.');
      const text = await file.text(); if (text.length > 2000000) throw new Error('Text exceeds the import limit.');
      const next = validateImport(JSON.parse(text));
      if (entries.length && !confirm('Replace current records with this imported, unverified session?')) { message.textContent = 'Import cancelled; current records retained.'; return; }
      entries = next; draw(); message.textContent = 'Imported records are unverified. No demonstration was re-executed.';
    } catch (error) { message.textContent = 'Import rejected: ' + error.message; }
    finally { byId('import').value = ''; setBusy(false); }
  });
  byId('clear').addEventListener('click', () => {
    if (busy || !confirm('Clear this page session? Exported files will not be deleted.')) return;
    entries = []; armed = false; draw(); message.textContent = 'Session cleared; exported files are unchanged.';
  });
  byId('print').addEventListener('click', () => window.print());
  let pageSuspended = false, resumeListBinding = false;
  window.addEventListener('pagehide', () => {
    resumeListBinding = !!unbind; pageSuspended = true; armed = false;
    if (unbind) unbind(); unbind = null;
    form.removeEventListener('submit', engine.preventForm);
    outer.removeEventListener('submit', formObserved);
  });
  window.addEventListener('pageshow', () => {
    if (!pageSuspended) return;
    pageSuspended = false;
    form.addEventListener('submit', engine.preventForm);
    outer.addEventListener('submit', formObserved);
    if (resumeListBinding) {
      unbind = engine.bindEvents(list, recordEvent);
      byId('event-state').textContent = 'Bound after page restoration; arm a new prediction.';
    } else byId('event-state').textContent = 'Unbound after page restoration.';
  });
  bind(); draw();
  window.C04Lab = Object.freeze({ validateImport, run, arm, bind, release, get busy(){return busy;} });
})();
