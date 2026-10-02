const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
// Supplied synthetic token fixture. This does not validate browser same-origin behaviour.
export function requireCsrf(request, response, next) {
  const method = request.method;
  if (typeof method !== "string" || !/^[A-Z]+$/.test(method)) return response.status(403).json({ error: { code: "csrf_failed", message: "CSRF validation failed" } });
  if (safeMethods.has(method)) return next();
  if (!request.principal || typeof request.principal.id !== "string") return response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
  const supplied = request.get("x-csrf-token");
  const expected = `csrf-${request.principal.id}`;
  if (typeof supplied !== "string" || /[\r\n]/.test(supplied) || supplied !== expected) return response.status(403).json({ error: { code: "csrf_failed", message: "CSRF validation failed" } });
  next();
}
