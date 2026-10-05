#!/usr/bin/env python3
"""Build RC8 from the frozen classroom selection with one explicit C07 derivative.

The RC6 carriers and RC7 recipe are read-only inputs. No dependency installation,
network request, publication or Actions operation occurs in this builder.
"""
from __future__ import annotations

import argparse
import html
import json
import posixpath
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_collection as predecessor
import c07_registry_derivative as c07
import release_contract as rc

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student
import validate_pages_payload as pages

VERSION = '3.0.0-rc.8'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_CLASSROOM_RC8/'
POLICY = 'metadata/classroom-successor-policy.json'
TEMPLATE = '00_START_HERE/STUDENT_CLASSROOM_RC8'
STATUS = 'FILTERED_CLASSROOM_PRERELEASE_NOT_FINAL'
SOURCE_COMMIT = predecessor.SOURCE_COMMIT
SOURCE_MATERIAL = predecessor.SOURCE_MATERIAL


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def read_policy():
    expected = {
        'schema': 'webtech-classroom-successor-policy/v1',
        'distribution_version': VERSION,
        'source_material_commit': SOURCE_COMMIT,
        'source_material_sha256': SOURCE_MATERIAL,
        'object_ids': sorted(rc.OBJECTS),
        'predecessor_recipe': '00_TOOLS/publishing/build_classroom_collection.py',
        'course_policy': 'THIRTEEN_WHOLE_AUTHENTIC_COURSES_UNCHANGED_AND_ONE_EXPLICIT_C07_DERIVATIVE',
        'setup_policy': 'WHOLE_AUTHENTIC_OBJECT_UNCHANGED',
        'seminar_policy': 'ALL_CLASSROOM_RC6_BYTES_UNCHANGED_WITH_EXPLICIT_REFERENCE_NOTICES',
        'derived_object_id': 'C07',
        'derived_carrier_version': '1.1.3-rc.8',
        'derived_payload_root': 'PACKAGES/C07/WEBTECH_ASE_C07_EN_GB_v1.1.3_RC8/',
        'permitted_registry_updates': 10,
        'registry_update_scope': 'DOCUMENTED_RC6_AFTER_HASHES_WITH_PREVIOUS_CARRIER_HASH_HISTORY',
        'runner_update_scope': 'VALIDATE_EXACT_CURRENT_REGISTRY_BEFORE_PREFLIGHT_OR_RUN_WITH_BUILD_AUTHENTICATED_HASH_HISTORY',
        'canonical_code_policy': 'ALL_CANONICAL_CODE_PACKAGE_PINS_AND_LOCKFILE_BYTES_UNCHANGED',
        'displaced_source_policy': 'FOUR_ORIGINAL_FILES_RETAINED_EXACTLY_UNDER_PREDECESSOR_RC6',
        'expected_preserved_source_files': 1156,
        'expected_classroom_source_files': 266,
        'expected_microprojects': 40,
        'expected_editable_files': 38,
        'expected_retained_docx': 30,
        'reference_notices': 'MANUAL_PINNED_SOURCE_LINK_AND_CURRENT_CLASSROOM_RETURN',
        'final_acceptance': False,
    }
    policy = rc.strict_json(rc.checked_path(ROOT, POLICY).read_bytes())
    if not isinstance(policy, dict) or policy != expected:
        raise ValueError('Classroom successor policy differs from the reviewed policy')
    return policy


def map_source_path(name):
    """Retain every authenticated original byte, including displaced C07 controls."""
    if not name.startswith(c07.OLD_PREFIX):
        return name
    relative = name[len(c07.OLD_PREFIX):]
    if relative in c07.DISPLACED:
        relative = 'PREDECESSOR_RC6/' + relative
    return c07.NEW_PREFIX + relative


def preserved_records(original_records):
    result = []
    for item in original_records:
        record = dict(item)
        record['path'] = map_source_path(item['path'])
        if item['path'].startswith(c07.OLD_PREFIX):
            record['source_path'] = item['path']
        result.append(record)
    return sorted(result, key=lambda item: item['path'])


