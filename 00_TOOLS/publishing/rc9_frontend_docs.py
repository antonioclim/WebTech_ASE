"""Narrow RC9 corrections to canonical frontend documentation.

The immutable source bytes remain in the predecessor. These replacements name
only behaviour present in the copied source and make locked installation clear.
No dependency, application logic or learner target is changed by this module.
"""
from __future__ import annotations
import json


def replace_once(text: str, old: str, new: str, path: str) -> str:
    if text.count(old) != 1:
        raise ValueError('Unexpected frontend documentation shape: ' + path)
    return text.replace(old, new, 1)


CORRECTIONS = {
    'C08': {
        'canonical/01-component-props-render/README.md': [(
            'Validated with the locked install, zero-vulnerability audit, and `npm run build`; inspect the rendered component tree through the Vite application.',
            'Run `npm ci` and `npm run build` to check this locked application. Inspect the rendered component tree through the Vite application. A successful build compiles the JSX; it is not a current security audit or proof of all browser behaviour.')],
        'canonical/02-immutable-state-view/README.md': [(
            'Mutate `initial[0]` and explain why identity-based rendering becomes harder to reason about.',
            'In a separate experiment, mutate `initialTasks[0]` and explain why identity-based rendering becomes harder to reason about. Restore the authentic example after the experiment.')],
        'canonical/05-effect-cleanup-timeline/README.md': [(
            'Synchronization needs an owner, cleanup, and a latest-work identity; abort signaling alone does not guarantee that an old promise will never settle.',
            'An effect owns one operation for its current dependency value and cleans it up before replacement work starts. This example uses a timer that cooperates with its AbortController; it does not demonstrate a separate request-identity guard.'), (
            '- Starting new work aborts the previous controller.\n- Each start receives a monotonically increasing identity.\n- The latest promise publishes first.\n- The old promise is deliberately resolved afterward but cannot publish.',
            '- Changing from slow to fast work runs cleanup for the old effect.\n- Cleanup aborts that operation and clears its timer.\n- The new fast operation publishes `Result for fast`.\n- After the old delay has elapsed, the cleared timer does not overwrite the fast result.\n- The source has no monotonically increasing request ID. A non-cooperative operation would require an additional publication guard.')],
    },
    'C09': {
        'canonical/01-url-state-decoder/README.md': [(
            '- `/notes/new` must be tested before the parameterized detail route.',
            '- `/notes/new` renders the static new-note screen; `/notes/42` renders the parameterized detail screen. Test both paths. React Router ranks matching routes, so source order is not the contract here.'), (
            'Ask whether an unsaved title belongs in this returned object (normally it does not).',
            'Ask whether an unsaved title should be copied into URL search state, or kept as a local draft until the user chooses a shareable value.'), (
            'Validated with Node.js: the four-case trace completes and the route/parameter/query test passes 1/1.',
            'Run `npm ci` and `npm run build` to compile the authentic JSX. In the browser, open `/notes?filter=open`, select Show archived and inspect `?filter=archived`. Open `/notes/new`, `/notes/42` and an unknown path; expect New note, Note 42 and Page not found respectively. This package has no Node trace or automated test script. These are browser observations to record, not a claim that an absent test passed.')],
        'canonical/02-form-navigation-policy/README.md': [(
            'Submission state is local, while navigation occurs only after authoritative server confirmation.',
            'Submission state is local, while navigation waits for a simulated asynchronous delay and local validation. This example demonstrates navigation timing; it has no HTTP request or authoritative server confirmation.'), (
            'A rendered React Router form keeps its controlled draft and saving status local, then navigates only after the asynchronous confirmation settles.',
            'A rendered React Router form keeps its controlled draft and saving status local, waits 300 ms, validates the title and then navigates to a fixed demonstration identity, note 42.'), (
            '- Submit changes only the in-flight status.\n- Failure preserves the draft and does not navigate.\n- Confirmation uses the returned identity/title and replaces the form history entry.',
            '- Submit displays saving and disables the Save button during the local delay.\n- A blank title preserves the draft and stays on the form with Enter a title.\n- A non-blank title navigates to `/notes/42` with `replace: true`.\n- The identity 42 is hard-coded. A note is placed in navigation state, but the detail component renders only the route parameter; no returned server resource is consumed.\n- A real application would navigate after its actual server response, using the returned identity.'), (
            'Validated with a clean Vite production build; inspect saving, validation failure, and post-confirmation navigation in the browser.',
            'Run the locked Vite production build, then inspect saving, blank validation and navigation to Confirmed note 42 in the browser. The displayed word Confirmed belongs to this simulation; it is not evidence of a server write.')],
        'canonical/03-authoritative-server-state/README.md': [(
            '- `save/requested` changes submission state only.',
            '- Submitting changes the local status to saving before the HTTP response arrives.'), (
            '```bash\nnpm ci\nnpm run server\nnpm run dev\nnpm run build\n```',
            'From this example directory, install once:\n\n```bash\nnpm ci\n```\n\nIn terminal 1, keep the Express API running:\n\n```bash\nnpm run server\n```\n\nIn terminal 2, from the same directory, start Vite and open the URL it prints:\n\n```bash\nnpm run dev\n```\n\nVite proxies `/api` to the local API on port 3001. To compile the production frontend separately, run `npm run build`. The resulting static `dist` files still need an API host or proxy; the build does not bundle the Express server. Stop both processes with Ctrl+C when finished.'), (
            '`transition` is a small deterministic model. React could implement the same transitions with several `useState` calls or a reducer; the important point is ownership, not the state API.',
            'The component uses three `useState` values: the last confirmed note, the editable draft and the request status. Its initial GET populates the note and draft. A successful PATCH replaces both from the server response; this server trims and uppercases the submitted title. An HTTP 400 displays error while retaining the prior confirmed note and current draft. The source contains no separate `transition` model. Transport rejection handling and retry controls beyond another submission are not implemented here.'), (
            'Validated with Node.js: the three-transition trace completes and both authoritative-state tests pass 2/2.',
            'Run `npm ci` and `npm run build` to compile the frontend. With both processes running, inspect the initial Stored title. Type a different draft and check that Confirmed stays unchanged. Save `  mixed Case  ` and expect the server response MIXED CASE to replace both values. Submit a blank draft and expect error without replacing the prior confirmed note. This package has no trace or automated test script; record the actual HTTP and browser observations.')],
    },
    'C10': {
        'canonical/01-state-ownership-map/README.md': [(
            'The four-row table asks whether a value is derived, authoritative elsewhere, long-lived, or consumed by several branches before selecting an owner.',
            'The actual React tree places the shared filter in the nearest common owner, passes it to the input and computes both the visible list and count. There is no four-row ownership table in this application.')],
        'canonical/04-normalized-selectors/README.md': [(
            '- `ids` and `entities` represent storage, not display order.\n- Ordering and unread count are recomputable views.\n- Updating one entity need not rebuild several duplicated lists/counts manually.',
            '- `ids` and `entities` represent normalized storage. The adapter has a `sortComparer`, so its stored IDs are ordered by descending `createdAt`.\n- `selectAll` exposes that adapter order; the unread count is derived during rendering.\n- Updating one entity changes the subscribed UI without manually synchronizing a second unread count.')],
        'canonical/05-latest-request-guard/README.md': [(
            'Centralized async state publishes fulfillment/rejection only when the action\'s request ID is still current.',
            'Centralized async state publishes fulfillment only when the action\'s request ID is still current. This source handles pending and fulfilled actions; it does not implement a rejected-action handler.')],
    },
}


