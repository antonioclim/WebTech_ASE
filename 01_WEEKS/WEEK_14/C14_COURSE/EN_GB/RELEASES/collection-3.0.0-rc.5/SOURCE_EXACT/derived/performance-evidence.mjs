export function nearestRank(values, percentile) {
  if (!Array.isArray(values) || values.length === 0) throw new TypeError('values required');
  if (!Number.isFinite(percentile) || percentile <= 0 || percentile > 100) throw new RangeError('percentile');
  const sorted=values.map(Number);
  if (sorted.some(v=>!Number.isFinite(v) || v<0)) throw new TypeError('finite non-negative values required');
  sorted.sort((a,b)=>a-b);
  return sorted[Math.ceil((percentile/100)*sorted.length)-1];
}
export function describeScenario(s) {
  const required=['operation','samples','concurrency','timeoutMs','interval'];
  const missing=required.filter(k=>s?.[k]===undefined || s?.[k]===null || s?.[k]==='');
  return {valid:missing.length===0, missing, localOnly:s?.target==='loopback'};
}
