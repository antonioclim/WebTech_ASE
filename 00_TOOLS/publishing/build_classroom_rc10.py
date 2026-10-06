#!/usr/bin/env python3
"""Derive the instruction-remediated RC10 candidate from exact published RC9 bytes.

No network, installation, publication or Actions operation occurs here. The
published predecessor is authenticated as a complete deterministic archive
before any documentary change. Runtime code and unfinished learner targets
are preserved. The two Day 0 form interfaces are explicit new derivatives.
"""
from __future__ import annotations
import argparse
import copy
import io
import json
import re
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_rc9 as predecessor
import release_contract as rc
import rc10_course_docs
import rc10_setup_docs
import rc10_day0_form

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import validate_pages_payload as pages

VERSION = '3.0.0-rc.10'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_CLASSROOM_RC10/'
POLICY = 'metadata/classroom-rc10-policy.json'
STATUS = 'DOCUMENTARY_CLASSROOM_CANDIDATE_NOT_FINAL'
SOURCE_COMMIT = predecessor.SOURCE_COMMIT
SOURCE_MATERIAL = predecessor.SOURCE_MATERIAL
PREDECESSOR_SOURCE = 'bf310e6a6f9ed9750d1cb0dac987fbd5a08401cc4751cbe956cc9e7eb32163a7'
PREDECESSOR_ID = 'c8be1c0dfaa3dfb56ca8c7868d961654859f1e87ebb35b8511e0ea4773e77dd7'
PREDECESSOR_ZIP = 'fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee'
encoded = predecessor.encoded
changed_records = predecessor.changed_records


def read_policy():
    expected = {
        'schema': 'webtech-classroom-rc10-policy/v1', 'distribution_version': VERSION,
        'predecessor_distribution_version': predecessor.VERSION,
        'predecessor_tag_commit': '60d8f8b86eec812a79db92860dd6d13f16d91f5f',
        'predecessor_source_identity': PREDECESSOR_SOURCE,
        'predecessor_collection_package_id': PREDECESSOR_ID,
        'predecessor_zip_sha256': PREDECESSOR_ZIP,
        'source_material_commit': SOURCE_COMMIT, 'source_material_sha256': SOURCE_MATERIAL,
        'object_ids': sorted(rc.OBJECTS), 'required_microprojects': 40,
        'editable_files': 38, 'tutorials': 14, 'optional_docx_references': 30,
        'source_policy': 'EXACT_AUTHENTICATED_PUBLISHED_RC9_BEFORE_DOCUMENTARY_DERIVATION',
        'runtime_policy': 'UNCHANGED_CODE_TESTS_DEPENDENCY_PINS_AND_LEARNER_ANSWERS',
        'docx_policy': 'THIRTY_PATHS_RETAINED_ONLY_DOCUMENT_XML_TEXT_DERIVATIVES',
        'acceptance_policy': 'SCOPED_DOCUMENTARY_AND_FORM_CHECKS_TEN_BROAD_GATES_PENDING',
        'final_acceptance': False,
    }
    actual = rc.strict_json((ROOT / POLICY).read_bytes())
    if (actual != expected or actual.get('final_acceptance') is not False
            or any(type(actual.get(k)) is not int for k in
                   ('required_microprojects', 'editable_files', 'tutorials', 'optional_docx_references'))):
        raise ValueError('RC10 policy differs from the fixed reviewed scope')
    return actual


def seal(files, manifest='SHA256SUMS.txt', identity='PACKAGE_ID.txt', include_identity=False):
    files[identity] = (rc.sha(rc.manifest(files, (manifest, identity))) + '\n').encode()
    files[manifest] = rc.manifest(files, (manifest,) if include_identity else (manifest, identity))
    return files


def authenticated_predecessor(check_source=True):
    """Rebind only the historical source receipt, then authenticate the whole ZIP."""
    source = predecessor.build_payload(check_source=check_source)
    meta = rc.strict_json(source['CLASSROOM_COLLECTION.json'])
    meta['repository_package_id'] = PREDECESSOR_SOURCE
    source['CLASSROOM_COLLECTION.json'] = encoded(meta)
    seal(source)
    if (source['PACKAGE_ID.txt'] != (PREDECESSOR_ID + '\n').encode()
            or rc.sha(rc.zip_bytes(source, predecessor.COLLECTION_ROOT)) != PREDECESSOR_ZIP):
        raise ValueError('Complete published RC9 authentication failed')
    return source


