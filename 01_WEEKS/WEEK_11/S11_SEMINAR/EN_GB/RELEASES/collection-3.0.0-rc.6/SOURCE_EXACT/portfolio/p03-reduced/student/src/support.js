const safeMethodNames = Object.freeze(["GET", "HEAD", "OPTIONS"]);
// Read-only compatible iterable: no exposed mutable Set.add/delete/clear methods.
export const SAFE_METHODS = Object.freeze({
  has(value) { return safeMethodNames.includes(value); },
  [Symbol.iterator]() { return safeMethodNames[Symbol.iterator](); }
});
export function normaliseOriginSet(values) {
  if (!Array.isArray(values) || !values.length) throw new TypeError("trustedOrigins must be a non-empty array");
  const out = new Set();
  for (const value of values) {
    if (typeof value !== "string") throw new TypeError("Invalid trusted origin");
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== value || url.username || url.password) throw new TypeError("Invalid trusted origin");
    out.add(url.origin);
  }
  return out;
}
export function isCanonicalHttpMethod(value) { return typeof value === "string" && /^[A-Z]+$/.test(value); }
// HTTP field-value text: HTAB and printable ASCII/Latin-1; no other controls, DEL or non-Latin-1 characters.
export function isHeaderText(value) { return typeof value === "string" && !/[^\t\x20-\x7e\x80-\xff]/u.test(value); }
export function isSupportedAuthMethod(value) { return value === "cookie" || value === "bearer"; }
