(function () {
  'use strict';
  const slides = Array.from(document.querySelectorAll('.slide'));
  const previous = document.getElementById('previous'), next = document.getElementById('next');
  const jump = document.getElementById('jump'), status = document.getElementById('status');
  const scaleInput = document.getElementById('text-size');
  let current = 0;
  document.body.classList.add('enhanced');
  function go(index, focus) {
    current = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
    slides.forEach((slide, i) => slide.classList.toggle('current', i === current));
    previous.disabled = current === 0; next.disabled = current === slides.length - 1;
    jump.value = String(current);
    status.textContent = 'Screen ' + (current + 1) + ' / ' + slides.length + ' | planned ' + slides[current].dataset.time;
    try { history.replaceState(null, '', '#s' + (current + 1)); } catch (_) { /* Local-file restrictions are non-fatal. */ }
    if (focus) slides[current].querySelector('h2').focus();
  }
  function setScale(value) {
    const numeric = Number(value);
    const scale = Math.max(40, Math.min(160, Number.isFinite(numeric) ? numeric : 100));
    document.documentElement.style.setProperty('--scale', String(scale / 100));
    scaleInput.value = String(scale); document.getElementById('scale-status').textContent = scale + '%';
  }
  function interactive(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, button, a, summary, [contenteditable]'));
  }
  function handleKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || interactive(event.target)) return;
    const actions = { ArrowRight: current + 1, PageDown: current + 1, ArrowLeft: current - 1,
      PageUp: current - 1, Home: 0, End: slides.length - 1 };
    if (Object.hasOwn(actions, event.key)) { event.preventDefault(); go(actions[event.key], true); }
  }
  previous.addEventListener('click', () => go(current - 1, true));
  next.addEventListener('click', () => go(current + 1, true));
  jump.addEventListener('change', () => go(Number(jump.value), true));
  scaleInput.addEventListener('input', () => setScale(scaleInput.value));
  document.getElementById('reset-size').addEventListener('click', () => setScale(100));
  document.getElementById('reading').addEventListener('click', function () {
    const reading = document.body.classList.toggle('reading');
    this.setAttribute('aria-pressed', String(reading)); this.textContent = reading ? 'Slide mode' : 'Reading mode';
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  document.addEventListener('keydown', handleKey);
  const hash = location.hash.match(/^#s(\d+)$/); go(hash ? Number(hash[1]) - 1 : 0, false); setScale(100);
  window.C12Deck = Object.freeze({ go, setScale, handleKey, current: () => current });
})();
