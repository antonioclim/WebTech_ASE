# Lecture Example — Effect Cleanup Timeline

## Concept demonstrated

An effect owns one operation for its current dependency value and cleans it up before replacement work starts. This example uses a timer that cooperates with its AbortController; it does not demonstrate a separate request-identity guard.

## Why this example is in the lecture

A rendered Vite app runs the synchronization from `useEffect`; changing its dependency triggers real cleanup and replacement setup.

## What to observe

- Changing from slow to fast work runs cleanup for the old effect.
- Cleanup aborts that operation and clears its timer.
- The new fast operation publishes `Result for fast`.
- After the old delay has elapsed, the cleared timer does not overwrite the fast result.
- The source has no monotonically increasing request ID. A non-cooperative operation would require an additional publication guard.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Explanation

The effect creates one `AbortController` for its dependency value and returns cleanup that aborts that exact operation before another effect owns synchronization.

## Variations

- Add a control that unmounts the synchronized component and observe cleanup.
- Call the returned cleanup on unmount before either promise settles.

## Validation

Validated with a clean install and `npm run build`; switch from slow to fast work and inspect cleanup in the Vite application.
