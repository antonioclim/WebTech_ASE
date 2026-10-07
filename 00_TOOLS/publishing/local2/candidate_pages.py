"""Pure student-page generators for a classroom candidate with publication-neutral scope.

No file, network or repository operation is performed by these helpers.
Identity values are supplied by the caller; core pages do not embed their own
outer identity, avoiding a manifest self-reference. The complete module uses
only the Python standard library.
"""
from __future__ import annotations

import html
import re
from typing import Any, Mapping

_GATE_LABELS = {
    'local_integrity': 'Local integrity', 'reference_runtime': 'Reference runtime',
    'headless_browser': 'Headless browser', 'native_windows': 'Native Windows',
    'native_macos': 'Native macOS', 'manual_browser': 'Manual browser',
    'word': 'Microsoft Word', 'moodle_live': 'Live Moodle',
    'human_pilot': 'Student pilot', 'owner_acceptance': 'Owner acceptance',
}
_COURSE_TOPICS = [
    'The Web as a system, HTTP and AI-assisted development',
    'Semantic HTML, CSS, responsive UI and accessibility',
    'JavaScript for reading and modifying programs',
    'Modules, DOM, events, Promises, async/await and fetch',
    'Node, Express and REST', 'Persistence with Sequelize and SQLite',
    'Relationships, transactions and API design', 'React with Vite',
    'Routing, forms and full-stack React', 'State ownership and frontend architecture',
    'Authentication, authorisation and web security', 'Realtime and asynchronous work',
    'Workers, Service Workers and the cost of composition',
    'Testing, observability, performance and production evidence',
]
_SEMINAR_TOPICS = [
    'HTTP Detective + Tiny HTTP Server', 'Responsive Card Grid', 'Dataset Transformer CLI',
    'Multi-source Data Dashboard', 'In-memory Task API', 'Query API', 'Transactional Booking',
    'Vanilla-to-React Reading Queue', 'Routed Notes Application', 'Shared Workshop State',
    'Role-Protected Moderation Operation', 'Correlated Request Dispatcher', 'Worker Offload',
    'Evidence review and individual defence',
]
_CSS = '''
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f5f8fb;color:#172a3b;font:17px/1.6 system-ui,sans-serif}
main{max-width:1080px;margin:24px auto;padding:28px;background:#fff;border:1px solid #cad7e2;border-radius:10px}
h1,h2,h3{line-height:1.25;overflow-wrap:anywhere}h1{font-size:clamp(1.65rem,4vw,2.35rem)}h2{margin-top:2rem}
p,li,a,code,td,th{overflow-wrap:anywhere}a{color:#075985;text-underline-offset:3px}
a:focus-visible,summary:focus-visible{outline:3px solid #9a3412;outline-offset:3px}
nav{display:flex;flex-wrap:wrap;gap:.6rem 1rem;margin:1rem 0 1.5rem}.notice{padding:1rem;background:#fff4dc;border-left:4px solid #9a3412}
li+li{margin-top:.6rem}code,pre{font:14px/1.6 ui-monospace,monospace}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#edf2f7;padding:1rem;border-radius:6px}
table{border-collapse:collapse;width:100%;table-layout:fixed;overflow-wrap:anywhere}caption{text-align:left;font-weight:700;padding:.6rem 0}
th,td{padding:.7rem;border:1px solid #bacbd8;text-align:left;vertical-align:top}th{background:#edf2f7}
footer{margin-top:2rem;border-top:1px solid #cad7e2;padding-top:1rem;font-size:.94rem}
@media(max-width:600px){main{margin:0;padding:16px;border:0;border-radius:0}th,td{padding:.4rem}pre{padding:.7rem}}
@media print{body{background:#fff}main{max-width:none;border:0;margin:0;padding:0}nav{display:none}h2{break-after:avoid}a{color:inherit}}
'''