def _assert_documentary(before, after, ident):
    if set(before) - set(after):
        raise ValueError('RC10 cannot delete predecessor files: ' + ident)
    controls = {'SHA256SUMS.txt', 'PACKAGE_ID.txt', '06_AUDIT/SHA256SUMS.txt',
                '06_AUDIT/PACKAGE_ID.txt', 'CLASSROOM_RC6/CLASSROOM_BOUNDARY.json',
                'CLASSROOM_RC6/SOURCE_MANIFEST.json'}
    for name in before:
        if before[name] == after[name] or name in controls:
            continue
        if name.endswith('.docx'):
            with zipfile.ZipFile(io.BytesIO(before[name])) as a, zipfile.ZipFile(io.BytesIO(after[name])) as b:
                if a.namelist() != b.namelist() or any(a.read(n) != b.read(n)
                        for n in a.namelist() if n != 'word/document.xml'):
                    raise ValueError('Word derivative changed a non-document part: ' + name)
        elif name.endswith('.html'):
            if ident.startswith('SETUP_') and name == '11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html':
                if after[name] != rc10_day0_form.derive(before[name], ident):
                    raise ValueError('Day 0 form is not the authenticated derivative')
            elif ident.startswith('SETUP_') and name == 'index.html':
                # The new setup reading page has an explicit presentation-only
                # stylesheet. It contains no executable scripts or runtime probe.
                if re.search(r'<script\b', after[name].decode(), re.I):
                    raise ValueError('Setup reading page cannot add executable code')
            else:
                for tag in ('script', 'style'):
                    pattern = r'<' + tag + r'\b[^>]*>[\s\S]*?</' + tag + r'\s*>'
                    if re.findall(pattern, before[name].decode(), re.I) != re.findall(pattern, after[name].decode(), re.I):
                        raise ValueError('Embedded executable or style changed: ' + name)
        elif not name.endswith(('.md', '.txt')):
            raise ValueError('Runtime, dependency or contract bytes changed: ' + ident + '/' + name)
    for name in set(after) - set(before):
        if name not in controls and not name.endswith(('.md', '.html')) and name != 'RC10_DERIVATION.json':
            raise ValueError('Unexpected new unit file: ' + name)


def derive_unit(item, original, seminar_item=None):
    ident = item['object_id']
    files = dict(original)
    reasons = {}
    if re.fullmatch(r'C\d{2}', ident):
        files = rc10_course_docs.derive(ident, files, item, seminar_item)
        reasons = rc10_course_docs.editorial_reasons(ident)
    elif ident.startswith('SETUP_'):
        files = rc10_setup_docs.derive(ident, files, item)
        form = '11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html'
        files[form] = rc10_day0_form.derive(original[form], ident)
    elif re.fullmatch(r'S\d{2}', ident):
        for name in ('CLASSROOM_RC6/START.html', 'CLASSROOM_RC6/GUIDE.html', 'CLASSROOM_RC6/README.md'):
            files[name] = files[name].replace(b'Install dependencies', b'Prepare the runtime and install only dependencies required for this route')
        if files != original:
            files = predecessor.reseal_classroom(files)
    if files == original:
        return files, None
    identity = '06_AUDIT/PACKAGE_ID.txt' if ident == 'C02' else 'PACKAGE_ID.txt'
    files['RC10_README.md'] = (
        '# ' + ident + ' — current RC10 documentary derivative\n\n'
        'The current unit identity is `' + identity + '`. Verify the complete extracted '
        'collection with `node VERIFY_COLLECTION.mjs`. `RC10_DERIVATION.json` and '
        'the collection `RC10_DERIVATIONS.json` bind predecessor and current bytes.\n\n'
        'Older RC6, RC8 and RC9 descriptors, inner version labels and source-copy indices '
        'remain historical provenance for their named bytes. Their unchanged-file claims '
        'do not cover subsequent RC10 explanatory edits. C02 canonical HTML, CSS and '
        'JavaScript stay exact while its example README instructions are derivatives.\n\n'
        'Use the current collection entry and seminar tutorial for required individual '
        'work. Runtime code, tests, dependency locks, project contracts and incomplete '
        'learner answers remain unchanged. Word references change only document text. '
        'Day 0 forms are explicit new interfaces and distinguish incomplete private '
        'drafts from completed evidence. Completion can contain actual FAILED attempts; '
        'it does not prove readiness or a grade. Broad acceptance remains NOT_FINAL.\n'
    ).encode()
    descriptor = {
        'schema': 'webtech-rc10-unit-derivation/v1', 'object_id': ident,
        'distribution_version': VERSION, 'predecessor_distribution_version': predecessor.VERSION,
        'predecessor_package_id': item['package_id'], 'predecessor_zip_sha256': PREDECESSOR_ZIP,
        'changed_files_before_package_controls': changed_records(original, files),
        'editorial_reasons': reasons,
        'source_recovery': 'Rebuild and authenticate the complete published RC9 archive before derivation.',
        'student_answers_supplied': False, 'final_acceptance': False,
    }
    files['RC10_DERIVATION.json'] = encoded(descriptor)
    if ident == 'C02':
        seal(files, '06_AUDIT/SHA256SUMS.txt', identity, True)
    else:
        seal(files)
    _assert_documentary(original, files, ident)
    return files, descriptor


