import { createServer } from "node:http";

const sharedRecords = new Map();

function seed(records) {
  records.clear();
  records.set("c-1", {
    id: "c-1",
    title: "Run regression suite",
    completed: false,
  });
}

const publicError = (status, code, message) =>
  Object.assign(new Error(message), { status, code });

export function createChecklistSystem({ defect = null } = {}) {
  const records = defect === "shared-state" ? sharedRecords : new Map();
  if (defect !== "shared-state" || records.size === 0) seed(records);
  let nextId = 2;

  // Repository returns clones so callers cannot mutate stored fixtures by accident.
  const repository = {
    list: () => [...records.values()].map((item) => ({ ...item })),
    find: (id) => (records.has(id) ? { ...records.get(id) } : null),
    save(item) {
      if (defect !== "missing-persistence") {
        records.set(item.id, { ...item });
      }

      return { ...item };
    },
  };

  const service = {
    list: () => repository.list(),
    create(input) {
      if (
        !input
        || typeof input.title !== "string"
        || input.title.trim().length < 3
        || input.title.trim().length > 80
      ) {
        throw publicError(
          400,
          "invalid_checklist",
          "Checklist title must contain 3 to 80 characters",
        );
      }

      return repository.save({
        id: `c-${nextId++}`,
        title: input.title.trim(),
        completed: false,
      });
    },
    complete(id) {
      const item = repository.find(id);
      if (!item) {
        throw publicError(404, "checklist_not_found", "Checklist not found");
      }
      if (item.completed) return item;
      return repository.save({ ...item, completed: true });
    },
  };

  return { repository, service, defect };
}

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let text = "";
  for await (const chunk of request) text += chunk;
  try {
    return JSON.parse(text);
  } catch {
    throw publicError(400, "invalid_json", "Request body must be valid JSON");
  }
}

export function createChecklistServer(system) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");

      if (url.pathname === "/api/checklists" && request.method === "GET") {
        return sendJson(response, 200, { data: system.service.list() });
      }
      if (url.pathname === "/api/checklists" && request.method === "POST") {
        const item = system.service.create(await readJson(request));
        response.setHeader("location", `/api/checklists/${item.id}`);
        return sendJson(
          response,
          system.defect === "wrong-status" ? 200 : 201,
          { data: item },
        );
      }

      const complete = url.pathname.match(/^\/api\/checklists\/(c-[0-9]+)\/complete$/);
      if (complete && request.method === "POST") {
        return sendJson(response, 200, {
          data: system.service.complete(complete[1]),
        });
      }
      if (
        url.pathname.startsWith("/api/checklists")
        && !["GET", "POST"].includes(request.method)
      ) {
        throw publicError(405, "method_not_allowed", "Method not allowed");
      }

      throw publicError(404, "route_not_found", "Route not found");
    } catch (error) {
      const status = Number.isInteger(error.status) ? error.status : 500;
      const body = {
        error: {
          code: error.code ?? "internal_error",
          message:
            status === 500 ? "Internal server error" : error.message,
        },
      };

      if (system.defect === "leaked-internal-error") {
        body.error.internal =
          error.stack ?? "database path /srv/private/checklists.db";
      }

      sendJson(response, status, body);
    }
  });
}

export function resetSharedFixture() {
  seed(sharedRecords);
}
