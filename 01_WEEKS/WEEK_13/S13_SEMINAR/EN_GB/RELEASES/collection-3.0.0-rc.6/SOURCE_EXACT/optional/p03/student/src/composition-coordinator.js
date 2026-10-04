const idPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const publicError = (code, message) => Object.assign(new Error(message), { code });

export function createCompositionCoordinator({
  hostWindow,
  setUnavailable,
  timers = globalThis,
  readinessTimeoutMs = 2000,
}) {
  const fragments = new Map();
  let disposed = false;

  // Keep the supplied shell healthy and fail closed until the message protocol
  // is implemented. Do not accept or forward any cross-origin message yet.
  const onMessage = () => {};
  hostWindow.addEventListener("message", onMessage);

  function armTimeout(fragment) {
    timers.clearTimeout(fragment.timer);
    fragment.timer = timers.setTimeout(() => setUnavailable(fragment.name), readinessTimeoutMs);
  }

  function register({ name, origin, window: targetWindow, generation = 1 }) {
    if (disposed) {
      throw publicError("coordinator_disposed", "Coordinator is disposed");
    }
    if (
      !idPattern.test(name)
      || fragments.has(name)
      || !targetWindow
      || !Number.isInteger(generation)
      || generation < 1
    ) {
      throw publicError(
        "invalid_fragment",
        "Fragment descriptor is invalid",
      );
    }

    const parsed = new URL(origin);
    if (
      parsed.origin !== origin
      || !["http:", "https:"].includes(parsed.protocol)
    ) {
      throw publicError("invalid_fragment", "Fragment origin is invalid");
    }

    const fragment = { name, generation, timer: null };
    fragments.set(name, fragment);
    armTimeout(fragment);
  }

  function send(name) {
    if (!fragments.has(name)) throw publicError("unknown_fragment", "Fragment is unknown");
    return false;
  }

  function replace(name, targetWindow, generation) {
    const fragment = fragments.get(name);
    if (
      !fragment
      || !targetWindow
      || !Number.isInteger(generation)
      || generation <= fragment.generation
    ) {
      throw publicError(
        "invalid_generation",
        "Fragment generation is invalid",
      );
    }

    timers.clearTimeout(fragment.timer);
    fragment.generation = generation;
    armTimeout(fragment);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    hostWindow.removeEventListener("message", onMessage);
    for (const fragment of fragments.values()) timers.clearTimeout(fragment.timer);
    fragments.clear();
  }

  return Object.freeze({
    register,
    send,
    replace,
    dispose,
    get diagnostics() {
      return Object.freeze({ fragmentCount: fragments.size, readyCount: 0 });
    },
  });
}
