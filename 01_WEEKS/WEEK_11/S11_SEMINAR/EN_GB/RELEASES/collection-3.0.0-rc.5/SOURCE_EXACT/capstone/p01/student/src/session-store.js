import { createHash, randomBytes as systemRandomBytes } from "node:crypto";
const tokenKey = (token) => createHash("sha256").update(token).digest("base64url");

export function createSessionStore({ clock = { now: () => Date.now() }, randomBytes = systemRandomBytes, ttlMs = 30 * 60 * 1000 } = {}) {
  const sessions = new Map();
  return {
    ttlMs,
    create(userId) {
      const token = randomBytes(32).toString("base64url");
      sessions.set(tokenKey(token), Object.freeze({ userId, expiresAt: clock.now() + ttlMs }));
      return { token, maxAgeSeconds: Math.floor(ttlMs / 1000) };
    },
    find(token) {
      if (!token) return null;
      const key = tokenKey(token);
      const record = sessions.get(key);
      if (!record) return null;
      if (record.expiresAt <= clock.now()) { sessions.delete(key); return null; }
      return record;
    },
    invalidate(token) { if (token) sessions.delete(tokenKey(token)); },
    get size() { return sessions.size; }
  };
}