def c07_entry(source_object, derived_files):
    link = predecessor.link
    prefix = c07.NEW_PREFIX
    package_id = derived_files['PACKAGE_ID.txt'].decode().strip()
    content = '<p class="notice">This is the explicit C07 carrier 1.1.3-rc.8. It corrects ten stale source-registry hashes and strengthens the source-registry guard. The documented hash history is authenticated during construction. The canonical JavaScript, dependency pins and lockfile bytes remain unchanged. Other course units retain their authenticated RC6 bytes.</p>'
    content += '<ol><li>' + link('../' + prefix + source_object['student_start'], 'Read the C07 start instructions') + '.</li><li>' + link('../' + prefix + source_object['student_guide'], 'Open the course presentation') + '.</li><li>' + link('../' + prefix + c07.DESCRIPTOR_PATH, 'Inspect the exact derivation and retained predecessor files') + '.</li></ol>'
    content += '<h2>Current package identity</h2><p>Use the current ' + link('../' + prefix + 'PACKAGE_ID.txt', 'PACKAGE_ID.txt') + ' for this derivative. The predecessor package identity is historical provenance.</p><pre>' + html.escape(package_id) + '</pre>'
    content += '<h2>Optional canonical examples</h2><p>Follow the original course preparation instructions. A clean source-boundary result does not install dependencies or prove that an example ran. Inspect the preflight JSON: <code>ready</code> must be <code>true</code> and source-boundary errors must be empty before claiming readiness. An exit code of zero alone is insufficient.</p>'
    content += '<p>Finite source checks do not certify full database execution, native Windows/macOS behaviour, Word layout, live Moodle or a student pilot. This carrier and the collection retain the general verdict <code>NOT_FINAL</code>.</p>'
    return predecessor.page('C07 — corrected course carrier', content, '../index.html')


