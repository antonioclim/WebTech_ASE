# Lecture Example — Component and Props Render

## Concept demonstrated

A React tree composes components; parents pass read-only props and children; collection identity comes from stable keys.

## Why this example is in the lecture

A small Vite app renders actual JSX in the browser so component composition, props, children, and stable keys are visible in their normal environment.

## What to observe

- `TopicList` owns collection iteration but not card markup.
- `TopicCard` receives `title`, `level`, and `children` as props.
- Stable topic IDs become React keys rather than visible attributes.
- Components return element descriptions; React produces the HTML.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Explanation

`TopicList` maps data to `<TopicCard>` elements. Props and children flow down; this render has no local state or effects because none are needed.

## Variations

- Pass a callback prop and exercise the resulting event in the browser.
- Replace stable IDs with indexes and discuss what happens when rows move.

## Validation

Run `npm ci` and `npm run build` to check this locked application. Inspect the rendered component tree through the Vite application. A successful build compiles the JSX; it is not a current security audit or proof of all browser behaviour.
