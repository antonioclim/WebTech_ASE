#!/usr/bin/env python3
"""Deterministically derive RC9 from authenticated immutable RC6/RC8 recipes.

No installation, network, publication or Actions dispatch occurs here. Original
carriers stay unchanged. Every changed unit has an explicit byte-level history.
"""
from __future__ import annotations
import argparse
import copy
import html
import json
import posixpath
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_successor as predecessor
import build_classroom_collection as common
import release_contract as rc
import rc9_code
import rc9_forms
import rc9_frontend_docs
import rc9_s02_browser

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import validate_pages_payload as pages

VERSION = '3.0.0-rc.9'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_CLASSROOM_RC9/'
TEMPLATE = '00_START_HERE/STUDENT_CLASSROOM_RC9'
POLICY = 'metadata/classroom-rc9-policy.json'
STATUS = 'FILTERED_CLASSROOM_PRERELEASE_NOT_FINAL'
SOURCE_COMMIT = predecessor.SOURCE_COMMIT
SOURCE_MATERIAL = predecessor.SOURCE_MATERIAL
encoded = common.encoded
page = common.page
link = common.link


def read_policy():
    expected = {
        'schema': 'webtech-classroom-rc9-policy/v1',
        'distribution_version': VERSION,
        'source_material_commit': SOURCE_COMMIT,
        'source_material_sha256': SOURCE_MATERIAL,
        'predecessor_recipe': '00_TOOLS/publishing/build_classroom_successor.py',
        'object_ids': sorted(rc.OBJECTS),
        'derived_courses': ['C07', 'C08', 'C09', 'C10', 'C14'],
        'derived_seminars': [f'S{i:02}' for i in range(1, 15)],
        'required_microprojects': 40,
        'editable_files': 38,
        'tutorials': 14,
        'optional_docx_references': 30,
        'source_policy': 'IMMUTABLE_INPUTS_EXPLICIT_DERIVATIVES_AND_HASH_HISTORY',
        'acceptance_policy': 'SCOPED_LOCAL_EVIDENCE_GENERAL_GATES_PENDING',
        'final_acceptance': False,
    }
    actual = rc.strict_json((ROOT / POLICY).read_bytes())
    if (not isinstance(actual, dict) or actual.get('final_acceptance') is not False
            or any(type(actual.get(key)) is not int for key in ('required_microprojects', 'editable_files', 'tutorials', 'optional_docx_references'))
            or actual != expected):
        raise ValueError('RC9 policy differs from the reviewed fixed scope')
    return actual


def reseal_classroom(files):
    """Refresh protected hashes without extending the learner edit allowlist."""
    prefix = 'CLASSROOM_RC6/'
    boundary_name = prefix + 'CLASSROOM_BOUNDARY.json'
    boundary = rc.strict_json(files[boundary_name])
    browser_name = 'BROWSER_CHECKS.html'
    if prefix + browser_name in files:
        boundary['protected'][browser_name] = rc.sha(files[prefix + browser_name])
    before_mutable = copy.deepcopy(boundary['mutable'])
    for name in boundary['protected']:
        boundary['protected'][name] = rc.sha(files[prefix + name])
    files[boundary_name] = encoded(boundary)
    source_name = prefix + 'SOURCE_MANIFEST.json'
    for name, digest in before_mutable.items():
        if rc.sha(files[prefix + name]) != digest:
            raise ValueError('RC9 must not supply completed student answers: ' + name)
    if source_name in files:
        source = rc.strict_json(files[source_name])
        if prefix + browser_name in files:
            source['protected'][browser_name] = rc.sha(files[prefix + browser_name])
        for name in source['protected']:
            source['protected'][name] = rc.sha(files[prefix + name])
        if source['targets'] != before_mutable:
            raise ValueError('Learner edit boundaries disagree')
        files[source_name] = encoded(source)
    return files


def changed_records(before, after):
    return [
        {'path': name, 'before_sha256': rc.sha(before[name]) if name in before else None,
         'after_sha256': rc.sha(after[name]) if name in after else None,
         'before_bytes': len(before[name]) if name in before else None,
         'after_bytes': len(after[name]) if name in after else None}
        for name in sorted(set(before) | set(after))
        if before.get(name) != after.get(name)
    ]


