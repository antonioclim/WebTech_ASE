/* Phase 3 authored local byte checker. Source-audited only; no browser execution in production. */
(() => {
  'use strict';
  const registryInput = document.getElementById('registry');
  const folderInput = document.getElementById('folder');
  const button = document.getElementById('check');
  const status = document.getElementById('status');
  const output = document.getElementById('result');
  const assessed = ['projects/p01/student/src/App.jsx', 'projects/p03/student/src/SearchPanel.jsx'];
  const previewPairs = [{preview: 'teaching/p01-preview/src/App.jsx', assessed: assessed[0]}, {preview: 'teaching/p03-preview/src/SearchPanel.jsx', assessed: assessed[1]}];
  const roots = ['projects', 'optional', 'teaching', 'source_reference/v1.1.0'];
  const generated = ['.vite', 'dist', 'node_modules'];
  const topKeys = ['schema', 'version', 'phase', 'source_files', 'assessed_editable_paths', 'teaching_copy_policy', 'forbidden_canonical_execution', 'identity_is_runtime_qualification', 'protected_source_roots', 'generated_directory_exclusions'];
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const sameList = (a, b) => Array.isArray(a) && a.length === b.length && a.every((value, index) => value === b[index]);
  const exactKeys = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
  const protectedName = name => roots.some(root => name.startsWith(root + '/'));
  const safe = name => typeof name === 'string' && name.length > 0 && name.length <= 1024 && /^[\x20-\x7e]+$/.test(name) && !/[\\<>:"|?*]/.test(name) && !name.startsWith('/') && name.split('/').every(part => part && part !== '.' && part !== '..' && !/[ .]$/.test(part) && !/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i.test(part));
  button.addEventListener('click', async () => {
    button.disabled = true;
    const result = {
      version: '1.2.0', mode: 'EXACT_PACKAGE_SOURCE_BYTES_ONLY', result: 'UNOBSERVED', checked_files: 0, errors: [],
      browser_runtime_of_projects: false, authentication: false, network_used: false,
      limitations: ['Supplied registry is not authenticated', 'This HTML route accepts portable ASCII paths only; use Python for strict NFC/Unicode collision and duplicate-JSON-key checks', 'The browser file picker cannot establish symlink absence, empty directory coverage or resistance to concurrent filesystem change', 'Form IDs and new unbound root/assets files are outside this HTML byte check; use the separately documented Python and package-manifest routes', 'No project, tests, Gemini, Moodle, native document behaviour or marks are validated']
    };
    try {
      if (!window.crypto || !window.crypto.subtle) throw new Error('Web Crypto is unavailable. No PASS is inferred. Use the installed-Python route.');
      const registryFile = registryInput.files[0];
      if (!registryFile || registryFile.name !== 'SOURCE_BINDINGS_v1.2.0.json' || registryFile.size > 2097152) throw new Error('Select the exact registry file, at most 2 MiB.');
      const registry = JSON.parse(await registryFile.text());
      if (!object(registry) || Object.keys(registry).some(key => !topKeys.includes(key)) || registry.schema !== 'tw2026.s08.source-bindings.v1' || registry.version !== '1.2.0' || !['2/4', '3/4', '4/4'].includes(registry.phase) || registry.forbidden_canonical_execution !== true || registry.identity_is_runtime_qualification !== false || !Array.isArray(registry.source_files) || !registry.source_files.length || registry.source_files.length > 4096) throw new Error('Registry shape or evidence boundary is invalid.');
      if (!Array.isArray(registry.assessed_editable_paths) || registry.assessed_editable_paths.length !== 2 || !registry.assessed_editable_paths.every(value => typeof value === 'string') || !sameList([...registry.assessed_editable_paths].sort(), [...assessed].sort())) throw new Error('Registry assessed edit boundary is invalid.');
      const policy = registry.teaching_copy_policy;
      if (!exactKeys(policy, ['package_mode', 'student_work_mode', 'pairs', 'reported_separately_from_assessed_edits', 'functional_qualification']) || policy.package_mode !== 'EXACT_DISTRIBUTED_STARTER' || policy.student_work_mode !== 'ONLY_EXACT_ONE_WAY_COPY_OF_CURRENT_PAIRED_ASSESSED_TARGET' || policy.reported_separately_from_assessed_edits !== true || policy.functional_qualification !== false || !Array.isArray(policy.pairs) || policy.pairs.length !== 2 || policy.pairs.some((pair, index) => !exactKeys(pair, ['preview', 'assessed']) || pair.preview !== previewPairs[index].preview || pair.assessed !== previewPairs[index].assessed)) throw new Error('Teaching-copy policy is invalid.');
      if (Object.prototype.hasOwnProperty.call(registry, 'protected_source_roots') && !sameList(registry.protected_source_roots, roots)) throw new Error('Protected roots differ from the fixed boundary.');
      if (Object.prototype.hasOwnProperty.call(registry, 'generated_directory_exclusions') && !sameList(registry.generated_directory_exclusions, generated)) throw new Error('Generated-directory policy differs from the fixed boundary.');
      const selected = [...folderInput.files];
      if (!selected.length || selected.some(file => !file.webkitRelativePath)) throw new Error('Directory selection is unavailable or empty. Use the installed-Python route.');
      const files = new Map(), selectedRoots = new Set(), selectedPortable = new Set();
      for (const file of selected) {
        const parts = file.webkitRelativePath.split('/');
        const selectedRoot = parts.shift();
        if (!selectedRoot) throw new Error('Directory picker returned an invalid root.');
        selectedRoots.add(selectedRoot);
        const name = parts.join('/');
        if (!safe(name) || files.has(name) || selectedPortable.has(name.toLowerCase())) throw new Error('Selected folder has an unsafe, unsupported or duplicate portable path. Use Python if a non-ASCII path is intended.');
        selectedPortable.add(name.toLowerCase()); files.set(name, file);
        if (protectedName(name) && !name.startsWith('source_reference/v1.1.0/') && name.split('/').slice(0, -1).some(part => generated.includes(part))) throw new Error('Exact-package mode rejects generated directories; use Python --student-work for the labelled future work boundary.');
      }
      if (selectedRoots.size !== 1) throw new Error('Select one whole student folder.');
      const seen = new Set(), portableSeen = new Set();
      for (const row of registry.source_files) {
        if (!exactKeys(row, ['path', 'bytes', 'sha256', 'role'])) throw new Error('Every source row requires exactly path, bytes, sha256 and role.');
        const name = row.path;
        const expectedRole = typeof name === 'string' && name.startsWith('source_reference/v1.1.0/') ? 'HISTORICAL_PUBLIC_SOURCE_EXACT' : 'ACTIVE_ASSESSED_OR_LABELLED_PREVIEW_SOURCE_EXACT';
        if (!safe(name) || !protectedName(name) || seen.has(name) || portableSeen.has(name.toLowerCase()) || !Number.isSafeInteger(row.bytes) || row.bytes < 0 || row.bytes > 33554432 || typeof row.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(row.sha256) || row.role !== expectedRole) throw new Error('Registry has an invalid or duplicate portable source row.');
        if (!name.startsWith('source_reference/v1.1.0/') && name.split('/').slice(0, -1).some(part => generated.includes(part))) throw new Error('Registry must not bind generated-directory content as source.');
        seen.add(name); portableSeen.add(name.toLowerCase());
        const file = files.get(name);
        if (!file) { result.errors.push('Missing bound file: ' + name); continue; }
        if (file.size > 33554432) throw new Error('Bound source exceeds the 32 MiB limit.');
        const bytes = await file.arrayBuffer();
        const digest = await window.crypto.subtle.digest('SHA-256', bytes);
        const hash = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
        result.checked_files += 1;
        if (bytes.byteLength !== row.bytes || hash !== row.sha256) result.errors.push('Source identity mismatch: ' + name);
      }
      if ([...assessed, ...previewPairs.map(pair => pair.preview)].some(name => !seen.has(name))) result.errors.push('Both assessed targets and both paired preview targets must be bound.');
      for (const name of files.keys()) if (protectedName(name) && !seen.has(name)) result.errors.push('Unbound unexpected protected source file: ' + name);
      result.result = result.errors.length ? 'FAIL_SOURCE_BYTE_COMPARISON' : 'PASS_SELECTED_BOUND_SOURCE_BYTES_ONLY';
      status.textContent = result.result + '. Selected bytes only: no runtime acceptance, symlink qualification or author authentication.';
    } catch (error) {
      result.result = 'UNAVAILABLE_OR_INVALID_INPUT_NO_PASS';
      result.errors.push(String(error.message || error));
      status.textContent = 'STOP: the comparison did not complete. No PASS is inferred.';
    } finally {
      output.textContent = JSON.stringify(result, null, 2);
      button.disabled = false;
    }
  });
})();
