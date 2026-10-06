#!/usr/bin/env python3
"""Pure RC9 corrections; callers separately authenticate and reseal carriers.

These functions never write files, install dependencies or start processes.
Predecessor payloads stay untouched. Returned controls require the caller's new
identity/provenance procedure; old signatures are not accepted as new identities.
"""
from __future__ import annotations

import hashlib
import json
import re


NATIVE_IMPORTS = ('import { fileURLToPath as rc9FileURLToPath } from "node:url";\n'
                  'import { resolve as rc9Resolve } from "node:path";\n')
ENTRY_PATTERN = re.compile(r'process\.argv\[1\]\s*===\s*new URL\(import\.meta\.url\)\.pathname')
ENTRY_NATIVE = '(process.argv[1] && rc9Resolve(process.argv[1]) === rc9FileURLToPath(import.meta.url))'
ROOT_PATTERN = re.compile(r'new URL\((["\'])\.\./\.\.\1\s*,\s*import\.meta\.url\)\.pathname')
C07_EXAMPLES = ('01-relationship-shapes', '02-eager-loading-query-count',
                '03-resource-contract', '04-pagination-stability',
                '05-transaction-timeline')
C07_CANONICAL = frozenset('canonical/' + example + '/' + leaf
                         for example in C07_EXAMPLES
                         for leaf in ('README.md', 'example.js', 'package.json', 'package-lock.json')) | {'canonical/reading-list-next.md'}


def _copy(files):
    if not isinstance(files, dict) or not files:
        raise ValueError('RC9 requires a nonempty relative-path byte mapping')
    for name, data in files.items():
        if (not isinstance(name, str) or not name or not isinstance(data, bytes)
                or name.startswith('/') or '\\' in name or '\x00' in name
                or any(p in ('', '.', '..') for p in name.split('/'))):
            raise ValueError('RC9 invalid relative-path byte mapping')
    return dict(sorted(files.items()))


def _replace_once(text, before, after, name):
    count = text.count(before)
    if count == 1:
        return text.replace(before, after, 1)
    if count == 0 and text.count(after) == 1:
        return text
    raise ValueError('RC9 reviewed source splice differs: ' + name)


def _native_paths(data):
    text = data.decode('utf-8')
    changed = False
    if ENTRY_PATTERN.search(text):
        text = ENTRY_PATTERN.sub(ENTRY_NATIVE, text)
        changed = True
    if ROOT_PATTERN.search(text):
        text = ROOT_PATTERN.sub('rc9FileURLToPath(new URL("../..", import.meta.url))', text)
        changed = True
    old_entry = 'import.meta.url===`file://${process.argv[1]}`'
    if old_entry in text:
        text = text.replace(old_entry, 'process.argv[1]&&rc9Resolve(process.argv[1])===rc9FileURLToPath(import.meta.url)')
        changed = True
    if changed and NATIVE_IMPORTS not in text:
        text = NATIVE_IMPORTS + text
    return text.encode('utf-8')


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('RC9 duplicate JSON key')
        result[key] = value
    return result