def global_documents(source, objects):
    payload = {}
    original_verifier = source['VERIFY_COLLECTION.mjs']
    if original_verifier.count(b"'3.0.0-rc.9'") != 1:
        raise ValueError('Authenticated collection verifier version anchor differs')
    # This is a new distribution control, not course/runtime implementation.
    # Preserve every integrity operation and rebind its single version literal.
    payload['VERIFY_COLLECTION.mjs'] = original_verifier.replace(b"'3.0.0-rc.9'", ("'" + VERSION + "'").encode(), 1)
    # Global delivery pages are new explanatory bytes. Tutorials and verification
    # programs remain exact, with their named RC9 history explained here.
    for name in ('START_HERE.html', 'ASSESSMENT.html', 'QUALIFICATION.html'):
        text = source[name].decode().replace('RC9', 'RC10')
        text = text.replace('RC10 is a filtered classroom prerelease.', 'RC10 is a documentary classroom candidate, prepared and not published.')
        text = re.sub(r'<p>C07, C08, C09, C10, C14.*?</p>',
            '<p>C02–C14 and both setup routes contain explicit RC10 documentary derivatives. '
            'C01 and unchanged task/code files retain exact predecessor bytes. New unit '
            'identities describe current bytes; historical descriptors remain provenance.</p>', text)
        text = text.replace('Thirty Word files remain optional references.',
                            'Thirty Word paths remain optional references; 26 documents have explicit text derivatives.')
        payload[name] = text.encode()
    payload['QUALIFICATION.html'] = predecessor.page('RC10 qualification scope',
        '<p class="notice">General verdict: NOT_FINAL. All ten broad qualification gates remain pending. '
        'RC10 is a prepared documentary candidate and publication is a separate owner action.</p>'
        '<p>Scoped checks cover exact published RC9 reconstruction, deterministic documentary derivation, '
        'collection and unit manifests, unchanged runtime and learner boundaries, local links, Word XML '
        'and new Day 0 form states. Form interaction tests use a local Linux Firefox environment; the '
        'native print/save dialogue is not exercised. No new saved PDF, native installation or genuine '
        'AI exchange is inferred.</p><p>Earlier bounded runtime evidence applies only to the exact '
        'unchanged files and named cases. New documentary text, forms and controls do not inherit '
        'predecessor acceptance. The retained fourteen RC9 tutorials explain the same required tasks.</p>'
        '<p>Native Windows and macOS, manual browser use, Microsoft Word layout, live Moodle, a genuine '
        'cohort pilot and final owner acceptance remain unverified. The 60-minute schedule is unpiloted.</p>'
        '<p>PACKAGE_ID proves supplied-manifest byte consistency. A reviewed source or trusted published '
        'checksum supplies the external reference. Neither the form nor an unsigned local manifest '
        'proves authorship, truthful results, successful readiness or a grade. Completed evidence can '
        'include actual FAILED attempts. Incomplete or blocked records remain private drafts.</p>', 'index.html')
    assessment = payload['ASSESSMENT.html'].decode()
    assessment = assessment.replace('<h2>Evidence formats</h2>',
        '<h2>Day 0 evidence scope</h2><p>The setup form distinguishes incomplete private drafts from '
        'completed evidence based on actual attempts and the required genuine AI audit. A FAILED '
        'attempt remains failed and does not demonstrate readiness. Save missing or blocked work '
        'honestly; completed export does not create a grade or an institutional exemption.</p><h2>Evidence formats</h2>')
    payload['ASSESSMENT.html'] = assessment.encode()
    weeks = rc.strict_json(source['course-map.json'])
    weeks['distribution_version'] = VERSION
    payload['course-map.json'] = encoded(weeks)
    rows = []
    topics = {w['week']: w for w in weeks['weeks']}
    for item in objects:
        ident = item['object_id']
        topic = ('Windows setup' if ident == 'SETUP_WINDOWS' else 'macOS/Linux setup'
                 if ident == 'SETUP_MACOS_LINUX' else topics[int(ident[1:])]
                 ['course_topic' if ident.startswith('C') else 'seminar_topic'])
        page = predecessor.entry(item, topic).decode().replace('RC9 filtered classroom prerelease', 'RC10 documentary classroom candidate')
        page = page.replace('RC9_README.md', 'RC10_README.md').replace('exact RC9 derivation', 'exact RC10 derivation') if item.get('distribution_carrier_version') == VERSION else page
        page = page.replace('current derivative and historical-identity scope', 'current derivative and historical-identity scope')
        payload[item['entry']] = page.encode()
    for number in range(1, 15):
        row = topics[number]
        rows.append('<tr><td>' + str(number) + '</td><td>' + predecessor.link(f'ENTRY/C{number:02}.html', row['course_topic']) + '</td><td>' + predecessor.link(f'ENTRY/S{number:02}.html', row['seminar_topic']) + '</td></tr>')
    body = ('<p class="notice">RC10 documentary candidate ' + VERSION + ', prepared locally and not published. '
            'General qualification remains NOT_FINAL. All forty bounded microprojects are required individual work.</p><p>'
            + predecessor.link('START_HERE.html', 'First-time setup and verification') + ' · '
            + predecessor.link('ASSESSMENT.html', 'Evidence and assessment') + ' · '
            + predecessor.link('QUALIFICATION.html', 'Qualification scope')
            + '</p><table><thead><tr><th>Week</th><th>Course topic</th><th>Individual seminar</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table><h2>Setup</h2><p>'
            + predecessor.link('ENTRY/SETUP_WINDOWS.html', 'Windows setup') + ' · '
            + predecessor.link('ENTRY/SETUP_MACOS_LINUX.html', 'macOS/Linux setup')
            + '</p><p>HTML is the primary route. Thirty optional Word paths remain. The fourteen '
            'seminar tutorials retain their authentic RC9 content and the same bounded tasks. '
            'Locally labelled historical full applications are optional advanced references.</p>')
    payload['index.html'] = predecessor.page('Web Technologies — RC10 classroom candidate', body, 'index.html')
    payload['COURSE_PLAN.html'] = predecessor.page('Fourteen-week current classroom route', body, 'index.html')
    payload['README.md'] = (
        '# RC10 classroom candidate — prepared, not published\n\n'
        'Extract this complete archive and open [index.html](index.html). Read '
        '[START_HERE.html](START_HERE.html) before editing. Run `node VERIFY_COLLECTION.mjs` '
        'from this extracted collection root; expect `PASS_INITIAL_BYTES_ONLY`. After '
        'changing only declared learner targets use `node VERIFY_COLLECTION.mjs --allow-student-edits`. '
        'Task checks are separate and incomplete starters can fail them.\n\n'
        'The current published predecessor is [RC9](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9). '
        'This successor authenticates its complete original ZIP before explicit documentary derivation. '
        'This is a student delivery archive; repository builder commands are not student prerequisites.\n\n'
        'Thirty source units, forty required individual microprojects, 38 editable files, fourteen '
        'HTML tutorials and thirty optional Word paths remain. Runtime code, test contracts, '
        'dependency pins and unfinished learner targets are unchanged. Course handoffs name '
        'current tasks and locally label historical full applications. Day 0 instructions '
        'provide preparation and recovery routes; forms support honest blocked or incomplete '
        'private drafts and completed evidence from actual attempts.\n\n'
        'RC10_DERIVATIONS.json records changed bytes and PRESERVED_RC9_FILES.json names '
        'exact predecessor bytes. Older descriptors and RC9 tutorial headings retain their '
        'historical provenance. Ten broad qualification gates remain pending, the 60-minute '
        'plan is unpiloted and native Word, PDF, Moodle and owner acceptance are unqualified. '
        'Keep evidence private and use only the lecturer’s actual authorised Assignment.\n'
    ).encode()
    return payload


