export function calculateLatency(samples) {
  if (samples.length === 0) return { min: 0, median: 0, p95: 0, max: 0, mean: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const nearestRank = (percent) => sorted[Math.max(0, Math.ceil(percent * sorted.length) - 1)];
  return { min: sorted[0], median: nearestRank(0.5), p95: nearestRank(0.95), max: sorted.at(-1), mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length };
}