def _rebind_c07_registry(files):
    try:
        rows = json.loads(files['CANONICAL_SOURCES.json'], object_pairs_hook=_unique_object,
                          parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Nonfinite JSON')))
    except (KeyError, UnicodeError, json.JSONDecodeError) as error:
        raise ValueError('RC9 C07 canonical registry missing or malformed') from error
    if (not isinstance(rows, list) or len(rows) != 21
            or not all(isinstance(row, dict) for row in rows)
            or len({row.get('path') for row in rows}) != 21
            or {row.get('path') for row in rows} != C07_CANONICAL):
        raise ValueError('RC9 C07 exact 21 canonical source paths required')
    for row in rows:
        name = row['path']
        if name not in files or not isinstance(row.get('sha256'), str) or not re.fullmatch('[0-9a-f]{64}', row['sha256']):
            raise ValueError('RC9 C07 canonical source or digest malformed: ' + name)
        # The caller records before/after provenance. Active hashes always name
        # the exact current bytes; dependency pins and locks are not changed here.
        row['sha256'] = hashlib.sha256(files[name]).hexdigest()
    files['CANONICAL_SOURCES.json'] = (json.dumps(rows, ensure_ascii=False, indent=2) + '\n').encode()


C07_01_README = '''# Lecture example — relationship shapes

This fixture creates one conference, one session, one attendee and one registration in a disposable in-memory SQLite database. The session points to the conference through `conferenceId`; the attendee is joined through `Registration`, whose `ticketType` is returned in the nested graph.

The script checks the foreign key, the returned junction attribute and refusal of a duplicate session/attendee membership. It does not create two sessions or demonstrate one attendee registered across multiple sessions. Those are useful extensions, not observations supplied by this fixture.

## Prepare and run

Prepare the exact project-local dependencies before class. From this example directory, run `npm ci` using the supplied lockfile. Return to the C07 package root and run `node tools/examples.mjs preflight 01`. A zero exit with `ready: false` is a prerequisite block; preflight does not execute SQLite or establish a runtime PASS.

Once the declared Node/npm prerequisites and native SQLite dependency are available, run `node tools/examples.mjs run 01 --allow-memory-fixture` from the C07 root. Record the actual report, assertion result and output. The explicit flag acknowledges the disposable fixture. Installation failure or a missing native addon must be reported, not replaced by a global package or an invented PASS.

## Extend the observation

Create a second session and a second membership for the same attendee, then compare the junction attributes. Predict and verify the effects of deleting an attendee under the declared foreign-key policy. These additional cases are not part of the original three assertions.
'''

C07_03_README = '''# Lecture example — membership resource contract

An Express application persists one session/attendee membership through Sequelize and an in-memory SQLite database. The member URL owns the pair `(sessionId, attendeeId)`. The supplied script sends two PUT requests followed by two DELETE requests to that same member URL and asserts status codes 201, 200, 204 and 204.

This example demonstrates convergent membership state for the supplied valid fixture. It does not implement pagination, a closed query parser, bounded query values or rejection of repeated/exponent-style numeric parameters. It also does not comprehensively validate path identifiers or request bodies. Do not attribute those checks to this source; the separate pagination example has a different scope.

## Prepare and run

Prepare project-local dependencies before class with `npm ci` from this example directory, retaining the supplied lockfile. Return to the C07 package root and run `node tools/examples.mjs preflight 03`. A zero exit with `ready: false` is a prerequisite block, not execution or runtime acceptance.

When the declared prerequisites are available, run `node tools/examples.mjs run 03 --allow-memory-fixture` from the C07 root. The script owns an ephemeral loopback listener and disposable database, closes both and returns its actual assertion outcome. Save the complete report. A timeout, native-addon failure or nonzero exit is an incomplete execution, not an expected PASS.

## Extend the observation

Add explicit request-body and path-identifier validation as a separate exercise, with positive and negative HTTP cases. Investigate representation headers and error envelopes without assuming that the existing four status assertions already test them.
'''

_OLD_PROVISION = ('The original READMEs contain historical npm install commands; do not run an installation during this phase. '
                  'A separately prepared environment is a prerequisite to genuine example execution.')
_NEW_PROVISION = ('Prepare dependencies before class: in each canonical example directory run npm ci using its supplied lockfile, '
                  'then return to the C07 root and run the corresponding tools/examples.mjs preflight command. '
                  'This deliberate setup operation may download dependencies and run the declared native-addon installation. '
                  'A preflight exit of zero with ready:false is a prerequisite block, not a runtime PASS. '
                  'Only an actual successful run supplies execution evidence; preserve installation failures and do not replace the native driver.')


def _c07_documents(files):
    if not C07_CANONICAL.issubset(files):
        raise ValueError('RC9 C07 canonical source missing before derivation')
    files['canonical/01-relationship-shapes/README.md'] = C07_01_README.encode()
    files['canonical/03-resource-contract/README.md'] = C07_03_README.encode()
    for example in C07_EXAMPLES:
        name = 'canonical/' + example + '/README.md'
        if name not in files:
            raise ValueError('RC9 C07 required README missing: ' + name)
        text = files[name].decode('utf-8').replace('npm install\n', 'npm ci\n')
        if example not in ('01-relationship-shapes', '03-resource-contract'):
            notice = ('\n\nDependency provisioning uses the supplied lockfile: run `npm ci` from this example directory. Return to the C07 root for '
                      '`node tools/examples.mjs preflight ' + example[:2] + '`. A zero exit with `ready: false` '
                      'is a prerequisite block, not a runtime PASS. Record an actual run separately.\n')
            if notice not in text:
                text = text.rstrip() + notice
        files[name] = text.encode()
    for name, data in list(files.items()):
        if not name.endswith(('.md', '.html')) or name.startswith(('PREDECESSOR_', 'canonical/')):
            continue
        text = data.decode('utf-8')
        text = text.replace(_OLD_PROVISION, _NEW_PROVISION)
        text = text.replace('The README describes two sessions; the script does not create them. Both original files remain unchanged in canonical/.',
                            'The predecessor README described two sessions. The corrected current README follows this one-session fixture; the canonical executable remains unchanged.')
        text = text.replace('The README describes two sessions.', 'The predecessor README described two sessions; the current README now matches the one-session fixture.')
        text = text.replace('README discrepancy: describes two sessions', 'Current README: one-session fixture; predecessor described two')
        text = text.replace('The original README remains archived; this note corrects the teaching account without rewriting it.',
                            'The executable remains unchanged. The current README follows its actual fixture; the predecessor carrier remains preserved as source history.')
        text = text.replace('There is no owner test, GitHub action, Moodle configuration or installation to perform now.',
                            'This guide does not start a GitHub workflow or configure Moodle. Complete the explicit dependency provisioning before attempting the optional executable examples.')
        if name in ('RUN_EXAMPLES.md', 'WINDOWS.md', 'MACOS_LINUX.md'):
            section = '''\n## Project-local preparation before class

From the extracted C07 root, prepare one example at a time. For Example 01:

```text
cd canonical/01-relationship-shapes
npm ci
cd ../..
node tools/examples.mjs preflight 01
```

Use the exact corresponding directory and ID for Examples 02–05. Retain the lockfile. The preflight report must show `ready: true` before genuine execution is attempted; this readiness still does not prove that the native addon loads. Record the result of the subsequent explicit run. Do not disable certificate checks, use global packages or record a failed installation as PASS.
'''
            if section not in text:
                text = text.rstrip() + '\n' + section
        elif name == 'guide.html':
            section = ('<h2>Project-local preparation before class</h2><p>From the extracted C07 root, prepare Example 01 with its exact lockfile:</p>'
                       '<pre><code>cd canonical/01-relationship-shapes\nnpm ci\ncd ../..\nnode tools/examples.mjs preflight 01</code></pre>'
                       '<p>Use the corresponding directory and ID for Examples 02–05. A ready preflight is a prerequisite; it does not establish native-addon execution. '
                       'Record the actual explicit run separately. Do not disable certificate checks or use global packages.</p>')
            if section not in text:
                text = text.replace('</article>', section + '</article>', 1)
        files[name] = text.encode('utf-8')
    _rebind_c07_registry(files)


def derive_course(object_id: str, files: dict[str, bytes]) -> dict[str, bytes]:
    """Correct a current course, retaining all paths; caller reseals identity."""
    if not re.fullmatch(r'C(?:0[1-9]|1[0-4])', object_id):
        raise ValueError('RC9 requires course C01–C14')
    result = _copy(files)
    if object_id in ('C09', 'C14'):
        for name, data in list(result.items()):
            if name.endswith(('.js', '.mjs', '.cjs')) and not name.startswith('PREDECESSOR_'):
                result[name] = _native_paths(data)
    if object_id == 'C09' and 'canonical/04-http-adapter-contract/server.js' not in result:
        raise ValueError('RC9 reviewed C09 HTTP example missing')
    if object_id == 'C14':
        name = 'canonical/05-evidence-tristate-gate/review.mjs'
        if name not in result:
            raise ValueError('RC9 reviewed C14 evidence example missing')
        before = 'commandEvidence("syntax","node",["--check",new URL("./sample-app.mjs",import.meta.url).pathname],true)'
        after = 'commandEvidence("syntax",process.execPath,["--check",rc9FileURLToPath(new URL("./sample-app.mjs",import.meta.url))],true)'
        text = _replace_once(result[name].decode('utf-8'), before, after, name)
        if NATIVE_IMPORTS not in text:
            text = NATIVE_IMPORTS + text
        result[name] = text.encode()
    if object_id == 'C07':
        _c07_documents(result)
    return result


def derive_seminar(object_id: str, files: dict[str, bytes]) -> dict[str, bytes]:
    """Remove unsupported S03/S06 serve branches from a classroom mapping."""
    if not re.fullmatch(r'S(?:0[1-9]|1[0-4])', object_id):
        raise ValueError('RC9 requires seminar S01–S14')
    result = _copy(files)
    if object_id not in ('S03', 'S06'):
        return result
    name = 'CLASSROOM_RC6/kit.mjs'
    if name not in result:
        raise ValueError('RC9 reviewed classroom runner missing: ' + object_id)
    text = result[name].decode('utf-8')
    text = _replace_once(text, "['initial','check','observe','serve']", "['initial','check','observe']", name)
    text = _replace_once(text, " | observe P01/P02/P03/all | serve", " | observe P01/P02/P03/all", name)
    text = _replace_once(text, "if(action==='serve'){const child=await import('./server.mjs');await child.serve();}else{", '/* RC9_CLASSROOM_MODULE_ONLY */{', name)
    marker = "const [action='help',project='all',...tail]=process.argv.slice(2);"
    stop = ("if(action==='serve'){console.error(JSON.stringify({status:'STOP_UNSUPPORTED_CLASSROOM_COMMAND',seminar:'" + object_id + "',command:'serve',reason:'This seminar uses Node module fixtures and ships no browser server. Use initial, check or observe.'}));process.exit(2);}")
    if stop not in text:
        text = _replace_once(text, marker, marker + stop, name)
    result[name] = text.encode()
    return result


S13_STATIC_SERVER = '''import { open, lstat, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import { createServer } from "node:http";
import { extname, join, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";

// RC9: serve only this fixture's browser assets, from the actual module root.
// Symlinks, parent traversal, package/test files and non-GET/HEAD methods refuse.
const root = await realpath(fileURLToPath(new URL(".", import.meta.url)));
const allowed = new Set(["index.html", "main.js", "styles.css", "src/worker-client.js", "src/analysis.js", "src/analysis-worker.js"]);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (request, response) => {
  let handle;
  try {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
    if (typeof request.url !== "string" || !request.url.startsWith("/") || request.url.startsWith("//") || request.url.includes("\\\\")) throw new Error("invalid origin-form target");
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const name = pathname === "/" ? "index.html" : pathname.slice(1);
    if (!allowed.has(name)) throw new Error("unlisted browser asset");
    let current = root;
    for (const component of name.split("/")) { current = join(current, component); if ((await lstat(current)).isSymbolicLink()) throw new Error("symbolic link"); }
    const file = await realpath(current), within = relative(root, file);
    if (!within || isAbsolute(within) || within === ".." || within.startsWith(".." + sep)) throw new Error("outside fixture");
    handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
    const info = await handle.stat();
    if (!info.isFile() || info.size > 2 * 1024 * 1024) throw new Error("not a bounded regular asset");
    const content = request.method === "HEAD" ? null : await handle.readFile();
    response.writeHead(200, { "content-type": types[extname(file)], "content-length": info.size, "cache-control": "no-store" });
    response.end(content);
  } catch {
    if (!response.headersSent) response.writeHead(404);
    response.end("Not found");
  } finally { if (handle) await handle.close().catch(() => {}); }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, "127.0.0.1", () => console.log(`Worker offload reference listening on http://127.0.0.1:${server.address().port}`));
const stop = () => server.close();
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
'''


def derive_advanced_seminar(object_id: str, files: dict[str, bytes]) -> dict[str, bytes]:
    """Correct separately retained advanced source; never claim class completion."""
    if not re.fullmatch(r'S(?:0[1-9]|1[0-4])', object_id):
        raise ValueError('RC9 requires seminar S01–S14')
    result = _copy(files)
    for name, data in list(result.items()):
        if name.endswith(('.js', '.mjs', '.cjs')) and not name.startswith('PREDECESSOR_'):
            result[name] = _native_paths(data)
    if object_id == 'S13':
        name = 'projects/p01/student/server.mjs'
        if name not in result:
            raise ValueError('RC9 reviewed S13 Worker fixture server missing')
        text = result[name].decode('utf-8')
        if 'if (!file.startsWith(root))' not in text and text != S13_STATIC_SERVER:
            raise ValueError('RC9 reviewed S13 server boundary differs')
        result[name] = S13_STATIC_SERVER.encode()
    return result
