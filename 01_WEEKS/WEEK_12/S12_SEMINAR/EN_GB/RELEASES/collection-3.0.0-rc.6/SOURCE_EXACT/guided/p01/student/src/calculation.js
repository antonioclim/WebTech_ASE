export async function runCalculation({ operation, values }) {
  if (operation !== "sum") throw new Error("unsupported internal calculation");
  await new Promise((resolve) => setImmediate(resolve));
  return values.reduce((total, value) => total + value, 0);
}
