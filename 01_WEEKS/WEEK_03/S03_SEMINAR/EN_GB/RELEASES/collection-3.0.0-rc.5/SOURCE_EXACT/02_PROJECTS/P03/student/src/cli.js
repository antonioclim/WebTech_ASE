import { readFileSync } from "node:fs";
import { normalizeEvents, summarizeEvents } from "./safe-normalizer.js";
import { unsafeNormalizeEvents } from "./unsafe-generated.js";

// Print both paths side by side so students can compare unsafe behavior against the defensive boundary.
export function run(io = console) {
  const source = JSON.parse(
    readFileSync(new URL("../data/events.json", import.meta.url)),
  );
  const unsafeInput = structuredClone(source);
  let safe;
  let safeError = null;

  try {
    safe = normalizeEvents(source);
  } catch (error) {
    safeError = error.message;
  }

  io.log(
    JSON.stringify(
      {
        unsafe: unsafeNormalizeEvents(unsafeInput),
        unsafeChangedInputOrder: unsafeInput[0].id !== source[0].id,
        safe,
        safeError,
        summary: safe ? summarizeEvents(safe) : null,
      },
      null,
      2,
    ),
  );

  return 0;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  process.exitCode = run();
}
