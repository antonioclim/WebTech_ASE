export const SESSION_COOKIE = "course_session";
export function readCookie(header, name = SESSION_COOKIE) { for (const part of String(header ?? "").split(";")) { const [key, ...rest] = part.trim().split("="); if (key === name) return decodeURIComponent(rest.join("=")); } return null; }
export function sessionCookie(value, { secure, maxAgeSeconds }) { return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=${maxAgeSeconds}`; }
export function clearSessionCookie({ secure }) { return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=0`; }
