(function () {
  'use strict';
  const core = globalThis.S12GuideCore;
  const get = id => document.getElementById(id);
  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const ids = steps.map(s => s.dataset.step);
  const key = 'TW2026_S12_GUIDE_PROGRESS_v1.2.1';
  let values = core.blank(ids);
  let persistent = true;
  let manualReturn = null;
  let progressRevision = 0;
  function storageFailure(message) {
    persistent = false;
    get('storage-notice').textContent = message + ' Progress is kept only in this open page; export progress JSON before closing.';
  }
  try {
    const text = localStorage.getItem(key);
    if (text !== null) values = core.parse(text, ids);
    get('storage-notice').textContent = 'Self-reported progress is stored locally for this guide only.';
  } catch (error) {
    storageFailure('Saved progress could not be read or validated. The written guide remains available.');
  }
  function save() {
    if (!persistent) return;
    try { localStorage.setItem(key, JSON.stringify(core.pack(values, ids))); }
    catch { storageFailure('Local storage is unavailable.'); }
  }
  function update() {
    for (const s of steps) {
      const checked = values[s.dataset.step] === true;
      s.querySelector('[data-progress]').checked = checked;
      s.classList.toggle('done', checked);
    }
    const n = core.count(values, ids);
    get('progress-text').textContent = `${n} of ${ids.length} self-reported actions complete`;
    get('progress-bar').style.width = `${n / ids.length * 100}%`;
    get('progress-meter').setAttribute('aria-valuenow', String(n));
  }
  for (const s of steps) s.querySelector('[data-progress]').addEventListener('change', e => {
    progressRevision++;
    values[s.dataset.step] = e.target.checked === true;
    save(); update();
  });
  get('reset-progress').addEventListener('click', () => {
    if (!confirm('Reset only this S12 guide’s self-reported progress? This does not erase the separate evidence form.')) return;
    values = core.blank(ids);
    progressRevision++;
    save(); update();
  });
  function download(text, name) {
    const blob = new Blob([text], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  get('export-progress').addEventListener('click', () => download(JSON.stringify(core.pack(values, ids), null, 2), 'TW2026_S12_GUIDE_PROGRESS_v1.2.1.json'));
  let importSequence = 0;
  get('import-progress').addEventListener('change', async e => {
    const seq = ++importSequence;
    const revision = progressRevision;
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > core.MAX_BYTES) throw new Error('Progress import exceeds 50,000 bytes.');
      const incoming = core.parse(await file.text(), ids);
      if (seq !== importSequence) return;
      if (revision !== progressRevision) throw new Error('Guide progress changed while the import was being read. Try again only after reviewing the current state.');
      if (!confirm('Replace this guide’s progress with the validated imported self-report? This does not import evidence or certify execution.')) return;
      values = incoming; progressRevision++; save(); update();
      get('storage-notice').textContent = persistent ? 'Validated guide progress imported locally. Self-report is not execution evidence.' : 'Guide progress imported in memory only. Export before closing.';
    } catch (error) {
      if (seq === importSequence) get('storage-notice').textContent = 'Import refused: ' + String(error.message) + ' Existing progress was kept.';
    } finally { if (seq === importSequence) e.target.value = ''; }
  });
  function platform(value) {
    const p = value === 'unix' ? 'unix' : 'windows';
    document.body.dataset.platform = p;
    for (const el of document.querySelectorAll('[data-platform]')) {
      if (el !== document.body) el.hidden = el.dataset.platform !== p;
    }
  }
  get('platform').addEventListener('change', e => platform(e.target.value));
  platform(get('platform').value);
  get('text-scale').addEventListener('change', e => {
    if (['1', '1.25', '1.5', '2'].includes(e.target.value)) document.documentElement.style.setProperty('--text-scale', e.target.value);
  });
  function setBrowser(value) {
    const b = core.route(value);
    for (const el of document.querySelectorAll('[data-browser]')) el.hidden = el.dataset.browser !== b;
  }
  get('browser-select').addEventListener('change', e => setBrowser(e.target.value));
  setBrowser(get('browser-select').value);
  const sections = Array.from(document.querySelectorAll('.guide-section,.extra'));
  function search() {
    const q = get('search').value;
    let shown = 0;
    for (const section of sections) {
      const visible = core.matches(section.textContent, q);
      section.hidden = !visible;
      if (visible) shown++;
    }
    get('search-notice').textContent = q.trim() ? `${shown} sections match. Search filters reading, never an execution/assessment gate.` : '';
  }
  get('search').addEventListener('input', search);
  for (const a of document.querySelectorAll('aside nav a')) a.addEventListener('click', () => {
    get('search').value = ''; search();
    const id = core.validAnchor(a.getAttribute('href'), sections.map(s => s.id));
    if (id) {
      const h = get(id).querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); }
    }
  });
  function projector(on) {
    document.body.classList.toggle('projector', on);
    get('exit-projector').hidden = !on;
    (on ? get('exit-projector') : get('projector')).focus();
  }
  get('projector').addEventListener('click', () => projector(true));
  get('exit-projector').addEventListener('click', () => projector(false));
  function closeManual() {
    get('manual-copy').hidden = true;
    if (manualReturn) manualReturn.focus();
    manualReturn = null;
  }
  function manual(text, button) {
    manualReturn = button;
    get('manual-text').value = text;
    get('manual-copy').hidden = false;
    get('manual-text').focus(); get('manual-text').select();
  }
  async function copy(text, button) {
    try {
      if (!globalThis.isSecureContext || !navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied — paste manually';
    } catch { manual(text, button); }
  }
  for (const b of document.querySelectorAll('[data-copy]')) b.addEventListener('click', () => {
    const source = get(b.dataset.copy);
    if (source) void copy(source.textContent, b);
  });
  get('manual-close').addEventListener('click', closeManual);
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && !get('manual-copy').hidden) { e.preventDefault(); closeManual(); }
    else if (e.key === 'Escape' && document.body.classList.contains('projector')) projector(false);
    if (e.key === 'Tab' && !get('manual-copy').hidden) {
      const textarea = get('manual-text'), close = get('manual-close');
      if (e.shiftKey && document.activeElement === textarea) { e.preventDefault(); close.focus(); }
      else if (!e.shiftKey && document.activeElement === close) { e.preventDefault(); textarea.focus(); }
    }
  });
  let base = 3600, started = null, interval = null;
  function current() { return started === null ? base : core.remaining(base, started, performance.now()); }
  function renderClock() {
    const n = current();
    get('clock').textContent = core.clock(n);
    if (n === 0) {
      clearInterval(interval); interval = null; base = 0; started = null;
      get('timer-notice').textContent = 'T60 STOP: save the truthful state and stop new technical content. Administrative reserve is not coding overflow.';
      get('timer-start').disabled = true;
    }
  }
  get('timer-start').addEventListener('click', () => {
    if (interval !== null || base <= 0) return;
    started = performance.now(); interval = setInterval(renderClock, 1000); renderClock();
  });
  get('timer-pause').addEventListener('click', () => {
    base = current(); started = null; clearInterval(interval); interval = null; renderClock();
  });
  get('timer-reset').addEventListener('click', () => {
    if (!confirm('Reset the local guide timer to 60:00? This does not extend the teacher’s content deadline.')) return;
    clearInterval(interval); interval = null; started = null; base = 3600;
    get('timer-start').disabled = false;
    get('timer-notice').textContent = 'Local timer reset; the teacher’s actual content STOP remains authoritative.';
    renderClock();
  });
  addEventListener('visibilitychange', renderClock);
  const fixes = {
    root: 'Reopen the real extracted S12_STUDENT_v1.2.1 inner folder. README, projects and root launchers must be siblings. Do not edit a ZIP preview.',
    package: 'Preserve this copy and extract a separate clean starter. Do not repair the manifest, delete unknown files or call a modified copy pristine.',
    runtime: 'Record actual Node/npm and ENVIRONMENT_BLOCKED. Stop execution until the applicable qualified teacher route exists. Do not install or use an author override.',
    checks: 'Preserve the actual named final failure. Edit only projects/p03/student/src/request-dispatcher.mjs. Red final observations are unresolved work, not planned initial assertion failures.',
    network: 'Confirm the actual prepared 127.0.0.1 application tab and separate protocol qualification. chatgpt.com is the wrong domain. With no prepared app, record source/model evidence and NOT_EXECUTED protocol status.',
    copy: 'Click Copy again to obtain the visible manual-copy box if the clipboard is blocked. Select all text there, Ctrl+C/Cmd+C, then paste into the intended terminal/prompt. Copy never executes.',
    storage: 'Export progress/evidence JSON outside the package before closing. Guide progress and form drafts have separate storage keys. A failed storage operation is not a saved-file receipt.',
    gemini: 'Keep an honest BLOCKED/NOT_EXECUTED draft with the actual reason. Obtain the existing applicable teacher policy later. Do not fabricate a response or assume an automatic alternative.',
    pdf: 'Regenerate from the current form revision, then open the actual PDF and read every page/last long-answer paragraph. Keep the correct CODE filename. Do not upload clipped/stale content.',
    moodle: 'Draft is STOP. Use the actual configured final-submit action and verify final status, exact filename and timestamp. A click alone is not a receipt.'
  };
  get('problem').addEventListener('change', e => {
    get('trouble-output').textContent = fixes[e.target.value] || 'Choose a symptom; a recovery does not override an execution or assessment gate.';
  });
  let printState = null;
  function beforePrint() {
    if (printState !== null) return;
    const toggles = Array.from(document.querySelectorAll('details'));
    printState = {q: get('search').value, details: toggles.map(d => [d, d.open]), commands: Array.from(document.querySelectorAll('.command')).map(c => [c, c.hidden]), routes: Array.from(document.querySelectorAll('.browser-route')).map(c => [c, c.hidden])};
    get('search').value = ''; search();
    for (const d of toggles) d.open = true;
    for (const [c] of printState.commands) c.hidden = false;
    for (const [c] of printState.routes) c.hidden = false;
  }
  function afterPrint() {
    if (printState === null) return;
    for (const [d, open] of printState.details) d.open = open;
    for (const [c, hidden] of printState.commands) c.hidden = hidden;
    for (const [c, hidden] of printState.routes) c.hidden = hidden;
    get('search').value = printState.q; printState = null; search();
  }
  get('print-guide').addEventListener('click', () => {
    beforePrint();
    try { window.print(); }
    catch {
      afterPrint();
      get('search-notice').textContent = 'Print could not start. The reading view was restored. Keep the guide open and use an approved PDF route if needed.';
      get('print-guide').focus();
    }
  });
  addEventListener('beforeprint', beforePrint);
  addEventListener('afterprint', afterPrint);
  update(); renderClock();
})();
