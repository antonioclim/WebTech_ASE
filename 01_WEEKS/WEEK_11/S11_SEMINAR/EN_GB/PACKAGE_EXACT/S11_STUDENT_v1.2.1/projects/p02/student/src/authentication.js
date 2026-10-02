const principals = Object.freeze(Object.assign(Object.create(null), {
  "member-u1": Object.freeze({ id: "u1", role: "member" }),
  "member-u2": Object.freeze({ id: "u2", role: "member" }),
  "moderator-u2": Object.freeze({ id: "u2", role: "moderator" }),
  "admin-u9": Object.freeze({ id: "u9", role: "admin" })
}));

// Deterministic classroom sessions only. This is not production authentication.
export function requireAuthentication(request, response, next) {
  const value = request.get("authorization");
  const key = typeof value === "string" && value.startsWith("Session ") ? value.slice(8) : "";
  const principal = Object.hasOwn(principals, key) ? principals[key] : null;
  if (!principal) return response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
  request.principal = principal;
  next();
}