HISTORICAL_NOTES = {
    'C08': [
        (['SOURCE_NOTES.md', 'sources.html'],
         'The canonical copies are byte-preserved.',
         'The canonical application source retains predecessor bytes; RC9 canonical READMEs are explicit documentation derivatives.'),
        (['SOURCE_NOTES.md', 'sources.html'],
         'Their npm install instructions are historical source text.',
         'The predecessor READMEs used npm install; the RC9 copies now use npm ci.'),
        (['documents/C08_HANDOUT.md', 'reading.html'],
         'Contrary to its preserved README,',
         'Contrary to its previous README,'),
        (['documents/C08_PREPARATION_TRANSFER.md', 'preparation.html'],
         'The preserved example READMEs contain historical installation and validation statements.',
         'The predecessor example READMEs contained historical installation and validation statements; RC9 corrects their canonical documentation explicitly.'),
    ],
    'C09': [
        (['SOURCE_NOTES.md', 'sources.html'],
         'Its README mentions a Node trace and 1/1 validation;',
         'Its previous README mentioned a Node trace and 1/1 validation;'),
        (['SOURCE_NOTES.md', 'sources.html'],
         'Actual runtime matching has not been tested in this delivery.',
         'The predecessor source notes did not claim actual runtime matching. Consult the RC9 collection qualification page for separately recorded runtime evidence.'),
        (['SOURCE_NOTES.md', 'sources.html'],
         'Its code and README remain exact.',
         'Its application code retains predecessor bytes; the RC9 README now labels that simulation accurately.'),
        (['SOURCE_NOTES.md', 'sources.html'],
         'The README names a transition and two tests not present in this directory.',
         'The previous README named a transition and two tests not present in this directory; the RC9 README now describes the actual component and HTTP observations.'),
        (['documents/C09_HANDOUT.md', 'reading.html'],
         "Each example's historical README remains unchanged;",
         "Each example's previous README remains in the immutable predecessor; the three RC9 frontend READMEs are explicit documentation derivatives;"),
        (['SOURCES.md', 'sources.html'],
         'Exact source READMEs retain their historical statements;',
         'The immutable predecessor retains the historical README statements; RC9 frontend READMEs correct the documented mismatches;'),
    ],
    'C10': [
        (['SOURCE_NOTES.md', 'sources.html'],
         'four-row table described by its README',
         'four-row table described by its previous README'),
        (['documents/C10_PREPARATION_TRANSFER.md', 'preparation.html'],
         'The README’s four-row table',
         'The previous README’s four-row table'),
    ],
}


def derive(object_id: str, files: dict[str, bytes]) -> dict[str, bytes]:
    """Return independent bytes with exact, fail-closed documentation changes."""
    result = dict(files)
    if object_id not in CORRECTIONS:
        return result
    expected_builds = {'C08': 5, 'C09': 3, 'C10': 5}[object_id]
    readmes = []
    for name in sorted(files):
        if name.startswith('canonical/') and name.endswith('/package.json'):
            package = json.loads(files[name])
            if package.get('scripts', {}).get('build') == 'vite build':
                readmes.append(name[:-len('package.json')] + 'README.md')
    if len(readmes) != expected_builds:
        raise ValueError('Unexpected canonical frontend scope: ' + object_id)
    for name in readmes:
        if name not in files:
            raise ValueError('Missing canonical frontend README: ' + name)
        text = files[name].decode('utf-8')
        text = replace_once(text, 'npm install\n', 'npm ci\n', name)
        for old, new in CORRECTIONS[object_id].get(name, []):
            text = replace_once(text, old, new, name)
        result[name] = text.encode('utf-8')
    for names, old, new in HISTORICAL_NOTES.get(object_id, []):
        for name in names:
            if name not in result:
                raise ValueError('Missing frontend source note: ' + name)
            text = result[name].decode('utf-8')
            result[name] = replace_once(text, old, new, name).encode('utf-8')
    return result
