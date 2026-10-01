const STATES = new Set(['pass','fail','unknown']);
export function typedEvidence(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const state = String(value.state || '').toLowerCase();
  if (!STATES.has(state)) return null;
  if (typeof value.source !== 'string' || !value.source.trim()) return null;
  return {state, source:value.source.trim(), owner:typeof value.owner==='string'?value.owner.trim():'', limit:typeof value.limit==='string'?value.limit.trim():''};
}
export function gate(rows, requiredIds=[]) {
  const byId = new Map();
  for (const row of rows || []) {
    const parsed=typedEvidence(row);
    if (parsed && typeof row.id==='string') byId.set(row.id, parsed);
  }
  const findings=[];
  for (const id of requiredIds) {
    const e=byId.get(id);
    if (!e) findings.push({id,state:'unknown',reason:'missing evidence'});
    else findings.push({id,state:e.state,reason:e.limit||e.source});
  }
  return {findings, admission:findings.some(x=>x.state!=='pass')?'hold':'eligible_for_review'};
}
