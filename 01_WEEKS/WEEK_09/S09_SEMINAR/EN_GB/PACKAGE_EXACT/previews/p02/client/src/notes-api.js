// Named S09 support-file derivative; the assessed NotesWorkspace remains the exact starter.
export class NotesApiError extends Error {
  constructor(status, code) { super('Notes request failed'); this.status=status; this.code=code; }
}
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const note = x => object(x) && typeof x.id === 'string' && x.id.length > 0 && typeof x.title === 'string' && typeof x.body === 'string';
export function createNotesApi(baseUrl = '', fetchImpl = globalThis.fetch) {
  const request = async (path, options, expected) => {
    let response;
    try { response = await fetchImpl(baseUrl + path, options); }
    catch(error) { if(error?.name === 'AbortError') throw error; throw new NotesApiError(0,'transport_failed'); }
    if(expected === 'empty' && response.status === 204) return null;
    if(!response.ok) throw new NotesApiError(response.status,'http_failed');
    if(expected === 'empty') throw new NotesApiError(response.status,'unexpected_body_status');
    let envelope;
    try { envelope = await response.json(); } catch { throw new NotesApiError(response.status,'invalid_json'); }
    if(!object(envelope) || !Object.hasOwn(envelope,'data')) throw new NotesApiError(response.status,'invalid_envelope');
    const data=envelope.data;
    if(expected === 'list' ? (!Array.isArray(data)||!data.every(note)||new Set(data.map(n=>n.id)).size!==data.length) : !note(data))
      throw new NotesApiError(response.status,'invalid_data');
    return structuredClone(data);
  };
  const json=(method,input)=>({method,headers:{'content-type':'application/json'},body:JSON.stringify(input)});
  const itemPath=id=>'/api/notes/'+encodeURIComponent(String(id));
  return {list:({signal}={})=>request('/api/notes',{signal},'list'),
    create:input=>request('/api/notes',json('POST',input),'note'),
    update:(id,input)=>request(itemPath(id),json('PUT',input),'note'),
    remove:id=>request(itemPath(id),{method:'DELETE'},'empty')};
}
