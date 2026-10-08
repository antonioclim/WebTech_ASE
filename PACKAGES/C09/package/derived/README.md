# Named C09 derivatives

These files do not replace or modify any canonical source. `request-note.mjs` is a one-note response-classification helper with an injected fetch boundary, not a complete NotesWorkspace implementation. Its deliberate order is transport → response interface → HTTP status → JSON parsing → own data envelope → note shape. It returns generic classifications instead of leaking diagnostic bodies. It neither retries nor imposes a timeout and does not validate list responses, all server fields, authority or cross-client concurrency. A caller still owns draft, progress and publication rights.

`entry-path.mjs` compares decoded native paths. It is not a security check and does not prove native-platform acceptance. `start-example04.mjs` is a separate, explicit local launcher for the unchanged example-04 factory. It requires `--start-local` and a separately provisioned Express dependency. It was NOT started in current QA. No installation, server start or user-side test is requested now.

The model laboratory uses finite declared fixtures and a separate small classifier. Current tests compare their shared intended cases with this helper; neither substitutes for real HTTP or React execution. These fragments do not contain a complete assessed project repair.
