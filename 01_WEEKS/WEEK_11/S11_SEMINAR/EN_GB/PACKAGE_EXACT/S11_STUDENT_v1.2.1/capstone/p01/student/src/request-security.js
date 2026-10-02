function exactTrustedOrigin(value) {
  if (typeof value !== "string") throw new TypeError("trustedOrigin must be an exact HTTP(S) origin");
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== value || url.username || url.password) throw new TypeError("trustedOrigin must be an exact HTTP(S) origin");
  return value;
}
export function requireCredentialWriteBoundary({ production = false, trustedOrigin = "https://course.example" } = {}) {
  const expectedOrigin = exactTrustedOrigin(trustedOrigin);
  return (request, response, next) => {
    const origin = request.get("origin");
    if (origin !== undefined && origin !== null && (typeof origin !== "string" || origin !== expectedOrigin)) return response.status(403).json({ error: { code: "origin_forbidden", message: "Origin is not allowed" } });
    // A declared proxy-style fixture signal, not a TLS handshake or deployment trust policy.
    if (production && request.get("x-forwarded-proto") !== "https") return response.status(400).json({ error: { code: "https_required", message: "HTTPS is required" } });
    next();
  };
}
