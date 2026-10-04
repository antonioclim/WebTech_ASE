# Lecture Example — Tail Latency Trace

## Concept demonstrated

An average can hide slow requests; a documented percentile rule exposes the tail of a bounded sample.

## Why this example is in the lecture

Ten actual HTTP requests measure header-to-body completion time against an Express endpoint with one slow response.

## What to observe

- Nine server delays are 10 ms and one is 200 ms.
- Runtime overhead is measured rather than assumed.
- Nearest-rank p95 and maximum expose the delayed response above the mean.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

Percentiles require a stated algorithm and sample population. This trace describes ten observations; it is not a capacity or SLO claim.

## Variations

- Add warm-up values and decide whether they belong in the measured population.
- Compare header latency with body-complete latency.

## Validation

Validated using measured HTTP durations with robust tail-versus-mean assertions.
