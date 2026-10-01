const terminal=new Set(['completed','failed']);
export function advanceProjection(current,event){
  if(terminal.has(current.status)) return current;
  if(event.type==='progress'){ const value=Number(event.value); if(!Number.isFinite(value)||value<=current.progress) return current; return {...current,status:'active',progress:value}; }
  if(event.type==='active') return current.status==='queued'?{...current,status:'active'}:current;
  if(event.type==='completed'){ if(current.status!=='active'||!event.result||typeof event.result.downloadId!=='string'||!event.result.downloadId) return current; return {...current,status:'completed',progress:100,result:{downloadId:event.result.downloadId,format:String(event.result.format||'unknown')}}; }
  if(event.type==='failed') return {...current,status:'failed',error:{code:'export_failed',message:'Export failed'}};
  return current;
}
