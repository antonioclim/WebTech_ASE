export const SESSION_COOKIE = "course_session";
export function readCookie(header, name = SESSION_COOKIE) {
  if (header === undefined || header === null || header === "") return null;
  if (typeof header !== "string") return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    try { return decodeURIComponent(rest.join("=")); }
    catch { return null; } // A malformed client cookie is an invalid session, not a parser crash.
  }
  return null;
}
export function sessionCookie(value, { secure, maxAgeSeconds }) { return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=${maxAgeSeconds}`; }
export function clearSessionCookie({ secure }) { return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=0`; }
