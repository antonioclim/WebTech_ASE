const fixtures = [
  { id: "n1", title: "Build finished", read: false, createdAt: "2026-08-10T10:00:00.000Z" },
  { id: "n2", title: "Review assigned", read: true, createdAt: "2026-08-09T10:00:00.000Z" }
];

export function createNotificationsApi(seed = fixtures) {
  let records = structuredClone(seed);
  return {
    async list() { return structuredClone(records); },
    async markRead(id) {
      const record = records.find((item) => item.id === id);
      if (!record) throw new Error("internal missing notification");
      record.read = true;
      return structuredClone(record);
    }
  };
}
