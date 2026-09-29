/* C03 derived demonstrations. Synthetic, non-assessed fixtures only.
 * No arbitrary code evaluation, filesystem access or network operations.
 */
(function (root) {
  'use strict';
  function acceptedAmount(row) {
    return row !== null && typeof row === 'object' && !Array.isArray(row) &&
      Object.hasOwn(row, 'amount') && typeof row.amount === 'number' &&
      Number.isFinite(row.amount) && row.amount >= 0;
  }
  function valueTrace(variant) {
    const values = { number: 3, string: '3', negative: -1, nan: NaN,
      infinity: Infinity, null: null, boolean: false };
    if (!Object.hasOwn(values, variant)) throw new RangeError('Unknown value variant');
    const value = values[variant];
    return { valueLabel: String(value), type: typeof value,
      accepted: acceptedAmount({ amount: value }),
      meaning: 'Own amount field; non-negative finite number required. No conversion.' };
  }
  function propertyTrace(variant) {
    const defaults = { priority: 'normal' };
    const job = Object.create(defaults); job.id = 'j-1';
    if (variant === 'shadow') job.priority = 'urgent';
    else if (variant === 'own-undefined') job.priority = undefined;
    else if (variant !== 'inherited') throw new RangeError('Unknown property variant');
    return { own: Object.hasOwn(job, 'priority'), lookup: job.priority === undefined ?
      '[undefined]' : job.priority, inheritedValue: defaults.priority,
      inResult: 'priority' in job,
      meaning: 'Ordinary writable data property; extensible receiver. Not an accessor example.' };
  }
  function identityTrace(variant) {
    const original = { id: 'c-1', supplier: { city: 'York' } };
    let copy;
    if (variant === 'alias') copy = original;
    else if (variant === 'shallow') copy = { ...original };
    else if (variant === 'path') copy = { ...original, supplier: { ...original.supplier } };
    else throw new RangeError('Unknown identity variant');
    const before = original.supplier.city;
    const sameRecord = copy === original;
    const sameSupplier = copy.supplier === original.supplier;
    copy.supplier.city = 'Leeds';
    return { before, originalCityAfter: original.supplier.city, copyCityAfter: copy.supplier.city,
      sameRecord, sameSupplier, supplierWasDefined: original.supplier !== undefined,
      meaning: 'Fresh fixture for this run; mutation follows the recorded identity comparisons.' };
  }
  function makeMinimum(minimum) {
    if (!Number.isFinite(minimum)) throw new TypeError('minimum must be finite');
    return (claim) => claim.amount >= minimum;
  }
  function functionTrace(variant) {
    const job = { id: 'j-1', describe() { return this.id; } };
    const describe = job.describe;
    if (variant === 'method') return { result: job.describe(), receiver: 'job' };
    if (variant === 'explicit') return { result: describe.call(job), receiver: 'job via call' };
    if (variant === 'detached') {
      try { return { result: describe() }; }
      catch (error) { return { error: error.name, meaning: 'Strict-mode bare call; this is undefined.' }; }
    }
    if (variant === 'closure') return { minimum: 10, amount: 12,
      result: makeMinimum(10)({ amount: 12 }),
      meaning: 'Amount is a validated finite number. Configuration is retained from the factory call.' };
    throw new RangeError('Unknown function variant');
  }
  function reducerTrace(variant) {
    let amounts;
    if (variant === 'numeric') amounts = [3, 8];
    else if (variant === 'mixed') amounts = ['3', 5];
    else if (variant === 'empty') amounts = [];
    else throw new RangeError('Unknown reducer variant');
    const trace = [{ value: 0, type: 'number' }];
    const total = amounts.reduce((sum, amount) => {
      const next = sum + amount; trace.push({ value: next, type: typeof next }); return next;
    }, 0);
    return { amounts, trace, total, totalType: typeof total,
      meaning: 'A reduction only. This is not the assessed dataset transformation.' };
  }
  function mutationWitness() {
    const items = [{ id: 'b' }, { id: 'a' }];
    const before = items.map(x => x.id);
    items.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const output = items.map(x => ({ id: x.id }));
    return { before, after: items.map(x => x.id),
      orderChanged: before.join(',') !== items.map(x => x.id).join(','),
      freshRecords: output.every((x, i) => x !== items[i]) };
  }
  const run = (demo, variant) => {
    const routes = { value: valueTrace, property: propertyTrace, identity: identityTrace,
      function: functionTrace, reducer: reducerTrace };
    if (!Object.hasOwn(routes, demo)) throw new RangeError('Unknown demonstration');
    return routes[demo](variant);
  };
  const api = Object.freeze({ acceptedAmount, valueTrace, propertyTrace, identityTrace,
    makeMinimum, functionTrace, reducerTrace, mutationWitness, run });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.C03Demos = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
