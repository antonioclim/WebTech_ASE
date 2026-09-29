const freezeOutcome = (outcome) => Object.freeze(outcome);
const copyMeeting = (meeting) => ({ ...meeting });

// This service intentionally preserves the legacy behavior that the repair exercise audits.
export function createLegacyMeetingService() {
  let meetings = [
    { id: "meeting-1", title: "Contract review", accepted: false },
  ];
  let nextId = 2;

  return {
    async list() {
      return freezeOutcome({ kind: "listed", meetings: meetings.map(copyMeeting) });
    },

    async create(input) {
      if (
        input === null ||
        typeof input !== "object" ||
        Array.isArray(input) ||
        typeof input.title !== "string" ||
        input.title.trim() === ""
      ) {
        return freezeOutcome({
          kind: "invalid",
          code: "title_required",
          message: "title must be a nonblank string",
          internalHint: "legacy validation detail",
        });
      }
      const meeting = {
        id: `meeting-${nextId++}`,
        title: input.title.trim(),
        accepted: false,
      };
      meetings.push(meeting);
      return freezeOutcome({ kind: "created", meeting: copyMeeting(meeting) });
    },

    async accept(id) {
      const index = meetings.findIndex((meeting) => meeting.id === id);
      if (index === -1) {
        return freezeOutcome({ kind: "missing", resource: "meeting" });
      }
      if (meetings[index].accepted) {
        return freezeOutcome({ kind: "conflict", code: "already_accepted" });
      }
      meetings[index] = { ...meetings[index], accepted: true };
      return freezeOutcome({ kind: "accepted", meeting: copyMeeting(meetings[index]) });
    },
  };
}
