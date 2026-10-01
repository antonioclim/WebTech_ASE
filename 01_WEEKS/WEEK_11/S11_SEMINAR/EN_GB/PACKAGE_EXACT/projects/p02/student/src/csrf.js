export function requireCsrf(request, response, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const expected = `csrf-${request.principal.id}`;
  if (request.get("x-csrf-token") !== expected) return response.status(403).json({ error: { code: "csrf_failed", message: "CSRF validation failed" } });
  next();
}
