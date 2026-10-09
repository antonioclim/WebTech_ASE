# Lecture Example — Request/response anatomy and header extension

## Concept demonstrated

An HTTP exchange contains two distinct messages and optional headers can extend their metadata without changing the simpler status-and-representation contract.

## Why this example is in the lecture

The compact trace makes the client/server boundary visible. The runnable page then exposes the same facts in browser DevTools and compares a client that ignores an optional field with one that uses it.

## What to observe

- The method and request `Content-Type` belong to the request.
- The status and `Location` belong to the response.
- Both clients use the response body; only the newer client uses `Example-Trace-Id`.
- Ignoring an optional unknown field preserves the simpler exchange, but required semantics cannot safely depend on an unknown field.
- Both messages can carry JSON, but the bodies have different roles.

## Run / inspect

Run the relative commands in this README from this example’s own folder under `C01_COURSE/EN_GB/04_CANONICAL_EXAMPLES`. When using the package-root commands in the C01 start guide, keep the full `04_CANONICAL_EXAMPLES/...` path instead. All examples use Node built-ins; follow the capability policy and retain actual warnings.

First read [`exchange.http`](exchange.http) from each start line toward its body. Then start the local target:

```bash
node start-demo.mjs
```

Open the printed URL, open DevTools **Network**, clear existing entries and select **Run exchanges**. Inspect the `GET` and `POST` entries using the sequence in the lecture. The page deliberately shows the body-only client and the header-aware client separately.

Run the automated observable check with:

```bash
node verify.mjs
```

## Explanation

The client submits a JSON representation to the collection resource. The server reports creation with `201 Created`, identifies the declared created resource with `Location` and echoes the submitted text. GET returns a fixed literal note. There is no persistence code; the creation report is not a durability witness. `Example-Trace-Id` adds optional correlation metadata. A client that knows only the status, media type and body still completes its simpler job.

## Variations

- Change the request to `GET` and identify which body-related fields would disappear.
- Replace `201` with `200` and discuss what meaning is lost.
- Remove the trace field and confirm that the body-only client continues to work.
- Pretend the body cannot be interpreted without the trace field and explain why the field is no longer a compatible optional extension.

## Invalid input and recovery

This local teaching endpoint expects a JSON object with a non-empty string `text`. Malformed JSON, a missing `text` and an oversized body (over 64 KiB) return `400` with an error object. The server remains available for a following valid retrieval. These are deliberately small example rules; the endpoint does not claim a complete production API implementation.

## Expected result and verification scope

The supplied check can be run with `node verify.mjs`: retrieval and creation statuses, media types, locations, trace fields and JSON representations are checked through the live HTTP boundary. The check sends malformed JSON, a missing field and an oversized body, then checks a following valid retrieval. Its finite recovery sequence does not guarantee all future requests. Record your actual run separately from these expectations. The supplied static trace is interpretation material, not your browser execution.

## Challenge the persistence claim

From this example folder run `node evidence-boundary.mjs`. Predict POST 201 echoing `C01 fresh text`, followed by GET 200 returning `Read diff`. The script prints both actual exchanges and closes its owned listener. Different texts contradict the particular claim that this GET retrieves the posted text; source inspection supplies the cause. This does not test an actual storage layer or durability after restart.

For the browser route, `start-demo.mjs` selects an available loopback port. Copy its actual READY origin and stop its own terminal with Ctrl+C. Confirm the printed owned-listener stop. Do not contact the fictional study hosts or terminate unrelated processes.
