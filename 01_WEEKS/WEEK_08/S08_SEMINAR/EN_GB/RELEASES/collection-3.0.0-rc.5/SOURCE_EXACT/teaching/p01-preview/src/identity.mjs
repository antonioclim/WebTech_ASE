/** Teaching launcher utility, not an implementation of ReadingQueue. */
export function createUniqueIdFactory(storage, initialItems = []) {
  const reserved = new Set();
  let next = 1;
  const absorb = items => {
    if (!Array.isArray(items)) return;
    const seen = new Set();
    for (const item of items) if (item && typeof item.id === 'string') {
      if (seen.has(item.id)) throw new Error('DUPLICATE_STORED_ID: use a clean labelled fixture, not an automatic repair.');
      seen.add(item.id); reserved.add(item.id);
    }
  };
  const read = () => {
    const text = storage.getItem('reading-queue');
    if (text === null) return;
    let data; try { data = JSON.parse(text); } catch (_) { return; }
    absorb(data);
  };
  absorb(initialItems); read();
  return function allocateAtEvent() {
    read(); // Reconcile the current persisted IDs, not an assumed empty store.
    while (reserved.has('s08-' + next)) {
      if (next >= Number.MAX_SAFE_INTEGER) throw new Error('ID_SPACE_EXHAUSTED');
      next += 1;
    }
    const id = 's08-' + next;
    reserved.add(id);
    return id;
  };
}
export function scopedStorage(raw, namespace, writes) {
  return {
    getItem(key) { if (key !== 'reading-queue') throw new Error('Unexpected key'); return raw.getItem(namespace); },
    setItem(key, value) { if (key !== 'reading-queue') throw new Error('Unexpected key'); raw.setItem(namespace, value); writes.push(value); }
  };
}
