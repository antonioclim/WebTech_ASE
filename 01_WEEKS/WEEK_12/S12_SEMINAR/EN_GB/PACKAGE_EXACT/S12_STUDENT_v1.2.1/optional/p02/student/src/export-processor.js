export async function processExport(job) {
  await job.updateProgress(25);
  await new Promise((resolve) => setImmediate(resolve));
  await job.updateProgress(75);
  if (job.data.reportId === "fail-report") throw new Error("internal export renderer failed at /private/path");
  return Object.freeze({ downloadId: `download-${job.id}`, format: "csv" });
}
