/* C08 explanatory fragments, not a patched canonical app or an S08 solution.
   Functions are supplied dependencies so the examples can be checked as ordinary JS. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.C08EventIds = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function prepareNote(rawTitle, createId) {
    const title = rawTitle.trim();
    if (!title) return null;
    // Call during the event, before handing the pure transition to React.
    const id = createId();
    return current => [...current, { id, title }];
  }
  function preparePrepend(createId) {
    const id = createId();
    return current => [{ id, title: 'New' }, ...current];
  }
  return Object.freeze({ prepareNote, preparePrepend });
});