def build_payload(check_source=True):
    read_policy()
    # This original recipe authenticates the unchanged RC6 corpus before filtering.
    payload = predecessor.build_payload(check_source=check_source)
    old_metadata = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    original_preserved = rc.strict_json(payload['PRESERVED_SOURCE_FILES.json'])
    source_object = next(item for item in student.read_registry()['objects'] if item['object_id'] == 'C07')
    source_files = {name[len(c07.OLD_PREFIX):]: data for name, data in payload.items() if name.startswith(c07.OLD_PREFIX)}
    derived_files = c07.derive(source_files, source_object)
    for name in tuple(payload):
        if name.startswith(c07.OLD_PREFIX):
            del payload[name]
    for name, data in derived_files.items():
        target = c07.NEW_PREFIX + name
        if target in payload:
            raise ValueError('Derived C07 path collision: ' + target)
        payload[target] = data

    old_template_names = set(rc.tree_files(ROOT / predecessor.TEMPLATE))
    new_template = {name: path.read_bytes() for name, path in rc.tree_files(ROOT / TEMPLATE).items()}
    if set(new_template) != old_template_names:
        raise ValueError('Successor root template must replace exactly the six predecessor controls')
    payload.update(new_template)
    for name in ('index.html', 'COURSE_PLAN.html'):
        text = payload[name].decode().replace(predecessor.VERSION, VERSION)
        paragraph = '<p>Thirteen course units and both setup units retain their original complete bytes and identities. C07 has one explicitly documented corrected carrier, with a new identity and all displaced original files retained as provenance. All fourteen seminar classroom contracts retain their RC6 bytes.</p>'
        payload[name] = text.replace('<h2>Setup</h2>', paragraph + '<h2>Setup</h2>').encode()
    for name in payload:
        if name.startswith('ENTRY/S') and name.endswith('.html'):
            text = payload[name].decode()
            text = text.replace('The course and seminar teaching units retain their original inner versions; this archive is the new filtered RC7 wrapper.', 'The seminar classroom contracts retain their RC6 bytes. Thirteen courses and both setup units are unchanged; C07 is an explicit corrected derivative. This archive is the new filtered RC8 wrapper.')
            payload[name] = text.encode()

    records = preserved_records(original_preserved['files'])
    if len(records) != 1156 or len({item['path'] for item in records}) != 1156:
        raise ValueError('Successor preserved-source inventory differs')
    for record in records:
        data = payload.get(record['path'])
        if not isinstance(data, bytes) or len(data) != record['bytes'] or rc.sha(data) != record['sha256']:
            raise ValueError('Original authenticated source byte lost: ' + record['path'])
    payload['PRESERVED_SOURCE_FILES.json'] = encoded({
        'schema': 'webtech-preserved-classroom-source-files/v1',
        'source_material_sha256': SOURCE_MATERIAL,
        'relocation_policy': 'C07_DERIVATIVE_ROOT_AND_FOUR_EXACT_PREDECESSOR_FILES',
        'files': records,
    })
    metadata = dict(old_metadata)
    metadata['distribution_version'] = VERSION
    metadata['policy_sha256'] = rc.sha((ROOT / POLICY).read_bytes())
    metadata['generated_directories'] = sorted(c07.NEW_PREFIX + name[len(c07.OLD_PREFIX):] if name.startswith(c07.OLD_PREFIX) else name for name in metadata['generated_directories'])
    for item in metadata['objects']:
        if item['object_id'] != 'C07':
            continue
        for key in ('payload_root', 'start', 'guide', 'package_id_path'):
            item[key] = c07.NEW_PREFIX + item[key][len(c07.OLD_PREFIX):]
        if item['form'] is not None:
            item['form'] = c07.NEW_PREFIX + item['form'][len(c07.OLD_PREFIX):]
        item['package_id'] = derived_files['PACKAGE_ID.txt'].decode().strip()
        item['distribution_carrier_version'] = c07.VERSION
        item['preservation'] = 'EXPLICIT_C07_DERIVATIVE_ALL_ORIGINAL_BYTES_RETAINED'
        item['derivation'] = c07.NEW_PREFIX + c07.DESCRIPTOR_PATH
        item['predecessor_files'] = [c07.NEW_PREFIX + 'PREDECESSOR_RC6/' + name for name in c07.DISPLACED]
        payload[item['entry']] = c07_entry(source_object, derived_files)
    metadata['derived_objects'] = [{
        'object_id': 'C07',
        'distribution_carrier_version': c07.VERSION,
        'descriptor': c07.NEW_PREFIX + c07.DESCRIPTOR_PATH,
        'descriptor_sha256': rc.sha(derived_files[c07.DESCRIPTOR_PATH]),
        'source_files_preserved': len(source_files),
    }]
    metadata['transfer_scope'] = 'All authenticated RC6 source bytes remain available, including four displaced C07 controls under PREDECESSOR_RC6. The fourteen unchanged classroom contracts retain only their previous bounded evidence. The C07 registry/runner derivative, RC8 wrapper and identities require their own scoped checks; no dependency execution, native platform or final acceptance is transferred by byte preservation.'
    payload['CLASSROOM_COLLECTION.json'] = encoded(metadata)
    for key in ('SHA256SUMS.txt', 'PACKAGE_ID.txt'):
        del payload[key]
    pages.check_links(payload)
    rc.namespace([(name, False) for name in payload])
    payload['SHA256SUMS.txt'] = rc.manifest(payload)
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    return payload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip')
    parser.add_argument('--site')
    parser.add_argument('--report')
    args = parser.parse_args()
    if not args.zip and not args.site:
        raise ValueError('Choose ZIP or extracted-tree output')
    paths = [rc.output_path(value) for value in (args.zip, args.site, args.report) if value]
    if any(a == b or a.is_relative_to(b) or b.is_relative_to(a) for i, a in enumerate(paths) for b in paths[i + 1:]):
        raise ValueError('Overlapping output paths')
    payload = build_payload()
    report = {'schema': 'webtech-classroom-successor-build/v1', 'status': 'PASS_SCOPED_BUILD_ONLY', 'files': len(payload), 'distribution_version': VERSION, 'package_id': payload['PACKAGE_ID.txt'].decode().strip(), 'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False, 'outputs': []}
    if args.zip:
        output = rc.output_path(args.zip)
        data = rc.zip_bytes(payload, COLLECTION_ROOT)
        rc.atomic_write(output, data)
        report['outputs'].append({'path': str(output), 'bytes': len(data), 'sha256': rc.sha(data)})
    if args.site:
        output = rc.output_path(args.site)
        rc.write_tree(output, payload)
        report['outputs'].append({'path': str(output), 'files': len(payload)})
    data = encoded(report)
    if args.report:
        rc.atomic_write(rc.output_path(args.report), data)
    print(data.decode(), end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
