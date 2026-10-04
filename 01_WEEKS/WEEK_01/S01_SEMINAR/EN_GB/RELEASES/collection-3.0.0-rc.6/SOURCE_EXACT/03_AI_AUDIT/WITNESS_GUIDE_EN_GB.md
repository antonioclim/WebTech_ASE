# Verify the deliberately flawed claim safely

From the package root, run `node 03_AI_AUDIT/flawed-patch-witness.mjs`. It executes only the supplied flawed function on four fixed synthetic inputs and prints the actual result beside the required contract. It does not modify either assessed file, contact Gemini or start an HTTP server. Choose two counterexamples and explain the operation that caused each mismatch. A successful witness check means the flaws remain detectable, not that your own solution passes.

Record the command and actual output as personally executed function evidence. Do not call it a browser observation or network exchange. Running TEST_PROJECT_2 on your completed handler is separate evidence about your implementation; it cannot prove the behaviour of this flawed snippet.

If Node cannot run, trace the supplied snippet on encoded spaces and an extra segment one operation at a time. Label that result STATIC INFERENCE, not execution. If Gemini is unavailable, audit the supplied synthetic claim and label SYNTHETIC_PRACTICE_NOT_GEMINI. An AI interaction may also be honestly NOT_AVAILABLE_NOT_EXECUTED with a reason; do not manufacture one.
