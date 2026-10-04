/* S11 v1.2.1 structural form contract. No network or execution certification. */
(function (root) {
  'use strict';
  const list = schema => schema.sections.flatMap(section => section.fields);
  const defaults = schema => Object.fromEntries(list(schema).map(field => [field.id, field.default]));
  const provenanceSet = new Set(['USER_ENTERED_UNVERIFIED_DRAFT', 'IMPORTED_UNVERIFIED_DRAFT']);
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
  function validType(field, value) {
    return field.kind === 'checkbox' ? typeof value === 'boolean' : typeof value === 'string' && value.length <= field.max && (!field.options || field.options.includes(value));
  }
  function validateShape(values, schema) {
    if (!plain(values)) throw Error('Values must be a plain object.');
    const fields = list(schema), keys = new Set(fields.map(field => field.id));
    if (Object.keys(values).some(key => !keys.has(key))) throw Error('Unknown field.');
    for (const field of fields) if (!Object.hasOwn(values, field.id) || !validType(field, values[field.id])) throw Error('Missing, oversized or invalid field: ' + field.id);
  }
  function pack(values, schema, provenance = 'USER_ENTERED_UNVERIFIED_DRAFT') {
    validateShape(values, schema);
    if (!provenanceSet.has(provenance)) throw Error('Invalid provenance.');
    return {schema: schema.schema, version: schema.version, savedAt: new Date().toISOString(), values: {...values}, provenance};
  }
  function cleanImport(text, schema) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > schema.maxImportBytes) throw Error('Import exceeds the 2,000,000-byte limit or is not text.');
    let packet;
    try { packet = JSON.parse(text); } catch (_) { throw Error('Malformed JSON.'); }
    if (!plain(packet) || packet.schema !== schema.schema || packet.version !== schema.version) throw Error('Unsupported schema/version. This form accepts v1.2.1 drafts only.');
    if (Object.keys(packet).some(key => !['schema', 'version', 'savedAt', 'values', 'provenance'].includes(key))) throw Error('Unknown import property.');
    if (typeof packet.savedAt !== 'string' || packet.savedAt.length > 40 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(packet.savedAt)) throw Error('Invalid savedAt metadata.');
    const date = new Date(packet.savedAt);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== packet.savedAt) throw Error('Invalid savedAt metadata.');
    if (!provenanceSet.has(packet.provenance)) throw Error('Invalid provenance metadata.');
    validateShape(packet.values, schema);
    return {values: {...packet.values, authorship_decl: false, redaction_decl: false, pdf_review: 'DRAFT_NOT_REVIEWED', submission_status: 'DRAFT'}, provenance: 'IMPORTED_UNVERIFIED_DRAFT'};
  }
  function filename(values) {
    const part = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^[_ .]+|[_ .]+$/g, '').slice(0, 45);
    const group = part(values.group), alias = part(values.student_alias);
    return group && alias ? 'TW2026_S11_' + group + '_' + alias + '.pdf' : null;
  }
  // Declared result structure only. Neither a count nor a locator authenticates execution.
  const suiteCounts = {p02: {BASELINE: 2, OBJECTIVE: 5, REGRESSION: 3, INFRASTRUCTURE: 10}, p03: {BASELINE: 2, OBJECTIVE: 4, REGRESSION: 2, INFRASTRUCTURE: 6, SUCCESSOR_INPUTS: 12}};
  function canonicalFinalChecks(text, project = 'p02') {
    if (typeof text !== 'string' || !Object.hasOwn(suiteCounts, project)) return false;
    let lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (project === 'p03') {
      const marker = '--- P03 SUITE LEDGER ---', markers = lines.reduce((found, line, index) => line === marker ? [...found, index] : found, []);
      if (markers.length !== 1 || markers[0] === 0) return false;
      const preamble = lines.slice(0, markers[0]);
      if (preamble.some(line => /^(?:ACTUAL_RECORDED|SOURCE_ONLY|MODEL_ONLY|BLOCKED|NOT_EXECUTED|PENDING)(?:\b|_)|^(?:BASELINE|OBJECTIVE|REGRESSION|INFRASTRUCTURE|SUCCESSOR_INPUTS)\s*:/i.test(line))) return false;
      lines = lines.slice(markers[0] + 1);
    }
    const suites = Object.entries(suiteCounts[project]);
    if (lines.length !== suites.length + 1 || lines.filter(line => line === 'ACTUAL_RECORDED').length !== 1) return false;
    return suites.every(([name, count]) => {
      const rows = lines.filter(line => new RegExp('^' + name + '\\s*:', 'i').test(line));
      if (rows.length !== 1) return false;
      const match = rows[0].match(new RegExp('^' + name + ': PASS; COUNT: ' + count + '/' + count + '; LOCATOR: ([^;|]+)$'));
      if (!match) return false;
      const locator = match[1].trim();
      return !!locator && !/^\[.*\]$/.test(locator) && !/^(?:PENDING|NOT_EXECUTED|BLOCKED|FAIL|UNKNOWN|NOT_STARTED|IN_PROGRESS|SOURCE_ONLY|MODEL_ONLY)(?:\b|_)/i.test(locator);
    });
  }
  function canonicalRequiredWork(text) {
    const lines = String(text).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const rows = lines.filter(line => /^REQUIRED\s*:/i.test(line));
    return rows.length === 1 && lines[0] === rows[0] && /^REQUIRED:\s*NONE$/i.test(rows[0]);
  }
  function check(values, schema, mode) {
    if (!['core', 'final'].includes(mode)) throw Error('Unknown validation mode.');
    const errors = [], add = (id, message) => errors.push({id, message});
    try { validateShape(values, schema); } catch (error) { return {ok: false, errors: [{id: 'student_alias', message: error.message}], state: 'INVALID_STRUCTURE'}; }
    for (const field of list(schema)) if (field.phase === 'core' || mode === 'final') {
      if (field.kind === 'checkbox' ? !values[field.id] : !values[field.id].trim()) add(field.id, 'Complete ' + field.label.toLowerCase() + '.');
    }
    if (!filename(values)) add('student_alias', 'Use a teacher-known alias and the real group to propose a filename.');
    if (mode === 'final') {
      if (values.execution_status !== 'ACTUAL_RECORDED') add('execution_status', 'This candidate offers standard actual completion only. Source/model, blocked and alternative records remain drafts; a selector grants no authority.');
      if (values.p02_completion !== 'COMPLETE_RECORDED') add('p02_completion', 'Complete the central P02 work and record actual results.');
      if (!canonicalFinalChecks(values.p02_checks, 'p02')) add('p02_checks', 'Record exactly one ACTUAL_RECORDED line and the four required P02 rows: BASELINE 2/2, OBJECTIVE 5/5, REGRESSION 3/3, INFRASTRUCTURE 10/10. Row syntax: NAME: PASS; COUNT: n/n; LOCATOR: your actual redacted log locator. No extra ledger line or status suffix. These structural claims do not authenticate execution.');
      if (values.portfolio_route !== 'CORS_CSRF_STANDARD') add('portfolio_route', 'The normal completion route requires the reduced CORS/CSRF portfolio. An alternative is a draft record only in this candidate.');
      if (values.portfolio_completion !== 'COMPLETE_RECORDED') add('portfolio_completion', 'Complete and record both reduced portfolio classes.');
      if (!canonicalFinalChecks(values.portfolio_patch, 'p03')) add('portfolio_patch', 'Keep the narrow file/diff locator, then --- P03 SUITE LEDGER ---, exactly one ACTUAL_RECORDED line and the five required P03 rows: BASELINE 2/2, OBJECTIVE 4/4, REGRESSION 2/2, INFRASTRUCTURE 6/6, SUCCESSOR_INPUTS 12/12. Use NAME: PASS; COUNT: n/n; LOCATOR: your actual redacted log locator. Counts and locators are unverified declarations.');
      if (values.ai_route !== 'ACTUAL_RECORDED') add('ai_route', 'Record a genuine bounded Gemini exchange for normal completion. An access block or alternative stays an honest draft for teacher review.');
      if (!canonicalRequiredWork(values.remaining_work)) add('remaining_work', 'Begin with exactly one REQUIRED: NONE row only when compulsory P02, CORS/CSRF and critique work is genuinely complete. Duplicate or contradictory REQUIRED rows remain a draft; optional P01 notes may follow.');
      if (!['FINAL_CANDIDATE_NOT_YET_SAVED', 'LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT'].includes(values.pdf_review)) add('pdf_review', 'Choose the actual candidate-unsaved or locally-reviewed PDF state.');
      for (const field of list(schema)) if (field.phase === 'final' && field.kind !== 'checkbox' && !['p01_capstone', 'alternative_authority', 'remaining_work', 'ai_verdict'].includes(field.id) && /^(PENDING|NOT_EXECUTED|BLOCKED|FAIL|NOT_STARTED|IN_PROGRESS)(\b|_)/i.test(values[field.id].trim())) add(field.id, 'This required record remains unresolved. Print a labelled draft.');
    }
    return {ok: errors.length === 0, errors, state: errors.length ? 'INCOMPLETE' : mode === 'core' ? 'CORE_DRAFT_FIELDS_COMPLETE' : 'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'};
  }
  root.S11Core = {list, defaults, validType, validateShape, pack, cleanImport, filename, canonicalFinalChecks, check};
  if (typeof module !== 'undefined') module.exports = root.S11Core;
})(globalThis);
