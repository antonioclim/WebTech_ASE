export function analyzeNumbers(values) {
  let sum = 0;
  let checksum = 0;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    sum += value;
    for (let round = 0; round < 80; round += 1) checksum = (checksum + Math.imul((index + 1) ^ round, Math.trunc(value * 1000) ^ round)) >>> 0;
  }
  return Object.freeze({ count: values.length, sum, mean: values.length ? sum / values.length : 0, checksum });
}

export function generateValues(count) {
  return Array.from({ length: count }, (_, index) => ((index * 17) % 101) / 10);
}
