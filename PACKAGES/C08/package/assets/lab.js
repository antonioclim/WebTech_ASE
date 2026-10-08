(function () {
  'use strict';
  const choice = document.getElementById('scenario'), prediction = document.getElementById('prediction');
  const output = document.getElementById('result'), message = document.getElementById('message');
  const download = document.getElementById('export');
  let record = null;
  function clearResult() { record = null; output.textContent = 'No model has been run for this selection.'; download.disabled = true; }
  choice.addEventListener('change', () => { clearResult(); message.textContent = 'Selection changed. Review your prediction before running.'; });
  prediction.addEventListener('input', () => { if (record) { clearResult(); message.textContent = 'Prediction changed. Run again to bind it to a new model result.'; } });
  document.getElementById('run').addEventListener('click', () => {
    clearResult();
    if (!prediction.value.trim()) { message.textContent = 'Write your own prediction first. This checks presence only.'; prediction.focus(); return; }
    if (prediction.value.length > 2000) { message.textContent = 'Use at most 2000 characters. No content was executed.'; return; }
    try {
      const data = window.C08Models.run(choice.value);
      record = { schema: 'C08_MODEL_NOTE/1.0', prediction: prediction.value, ...data,
        declaration: 'This is a local teaching model, not an actual React, browser, Gemini or assessed S08 observation.' };
      output.textContent = JSON.stringify(record, null, 2); download.disabled = false;
      message.textContent = 'Model completed. Compare the result with your prediction; no correctness grade has been assigned.';
    } catch (error) { message.textContent = 'Model error: ' + String(error.message || error); }
  });
  download.addEventListener('click', () => {
    if (!record) { message.textContent = 'Run a model before export.'; return; }
    let url;
    try {
      url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2) + '\n'], { type: 'text/plain;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'C08_MODEL_' + record.scenario + '.txt';
      document.body.appendChild(a); a.click(); a.remove();
      message.textContent = 'Download requested. Check the saved text yourself; this page cannot confirm it exists.';
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { if (url) URL.revokeObjectURL(url); message.textContent = 'Export unavailable: ' + String(error.message || error) + '. Copy the visible model text instead.'; }
  });
  document.getElementById('reset').addEventListener('click', () => {
    prediction.value = ''; clearResult(); message.textContent = 'Page draft cleared. Nothing was uploaded or saved automatically.';
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  clearResult();
})();
