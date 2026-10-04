
'use strict';
(() => {
  const KEY = 'tw2026-s08-guide-progress-v1.2.0';
  const checks = [...document.querySelectorAll('.done-step')];
  const opt = document.getElementById('save-progress');
  const report = document.getElementById('guide-status');
  const progress = document.getElementById('guide-progress');
  const ptext = document.getElementById('progress-text');
  let current = 1;
  const setStatus = text => { report.textContent = text; };
  function update() {
    const done = checks.filter(c => c.checked).map(c => Number(c.dataset.step));
    progress.value = done.length;
    ptext.textContent = done.length + ' of 15 guide steps marked. Marks are navigation notes, not evidence.';
    if (opt.checked) {
      try { localStorage.setItem(KEY, JSON.stringify({version:'1.2.0',steps:done})); }
      catch (_) { setStatus('Local progress could not be saved. Your readable guide remains available.'); }
    }
  }
  checks.forEach(c => c.addEventListener('change', update));
  opt.addEventListener('change', () => {
    if (!opt.checked) { setStatus('Progress saving is off. Stored guide progress is not deleted; Reset progress can remove it.'); return; }
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) {
        const data = JSON.parse(raw);
        if (data.version !== '1.2.0' || !Array.isArray(data.steps) || data.steps.some(n => !Number.isInteger(n) || n < 1 || n > 15)) throw new Error('Invalid guide progress');
        checks.forEach(c => { c.checked = data.steps.includes(Number(c.dataset.step)); });
      }
      setStatus('Optional local guide progress saving is on for this browser. It records only step numbers.');
      update();
    } catch (_) { opt.checked = false; setStatus('Saved guide progress could not be read. Saving remains off; no form evidence was changed.'); }
  });
  document.getElementById('reset-progress').addEventListener('click', () => {
    if (!window.confirm('Clear only this S08 guide progress? This does not clear your form, projects or other site storage.')) return;
    checks.forEach(c => { c.checked = false; });
    try { localStorage.removeItem(KEY); setStatus('This guide progress was cleared.'); }
    catch (_) { setStatus('Progress marks cleared here; browser storage deletion was blocked.'); }
    opt.checked = false;
    update();
  });
  const route = document.getElementById('browser-route');
  const routeNote = document.getElementById('browser-note');
  const routes = {
    chrome: 'Chrome — illustrative, unobserved route: menu → More tools → Developer tools → Application → Local Storage → exact local origin. The selected app tab and port determine the store.',
    edge: 'Edge — illustrative, unobserved route: menu → More tools → Developer tools → Application → Local Storage → exact local origin. Menu/tab overflow may differ in your installed version.',
    firefox: 'Firefox — illustrative, unobserved route: menu → More tools → Web Developer Tools → Storage → Local Storage → exact local origin. Record actual labels if they differ.'
  };
  route.addEventListener('change', () => { routeNote.textContent = routes[route.value]; });
  routeNote.textContent = routes[route.value];
  document.getElementById('projector').addEventListener('click', event => {
    const on = document.documentElement.classList.toggle('projector');
    event.currentTarget.setAttribute('aria-pressed', String(on));
    event.currentTarget.textContent = on ? 'Standard text' : 'Larger / projector text';
  });
  function navigate(n) {
    current = Math.max(1, Math.min(15, n));
    document.getElementById('wizard-position').textContent = 'Focused step ' + current + ' of 15. All steps remain in the document.';
    document.querySelectorAll('.toc a').forEach(a => { if (a.getAttribute('href') === '#step-' + String(current).padStart(2,'0')) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); });
    const heading = document.querySelector('#step-' + String(current).padStart(2,'0') + ' h2');
    heading.focus({preventScroll:true});
    heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
  }
  document.getElementById('previous-step').addEventListener('click', () => navigate(current - 1));
  document.getElementById('next-step').addEventListener('click', () => navigate(current + 1));
  document.querySelectorAll('.toc a[data-step]').forEach(a => a.addEventListener('click', () => { current = Number(a.dataset.step); document.getElementById('wizard-position').textContent = 'Focused step ' + current + ' of 15. All steps remain in the document.'; document.querySelectorAll('.toc a').forEach(x => x.removeAttribute('aria-current')); a.setAttribute('aria-current','step'); }));
  function fallbackCopy(target) {
    const temp = document.createElement('textarea'); temp.value = target.textContent; temp.setAttribute('aria-label','Command text: press Ctrl+C or Command+C'); temp.style.width = '100%'; temp.style.minHeight = '5rem'; target.parentElement.appendChild(temp); temp.focus(); temp.select(); setStatus('Clipboard copy was unavailable. Selected command text is ready for Ctrl+C or Command+C. Review its project root before use.'); temp.addEventListener('blur', () => temp.remove(), {once:true});
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard not available'); await navigator.clipboard.writeText(target.textContent); setStatus('Displayed command copied. Review its project root before running on an already provisioned machine.'); }
    catch (_) { fallbackCopy(target); }
  }));
  let elapsed = 0, started = 0, ticker = null;
  const timer = document.getElementById('timer-output');
  const timerStatus = document.getElementById('timer-status');
  function paintTimer() {
    const seconds = Math.min(3600, Math.floor(Math.max(0, elapsed + (ticker ? performance.now() - started : 0))/1000));
    timer.textContent = String(Math.floor(seconds/60)).padStart(2,'0') + ':' + String(seconds%60).padStart(2,'0') + ' / 60:00';
    if (seconds >= 3600) {
      if (ticker) { clearInterval(ticker); ticker = null; }
      elapsed = 3600000;
      timerStatus.textContent = 'STOP at minute 60. Save an honest draft and list pending P01/P03 work. The other 30 minutes are logistics.';
      timerStatus.classList.add('stop');
    }
  }
  document.getElementById('start-timer').addEventListener('click', () => { if (ticker || elapsed >= 3600000) return; started = performance.now(); ticker = setInterval(paintTimer,1000); timerStatus.textContent = 'Content timer running. Full P03 continues after the meeting.'; paintTimer(); });
  document.getElementById('pause-timer').addEventListener('click', () => { if (!ticker) return; elapsed = Math.min(3600000,Math.max(0, elapsed + performance.now() - started)); clearInterval(ticker); ticker = null; timerStatus.textContent = 'Timer paused. This does not move the content boundary beyond minute 60.'; paintTimer(); });
  document.getElementById('reset-timer').addEventListener('click', () => { if (!window.confirm('Reset only this guide timer? The 60-minute content limit still applies.')) return; if (ticker) clearInterval(ticker); ticker = null; elapsed = 0; timerStatus.classList.remove('stop'); timerStatus.textContent = "Timer not started. Start at the teacher’s content start."; paintTimer(); });
  document.getElementById('print-guide').addEventListener('click', () => window.print());
  update(); paintTimer();
})();
