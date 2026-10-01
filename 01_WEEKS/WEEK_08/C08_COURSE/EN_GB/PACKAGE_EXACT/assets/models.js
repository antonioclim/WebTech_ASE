/* C08 teaching models: discrete JavaScript values, not React or browser evidence. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.C08Models = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const fixture = () => [{ id: 1, title: 'Read about state', done: false }, { id: 2, title: 'Derive the view', done: true }];
  function toggle(tasks, id) {
    return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  }
  function view(tasks, filter) {
    if (!['all', 'open', 'done'].includes(filter)) throw new RangeError('Unknown filter.');
    return {
      visible: tasks.filter(task => filter === 'all' || task.done === (filter === 'done')),
      remaining: tasks.filter(task => !task.done).length
    };
  }
  function submit(draft, notes, id) {
    if (typeof draft !== 'string') throw new TypeError('Draft must be text.');
    const accepted = draft.trim();
    return accepted ? { notes: [...notes, { id, title: accepted }], draft: '', error: '' }
      : { notes, draft, error: 'Enter a title.' };
  }
  function identities(policy) {
    if (!['stable', 'index'].includes(policy)) throw new RangeError('Unknown identity policy.');
    const before = [{ id: 'b', title: 'Beta' }, { id: 'c', title: 'Gamma' }];
    const drafts = ['Beta edited', 'Gamma'];
    const after = [{ id: 'a', title: 'New' }, ...before];
    const prior = new Map(before.map((item, index) => [policy === 'stable' ? item.id : index, drafts[index]]));
    return after.map((item, index) => {
      const key = policy === 'stable' ? item.id : index;
      return { id: item.id, matchingKey: key, draft: prior.has(key) ? prior.get(key) : item.title };
    });
  }
  function timeline(policy, cooperative = false, dispose = false, oldError = false) {
    if (!['both', 'active', 'abort-only'].includes(policy)) throw new RangeError('Unknown publication policy.');
    let latest = 0;
    const log = [], published = [];
    function start(label) {
      const task = { label, generation: ++latest, active: true, cancellationRequested: false };
      log.push({ order: log.length + 1, event: 'setup', task: label });
      return task;
    }
    function cleanup(task) {
      task.active = false;
      task.cancellationRequested = true;
      log.push({ order: log.length + 1, event: 'cleanup: request cancellation and invalidate active', task: task.label });
    }
    function settle(task, error) {
      const cancelled = cooperative && task.cancellationRequested;
      const allowed = policy === 'abort-only' || (task.active && (policy !== 'both' || task.generation === latest));
      const decision = cancelled ? 'cooperative cancellation' : allowed ? 'PUBLISH' : 'IGNORE';
      if (!cancelled && allowed) published.push(error ? 'Error from ' + task.label : task.label);
      log.push({ order: log.length + 1, event: error ? 'reject' : 'resolve', task: task.label,
        cancellationRequested: task.cancellationRequested, active: task.active,
        generation: task.generation, latest, decision });
    }
    const old = start('Old'); cleanup(old); const current = start('New');
    if (dispose) cleanup(current);
    settle(current, false); settle(old, oldError);
    return { kind: 'DISCRETE_MODEL_NOT_REACT', policy, cooperative, disposedBeforeSettlement: dispose,
      published, visible: published.length ? published[published.length - 1] : '(nothing published)', log };
  }
  const specs = [
    ['T01', 'Immutable toggle', 'Example 02 expression; JavaScript value model'],
    ['T02', 'Filter-only view', 'Example 02 calculations; no persistence system'],
    ['F01', 'Submit a spaced title', 'Derived normalisation model; no React input'],
    ['F02', 'Reject a blank title', 'Derived normalisation model; no React input'],
    ['K01', 'Stable IDs after prepend', 'Same-type sibling matching model; not React reconciliation'],
    ['K02', 'Index keys after prepend', 'Same-type sibling matching model; not React reconciliation'],
    ['K03', 'Reset ID counter collision', 'Two generator initialisations; not an actual browser reload'],
    ['E01', 'Cooperative cancellation', 'Abstract analogue of example 05 loader cooperation'],
    ['E02', 'Non-cooperative, abort-only', 'Deliberate counterexample: no publication guards'],
    ['E03', 'Non-cooperative, both guards', 'Active plus generation policy'],
    ['E04', 'Non-cooperative, active only', 'Generation comparison removed; active still protects'],
    ['E05', 'Disposed before settlement', 'Both guards; no mounted React component'],
    ['E06', 'Old error, abort-only', 'Late error can overwrite the newer successful result'],
    ['E07', 'Old error, both guards', 'Old error rejected by publication policy']
  ];
  function run(id) {
    const spec = specs.find(s => s[0] === id);
    if (!spec) throw new RangeError('Unknown scenario.');
    let result;
    if (id === 'T01') {
      const input = fixture(), next = toggle(input, 1);
      result = { input, next, newArray: input !== next, changedRecordReplaced: input[0] !== next[0],
        unchangedRecordPreserved: input[1] === next[1], remaining: view(next, 'all').remaining };
    } else if (id === 'T02') {
      const input = fixture(); result = { input, open: view(input, 'open'), done: view(input, 'done'),
        collectionModified: false, persistence: 'NOT_MODELLED' };
    } else if (id === 'F01' || id === 'F02') result = submit(id === 'F01' ? '  Read effects  ' : '   ', [], 'example-id');
    else if (id === 'K01' || id === 'K02') result = identities(id === 'K01' ? 'stable' : 'index');
    else if (id === 'K03') {
      const make = () => { let nextId = 3; return () => String(nextId++); };
      const first = make()(), afterReinitialisation = make()();
      result = { first, afterReinitialisation, duplicate: first === afterReinitialisation,
        witnessLimit: 'No storage system or actual reload was executed.' };
    } else {
      const args = { E01: ['abort-only', true], E02: ['abort-only', false], E03: ['both', false],
        E04: ['active', false], E05: ['both', false, true], E06: ['abort-only', false, false, true],
        E07: ['both', false, false, true] };
      result = timeline(...args[id]);
    }
    return { evidenceClass: 'MODEL_OUTPUT_NOT_ACTUAL_REACT_EVIDENCE', scenario: id, title: spec[1],
      scope: spec[2], result };
  }
  return Object.freeze({ fixture, toggle, view, submit, identities, timeline, run,
    scenarios: Object.freeze(specs.map(s => Object.freeze({ id: s[0], title: s[1], scope: s[2] }))) });
});
