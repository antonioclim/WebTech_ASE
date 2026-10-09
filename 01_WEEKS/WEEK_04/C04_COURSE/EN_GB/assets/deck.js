(function () {
  'use strict';
  const slides = Array.from(document.querySelectorAll('.slide'));
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const jump = document.getElementById('jump');
  const status = document.getElementById('status');
  const zoom = document.getElementById('text-size');
  const scaleStatus = document.getElementById('scale-status');
  let current = 0;
  document.body.classList.add('enhanced');
  function go(index, focus) {
    current = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
    slides.forEach((slide, i) => slide.classList.toggle('current', i === current));
    previous.disabled = current === 0; next.disabled = current === slides.length - 1;
    jump.value = String(current);
    status.textContent = 'Screen ' + (current + 1) + ' of ' + slides.length + ' | ' + slides[current].dataset.time;
    try { history.replaceState(null, '', '#s' + (current + 1)); } catch (_) { /* Local-file restrictions must not break navigation. */ }
    if (focus) slides[current].querySelector('h2').focus();
  }
  function setScale(value) {
    const scale = Math.max(40, Math.min(160, Number(value) || 100));
    document.documentElement.style.setProperty('--scale', String(scale / 100));
    zoom.value = String(scale); scaleStatus.textContent = scale + '%';
  }
  function interactive(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, button, a, summary, [contenteditable="true"]'));
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
  zoom.addEventListener('input', () => setScale(zoom.value));
  document.getElementById('reset-size').addEventListener('click', () => setScale(100));
  document.getElementById('reading').addEventListener('click', function () {
    const reading = document.body.classList.toggle('reading');
    this.setAttribute('aria-pressed', String(reading));
    this.textContent = reading ? 'Slide mode' : 'Reading mode';
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  document.addEventListener('keydown', handleKey);
  document.querySelectorAll('[data-reveal]').forEach(button => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.reveal);
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      button.textContent = panel.hidden ? 'Reveal explanation' : 'Hide explanation';
    });
  });
  const match = location.hash.match(/^#s(\d+)$/);
  go(match ? Number(match[1]) - 1 : 0, false);
  setScale(100);
  window.C04Deck = Object.freeze({ go, setScale, handleKey, current: () => current });
})();
