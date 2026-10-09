# Five-message async continuation

Predict script start → function start → script end → after await → promise fulfilled. Calling the async function starts its synchronous prefix immediately. Await suspends its continuation, even with a fulfilled operand. The result is a promise trace, not browser painting.

From `01_WEEKS/WEEK_04/C04_COURSE/EN_GB` run `node canonical/02-async-continuation-order/example.js` in a fresh process. Or use `node tools/tw-kit.mjs example 02` after the capability preflight. Preserve your prediction, exact command and actual output. A reference result is not a new observation. These neutral course files do not implement the assessed S04 targets.
