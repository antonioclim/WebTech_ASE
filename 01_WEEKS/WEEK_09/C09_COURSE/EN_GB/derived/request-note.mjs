/** Named explanatory derivative: classify one note response, not all CRUD or UI logic. */
export async function requestNote(url, { fetchImpl = globalThis.fetch, signal } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('A fetch function is required');
  let response;
  try { response = await fetchImpl(url, { signal }); }
  catch (error) { return { ok: false, kind: error?.name === 'AbortError' ? 'CANCELLED' : 'TRANSPORT' }; }
  if (!response || typeof response.ok !== 'boolean' || typeof response.json !== 'function') {
    return { ok: false, kind: 'PROTOCOL' };
  }
  // Declared order: HTTP failure takes precedence over parsing an error body.
  if (!response.ok) return { ok: false, kind: 'HTTP', status: response.status };
  let body;
  try { body = await response.json(); }
  catch { return { ok: false, kind: 'PARSE' }; }
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      !Object.prototype.hasOwnProperty.call(body, 'data')) return { ok: false, kind: 'ENVELOPE' };
  const note = body.data;
  if (!note || typeof note !== 'object' || Array.isArray(note) ||
      !['string', 'number'].includes(typeof note.id) || typeof note.title !== 'string') {
    return { ok: false, kind: 'SHAPE' };
  }
  // The domain result is a projection, not a schema for every server field or operation.
  return { ok: true, data: { id: note.id, title: note.title } };
}