def rebind_course_index(ident, files):
    """Name current canonical bytes while retaining exact source-copy history."""
    name = 'CANONICAL_SOURCES.json'
    if ident not in ('C08', 'C09', 'C10', 'C14'):
        return files
    index = rc.strict_json(files[name])
    if not isinstance(index, dict) or not isinstance(index.get('files'), list):
        raise ValueError('Canonical provenance index structure differs')
    seen = set()
    changed = False
    for row in index['files']:
        key = 'public_path' if ident == 'C14' else 'path'
        path = row.get(key)
        if not isinstance(path, str) or path in seen or not path.startswith('canonical/') or path not in files:
            raise ValueError('Canonical provenance index inventory differs')
        seen.add(path)
        digest, length = rc.sha(files[path]), len(files[path])
        if row.get('sha256') != digest or row.get('bytes') != length:
            row['predecessor_sha256'] = row['sha256']
            row['predecessor_bytes'] = row['bytes']
            if 'mode' in row:
                row['predecessor_mode'] = row['mode']
            row.update(sha256=digest, bytes=length, mode='EXPLICIT_RC9_DERIVATIVE')
            changed = True
    if changed:
        index['distribution_version'] = VERSION
        index['source_reference_scope'] = 'Source-tree and source-path fields identify predecessor history. Changed rows explicitly bind current RC9 bytes and retain predecessor digests.'
        files[name] = encoded(index)
    return files


