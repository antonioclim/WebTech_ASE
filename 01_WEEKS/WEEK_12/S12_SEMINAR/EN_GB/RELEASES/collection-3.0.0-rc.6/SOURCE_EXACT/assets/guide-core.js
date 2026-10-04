/* S12 offline guide model. No network or document access. */
(function (root) {
  'use strict';
  const VERSION = '1.2.1';
  const SCHEMA = 'TW2026_S12_GUIDE_PROGRESS';
  const MAX_BYTES = 50000;
  function plain(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) &&
      (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  }
  function blank(ids) { return Object.fromEntries(ids.map(id => [id, false])); }
  function clean(value, ids) {
    if (!plain(value)) throw new Error('Progress must be a plain object.');
    if (value.schema !== SCHEMA || value.version !== VERSION) throw new Error('This progress belongs to another guide version.');
    if (!plain(value.values)) throw new Error('Progress values must be a plain object.');
    const allowed = new Set(ids);
    for (const [id, flag] of Object.entries(value.values)) {
      if (!allowed.has(id) || typeof flag !== 'boolean') throw new Error('Unknown step or non-boolean progress.');
    }
    for (const id of Object.keys(value)) {
      if (!['schema', 'version', 'values'].includes(id)) throw new Error('Unknown progress property.');
    }
    return Object.assign(blank(ids), value.values);
  }
  function parse(text, ids) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > MAX_BYTES) throw new Error('Progress import exceeds 50,000 bytes.');
    return clean(JSON.parse(text), ids);
  }
  function pack(values, ids) { return { schema: SCHEMA, version: VERSION, values: clean({schema: SCHEMA, version: VERSION, values}, ids) }; }
  function normalise(text) { return String(text).normalize('NFKC').toLocaleLowerCase('en-GB').replace(/\s+/g, ' ').trim(); }
  function matches(text, query) { return normalise(query) === '' || normalise(text).includes(normalise(query)); }
  function count(values, ids) { return ids.filter(id => values[id] === true).length; }
  function clock(seconds) {
    const n = Math.max(0, Math.min(3600, Math.floor(Number(seconds) || 0)));
    return (n === 0 ? 'STOP ' : '') + String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  }
  function remaining(baseSeconds, startedAt, now) {
    if (!Number.isFinite(baseSeconds) || !Number.isFinite(startedAt) || !Number.isFinite(now)) throw new Error('Invalid timer state.');
    return Math.max(0, baseSeconds - Math.max(0, Math.floor((now - startedAt) / 1000)));
  }
  function validAnchor(hash, ids) {
    if (typeof hash !== 'string') return null;
    try { const id = decodeURIComponent(hash.replace(/^#/, '')); return ids.includes(id) ? id : null; } catch { return null; }
  }
  function route(browser) { return ['chrome', 'edge', 'firefox'].includes(browser) ? browser : 'chrome'; }
  root.S12GuideCore = Object.freeze({VERSION, SCHEMA, MAX_BYTES, blank, clean, parse, pack, normalise, matches, count, clock, remaining, validAnchor, route});
})(typeof module === 'object' && module.exports ? module.exports : globalThis);
