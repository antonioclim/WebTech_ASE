export function createGenerationGate() {
  let generation = 0;
  let ready = false;
  let queued = null;
  return Object.freeze({
    replace() { generation += 1; ready = false; queued = null; return generation; },
    queue(command) { queued = command; return { generation, queued: Boolean(queued) }; },
    markReady(messageGeneration) {
      if (messageGeneration !== generation) return { accepted: false, code: 'stale_generation' };
      ready = true;
      const command = queued; queued = null;
      return { accepted: true, generation, command };
    },
    snapshot() { return { generation, ready, queued }; }
  });
}