def derive_unit(item, original):
    ident = item['object_id']
    files = dict(original)
    if ident.startswith('C'):
        files = rc9_code.derive_course(ident, files)
        files = rc9_frontend_docs.derive(ident, files)
        files = rebind_course_index(ident, files)
    elif ident.startswith('S') and ident[1:].isdigit():
        files = rc9_code.derive_seminar(ident, files)
        if ident == 'S02':
            files = rc9_s02_browser.derive(files)
        name = 'CLASSROOM_RC6/EVIDENCE_FORM.html'
        files[name] = rc9_forms.derive_form(files[name], ident)
        # Editorial corrections are confined to reader guidance. The frozen
        # task contracts, source tests and incomplete learner targets stay exact.
        for name in ('CLASSROOM_RC6/START.html', 'CLASSROOM_RC6/GUIDE.html', 'CLASSROOM_RC6/README.md'):
            text = files[name].decode('utf-8')
            for before, after in (
                    ('Day 0setup', 'Day 0 setup'), ('threshold3', 'threshold 3'),
                    ('stringfalse', 'the string false'), ('Stringfalse', 'String false'),
                    ('andunknown-key', 'and unknown-key'), ('ownerAda', 'owner Ada'),
                    ('archivedfalse', 'archived false'), ('Rejectedquery', 'Rejected query'),
                    ('pre-DBcall', 'before the database call')):
                text = text.replace(before, after)
            if ident not in ('S06', 'S07'):
                warning = ' Built-in SQLite experiments emit a Node experimental-feature warning where applicable; that is neither a measurement result nor proof of another platform.'
                text = text.replace(warning, '')
            files[name] = text.encode('utf-8')
        # The tutorial complements rather than impersonates the frozen contract.
        for name in ('CLASSROOM_RC6/START.html', 'CLASSROOM_RC6/GUIDE.html'):
            text = files[name].decode('utf-8')
            target = posixpath.relpath('TUTORIALS/' + ident + '.html',
                                      posixpath.dirname(item['payload_root'] + name))
            banner = '<p class="notice">RC9 teaching companion: ' + link(target, 'open the detailed task-by-task tutorial') + '. The bounded RC6 task contract and editable target files remain the assignment. Record actual outcomes, including BLOCKED work.</p>'
            if '<body>' not in text:
                raise ValueError('Unexpected classroom HTML structure')
            files[name] = text.replace('<body>', '<body>' + banner, 1).encode()
        files = reseal_classroom(files)
    if files == original:
        return files, None
    files['RC9_README.md'] = (
        '# ' + ident + ' — current RC9 derivative\n\n'
        'This unit is an explicit RC9 derivative. The current identity is '
        '`PACKAGE_ID.txt` at this unit root; `RC9_DERIVATION.json` records its '
        'predecessor identity and changed bytes. Verify the whole extracted '
        'collection with `VERIFY_COLLECTION.mjs`.\n\n'
        'Older inner version strings, `DERIVED_CARRIER.json`, source notes and '
        'predecessor derivation JSON describe their named historical carriers. '
        'They do not claim that current RC9 bytes are unchanged. In C07, '
        '`C07_REGISTRY_DERIVATION_RC8.json` describes the RC8 registry correction; '
        'its unchanged-canonical assertion applies to that earlier correction, '
        'before the explicit RC9 README corrections.\n\n'
        'Use the current collection entry and detailed seminar tutorial for '
        'required work. Canonical dependency pins, lockfiles and learner target '
        'answers are not replaced by this derivation. The existing task-layout '
        'folder name is retained. A byte identity does not prove correctness, '
        'authorship, a native platform run or final acceptance.\n'
    ).encode()
    descriptor = {
        'schema': 'webtech-rc9-unit-derivation/v1', 'object_id': ident,
        'distribution_version': VERSION,
        'predecessor_distribution_version': predecessor.VERSION,
        'predecessor_package_id': item['package_id'],
        'source_material_commit': SOURCE_COMMIT,
        'source_material_sha256': SOURCE_MATERIAL,
        'changed_files_before_package_controls': changed_records(original, files),
        'source_recovery': 'Rebuild the immutable RC8 predecessor recipe from the repository. Original RC6 carriers and pinned source remain preserved.',
        'student_answers_supplied': False, 'final_acceptance': False,
    }
    files['RC9_DERIVATION.json'] = encoded(descriptor)
    files['SHA256SUMS.txt'] = rc.manifest(files, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    files['PACKAGE_ID.txt'] = (rc.sha(files['SHA256SUMS.txt']) + '\n').encode()
    return files, descriptor


def entry(item, topic):
    ident = item['object_id']
    relative = lambda target: '../' + target
    seminar = ident.startswith('S') and ident[1:].isdigit()
    content = '<p class="notice">RC9 filtered classroom prerelease. General qualification remains NOT_FINAL. Work individually and report actual observations.</p>'
    if seminar:
        content += '<ol><li>' + link('../TUTORIALS/' + ident + '.html', 'Follow the detailed tutorial for every required microproject') + '.</li><li>' + link(relative(item['start']), 'Read the bounded assignment contract') + '.</li><li>' + link(relative(item['form']), 'Complete your evidence form and export one reviewed PDF') + '.</li></ol>'
        content += '<p>The target files intentionally start with incomplete implementations. Initial task checks may fail; verification of unchanged protected files is a separate check. Complete all ' + str(len(item['projects'])) + ' listed projects. The 60-minute schedule remains unpiloted.</p>'
        if ident == 'S02':
            content += '<h2>Observe the actual CSS in a browser</h2><p>From this seminar package root run <code>node CLASSROOM_RC6/kit.mjs serve</code>. Use the actual loopback origin printed by that owned server and append <code>/browser-checks.html</code>. The ' + link(relative(item['payload_root'] + 'CLASSROOM_RC6/BROWSER_CHECKS.html'), 'browser observation page and instructions') + ' measure visible boxes and computed styles at the three required widths. Direct file access reports BLOCKED. Keyboard focus and reduced-motion evidence remain explicit manual observations. A source checklist PASS alone does not demonstrate usable rendered CSS.</p>'
    else:
        content += '<ol><li>' + link(relative(item['start']), 'Read the course or setup start') + '.</li><li>' + link(relative(item['guide']), 'Open the HTML presentation or guide') + '.</li></ol>'
    content += '<h2>Package identity</h2><p>' + link(relative(item['package_id_path']), 'Read this unit PACKAGE_ID.txt') + '. This is a byte identity, not a grade or evidence that the application ran.</p><pre>' + html.escape(item['package_id']) + '</pre>'
    if item.get('derivation'):
        content += '<p>' + link(relative(item['payload_root'] + 'RC9_README.md'), 'Read the current derivative and historical-identity scope') + ' · ' + link(relative(item['derivation']), 'Inspect the exact RC9 derivation') + '. Previous identities refer to previous bytes.</p>'
    content += '<p>From the fully extracted collection root, run <code>node VERIFY_COLLECTION.mjs</code> before editing, then <code>node VERIFY_COLLECTION.mjs --allow-student-edits</code> after editing only the declared learner files. Dependencies and generated outputs are excluded only where explicitly declared. Follow ' + link('../ASSESSMENT.html', 'the evidence and assessment guidance') + '.</p>'
    return page(ident + ' — ' + topic, content, '../index.html')


def build_payload(check_source=True):
    read_policy()
    source = predecessor.build_payload(check_source=check_source)
    old_meta = rc.strict_json(source['CLASSROOM_COLLECTION.json'])
    old_preserved = rc.strict_json(source['PRESERVED_SOURCE_FILES.json'])
    payload = dict(source)
    objects, derivations = [], []
    for old_item in old_meta['objects']:
        item = copy.deepcopy(old_item)
        prefix = item['payload_root']
        original = {name[len(prefix):]: data for name, data in source.items() if name.startswith(prefix)}
        derived, descriptor = derive_unit(item, original)
        for name in tuple(payload):
            if name.startswith(prefix):
                del payload[name]
        payload.update({prefix + name: data for name, data in derived.items()})
        if descriptor:
            item['package_id_path'] = prefix + 'PACKAGE_ID.txt'
            item['package_id'] = derived['PACKAGE_ID.txt'].decode().strip()
            item['distribution_carrier_version'] = VERSION
            item['preservation'] = 'EXPLICIT_RC9_DERIVATIVE_IMMUTABLE_PREDECESSOR'
            item['derivation'] = prefix + 'RC9_DERIVATION.json'
            item.pop('predecessor_files', None)
            derivations.append({'object_id': item['object_id'], 'descriptor': item['derivation'],
                                'changed_files': changed_records(original, derived)})
        objects.append(item)
    for name in ('SHA256SUMS.txt', 'PACKAGE_ID.txt', 'CLASSROOM_COLLECTION.json',
                 'PRESERVED_SOURCE_FILES.json', 'RC9_DERIVATIONS.json'):
        payload.pop(name, None)
    template_files = {name: path.read_bytes() for name, path in rc.tree_files(ROOT / TEMPLATE).items()}
    if {name for name in template_files if name.startswith('TUTORIALS/') and name.endswith('.html')} != {f'TUTORIALS/S{i:02}.html' for i in range(1, 15)}:
        raise ValueError('Exactly fourteen tutorials are required')
    payload.update(template_files)
    course_map = rc.strict_json(payload['course-map.json'])
    if course_map['distribution_version'] != VERSION or course_map['required_project_count'] != 40 or len(course_map['weeks']) != 14:
        raise ValueError('Course map differs from fixed classroom scope')
    weeks = {row['week']: row for row in course_map['weeks']}
    rows = []
    for item in objects:
        ident = item['object_id']
        topic = 'Windows setup' if ident == 'SETUP_WINDOWS' else 'macOS/Linux setup' if ident == 'SETUP_MACOS_LINUX' else weeks[int(ident[1:])]['course_topic' if ident.startswith('C') else 'seminar_topic']
        payload[item['entry']] = entry(item, topic)
        if ident.startswith('S') and ident[1:].isdigit():
            item['tutorial'] = 'TUTORIALS/' + ident + '.html'
    for number in range(1, 15):
        row = weeks[number]
        rows.append('<tr><td>' + str(number) + '</td><td>' + link(f'ENTRY/C{number:02}.html', row['course_topic']) + '</td><td>' + link(f'ENTRY/S{number:02}.html', row['seminar_topic']) + '</td></tr>')
    body = '<p class="notice">Filtered classroom prerelease ' + VERSION + '. Extract the complete archive. All forty bounded seminar microprojects are required individual work. The full historical applications are a separate optional advanced scope.</p><p>' + link('START_HERE.html', 'First-time setup and verification') + ' · ' + link('ASSESSMENT.html', 'Evidence and assessment') + ' · ' + link('QUALIFICATION.html', 'Verified scope and remaining limitations') + '</p><table><thead><tr><th>Week</th><th>Course topic</th><th>Individual seminar</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table><h2>Setup</h2><p>' + link('ENTRY/SETUP_WINDOWS.html', 'Windows setup') + ' · ' + link('ENTRY/SETUP_MACOS_LINUX.html', 'macOS/Linux setup') + '</p><p>HTML is the primary route. The thirty optional Word handouts remain reference material; no presentation slides or build dependencies are added to this archive.</p>'
    payload['index.html'] = page('Web Technologies — RC9 classroom collection', body, 'index.html')
    payload['COURSE_PLAN.html'] = page('Fourteen-week topics and classroom route', body, 'index.html')
    preserved = [record for record in old_preserved['files'] if payload.get(record['path']) == source[record['path']]]
    for item in objects:
        item['source_files_preserved'] = sum(record['path'].startswith(item['payload_root']) for record in preserved)
    payload['PRESERVED_SOURCE_FILES.json'] = encoded({'schema': 'webtech-preserved-classroom-source-files/v2', 'source_material_sha256': SOURCE_MATERIAL, 'files': preserved, 'changed_files': 'RC9_DERIVATIONS.json', 'claim': 'Only these listed original files retain exact source bytes. Changed files are explicit derivatives.'})
    payload['RC9_DERIVATIONS.json'] = encoded({'schema': 'webtech-rc9-derivations/v1', 'predecessor_recipe': '00_TOOLS/publishing/build_classroom_successor.py', 'objects': derivations})
    metadata = copy.deepcopy(old_meta)
    metadata.update({'distribution_version': VERSION, 'policy_sha256': rc.sha((ROOT / POLICY).read_bytes()), 'objects': objects, 'source_files_preserved': len(preserved), 'classroom_source_files_preserved': sum('/CLASSROOM_RC6/' in record['path'] for record in preserved), 'derived_objects': derivations, 'tutorials': 14, 'transfer_scope': 'Only listed unchanged source bytes retain previous scoped evidence. All RC9 forms, tutorials, code corrections, resealed controls and navigation require their own checks. Broad acceptance remains pending.'})
    payload['CLASSROOM_COLLECTION.json'] = encoded(metadata)
    pages.check_links(payload)
    rc.namespace([(name, False) for name in payload])
    payload['SHA256SUMS.txt'] = rc.manifest(payload)
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    return payload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip'); parser.add_argument('--site'); parser.add_argument('--report')
    args = parser.parse_args()
    if not args.zip and not args.site:
        raise ValueError('Choose ZIP or extracted-tree output')
    paths = [rc.output_path(value) for value in (args.zip, args.site, args.report) if value]
    if any(a == b or a.is_relative_to(b) or b.is_relative_to(a) for i, a in enumerate(paths) for b in paths[i + 1:]):
        raise ValueError('Overlapping outputs')
    payload = build_payload()
    outputs = []
    if args.zip:
        data = rc.zip_bytes(payload, COLLECTION_ROOT)
        rc.atomic_write(rc.output_path(args.zip), data)
        outputs.append({'path': args.zip, 'bytes': len(data), 'sha256': rc.sha(data)})
    if args.site:
        rc.write_tree(rc.output_path(args.site), payload)
        outputs.append({'path': args.site, 'files': len(payload)})
    report = encoded({'schema': 'webtech-classroom-rc9-build/v1', 'status': 'PASS_BUILD_ONLY', 'distribution_version': VERSION, 'files': len(payload), 'package_id': payload['PACKAGE_ID.txt'].decode().strip(), 'qualificationVerdict': 'NOT_FINAL', 'actionsStarted': False, 'outputs': outputs})
    if args.report:
        rc.atomic_write(rc.output_path(args.report), report)
    print(report.decode(), end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