def _version(metadata: Mapping[str, Any], value: str | None) -> str:
    version = value or metadata.get('candidate_version') or metadata.get('distribution_version')
    if not isinstance(version, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+-local\.\d+', version):
        raise ValueError('A local candidate version ending in -local.N is required')
    return version


def _safe_path(value: str, label: str) -> str:
    if (not isinstance(value, str) or not value or value.startswith('/')
            or any(char in value for char in '\\:?#')
            or any(part in ('', '.', '..') for part in value.split('/'))):
        raise ValueError(f'{label} must be a collection-relative file path')
    return value


def _link(path: str, label: str) -> str:
    return f'<a href="{html.escape(_safe_path(path, "link target"), quote=True)}">{html.escape(label)}</a>'


def _number(value: Any, label: str) -> int:
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    if isinstance(value, (list, tuple, dict)):
        return len(value)
    raise ValueError(f'{label} must be an integer or a declared collection')


def _stats(metadata: Mapping[str, Any]) -> dict[str, int]:
    objects = metadata.get('objects')
    if not isinstance(objects, list):
        raise ValueError('metadata.objects must list the current collection units')
    expected = {f'{kind}{n:02}' for kind in ('C', 'S') for n in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
    identifiers = [obj.get('object_id') for obj in objects]
    if len(identifiers) != 30 or set(identifiers) != expected:
        raise ValueError('The candidate must declare all 30 course, seminar and setup units exactly once')
    result = {
        'units': len(objects), 'tutorials': _number(metadata.get('tutorials'), 'tutorials'),
        'tasks': _number(metadata.get('required_microprojects'), 'required_microprojects'),
        'targets': _number(metadata.get('editable_files'), 'editable_files'),
        'word_references': _number(metadata.get('optional_docx_references', 30), 'optional_docx_references'),
    }
    if (result['units'], result['tutorials'], result['tasks'], result['targets']) != (30, 14, 40, 38):
        raise ValueError('Expected the retained 30 units, 14 tutorials, 40 tasks and 38 learner targets')
    return result


def _course_table(metadata: Mapping[str, Any], original_pages: Mapping[str, str]) -> str:
    source = original_pages.get('COURSE_PLAN.html', '')
    tables = re.findall(r'<table\b[^>]*>.*?</table>', source, re.DOTALL | re.IGNORECASE)
    for table in tables:
        entries = re.findall(r'href="(ENTRY/[CS]\d{2}\.html)"', table)
        if len(entries) == 28 and set(entries) == {f'ENTRY/{kind}{n:02}.html' for kind in ('C', 'S') for n in range(1, 15)}:
            if '<caption' not in table:
                table = re.sub(r'(<table\b[^>]*>)', r'\1<caption>Fourteen-week course and individual seminar route</caption>', table, count=1)
            return table
    if source:
        raise ValueError('The supplied course plan does not contain the exact retained 28-entry route table')
    units = {obj['object_id']: obj for obj in metadata['objects']}
    rows = []
    for index in range(14):
        course, seminar = units[f'C{index+1:02}'], units[f'S{index+1:02}']
        course_label = course.get('title') or course.get('topic') or _COURSE_TOPICS[index]
        seminar_label = seminar.get('title') or seminar.get('topic') or _SEMINAR_TOPICS[index]
        rows.append(f'<tr><th scope="row">{index+1}</th><td>{_link(course.get("entry", f"ENTRY/C{index+1:02}.html"), course_label)}</td><td>{_link(seminar.get("entry", f"ENTRY/S{index+1:02}.html"), seminar_label)}</td></tr>')
    return '<table><caption>Fourteen-week course and individual seminar route</caption><thead><tr><th scope="col">Week</th><th scope="col">Course topic</th><th scope="col">Individual seminar</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'


def _assessment_content(original_pages: Mapping[str, str]) -> str:
    source = original_pages.get('ASSESSMENT.html', '')
    if source:
        main = re.search(r'<main\b[^>]*>(.*?)</main>', source, re.DOTALL | re.IGNORECASE)
        if not main:
            raise ValueError('The supplied assessment source lacks its main content')
        content = re.sub(r'<section\b[^>]*id="static-site-scope"[^>]*>.*?</section>', '', main.group(1), flags=re.DOTALL)
        content = re.sub(r'<nav\b[^>]*>.*?</nav>', '', content, count=1, flags=re.DOTALL)
        content = re.sub(r'<h1\b[^>]*>.*?</h1>', '', content, count=1, flags=re.DOTALL)
        if 'releases/download/' in content or 'Published RC10 classroom download' in content:
            raise ValueError('An old publication/download claim remains in the assessment body')
        return content
    return '''<p>Complete every required individual microproject and explain your own implementation. The evidence form supports observation and review; it does not award marks or authenticate an AI conversation.</p>
<h2>What evidence can show</h2><ul><li>Correctness: specified positive and negative cases, exact commands and actual outputs.</li><li>Explanation: why your approach meets the contract and where its boundary lies.</li><li>Investigation: a prediction, observed result and reasoned response to a failure or counterexample.</li><li>Independence: your own work, with AI suggestions checked against source and tests.</li><li>Reporting: traceable observations, clear limitations and one readable complete PDF.</li></ul>
<p>Mark weights, deadlines, late rules, permitted alternatives and institutional policy come from the lecturer's actual Assignment. This candidate defines none of them.</p>
<h2>When something is blocked</h2><p>If an AI service, account or required installation is unavailable or disallowed, record BLOCKED, its cause and the affected activity. Keep completing independent work where possible and use the authorised course channel to obtain an alternative. Do not fabricate an exchange or treat BLOCKED as an automatic exemption or a grade.</p>
<p>Preserve failed commands and useful output. Distinguish unexecuted work from a failed execution. A supplied teaching fixture is not your personal evidence.</p>
<h2>Day 0 scope</h2><p>A FAILED attempt remains failed and does not establish readiness. Keep incomplete or blocked work as an honest private draft. Completed export creates neither a grade nor an institutional exemption.</p>
<h2>Evidence formats</h2><p>JSON is a private editable backup. PDF is the reviewed seminar deliverable. Include screenshots through the process required by the actual Assignment; describing a screenshot or naming a file does not prove it was supplied. Reopen the saved PDF and inspect its identity, answers, page breaks and missing text.</p>
<p>Submit <code>TW2026_Sxx_GROUP_Surname_Firstname.pdf</code> to the correct authorised Assignment. Never commit private evidence to GitHub.</p>'''


def _shell(title: str, body: str, *, version: str, profile: str, history_path: str | None,
           core_identity: str | None) -> str:
    scope = ('This is the complete local candidate collection. Run commands from the fully extracted folder.' if profile == 'core'
             else 'This is the local static reading profile. Run code, local servers and learner checks from the complete matching candidate collection. This reading profile accepts no Moodle submissions.')
    identity = _link('PACKAGE_ID.txt', 'Read this copy\'s PACKAGE_ID.txt')
    if profile == 'static' and core_identity is not None:
        if not re.fullmatch(r'[a-f0-9]{64}', core_identity):
            raise ValueError('core_identity must be a lowercase SHA-256 string')
        identity += f'. Matching candidate core identity: <code>{core_identity}</code>'
    provenance = '' if history_path is None else f'<p>{_link(history_path, "Read the historical published RC10 ancestor receipt")}. Historical evidence applies to the earlier bytes identified by that receipt.</p>'
    notice = f'<section class="notice" aria-label="Local candidate scope"><p><strong>Candidate {html.escape(version)}.</strong> General qualification remains <strong>NOT_FINAL</strong>. {scope}</p><p>Build metadata records derivation, not deployment. When publication has occurred, use the owner’s publication receipt to identify the bytes actually published.</p><p>{identity}. {_link("LOCAL_CANDIDATE_DERIVATION.json", "Candidate derivation")} · {_link("LOCAL_DERIVATION_POLICY.json", "Local derivation policy")}.</p>{provenance}</section>'
    nav = '<nav aria-label="Collection navigation">'+''.join(_link(path,label) for path,label in [('index.html','Collection home'),('START_HERE.html','Start here'),('COURSE_PLAN.html','Course plan'),('ASSESSMENT.html','Evidence and assessment'),('QUALIFICATION.html','Qualification'),('DOWNLOAD.html','Receive and verify this candidate')])+'</nav>'
    return f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{_CSS}</style></head><body><main><h1>{html.escape(title)}</h1>{notice}{nav}{body}<footer>Version {html.escape(version)} · candidate · NOT_FINAL. {_link("CLASSROOM_COLLECTION.json", "Inspect the current collection metadata")}.</footer></main></body></html>\n'


def annotate_form(source_text: str, *, version: str, profile: str = 'core') -> str:
    """Add a screen/print notice and identity labels, preserving v1 logic/META.

    Apply to the core before sealing its unit. Copy those sealed unit bytes
    unchanged into a static profile rather than annotating that copy again.
    """
    version = _version({}, version)
    if profile not in ('core', 'static'):
        raise ValueError('profile must be core or static')
    if 'id="local-candidate-form-scope"' in source_text:
        raise ValueError('The form already contains a local candidate notice')
    main = re.search(r'<main\b[^>]*>', source_text, re.IGNORECASE)
    heading = re.search(r'<h1\b[^>]*>.*?</h1>', source_text[main.end():] if main else '', re.DOTALL | re.IGNORECASE)
    if not main or not heading:
        raise ValueError('Expected the form\'s main element and first visible heading')
    offset = main.start()
    notice = (f'<p class="notice" id="local-candidate-form-scope"><strong>Candidate {html.escape(version)}.</strong> '
              'General qualification remains <strong>NOT_FINAL</strong>. '
              'This form retains its existing v1 record format and teaching contract. For a new record, use this candidate unit\'s current PACKAGE_ID.txt. '
              'Retained edition and classroom-scope labels describe the teaching contract. This notice identifies the candidate form’s code and records no publication or deployment result. '
              'An imported backup retains its saved package identity until you deliberately update the record and review it. '
              'An import, saved draft or PDF export does not establish a grade or accepted qualification.</p>')
    result = source_text[:offset] + notice + source_text[offset:]
    replacements = {
        '<label for="packageId">Released PACKAGE_ID copied from this actual package</label>':
            '<label for="packageId">PACKAGE_ID of the package actually used</label>',
        'Copy the 64 lowercase hexadecimal characters from the released PACKAGE_ID.txt.':
            'Copy the 64 lowercase hexadecimal characters from the PACKAGE_ID.txt of the package actually used.',
        "packageId:'Released PACKAGE_ID'":
            "packageId:'PACKAGE_ID of the package actually used'",
        "packageId:'Released PACKAGE_ID copied by the student'":
            "packageId:'PACKAGE_ID of the package actually used'",
        'this released package’s PACKAGE_ID.txt':
            'the PACKAGE_ID.txt of the package actually used',
    }
    for old, new in replacements.items():
        if result.count(old) != 1:
            raise ValueError('Expected exactly one form identity display label: ' + old)
        result = result.replace(old, new, 1)
    scripts = re.compile(r'<script\b[^>]*>.*?</script>', re.DOTALL | re.IGNORECASE)
    expected_scripts = [script.replace("packageId:'Released PACKAGE_ID'", "packageId:'PACKAGE_ID of the package actually used'", 1)
                       .replace("packageId:'Released PACKAGE_ID copied by the student'", "packageId:'PACKAGE_ID of the package actually used'", 1)
                       .replace('this released package’s PACKAGE_ID.txt', 'the PACKAGE_ID.txt of the package actually used', 1)
                        for script in scripts.findall(source_text)]
    if scripts.findall(result) != expected_scripts:
        raise ValueError('A form script changed beyond its three identity display strings')
    return result


def generate_candidate_pages(metadata: Mapping[str, Any], gates: Mapping[str, str] | None = None,
                             version: str | None = None, core_identity: str | None = None, *,
                             profile: str = 'core', original_pages: Mapping[str, str] | None = None,
                             history_receipt_path: str | None = 'PROVENANCE/PUBLISHED_RC10.json') -> dict[str, str]:
    """Return complete local global pages and README text without writing files.

    The caller supplies current collection metadata and creates the linked
    root derivation/policy and historical receipt files. Input original_pages
    preserves the verified course table and assessment prose. No current unit
    or outer ID is invented, copied from publication or hard-coded here.
    """
    if profile not in ('core', 'static'):
        raise ValueError('profile must be core or static')
    version = _version(metadata, version)
    stats = _stats(metadata)
    originals = original_pages or {}
    gates = dict(gates if gates is not None else metadata.get('qualificationGates', {}))
    if set(gates) != set(_GATE_LABELS):
        raise ValueError('All ten general qualification gates must be supplied explicitly')
    if history_receipt_path is not None:
        _safe_path(history_receipt_path, 'history_receipt_path')
        if not history_receipt_path.startswith(('PROVENANCE/', 'HISTORY/')):
            raise ValueError('Historical publication receipts must remain in a provenance/history directory')
    table = _course_table(metadata, originals)
    setup = f'<p>{_link("ENTRY/SETUP_WINDOWS.html", "Windows setup")} · {_link("ENTRY/SETUP_MACOS_LINUX.html", "macOS/Linux setup")}.</p>'
    summary = f'<p>This collection retains <strong>{stats["units"]} units, {stats["tutorials"]} seminar tutorials, {stats["tasks"]} required individual microprojects and {stats["targets"]} declared learner target files</strong>. HTML is the primary route. The {stats["word_references"]} Word references remain optional.</p>'
    overview = summary+'<p>Start with Day 0 setup, then follow the course and seminar entries for your week. All listed microprojects are individual required work. Read each contract before editing or executing its checks.</p>'+table+'<h2>Day 0 setup</h2>'+setup+'<p>The retained 60-minute teaching plan remains unpiloted. A source checklist or successful byte verification does not establish the time taken, rendered accessibility or completion of a microproject.</p>'
    start = summary+'''<h2>Open and verify the complete collection</h2><ol>
<li>Receive the local candidate archive and its matching checksum. Authenticate the expected checksum through the documented trusted channel. Follow <a href="DOWNLOAD.html">the verification and extraction guide</a>. Extract the whole ZIP into a new folder and open <code>index.html</code> from that folder, rather than the ZIP viewer.</li>
<li>Complete the appropriate Day 0 setup. The reference runtime is <strong>Node.js 24.21.0</strong>. In VS Code choose <strong>File → Open Folder</strong>, select the complete collection and choose <strong>Terminal → New Terminal</strong>. Run <code>node --version</code>.</li>
<li>From the extracted collection root run <code>node VERIFY_COLLECTION.mjs</code>. A clean copy reports <code>PASS_INITIAL_BYTES_ONLY</code>. A STOP requires correction before you edit. This command verifies bytes and declared boundaries; it does not complete a task for you.</li>
<li>Choose the seminar entry and its detailed tutorial. Complete every listed microproject individually. Edit only the declared learner targets. The starters intentionally contain incomplete implementations, so initial task checks can fail until you implement the specified behaviour.</li>
<li>After editing or installing the expressly declared dependencies, run <code>node VERIFY_COLLECTION.mjs --allow-student-edits</code> from the collection root. This admits only the declared learner targets and generated folders. Run the separate task checks and record their actual outputs; byte verification does not grade an implementation or inspect every dependency.</li>
<li>Open the seminar's current evidence form. For a new current-candidate record, copy that unit's current <code>PACKAGE_ID.txt</code>. An imported draft retains its saved identity and observations until you deliberately update and review them. Use JSON export as a private editable backup.</li>
<li>Review your observations and export one PDF named <code>TW2026_Sxx_GROUP_Surname_Firstname.pdf</code>. Replace the placeholders with your details. Reopen the saved PDF and inspect every page. The suggested filename does not control your browser's save dialogue. Keep private evidence in your own folder outside the extracted collection, for example a separate <code>STUDENT_EVIDENCE</code> folder.</li>
<li>Submit only to the actual Assignment authorised by the lecturer. Follow <a href="ASSESSMENT.html">the evidence and assessment guidance</a> for failed commands, unavailable AI access or blocked installations. Do not upload private evidence to GitHub.</li></ol>
<h2>Local application and browser work</h2><p>Node, Express, database, React and worker examples need their documented local execution environment. Opening a source HTML file or a reading profile does not start its server or bundler.</p>
<p>S02 rendered observations require its owned loopback server. From the S02 seminar package root run <code>node CLASSROOM_RC6/kit.mjs serve</code>. Use the actual origin printed by that server and append <code>/browser-checks.html</code>. Direct file access reports BLOCKED. Preserve the separate distinction between listed automatic observations and genuine manual keyboard or motion-preference evidence.</p>
<h2>Current identity and retained teaching sources</h2><p>The current local manifests describe this candidate's bytes. Preserved source versions, earlier descriptors and historical full applications remain labelled provenance or optional advanced references. They do not supply the current identity or qualify changed files.</p><p>The 60-minute schedule remains an unpiloted planning estimate.</p>'''+setup
    gate_rows = ''.join(f'<tr><th scope="row">{html.escape(_GATE_LABELS[name])}</th><td>{html.escape(str(gates[name]))}</td></tr>' for name in _GATE_LABELS)
    qualification = '<p><strong>General verdict: NOT_FINAL.</strong> This candidate records its build scope. Local consistency and named regression checks do not satisfy unrelated qualification gates.</p><table><caption>General qualification gates supplied by the candidate metadata</caption><thead><tr><th scope="col">Gate</th><th scope="col">Recorded state</th></tr></thead><tbody>'+gate_rows+'''</tbody></table>
<h2>What scoped verification can establish</h2><p>Use the exact candidate manifests, identities, derivation record and test receipts to assess the named source and logic checks. Each result belongs to its actual files, runtime and test fixtures. Retained historical evidence is limited to the earlier bytes and cases identified by its receipt.</p>
<p>DOM simulation can test record state, handlers and programmatic focus. It does not establish rendered CSS, native keyboard traversal, an assistive-technology announcement or the browser's PDF save behaviour. An initial byte-verification PASS does not establish learner-task correctness.</p>
<h2>Limits and private drafts</h2><p>Native Windows and macOS, real browser layouts, Microsoft Word and PDF layout, live Moodle, a genuine student pilot and owner acceptance remain governed by their recorded gate states. No success is inferred merely from packaging or local derivation. The retained 60-minute plan is unpiloted.</p>
<p>PACKAGE_ID identifies supplied-manifest bytes. Use a trusted source to authenticate the expected reference for that identity. An unsigned local manifest does not prove authorship, truthful observations, completed learning or a grade. Failed attempts remain failed. Incomplete or blocked evidence remains a private draft.</p>'''
    archive_name = metadata.get('candidate_archive_name', f'WEBTECH_ASE_EN_GB_CLASSROOM_v{version}.zip')
    if not isinstance(archive_name, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+\.zip', archive_name):
        raise ValueError('candidate_archive_name must be a plain ZIP filename')
    windows = f'''$candidateZip = '.\\{archive_name}'
$candidateExpected = (Get-Content -LiteralPath ($candidateZip + '.sha256') -Raw).Trim().Split(' ')[0]
if ($candidateExpected -notmatch '^[0-9a-fA-F]{{64}}$') {{ throw 'The supplied checksum is malformed.' }}
$candidateActual = (Get-FileHash -LiteralPath $candidateZip -Algorithm SHA256).Hash
if ($candidateActual.ToLowerInvariant() -ne $candidateExpected.ToLowerInvariant()) {{ throw 'Checksum mismatch. Stop before extracting.' }}
$candidateFolder = '.\\WebTech-local-candidate'
if (Test-Path -LiteralPath $candidateFolder) {{ throw 'Choose a new extraction folder.' }}
Expand-Archive -LiteralPath $candidateZip -DestinationPath $candidateFolder'''
    download = f'''<p>Obtain the matching <code>{html.escape(archive_name)}</code> and <code>{html.escape(archive_name)}.sha256</code> through the owner’s actual distribution route or the authorised course channel. When publication has occurred, use the owner’s publication receipt to identify the actual published bytes and compare their filenames and SHA-256 values. Build metadata records derivation, not publication or deployment. Published ancestor archives contain earlier bytes and are not a download route for this candidate.</p>
<h2>1. Check the received archive</h2><p>Put the ZIP and its checksum sidecar in the same folder. Compare the archive with the checksum supplied through the trusted course channel. A matching unsigned sidecar establishes consistency with that supplied value, not authorship by itself.</p>
<details><summary>Windows PowerShell: verify, then extract into a new folder</summary><pre><code>{html.escape(windows)}</code></pre></details>
<details><summary>macOS or Linux: verify the supplied SHA-256 sidecar</summary><p>From the folder containing both files, use the checksum tool provided by your operating system.</p><pre><code># macOS\nshasum -a 256 -c '{html.escape(archive_name)}.sha256'\n\n# Linux\nsha256sum --check '{html.escape(archive_name)}.sha256'</code></pre><p>Continue only if the actual check succeeds. Extract the complete archive into a new folder with your usual archive utility.</p></details>
<h2>2. Open the complete extracted copy</h2><p>Open <code>index.html</code>, then <a href="START_HERE.html">follow the setup and verification route</a>. Keep this candidate separate from predecessor folders. From the complete collection root run <code>node VERIFY_COLLECTION.mjs</code> before editing.</p>
<h2>3. Preserve the learner boundary</h2><p>Only {stats['targets']} declared learner targets may be edited. Run <code>node VERIFY_COLLECTION.mjs --allow-student-edits</code> after those edits and the separate task checks for actual learning outcomes. Keep private JSON/PDF evidence out of the source tree.</p>
<h2>If a step fails</h2><p>Preserve the filename, command and actual error. A checksum mismatch, missing complete collection or verifier STOP is a reason to correct the supplied copy before proceeding. Do not substitute an earlier published archive or an unrelated unit identity.</p>'''
    if profile == 'static':
        static_execution_scope = (f'<p class="notice"><strong>This static reading profile is for reading and navigation only.</strong> '
                                  f'All numbered verification, setup, learner task and local execution instructions on this page refer to '
                                  f'the matching <code>{html.escape(archive_name)}</code>, received with its checksum and extracted separately. '
                                  'Open the complete classroom archive\'s own <code>index.html</code> and run its commands from that classroom collection. '
                                  'The static reading profile supplies no execution or qualification acceptance.</p>')
        start = static_execution_scope + start
        download = static_execution_scope + download
    bodies = {
        'index.html': ('Web Technologies — local classroom candidate', overview),
        'START_HERE.html': ('Start the local classroom candidate', start),
        'QUALIFICATION.html': ('Local candidate qualification scope', qualification),
        'COURSE_PLAN.html': ('Fourteen-week local classroom route', overview),
        'ASSESSMENT.html': ('Evidence and assessment guidance', _assessment_content(originals)),
        'DOWNLOAD.html': ('Receive, verify and extract this local candidate', download),
        'DOWNLOAD_RC10.html': ('Local candidate archive guidance', '<p>This retained filename is a compatibility route. It provides the current local candidate instructions and does not redirect to a published ancestor archive.</p>'+download),
    }
    result = {path:_shell(title,body,version=version,profile=profile,history_path=history_receipt_path,core_identity=core_identity) for path,(title,body) in bodies.items()}
    profile_text = 'complete local candidate collection' if profile == 'core' else 'local static reading profile'
    command_root = ('fully extracted collection root' if profile == 'core' else
                    f'matching complete classroom archive\'s root, after separately extracting `{archive_name}`')
    provenance_md = '' if history_receipt_path is None else f'\nHistorical ancestor receipt: [{history_receipt_path}]({history_receipt_path}). It identifies earlier published bytes and supplies no current download or qualification claim.\n'
    result['README.md'] = f'''# Web Technologies — local candidate {version}

This is a **{profile_text}**, with general verdict **NOT_FINAL**. Build metadata records derivation, not deployment. When publication has occurred, use the owner’s publication receipt to identify the bytes actually published.

Start with [index.html](index.html), [setup and verification](START_HERE.html) and [the local archive guide](DOWNLOAD.html). The collection retains {stats['units']} units, {stats['tutorials']} detailed seminar tutorials, {stats['tasks']} required individual microprojects and {stats['targets']} learner target files. HTML is the primary route; {stats['word_references']} Word references remain optional.

The reference runtime is Node.js 24.21.0. From the {command_root} run `node VERIFY_COLLECTION.mjs` before editing and `node VERIFY_COLLECTION.mjs --allow-student-edits` after editing only declared targets or creating declared dependency/output folders. Task checks are separate. Starter implementations deliberately remain incomplete. S02 uses its documented owned loopback server; React, API, database and worker examples need their documented local environment.

Read [the course plan](COURSE_PLAN.html) and [assessment](ASSESSMENT.html). Complete every listed microproject individually. JSON is a private backup; the reviewed PDF goes only to the lecturer's actual authorised Assignment. Never commit private evidence. An imported draft retains its saved identity until it is deliberately reviewed and updated for this candidate.

Current byte identities are supplied by [PACKAGE_ID.txt](PACKAGE_ID.txt), current unit identity files and the manifests. Read [LOCAL_CANDIDATE_DERIVATION.json](LOCAL_CANDIDATE_DERIVATION.json), [LOCAL_DERIVATION_POLICY.json](LOCAL_DERIVATION_POLICY.json) and [CLASSROOM_COLLECTION.json](CLASSROOM_COLLECTION.json). Old source labels and explicitly historical descriptors remain provenance, not current byte identities.
{provenance_md}
Read [qualification](QUALIFICATION.html) for the exact general gate states. Scoped source and DOM regressions do not establish rendered accessibility, native installation, Word/PDF layout, live Moodle, a genuine student pilot or owner acceptance. The retained 60-minute plan remains unpiloted.
'''
    return result


render_candidate_pages = generate_candidate_pages


# Exact, fail-closed ENTRY identity and historical-provenance helpers.
import hashlib
import html
from html.parser import HTMLParser
import json
import posixpath
import re
import sys
from typing import Any, Mapping

_HASH = re.compile(r"^[a-f0-9]{64}$")
_NOTICE = re.compile(r'<p class="notice">.*?</p>', re.DOTALL)
_LINK = re.compile(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)


def _hash(value: Any, label: str) -> str:
    if not isinstance(value, str) or not _HASH.fullmatch(value):
        raise ValueError(f"{label} must be a lowercase SHA-256 string")
    return value


def _relative_path(value: Any, label: str) -> str:
    if (not isinstance(value, str) or not value or value.startswith("/")
            or "\\" in value or ":" in value or "?" in value or "#" in value
            or any(part in ("", ".", "..") for part in value.split("/"))):
        raise ValueError(f"{label} must be a safe collection-relative file path")
    return posixpath.relpath(value, "ENTRY")


def _single(source: str, old: str, new: str, label: str) -> str:
    if source.count(old) != 1:
        raise ValueError(f"Expected exactly one {label}")
    return source.replace(old, new, 1)


def _route_links(source: str) -> list[str]:
    return [html.unescape(match.group(1)) for match in _LINK.finditer(source)
            if not any(token in match.group(1) for token in
                       ("PACKAGE_ID.txt", "RC10_README.md", "RC10_DERIVATION.json"))]


def rebind_entry(source_text: str, object_id: str,
                 old_ids: Mapping[str, str], new_ids: Mapping[str, str],
                 metadata: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    """Rebind current identity while preserving instructional entry routes.

    Reject unexpected source shapes rather than using a broad RC10 or hash
    replacement. New descriptor files are the caller's responsibility.
    """
    if not isinstance(source_text, str) or not source_text:
        raise ValueError("source_text must be non-empty HTML text")
    if object_id not in old_ids or object_id not in new_ids:
        raise ValueError(f"Missing identity map entry for {object_id}")
    old_id = _hash(old_ids[object_id], "old unit identity")
    new_id = _hash(new_ids[object_id], "new unit identity")
    version = metadata.get("candidate_version")
    if not isinstance(version, str) or not version or "local" not in version:
        raise ValueError("candidate_version must explicitly identify a local candidate")
    if metadata.get("qualification_verdict", "NOT_FINAL") != "NOT_FINAL":
        raise ValueError("ENTRY rebinding cannot promote qualification")
    unit = metadata.get("units", {}).get(object_id)
    if not isinstance(unit, Mapping):
        raise ValueError(f"Missing units metadata for {object_id}")
    id_href = _relative_path(unit.get("package_id_path"), "package_id_path")
    readme_href = _relative_path(unit.get("candidate_readme_path"), "candidate_readme_path")
    derivation_href = _relative_path(unit.get("candidate_derivation_path"), "candidate_derivation_path")
    if len({id_href, readme_href, derivation_href}) != 3:
        raise ValueError("Current identity and two descriptor paths must be distinct")

    old_identity = f"<pre>{old_id}</pre>"
    new_identity = f'<pre data-identity-scope="current-local-candidate">{new_id}</pre>'
    result = _single(source_text, old_identity, new_identity, "displayed unit identity")
    identity_matches = [m for m in _LINK.finditer(result) if m.group(1).endswith("PACKAGE_ID.txt")]
    if len(identity_matches) != 1:
        raise ValueError("Expected exactly one current PACKAGE_ID.txt link")
    identity_link = identity_matches[0].group(0)
    result = _single(result, identity_link,
                     f'<a href="{html.escape(id_href, quote=True)}">Read this local unit PACKAGE_ID.txt</a>',
                     "current unit identity link")
    result = _single(result, "<h2>Package identity</h2>",
                     "<h2>Current local package identity</h2>", "identity heading")

    notices = _NOTICE.findall(result)
    if len(notices) != 1:
        raise ValueError("Expected exactly one ENTRY candidate notice")
    notice = (f'<p class="notice">Candidate {html.escape(version)}. '
              'General qualification remains NOT_FINAL. Build metadata records derivation, not deployment. When publication has occurred, use the owner’s publication receipt to identify the bytes actually published. Work individually and report actual observations. '
              'Published RC10 evidence applies only to the historical bytes for which it was recorded.</p>')
    result = _single(result, notices[0], notice, "candidate notice")

    historical_links = []
    for match in list(_LINK.finditer(result)):
        href = match.group(1)
        if href.endswith("/RC10_README.md"):
            label = "Read preserved historical RC10 provenance"
        elif href.endswith("/RC10_DERIVATION.json"):
            label = "Inspect the preserved historical RC10 derivation"
        else:
            continue
        result = _single(result, match.group(0),
                         f'<a href="{html.escape(html.unescape(href), quote=True)}">{label}</a>',
                         "historical provenance link")
        historical_links.append(html.unescape(href))

    local_scope = (f'<p id="local-candidate-identity-scope"><a href="{html.escape(readme_href, quote=True)}">'
                   'Read the current local candidate scope</a> · '
                   f'<a href="{html.escape(derivation_href, quote=True)}">Inspect the current local derivation</a>. '
                   'Use the current local unit identity above for this candidate. '
                   'Preserved RC10 identities describe earlier bytes and do not qualify these changes.</p>')
    result = _single(result, new_identity, new_identity + local_scope, "local identity insertion point")

    # Exclude the added current descriptor links when checking the original
    # instructional routes. Existing tutorial, form and package start links
    # must remain byte-identical href values in their original order.
    if _route_links(result.replace(local_scope, "", 1)) != _route_links(source_text):
        raise ValueError("An instructional ENTRY route changed unexpectedly")
    for tag in ("title", "h1"):
        pattern = re.compile(rf"<{tag}[^>]*>.*?</{tag}>", re.DOTALL)
        if pattern.findall(result) != pattern.findall(source_text):
            raise ValueError(f"The instructional {tag} changed unexpectedly")
    if old_id != new_id and old_id in result:
        raise ValueError("The old unit hash remains in a current ENTRY page")

    return result, {
        "schema": "webtech-local-entry-rebind/v1",
        "object_id": object_id,
        "candidate_version": version,
        "publication_status": "PUBLICATION_NOT_ASSERTED",
        "qualificationVerdict": "NOT_FINAL",
        "old_unit_package_id": old_id,
        "current_unit_package_id": new_id,
        "identity_changed": old_id != new_id,
        "current_package_id_href": id_href,
        "current_candidate_readme_href": readme_href,
        "current_candidate_derivation_href": derivation_href,
        "historical_provenance_hrefs": historical_links,
        "instructional_routes_preserved": True,
        "title_and_h1_preserved": True,
        "source_sha256": hashlib.sha256(source_text.encode("utf-8")).hexdigest(),
        "candidate_sha256": hashlib.sha256(result.encode("utf-8")).hexdigest(),
        "descriptor_existence_checked": False,
        "current_id_file_contents_checked": False,
        "source_or_candidate_files_written": False,
    }


class _RouteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[dict[str, Any]] = []
        self.table: dict[str, Any] | None = None
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "table":
            if self.table is not None:
                raise ValueError("Nested tables are not supported in route snapshots")
            self.table = {"rows": [], "entry_hrefs": []}
        elif self.table is not None:
            if tag == "tr":
                self.row = []
            elif tag in ("td", "th"):
                self.cell = []
            elif tag == "a" and (values.get("href") or "").startswith("ENTRY/"):
                self.table["entry_hrefs"].append(values["href"])

    def handle_data(self, data: str) -> None:
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in ("td", "th") and self.cell is not None:
            if self.row is not None:
                self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.table is not None:
                self.table["rows"].append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            if self.table["entry_hrefs"]:
                self.tables.append(self.table)
            self.table = None


def route_snapshot(source_text: str) -> list[dict[str, Any]]:
    """Capture table topics and ENTRY routes without publication notices."""
    parser = _RouteParser()
    parser.feed(source_text)
    parser.close()
    return parser.tables

