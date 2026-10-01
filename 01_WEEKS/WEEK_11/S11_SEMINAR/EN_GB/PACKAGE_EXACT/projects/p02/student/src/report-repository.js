const seed = [
  { id: "r1", ownerId: "u1", status: "draft", title: "Member draft" },
  { id: "r2", ownerId: "u2", status: "draft", title: "Other draft" },
  { id: "r3", ownerId: "u2", status: "submitted", title: "Needs review" },
  { id: "r4", ownerId: "u1", status: "resolved", title: "Closed report" }
];
const snapshot = (record) => record ? Object.freeze(structuredClone(record)) : null;

export function createReportRepository() {
  let records = structuredClone(seed);
  return {
    async findById(id) { return snapshot(records.find((record) => record.id === id)); },
    async submit(id) { const record = records.find((item) => item.id === id); record.status = "submitted"; return snapshot(record); },
    async resolve(id) { const record = records.find((item) => item.id === id); record.status = "resolved"; return snapshot(record); },
    async remove(id) { records = records.filter((item) => item.id !== id); },
    list() { return records.map(snapshot); }
  };
}
