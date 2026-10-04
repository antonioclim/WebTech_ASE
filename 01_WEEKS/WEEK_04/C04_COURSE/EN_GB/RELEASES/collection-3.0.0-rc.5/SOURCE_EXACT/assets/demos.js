/* C04 derived demonstrations. Controlled dependencies, never real HTTP traffic.
   These examples do not implement the assessed Dashboard or Task List. */
(function (root) {
  'use strict';
  const choices = Object.freeze({
    continuation: 'Five-message continuation',
    concurrent: 'Independent initiation',
    sequential: 'Sequential initiation',
    aggregate_reject: 'Aggregate rejection is not cancellation',
    fetch_success: 'Accepted response and parsing',
    fetch_empty: 'Accepted empty representation',
    fetch_http: 'Fulfilled non-success response',
    fetch_parse: 'Accepted status, rejected parsing',
    fetch_transport: 'Rejected transport',
    stale: 'Current result ownership'
  });
  function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
  }
  async function continuation() {
    const events = [];
    async function run() {
      events.push('function start');
      await Promise.resolve();
      events.push('after await');
    }
    events.push('script start');
    const done = run().then(() => events.push('promise fulfilled'));
    events.push('script end');
    await done;
    return { events, limit: 'Local promise execution; no browser-paint or HTTP measurement.' };
  }
  async function coordination(mode) {
    const events = [], names = ['alpha', 'beta', 'gamma'], controls = new Map();
    function start(name) {
      events.push('start:' + name);
      const c = deferred(); controls.set(name, c);
      return c.promise.then(value => { events.push('finish:' + name); return value; }, error => {
        events.push('reject:' + name); throw error;
      });
    }
    if (mode === 'sequential') {
      const results = [];
      for (const name of names) {
        const pending = start(name);
        controls.get(name).resolve(name);
        results.push(await pending);
      }
      return { events, results, limit: 'Controlled promise releases, not measured duration.' };
    }
    const pending = names.map(start);
    const aggregate = Promise.all(pending).then(results => {
      events.push('aggregate:fulfilled'); return { status: 'fulfilled', results };
    }, error => {
      events.push('aggregate:rejected'); return { status: 'rejected', message: error.message };
    });
    if (mode === 'aggregate_reject') {
      controls.get('beta').reject(new Error('Controlled beta failure'));
      const outcome = await aggregate;
      controls.get('gamma').resolve('gamma'); await pending[2];
      controls.get('alpha').resolve('alpha'); await pending[0];
      const settled = await Promise.allSettled(pending);
      return { events, outcome, settled: settled.map(x => x.status),
        limit: 'Late completions are observed; no automatic cancellation or real HTTP is simulated as evidence.' };
    }
    for (const name of ['beta', 'gamma', 'alpha']) {
      controls.get(name).resolve(name); await pending[names.indexOf(name)];
    }
    return { events, outcome: await aggregate, limit: 'Input order differs from controlled completion order; not network timing.' };
  }
  async function fetchBoundary(mode) {
    const events = []; let parseCalls = 0;
    const fetchImpl = async () => {
      events.push('fetch:called');
      if (mode === 'fetch_transport') throw new Error('Controlled transport rejection');
      const ok = mode !== 'fetch_http';
      return { ok, status: ok ? 200 : 404, json: async () => {
        parseCalls++; events.push('json:called');
        if (mode === 'fetch_parse') return JSON.parse('{invalid');
        return mode === 'fetch_empty' ? [] : [{ label: 'Local teaching fixture' }];
      } };
    };
    let boundary = 'transport';
    try {
      const response = await fetchImpl();
      events.push('fetch:fulfilled:' + response.status); boundary = 'HTTP policy';
      if (!response.ok) throw new Error('HTTP ' + response.status);
      boundary = 'parsing';
      const value = await response.json(); events.push('representation:obtained');
      return { events, parseCalls, status: 'success', value, evidence: 'MODEL_OR_INJECTED', limit: 'Fake response; no real HTTP request or domain-schema check.' };
    } catch (error) {
      events.push('caught:' + boundary);
      return { events, parseCalls, status: 'error', boundary, errorType: error.name,
        evidence: 'MODEL_OR_INJECTED', limit: 'Controlled failure; not browser Network evidence.' };
    }
  }
  async function stale() {
    const events = []; let generation = 0, visible = null;
    function start(name) {
      const token = ++generation, c = deferred(); events.push('start:' + name);
      const done = c.promise.then(value => {
        events.push('finish:' + name);
        if (token === generation) { visible = value; events.push('commit:' + name); }
        else events.push('ignore:' + name);
      });
      return { ...c, done };
    }
    const a = start('A'), b = start('B');
    b.resolve('B'); await b.done;
    a.resolve('A'); await a.done;
    return { events, visible, limit: 'A completed but was ignored; no cancellation occurred. Not a new P01 refresh requirement.' };
  }
  async function run(name) {
    if (!Object.hasOwn(choices, name)) throw new RangeError('Unknown C04 scenario');
    if (name === 'continuation') return continuation();
    if (name.startsWith('fetch_')) return fetchBoundary(name);
    if (name === 'stale') return stale();
    return coordination(name);
  }
  function eventSnapshot(event, list) {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return null;
    const action = target.closest('[data-action]');
    const row = target.closest('[data-item-id]');
    if (!action || !row || !list.contains(action) || !list.contains(row)) return null;
    return { target: target.tagName, currentTarget: event.currentTarget?.id || '',
      action: action.dataset.action, item: row.dataset.itemId,
      isTrusted: event.isTrusted === true, eventPhase: event.eventPhase,
      defaultPrevented: event.defaultPrevented === true };
  }
  function bindEvents(list, report) {
    const handler = event => { const value = eventSnapshot(event, list); if (value) report(value); };
    list.addEventListener('click', handler);
    let active = true;
    return () => { if (active) list.removeEventListener('click', handler); active = false; };
  }
  function preventForm(event) { event.preventDefault(); }
  function projectLabel(doc, root, text) {
    if (!root) throw new Error('Missing label root');
    const element = doc.createElement('p'); element.textContent = String(text); root.replaceChildren(element);
  }
  const api = Object.freeze({ choices, run, eventSnapshot, bindEvents, preventForm, projectLabel });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.C04Demos = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
