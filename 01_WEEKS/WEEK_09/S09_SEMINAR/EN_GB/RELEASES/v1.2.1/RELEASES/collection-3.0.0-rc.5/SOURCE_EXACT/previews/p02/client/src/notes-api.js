// S09 v1.2.1 separate UNASSESSED preview support derivative: source-only, unexecuted.
// Authored from the declared API contract; does not replace the protected assessed adapter.
export class NotesApiError extends Error {
  constructor(status, code) { super('Notes request failed'); this.status=status; this.code=code; }
}
const object=value=>value!==null && typeof value==='object' && !Array.isArray(value);
const note=value=>object(value) && typeof value.id==='string' && value.id.length>0 && typeof value.title==='string' && typeof value.body==='string';
export function createNotesApi(baseUrl='', fetchImpl=globalThis.fetch) {
  const request=async(path, options, expected, successStatus)=>{
    let response;
    try { response=await fetchImpl(baseUrl+path, options); }
    catch(error) { if(error?.name==='AbortError') throw error; throw new NotesApiError(0,'transport_failed'); }
    if(!response.ok) {
      let envelope;
      try { envelope=await response.json(); }
      catch(error) { if(error?.name==='AbortError') throw error; throw new NotesApiError(response.status,'http_failed'); }
      const suppliedCode=object(envelope) && object(envelope.error) && Object.hasOwn(envelope.error,'code') ? envelope.error.code : null;
      const code=typeof suppliedCode==='string' && /^[a-z][a-z0-9_]{0,63}$/.test(suppliedCode) ? suppliedCode : 'http_failed';
      throw new NotesApiError(response.status,code);
    }
    if(response.status!==successStatus) throw new NotesApiError(response.status,'unexpected_status');
    if(expected==='empty') return null;
    let envelope;
    try { envelope=await response.json(); }
    catch(error) { if(error?.name==='AbortError') throw error; throw new NotesApiError(response.status,'invalid_json'); }
    if(!object(envelope) || !Object.hasOwn(envelope,'data')) throw new NotesApiError(response.status,'invalid_envelope');
    const data=envelope.data;
    if(expected==='list' ? (!Array.isArray(data)||!data.every(note)||new Set(data.map(n=>n.id)).size!==data.length) : !note(data))
      throw new NotesApiError(response.status,'invalid_data');
    return structuredClone(data);
  };
  const json=(method,input)=>({method,headers:{'content-type':'application/json'},body:JSON.stringify(input)});
  const itemPath=id=>'/api/notes/'+encodeURIComponent(String(id));
  return {list:({signal}={})=>request('/api/notes',{signal},'list',200),
    create:input=>request('/api/notes',json('POST',input),'note',201),
    update:(id,input)=>request(itemPath(id),json('PUT',input),'note',200),
    remove:id=>request(itemPath(id),{method:'DELETE'},'empty',204)};
}
