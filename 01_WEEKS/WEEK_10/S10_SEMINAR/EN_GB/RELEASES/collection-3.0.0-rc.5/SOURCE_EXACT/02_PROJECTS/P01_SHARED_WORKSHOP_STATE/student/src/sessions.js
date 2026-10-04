export const sessions = Object.freeze([
  Object.freeze({ id: "s1", title: "Route ownership", track: "frontend", description: "URLs and UI identity" }),
  Object.freeze({ id: "s2", title: "Transaction boundaries", track: "backend", description: "Atomic persistence work" }),
  Object.freeze({ id: "s3", title: "Effect timelines", track: "frontend", description: "Cleanup and stale results" })
]);

export function visibleSessions(items, track, search) {
  const needle = search.trim().toLowerCase();
  return items.filter((session) => (track === "all" || session.track === track)
    && session.title.toLowerCase().includes(needle));
}
