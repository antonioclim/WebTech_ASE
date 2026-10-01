const principals = Object.freeze({
  "member-u1": Object.freeze({ id: "u1", role: "member" }),
  "member-u2": Object.freeze({ id: "u2", role: "member" }),
  "moderator-u2": Object.freeze({ id: "u2", role: "moderator" }),
  "admin-u9": Object.freeze({ id: "u9", role: "admin" })
});

export function requireAuthentication(request, response, next) {
  const value = request.get("authorization") ?? "";
  const key = value.startsWith("Session ") ? value.slice(8) : "";
  const principal = principals[key];
  if (!principal) return response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
  request.principal = principal;
  next();
}
