export function createEventSink() {
  const events = [];
  return Object.freeze({
    emit(ownerId, event) { events.push(Object.freeze({ ownerId, event: structuredClone(event) })); },
    forOwner(ownerId) { return structuredClone(events.filter((entry) => entry.ownerId === ownerId).map((entry) => entry.event)); },
    all() { return structuredClone(events); }
  });
}
