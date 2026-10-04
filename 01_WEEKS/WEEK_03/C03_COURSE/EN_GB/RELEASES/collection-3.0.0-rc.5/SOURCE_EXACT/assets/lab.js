(function () {
  'use strict';
  const variants = {
    value: [['number','Number 3'],['string','String "3"'],['negative','Number -1'],['nan','NaN'],['infinity','Infinity'],['null','null'],['boolean','false']],
    property: [['inherited','Inherited default'],['shadow','Own shadow'],['own-undefined','Own undefined']],
    identity: [['alias','Alias'],['shallow','Shallow object copy'],['path','Copy the changed path']],
    function: [['method','Method call'],['detached','Bare strict-mode call'],['explicit','Explicit receiver'],['closure','Captured minimum']],
    reducer: [['numeric','Numeric amounts'],['mixed','Mixed types'],['empty','Empty input']]
  };
  let entries = [];
  const demo = document.getElementById('demo');
  const variant = document.getElementById('variant');
  const prediction = document.getElementById('prediction');
  const output = document.getElementById('output');
  const message = document.getElementById('message');
  const log = document.getElementById('log');
  function changeDemo() {
    variant.replaceChildren();
    for (const [value, label] of variants[demo.value]) {
      const option = document.createElement('option'); option.value = value;
      option.textContent = label; variant.appendChild(option);
    }
    output.textContent = 'No run for this selection yet.';
  }
  function refresh() {
    log.textContent = entries.length ? JSON.stringify(entries, null, 2) : 'No saved session entries.';
    document.getElementById('entry-count').textContent = entries.length + ' session entries';
  }
  function validateImport(value) {
    if (!value || typeof value !== 'object' || value.schema !== 'C03_LAB_1' ||
      !Array.isArray(value.entries) || value.entries.length > 200) throw new Error('Invalid C03 schema or entry count');
    const clean = value.entries.map(entry => {
      if (!entry || typeof entry !== 'object' || typeof entry.demo !== 'string' ||
        !Object.hasOwn(variants, entry.demo) || !variants[entry.demo].some(v => v[0] === entry.variant) ||
        typeof entry.prediction !== 'string' || !entry.prediction.trim() || entry.prediction.length > 4000 ||
        typeof entry.observedAt !== 'string' || entry.observedAt.length > 80 ||
        !entry.output || typeof entry.output !== 'object' || Array.isArray(entry.output) ||
        JSON.stringify(entry.output).length > 12000) throw new Error('Invalid entry');
      return { demo: entry.demo, variant: entry.variant, prediction: entry.prediction,
        observedAt: entry.observedAt, output: entry.output, origin: 'IMPORTED_UNVERIFIED_RECORD' };
    });
    return clean;
  }
  document.getElementById('run').addEventListener('click', () => {
    if (!prediction.value.trim()) { message.textContent = 'Write your prediction before running.'; prediction.focus(); return; }
    if (prediction.value.length > 4000) { message.textContent = 'Keep the prediction below 4,001 characters.'; return; }
    if (entries.length >= 200) { message.textContent = 'Session limit reached. Export before clearing.'; return; }
    try {
      const result = window.C03Demos.run(demo.value, variant.value);
      entries.push({ demo: demo.value, variant: variant.value, prediction: prediction.value,
        observedAt: new Date().toISOString(), output: result, origin: 'LOCAL_DEMO_EXECUTION' });
      output.textContent = JSON.stringify(result, null, 2);
      message.textContent = 'Local demonstration recorded. This is not an S03 project test.';
      refresh();
    } catch (error) { message.textContent = 'Demonstration error: ' + error.message; }
  });
  demo.addEventListener('change', changeDemo);
  variant.addEventListener('change', () => { output.textContent = 'No run for this selection yet.'; });
  document.getElementById('export').addEventListener('click', () => {
    const data = JSON.stringify({ schema: 'C03_LAB_1', entries }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'C03_LAB_OBSERVATIONS.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = 'Export requested. Confirm that the file was saved before closing.';
  });
  document.getElementById('import').addEventListener('change', async function () {
    const file = this.files && this.files[0]; if (!file) return;
    if (file.size > 2000000) { message.textContent = 'Import rejected: file exceeds 2 MB.'; this.value = ''; return; }
    try {
      const clean = validateImport(JSON.parse(await file.text()));
      if (entries.length && !window.confirm('Replace this session log? Export it first to keep it.')) return;
      entries = clean; refresh();
      message.textContent = 'Imported as unverified historical records. No demonstration was re-executed.';
    } catch (error) { message.textContent = 'Import rejected: ' + error.message; }
    finally { this.value = ''; }
  });
  document.getElementById('clear').addEventListener('click', () => {
    if (!window.confirm('Clear this session? Export first to keep the log.')) return;
    entries = []; prediction.value = ''; output.textContent = 'No run yet.'; refresh();
    message.textContent = 'Session cleared.';
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  changeDemo(); refresh();
  window.C03Lab = Object.freeze({ validateImport });
})();
