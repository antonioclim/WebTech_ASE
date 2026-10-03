/* Newly authored S07 v1.2.1 pure draft handling. No DOM, dependencies or network. */
(function (root) {
  'use strict';
  const UNVERIFIED = 'IMPORTED_UNVERIFIED_DRAFT';
  const ENTERED = 'USER_ENTERED_UNVERIFIED_DRAFT';
  const STATE = Object.freeze({
    INCOMPLETE: 'INCOMPLETE',
    CORE: 'CORE_DRAFT_FIELDS_COMPLETE',
    FINAL: 'FINAL_FIELDS_COMPLETE_NOT_VERIFIED'
  });
  function list(schema) { return schema.sections.flatMap(section => section.fields); }
  function defaults(schema) { return Object.fromEntries(list(schema).map(field => [field.id, field.default])); }
  function bytes(text) { return new TextEncoder().encode(text).byteLength; }
  function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function validType(field, value) {
    return field.kind === 'checkbox' ? typeof value === 'boolean' :
      typeof value === 'string' && value.length <= field.max && (!field.options || field.options.includes(value));
  }
  function validateValues(values, schema, exact = true) {
    if (!record(values)) throw Error('Values must be a field object.');
    const fields = list(schema), ids = new Set(fields.map(field => field.id));
    if (Object.keys(values).some(id => !ids.has(id))) throw Error('Unknown field in draft.');
    for (const field of fields) {
      if ((!Object.hasOwn(values, field.id) && exact) ||
          (Object.hasOwn(values, field.id) && !validType(field, values[field.id])))
        throw Error('Missing, invalid or oversized field: ' + field.id);
    }
  }
  function pack(values, schema, provenance = ENTERED, savedAt = new Date().toISOString()) {
    validateValues(values, schema);
    if (![ENTERED, UNVERIFIED].includes(provenance)) throw Error('Unknown draft provenance.');
    return {schema: schema.schema, version: schema.version, savedAt, values: {...values}, provenance};
  }
  function serialise(values, schema, provenance = ENTERED, savedAt) {
    const text = JSON.stringify(pack(values, schema, provenance, savedAt), null, 2);
    const size = bytes(text);
    if (size > schema.maxExportBytes)
      throw Error('JSON export is ' + size + ' UTF-8 bytes; the limit is ' + schema.maxExportBytes + '. All fields were retained. Save the plain-text fallback before reducing redundant text.');
    return {text, bytes: size};
  }
  function cleanImport(text, schema) {
    if (typeof text !== 'string') throw Error('Import must be JSON text.');
    if (bytes(text) > schema.maxImportBytes) throw Error('JSON import exceeds ' + schema.maxImportBytes + ' UTF-8 bytes.');
    let incoming;
    try { incoming = JSON.parse(text); } catch (_) { throw Error('Malformed JSON.'); }
    if (!record(incoming) || incoming.schema !== schema.schema || !record(incoming.values))
      throw Error('Unsupported schema or values.');
    const legacy = schema.legacyVersions.includes(incoming.version);
    const compatible = (schema.compatibleVersions || []).includes(incoming.version);
    if (incoming.version !== schema.version && !legacy && !compatible) throw Error('Unsupported draft version.');
    if (Object.keys(incoming).some(key => !['schema', 'version', 'savedAt', 'values', 'provenance'].includes(key)))
      throw Error('Unknown import property.');
    if (incoming.savedAt !== undefined && typeof incoming.savedAt !== 'string') throw Error('Invalid save date.');
    if (incoming.provenance !== undefined && typeof incoming.provenance !== 'string') throw Error('Invalid provenance.');
    const sourceIds = legacy ? schema.legacyIds : list(schema).map(field => field.id);
    const fields = new Map(list(schema).map(field => [field.id, field]));
    if (Object.keys(incoming.values).length !== sourceIds.length ||
        Object.keys(incoming.values).some(id => !sourceIds.includes(id))) throw Error('Unknown or missing import field.');
    const values = defaults(schema);
    for (const id of sourceIds) {
      if (!Object.hasOwn(incoming.values, id) || !validType(fields.get(id), incoming.values[id]))
        throw Error('Missing, invalid or oversized field: ' + id);
      values[id] = incoming.values[id];
    }
    if (values.seminar_id !== 'S07') throw Error('This form only accepts seminar identity S07.');
    values.declaration = false;
    values.gemini_state = '';
    return {
      values,
      provenance: UNVERIFIED,
      sourceVersion: incoming.version,
      legacy,
      compatible,
      review: legacy ? 'Review the legacy kit string. No S07 PACKAGE_ID was inferred. All 53 retained values and their claims are imported and unverified.' :
        'All imported claims are unverified. Review the evidence and renew the Gemini state and individual declaration.'
    };
  }
  function pending(value) {
    return /^(?:\[\s*)?(?:PENDING|NOT[ _-]?EXECUTED|BLOCKED|UNKNOWN|SYNTHETIC(?:[ _-]PRACTICE)?)(?:\b|_)/i.test(String(value || '').trim());
  }
  function nonActualObservation(value) {
    const text = String(value || '').trim();
    return /^(?:\[\s*)?(?:SOURCE_EXPECTATION|SOURCE_REASONING|MODULE_MODEL|SOURCE_LINKED_MODEL|SYNTHETIC_PRACTICE|NOT_EXECUTED)(?:\b|_)/i.test(text) &&
      !/(?:GENUINE_ORM_SQLITE|ACTUAL_ORM_SQLITE|LOCAL_HTTP)\s*[:|]\s*\S/.test(text);
  }
  function check(values, schema, mode) {
    if (!['core', 'final'].includes(mode)) throw Error('Unknown check mode.');
    if (!record(values)) values = {};
    const errors = [];
    function issue(id, message) { if (!errors.some(error => error.id === id && error.message === message)) errors.push({id, message}); }
    for (const field of list(schema)) {
      const value = values && values[field.id];
      if (!validType(field, value)) { issue(field.id, 'Invalid type, selection or size.'); continue; }
      if ((mode === 'final' || field.phase === 'core') && (field.kind === 'checkbox' ? !value : !value.trim()))
        issue(field.id, 'Complete ' + field.label.toLowerCase() + '.');
    }
    if (values.seminar_id !== 'S07') issue('seminar_id', 'Use the fixed seminar identity S07.');
    if (mode === 'final') {
      for (const id of ['group', 'surname', 'given'])
        if (typeof values[id] === 'string' && values[id].trim() && !part(values[id]))
          issue(id, 'Enter a name or group value that produces a usable PDF filename. Review the generated filename.');
      const altStack = values.actual_stack_state === 'SEPARATELY_APPROVED_ALTERNATIVE';
      const altGemini = values.gemini_state === 'SEPARATELY_APPROVED_ALTERNATIVE';
      if (altStack || altGemini) {
        const authority = String(values.authority_reference || '');
        if (!/^AUTHORISATION:\s*\S[\s\S]{24,}/.test(authority) || pending(authority.slice('AUTHORISATION:'.length)))
          issue('authority_reference', 'Record the existing teacher, date, decision reference, exact affected requirement and replacement evidence. This checker cannot grant or authenticate the decision.');
      }
      if (!altStack) {
        if (values.actual_stack_state !== 'ACTUAL_RECORDED') issue('actual_stack_state', 'Genuine ORM/SQLite and local HTTP observations remain required. Keep a truthful draft while prerequisites are blocked.');
        const refs = String(values.fixture_identity || '') + '\n' + String(values.evidence_index || '');
        if (!/(?:GENUINE_ORM_SQLITE|ACTUAL_ORM_SQLITE)\s*[:|]\s*\S/.test(refs) || !/LOCAL_HTTP\s*[:|]\s*\S/.test(refs))
          issue('evidence_index', 'Name genuine ORM/SQLite and local HTTP witnesses with reproducible identities. Labels alone cannot authenticate execution.');
        for (const id of ['initial_checks', 'before_state', 'unsafe_observation', 'operation_sequence', 'transaction_witness', 'success_state', 'success_http', 'callback_failure', 'audit_failure', 'rollback_state', 'error_identity', 'commit_boundary', 'recovery', 'invalid_outcomes', 'observed_difference']) {
          if (pending(values[id])) issue(id, 'This required observation is visibly pending or unexecuted. Save a draft or record the separate teacher decision.');
          else if (nonActualObservation(values[id])) issue(id, 'A source or model-only record is not a genuine observation. Keep its class explicit and add the actual witness or save a truthful draft.');
        }
      }
      if (!altGemini) {
        if (values.gemini_state !== 'ACTUAL_RECORDED') issue('gemini_state', 'Complete an actual bounded Gemini interaction with an independent check. Synthetic practice does not substitute automatically.');
        if (values.gemini_state === 'ACTUAL_RECORDED') {
          for (const id of ['gemini_context', 'gemini_prompt', 'gemini_claim', 'gemini_check'])
            if (pending(values[id])) issue(id, 'ACTUAL_RECORDED cannot be combined with an obvious pending, blocked or synthetic minimum witness.');
          for (const id of ['gemini_correction', 'gemini_limit'])
            if (/^(?:\[\s*)?(?:PENDING|NOT[ _-]?EXECUTED|BLOCKED|SYNTHETIC(?:[ _-]PRACTICE)?)(?:\b|_)/i.test(String(values[id] || '').trim()))
              issue(id, 'Record the justified correction or NONE and the limit of the independent check. A bounded UNKNOWN verdict is allowed.');
        }
      }
      for (const id of ['adr_context', 'adr_resources', 'adr_alternatives', 'adr_decision', 'adr_transaction', 'adr_retry_table', 'adr_evidence', 'adr_consequences'])
        if (pending(values[id])) issue(id, 'Complete this required ADR analysis. Full P03 programming is optional.');
    }
    return {ok: errors.length === 0, errors, state: errors.length ? STATE.INCOMPLETE : mode === 'core' ? STATE.CORE : STATE.FINAL,
      authenticity: 'NOT_AUTHENTICATED', permission: 'NOT_GRANTED_BY_FORM'};
  }
  function part(value) {
    const clean = String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}-]+/gu, '_').replace(/^[_ .]+|[_ .]+$/g, '');
    let output = '';
    for (const character of clean) {
      if (bytes(output + character) > 45) break;
      output += character;
    }
    return output;
  }
  function filename(values) {
    const parts = [part(values.group), part(values.surname), part(values.given)];
    return parts.every(Boolean) ? 'TW2026_S07_' + parts.join('_') + '.pdf' : null;
  }
  function plainText(values, schema, provenance = ENTERED) {
    const output = ['TW2026 S07 — Evidence worksheet', 'Kit v' + schema.version, provenance,
      'Working fallback. Claims are not authenticated. Final submission is one PDF.', ''];
    for (const section of schema.sections) {
      output.push(section.title, '');
      for (const field of section.fields) {
        output.push(field.label + ' [' + field.id + ']', field.kind === 'checkbox' ? (values[field.id] ? 'DECLARED' : 'NOT DECLARED') : String(values[field.id] || 'PENDING / NOT ENTERED'), '');
      }
    }
    return output.join('\n');
  }
  root.S07Core = Object.freeze({list, defaults, bytes, validType, pack, serialise, cleanImport, check, filename, plainText, STATE, ENTERED, UNVERIFIED});
  if (typeof module !== 'undefined' && module.exports) module.exports = root.S07Core;
})(globalThis);