def build_payload(check_source=True):
    read_policy()
    source_id = rc.source_identity(ROOT) if check_source else (ROOT / 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt').read_text().strip()
    source = authenticated_predecessor(check_source)
    old = rc.strict_json(source['CLASSROOM_COLLECTION.json'])
    by_id = {i['object_id']: i for i in old['objects']}
    payload, objects, derivations = dict(source), [], []
    for old_item in old['objects']:
        item = copy.deepcopy(old_item)
        prefix, ident = item['payload_root'], item['object_id']
        original = {n[len(prefix):]: d for n, d in source.items() if n.startswith(prefix)}
        seminar = by_id.get('S' + ident[1:]) if re.fullmatch(r'C\d{2}', ident) else None
        files, descriptor = derive_unit(item, original, seminar)
        payload.update({prefix + n: d for n, d in files.items()})
        if descriptor:
            ipath = '06_AUDIT/PACKAGE_ID.txt' if ident == 'C02' else 'PACKAGE_ID.txt'
            item.update(package_id_path=prefix + ipath, package_id=files[ipath].decode().strip(),
                        distribution_carrier_version=VERSION,
                        preservation='EXPLICIT_RC10_DOCUMENTARY_DERIVATIVE_AUTHENTICATED_RC9',
                        derivation=prefix + 'RC10_DERIVATION.json')
            derivations.append({'object_id': ident, 'descriptor': item['derivation'],
                                'changed_files': changed_records(original, files)})
        objects.append(item)
    payload.update(global_documents(source, objects))
    preserved = [r for r in rc.strict_json(source['PRESERVED_SOURCE_FILES.json'])['files'] if payload.get(r['path']) == source[r['path']]]
    for item in objects:
        item['source_files_preserved'] = sum(r['path'].startswith(item['payload_root']) for r in preserved)
    payload['PRESERVED_SOURCE_FILES.json'] = encoded({'schema': 'webtech-preserved-classroom-source-files/v2',
        'source_material_sha256': SOURCE_MATERIAL, 'files': preserved, 'changed_files': 'RC10_DERIVATIONS.json',
        'claim': 'Only listed original source files retain exact bytes. Documentary changes are explicit derivatives.'})
    # Capture only actual unchanged published files, including preserved historical
    # descriptors. Newly generated root controls are intentionally omitted.
    preserved_rc9 = [{'path': n, 'sha256': rc.sha(d), 'bytes': len(d)} for n, d in sorted(source.items())
                     if n not in ('SHA256SUMS.txt', 'PACKAGE_ID.txt', 'CLASSROOM_COLLECTION.json') and payload.get(n) == d]
    payload['PRESERVED_RC9_FILES.json'] = encoded({'schema': 'webtech-preserved-rc9-files/v1',
        'predecessor_zip_sha256': PREDECESSOR_ZIP, 'files': preserved_rc9})
    payload['RC10_DERIVATIONS.json'] = encoded({'schema': 'webtech-rc10-derivations/v1',
        'predecessor_zip_sha256': PREDECESSOR_ZIP, 'predecessor_package_id': PREDECESSOR_ID,
        'objects': derivations, 'historical_descriptors': 'RC9_DERIVATIONS.json'})
    meta = copy.deepcopy(old)
    meta.update(distribution_version=VERSION, status=STATUS, repository_package_id=source_id,
                policy_sha256=rc.sha((ROOT / POLICY).read_bytes()), objects=objects,
                source_files_preserved=len(preserved), derived_objects=derivations,
                classroom_source_files_preserved=sum('/CLASSROOM_RC6/' in r['path'] for r in preserved),
                predecessor_zip_sha256=PREDECESSOR_ZIP, predecessor_package_id=PREDECESSOR_ID,
                transfer_scope='Only exact listed predecessor bytes retain their earlier bounded evidence. New documentary pages, Word text, forms and controls require scoped checks. Broad gates remain pending.')
    payload['CLASSROOM_COLLECTION.json'] = encoded(meta)
    payload['RC10_COLLECTION_DERIVATION.json'] = encoded(collection_derivation(source, payload))
    seal(payload)
    validate_scope(payload, source)
    if check_source and rc.source_identity(ROOT) != source_id:
        raise ValueError('Source changed during RC10 construction')
    return payload


def collection_derivation(source, payload):
    controls = {'SHA256SUMS.txt', 'PACKAGE_ID.txt', 'RC10_COLLECTION_DERIVATION.json'}
    before = {n: d for n, d in source.items() if not n.startswith('PACKAGES/') and n not in controls}
    after = {n: d for n, d in payload.items() if not n.startswith('PACKAGES/') and n not in controls}
    return {'schema': 'webtech-rc10-collection-derivation/v1',
            'predecessor_zip_sha256': PREDECESSOR_ZIP, 'predecessor_package_id': PREDECESSOR_ID,
            'changed_files_before_collection_controls': changed_records(before, after),
            'verification_control_scope': 'VERIFY_COLLECTION.mjs changes only its single distribution-version literal. Every integrity operation remains exact. Course, seminar and dependency runtime code remain unchanged.',
            'student_answers_supplied': False, 'final_acceptance': False}


def validate_scope(payload, source=None):
    source = authenticated_predecessor(False) if source is None else source
    rc.namespace([(n, False) for n in payload])
    if payload.get('SHA256SUMS.txt') != rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')) or payload.get('PACKAGE_ID.txt') != (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode():
        raise ValueError('Collection exact manifest or identity differs')
    meta = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    fixed = {'schema': 'webtech-classroom-collection/v1', 'status': STATUS, 'distribution_version': VERSION,
             'required_microprojects': 40, 'tutorials': 14, 'optional_docx_references': 30,
             'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False, 'publication_qualified': False,
             'qualificationGates': {n: 'pending' for n in rc.GATES},
             'predecessor_zip_sha256': PREDECESSOR_ZIP, 'predecessor_package_id': PREDECESSOR_ID}
    if any(meta.get(k) != v for k, v in fixed.items()) or meta.get('native_acceptance') is not False or meta.get('publication_qualified') is not False:
        raise ValueError('Current scope or real false qualification differs')
    if any(type(meta.get(k)) is not int for k in ('required_microprojects', 'tutorials', 'optional_docx_references')):
        raise ValueError('Scope counts require integers')
    if meta.get('repository_package_id') != (ROOT / 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt').read_text().strip() or meta.get('policy_sha256') != rc.sha((ROOT / POLICY).read_bytes()):
        raise ValueError('Current source or policy identity differs')
    old_items = {i['object_id']: i for i in rc.strict_json(source['CLASSROOM_COLLECTION.json'])['objects']}
    items = meta['objects']
    if len(items) != 30 or {i['object_id'] for i in items} != rc.OBJECTS:
        raise ValueError('Exactly thirty distinct units required')
    edits, count, actual_derivations = set(), 0, []
    for item in items:
        ident, prefix = item['object_id'], item['payload_root']
        if prefix != old_items[ident]['payload_root']:
            raise ValueError('Unit path moved')
        for key in ('entry', 'start', 'guide', 'form', 'tutorial'):
            if item.get(key) != old_items[ident].get(key):
                raise ValueError('Current route differs from authenticated unit: ' + ident + '/' + key)
        for key in ('entry', 'start', 'guide', 'package_id_path'):
            if item.get(key) not in payload:
                raise ValueError('Missing actual unit route: ' + ident + '/' + key)
        before = {n[len(prefix):]: d for n, d in source.items() if n.startswith(prefix)}
        unit = {n[len(prefix):]: d for n, d in payload.items() if n.startswith(prefix)}
        _assert_documentary(before, unit, ident)
        seminar = old_items.get('S' + ident[1:]) if re.fullmatch(r'C\d{2}', ident) else None
        expected_unit, _ = derive_unit(old_items[ident], before, seminar)
        if unit != expected_unit:
            raise ValueError('Unit differs from the explicit authenticated documentary recipe: ' + ident)
        if payload[item['package_id_path']] != (item['package_id'] + '\n').encode():
            raise ValueError('Unit identity binding differs')
        expected_identity_path = prefix + ('06_AUDIT/PACKAGE_ID.txt' if ident == 'C02' else 'PACKAGE_ID.txt') if item.get('distribution_carrier_version') == VERSION else old_items[ident]['package_id_path']
        if item['package_id_path'] != expected_identity_path:
            raise ValueError('Unit identity route differs')
        if item.get('distribution_carrier_version') == VERSION:
            mn, pn, include = ('06_AUDIT/SHA256SUMS.txt', '06_AUDIT/PACKAGE_ID.txt', True) if ident == 'C02' else ('SHA256SUMS.txt', 'PACKAGE_ID.txt', False)
            if unit[pn] != (rc.sha(rc.manifest(unit, (mn, pn))) + '\n').encode() or unit[mn] != rc.manifest(unit, (mn,) if include else (mn, pn)):
                raise ValueError('Derived unit controls differ')
            desc = rc.strict_json(unit['RC10_DERIVATION.json'])
            without = {n: d for n, d in unit.items() if n != 'RC10_DERIVATION.json'}
            for name in (mn, pn):
                without[name] = before[name] if name in before else b''
                if name not in before:
                    del without[name]
            if (desc['changed_files_before_package_controls'] != changed_records(before, without)
                    or desc['predecessor_package_id'] != old_items[ident]['package_id']
                    or desc['student_answers_supplied'] is not False or desc['final_acceptance'] is not False):
                raise ValueError('Unit exact derivation history differs')
            actual_derivations.append({'object_id': ident, 'descriptor': item['derivation'], 'changed_files': changed_records(before, unit)})
        elif unit != before:
            raise ValueError('Changed unit lacks a current derivation')
        if re.fullmatch(r'S\d{2}', ident):
            scope = rc.strict_json(unit['CLASSROOM_RC6/CLASSROOM_SCOPE.json'])
            if item['projects'] != old_items[ident]['projects'] or scope['projects'] != item['projects']:
                raise ValueError('Required project contracts changed')
            count += len(item['projects'])
            edits.update(prefix + p['editable_path'] for p in item['projects'])
            if item.get('tutorial') != 'TUTORIALS/' + ident + '.html' or payload[item['tutorial']] != source[item['tutorial']]:
                raise ValueError('Tutorial scope changed')
    if count != 40 or len(edits) != 38 or meta['editable_files'] != sorted(edits):
        raise ValueError('Exact forty projects and 38 edit targets required')
    if {n for n in payload if n.endswith('.docx')} != {n for n in source if n.endswith('.docx')}:
        raise ValueError('Thirty Word paths must be retained')
    deriv = rc.strict_json(payload['RC10_DERIVATIONS.json'])
    if deriv != {'schema': 'webtech-rc10-derivations/v1', 'predecessor_zip_sha256': PREDECESSOR_ZIP,
                 'predecessor_package_id': PREDECESSOR_ID, 'objects': actual_derivations,
                 'historical_descriptors': 'RC9_DERIVATIONS.json'} or meta['derived_objects'] != actual_derivations:
        raise ValueError('Collection derivation history differs')
    for index in ('PRESERVED_SOURCE_FILES.json', 'PRESERVED_RC9_FILES.json'):
        records = rc.strict_json(payload[index])['files']
        if len({r['path'] for r in records}) != len(records):
            raise ValueError('Duplicate preserved file')
        for r in records:
            if payload.get(r['path']) != source.get(r['path']) or rc.sha(payload[r['path']]) != r['sha256'] or len(payload[r['path']]) != r['bytes']:
                raise ValueError('Preserved exact bytes differ')
    original_preserved = rc.strict_json(source['PRESERVED_SOURCE_FILES.json'])['files']
    expected = [r for r in original_preserved if payload.get(r['path']) == source[r['path']]]
    if rc.strict_json(payload['PRESERVED_SOURCE_FILES.json'])['files'] != expected or type(meta.get('source_files_preserved')) is not int or meta['source_files_preserved'] != len(expected):
        raise ValueError('Exact original preservation inventory differs')
    if type(meta.get('classroom_source_files_preserved')) is not int or meta.get('classroom_source_files_preserved') != sum('/CLASSROOM_RC6/' in r['path'] for r in expected):
        raise ValueError('Classroom original preservation count differs')
    for item in items:
        if type(item.get('source_files_preserved')) is not int or item.get('source_files_preserved') != sum(r['path'].startswith(item['payload_root']) for r in expected):
            raise ValueError('Unit original preservation count differs')
    expected_rc9 = [{'path': n, 'sha256': rc.sha(d), 'bytes': len(d)} for n, d in sorted(source.items())
                    if n not in ('SHA256SUMS.txt', 'PACKAGE_ID.txt', 'CLASSROOM_COLLECTION.json') and payload.get(n) == d]
    if rc.strict_json(payload['PRESERVED_RC9_FILES.json']) != {'schema': 'webtech-preserved-rc9-files/v1',
            'predecessor_zip_sha256': PREDECESSOR_ZIP, 'files': expected_rc9}:
        raise ValueError('Exact published predecessor preservation inventory differs')
    for name in ('VERIFY_COLLECTION.sh', 'VERIFY_COLLECTION.cmd', 'RC9_DERIVATIONS.json'):
        if payload.get(name) != source[name]:
            raise ValueError('Historical or executable collection file changed: ' + name)
    globals_expected = global_documents(source, items)
    for name, data in globals_expected.items():
        if payload.get(name) != data:
            raise ValueError('Current delivery document differs: ' + name)
    if rc.strict_json(payload['RC10_COLLECTION_DERIVATION.json']) != collection_derivation(source, payload):
        raise ValueError('Exact global derivation history differs')
    new_roots = {'RC10_DERIVATIONS.json', 'PRESERVED_RC9_FILES.json', 'RC10_COLLECTION_DERIVATION.json'}
    if set(payload) - set(source) - new_roots - set(globals_expected) - {n for n in payload if n.startswith('PACKAGES/')}:
        raise ValueError('Unexpected collection file')
    current_roots = {'SHA256SUMS.txt', 'PACKAGE_ID.txt', 'CLASSROOM_COLLECTION.json', 'PRESERVED_SOURCE_FILES.json'}
    for name, data in source.items():
        if not name.startswith('PACKAGES/') and name not in set(globals_expected) | current_roots and payload.get(name) != data:
            raise ValueError('Preserved collection root file changed: ' + name)
    return pages.check_links(payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip'); parser.add_argument('--site'); parser.add_argument('--report')
    args = parser.parse_args()
    if not args.zip and not args.site:
        raise ValueError('Choose ZIP or extracted-tree output')
    paths = [rc.output_path(v) for v in (args.zip, args.site, args.report) if v]
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
    report = encoded({'schema': 'webtech-classroom-rc10-build/v1', 'status': 'PASS_BUILD_ONLY',
        'distribution_version': VERSION, 'files': len(payload), 'package_id': payload['PACKAGE_ID.txt'].decode().strip(),
        'qualificationVerdict': 'NOT_FINAL', 'actionsStarted': False, 'outputs': outputs})
    if args.report:
        rc.atomic_write(rc.output_path(args.report), report)
    print(report.decode(), end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, UnicodeError, zipfile.BadZipFile) as error:
        raise SystemExit('STOP: ' + str(error))
