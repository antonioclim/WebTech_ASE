# C01 start here

Week 01 English course: **The Web as a system, HTTP and evidence**. Package **2.0.2-rc.1** is a release candidate. Its integrity check is separate from platform and classroom qualification.

## Browser route

1. Extract the complete ZIP; keep its folder structure.
2. Open `OPEN_PRESENTATION.cmd` on Windows or `OPEN_PRESENTATION.sh` on macOS/Linux. You can also open `01_PRESENTATION/C01_PRESENTATION_EN_GB.html` directly.
3. Read `02_HANDOUT/STUDENT_HANDOUT_C01_v2.0.2_EN_GB.docx` for explanations, six self-checks and the example map.
4. Use `02_HANDOUT/READINESS_AND_TRANSFER_C01_v2.0.2_EN_GB.docx` for the distinct before-class and after-class activities. If a DOCX reader is unavailable, read the canonical example READMEs and open `03_ACTIVITIES/OFFLINE_TRACE.html`.

The presentation and supplied trace work offline in a current browser. They do not require Node. Left/Right and Page Up/Page Down change slides; Home/End jump. T starts or pauses, R resets and F toggles full screen. Focused buttons retain normal Enter/Space activation.

## Verify and execute with Node

`VERIFY_PACKAGE`, `CHECK_ENVIRONMENT` and `RUN_ALL_EXAMPLES` have `.cmd` (Windows) and `.sh` (macOS/Linux) versions. Verification needs Node; the executable examples require **Node v24.21.0**. The environment check also verifies **npm 11.19.0** through npm's CLI using the selected Node binary. No `npm install` is needed: all examples use built-in APIs.

1. Run `VERIFY_PACKAGE` before executing examples. It checks the exact file set and identity.
2. Run `CHECK_ENVIRONMENT` and resolve any version mismatch using the course setup guidance.
3. Run `RUN_ALL_EXAMPLES` for all five checks. Each example process is limited to 20 seconds and 1 MiB of output. These bounded checks are separate from an interactive server you start yourself.

A failed identity check means a missing, extra, altered or invalid package entry needs investigation. A runtime mismatch means the selected environment does not match the required versions. Neither result establishes the truth of a separate HTTP claim.

## Learning route

| Outcome | Start with | Question to answer |
| --- | --- | --- |
| Client/server roles and resource versus representation | Handout page 1 and slides 2–4 | Who requests, and what does the returned content represent? |
| URL components and the request target | Example 01 | Which part is omitted from HTTP? |
| Request and response anatomy | Example 02 | Which direction owns each field? |
| Methods, statuses and business outcomes | Example 03 | What does 201 establish and what remains unproved? |
| Representation and API contracts | Example 04 | Does the media type match this agreed interpretation? |
| Evidence, independent checks and bounded AI changes | Example 05 | Which assertion is sensitive to which defect? |

Examples 01–04 are the core independent reading route; example 05 is an extension. The presentation ends at minute 60. That schedule is a teaching plan; it is not a measured novice completion time. Supplied traces permit honest interpretation practice without implying execution on the student's computer.

Read [SOURCES.md](SOURCES.md) for targeted primary references. [MOODLE_POLICY.md](MOODLE_POLICY.md) explains that the compulsory Week 01 individual upload belongs to S01.
