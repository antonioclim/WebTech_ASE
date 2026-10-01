const ALLOWED=['timestamp','level','event','internalRequestId','routeTemplate','status','durationMs'];
export function projectLog(input={}) {
  const out={};
  for (const key of ALLOWED) if (Object.hasOwn(input,key)) out[key]=input[key];
  return out;
}
export function boundedLabel(value, allowed) {
  const v=String(value || 'unknown');
  return (allowed||[]).includes(v)?v:'other';
}
