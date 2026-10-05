#!/usr/bin/env python3
"""Resolve one explicitly scoped classroom prerelease; never publish from Python.

RC6 source bytes and historical identities are preserved. This resolver admits
only a new RC8 wrapper and explicit C07 derivative, exact closure and three assets.
It has no final-release mode, no network operations and no Actions dispatch.
"""
from __future__ import annotations

import argparse
import json
import posixpath
import re
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_successor as classroom_builder
import c07_registry_derivative as c07
import release_contract as rc

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student
import validate_pages_payload as pages

PLAN = '90_RELEASES/CLASSROOM_SUCCESSOR_RELEASE_PLAN.json'
POLICY = 'metadata/classroom-successor-policy.json'
VERSION = '3.0.0-rc.8'
ARCHIVE = 'WEBTECH_ASE_EN_GB_CLASSROOM_v' + VERSION + '.zip'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_CLASSROOM_RC8/'
TAG = 'classroom-en-gb-v' + VERSION
NOTES = '90_RELEASES/NOTES_CLASSROOM_RC8.md'
MATERIAL_SHA256 = '5c9d9a2aa07fe0eccc03239940a1cfbd895d07b906c9b99cfcd5188e4d464ec4'
MATERIAL_COMMIT = 'cab9751b6af7ddc6d73961e7768db7c300c72434'
STATUS = 'FILTERED_CLASSROOM_PRERELEASE_NOT_FINAL'
PLAN_KEYS = {
    'schema', 'distribution_version', 'source_material_commit',
    'original_material_sha256', 'registry', 'registry_sha256', 'policy',
    'policy_sha256', 'status', 'draft', 'prerelease', 'required_gates',
    'gates', 'collection_root', 'tag', 'notes', 'object_ids', 'archive'
}


def read_plan(path=PLAN):
    if path != PLAN:
        raise ValueError('Use the authoritative classroom release plan')
    plan = rc.strict_json(rc.checked_path(ROOT, path).read_bytes())
    if not isinstance(plan, dict) or set(plan) != PLAN_KEYS:
        raise ValueError('Classroom plan fields differ')
    expected = {
        'schema': 'webtech-classroom-successor-release-plan/v1',
        'distribution_version': VERSION,
        'source_material_commit': MATERIAL_COMMIT,
        'original_material_sha256': MATERIAL_SHA256,
        'registry': 'metadata/student-selection.json',
        'policy': POLICY,
        'status': 'candidate',
        'collection_root': COLLECTION_ROOT,
        'tag': TAG, 'notes': NOTES, 'archive': ARCHIVE
    }
    if any(plan.get(key) != value for key, value in expected.items()):
        raise ValueError('Classroom candidate identity, provenance or paths differ')
    if plan['draft'] is not True or plan['prerelease'] is not True:
        raise ValueError('Only a draft prerelease is permitted')
    if plan['registry_sha256'] != rc.sha(student.REGISTRY.read_bytes()):
        raise ValueError('Source registry binding differs')
    if plan['policy_sha256'] != rc.sha(rc.checked_path(ROOT, POLICY).read_bytes()):
        raise ValueError('Filter policy binding differs')
    classroom_builder.read_policy()
    if plan['object_ids'] != sorted(rc.OBJECTS):
        raise ValueError('Exactly the thirty source-object identifiers are required')
    if plan['required_gates'] != list(rc.GATES):
        raise ValueError('All ten broad qualification gates remain declared')
    gates = plan['gates']
    if not isinstance(gates, dict) or set(gates) != set(rc.GATES):
        raise ValueError('Qualification gate inventory differs')
    for gate, value in gates.items():
        if (not isinstance(value, dict) or set(value) != {'status', 'scope'}
                or value['status'] != 'pending'
                or not isinstance(value['scope'], str) or not value['scope'].strip()):
            raise ValueError('Broad qualification gate must remain pending: ' + gate)
    notes = rc.checked_path(ROOT, NOTES)
    if not notes.is_file() or not notes.read_text(encoding='utf-8').strip():
        raise ValueError('English classroom prerelease notes are absent')
    return plan


def validate_scope(embedded, payload):
    """Reconcile advertised scope with the actual retained files and unit controls."""
    gates = embedded.get('qualificationGates')
    if (not isinstance(gates, dict) or set(gates) != set(rc.GATES)
            or any(value != 'pending' for value in gates.values())):
        raise ValueError('Every broad qualification gate must remain pending')
    for field, expected in (('required_microprojects', 40),
                            ('classroom_source_files_preserved', 266),
                            ('source_files_preserved', 1156),
                            ('optional_docx_references', 30)):
        if type(embedded.get(field)) is not int or embedded[field] != expected:
            raise ValueError('Reviewed classroom count differs: ' + field)
    objects = embedded['objects']
    selected = {item['object_id']: item for item in student.read_registry()['objects']}
    if (not isinstance(objects, list) or len(objects) != 30
            or not all(isinstance(item, dict) for item in objects)
            or {item.get('object_id') for item in objects} != rc.OBJECTS):
        raise ValueError('Actual source-object inventory differs')
    expected_edits, classroom_roots, project_count = set(), [], 0
    for item in objects:
        ident = item['object_id']
        original = selected[ident]
        prefix = c07.NEW_PREFIX if ident == 'C07' else original['collection_payload_root']
        if item.get('payload_root') != prefix:
            raise ValueError('Classroom object root differs: ' + ident)
        for field, original_field in (('source_package_id', 'package_id'),
                                      ('source_archive_sha256', 'archive_sha256'),
                                      ('source_carrier_version', 'carrier_version')):
            if item.get(field) != original[original_field]:
                raise ValueError('Source carrier provenance differs: ' + ident + '/' + field)
        for field in ('entry', 'start', 'guide', 'package_id_path'):
            name = item.get(field)
            if not isinstance(name, str) or name not in payload:
                raise ValueError('Classroom object route/control absent: ' + ident + '/' + field)
        if (item.get('form') is not None
                and (not isinstance(item['form'], str) or item['form'] not in payload)):
            raise ValueError('Classroom object form is absent: ' + ident)
        value = item.get('package_id')
        if (not isinstance(value, str) or not re.fullmatch('[0-9a-f]{64}', value)
                or payload[item['package_id_path']] != (value + '\n').encode()):
            raise ValueError('Classroom object PACKAGE_ID binding differs: ' + ident)
        seminar = bool(re.fullmatch(r'S\d{2}', ident))
        preservation = ('EXPLICIT_C07_DERIVATIVE_ALL_ORIGINAL_BYTES_RETAINED'
                        if ident == 'C07' else 'CLASSROOM_SUBSET_NEW_IDENTITY'
                        if seminar else 'WHOLE_OBJECT_EXACT_BYTES_ORIGINAL_IDENTITY')
        if item.get('preservation') != preservation:
            raise ValueError('Actual source preservation declaration differs: ' + ident)
        if ident == 'C07':
            if (item.get('distribution_carrier_version') != c07.VERSION
                    or item.get('derivation') != c07.NEW_PREFIX + c07.DESCRIPTOR_PATH
                    or item.get('predecessor_files') != [c07.NEW_PREFIX + 'PREDECESSOR_RC6/' + name for name in c07.DISPLACED]):
                raise ValueError('Derived C07 declaration differs')
        if ident.startswith('S') and re.fullmatch(r'S\d{2}', ident):
            classroom_roots.append(prefix + 'CLASSROOM_RC6/')
            scope_name = prefix + 'CLASSROOM_RC6/CLASSROOM_SCOPE.json'
            if scope_name not in payload:
                raise ValueError('Retained classroom contract is absent: ' + ident)
            scope = rc.strict_json(payload[scope_name])
            projects = scope.get('projects') if isinstance(scope, dict) else None
            if (not isinstance(scope, dict) or scope.get('seminar') != ident
                    or not isinstance(projects, list)
                    or len(projects) not in (2, 3)
                    or not all(isinstance(project, dict) for project in projects)
                    or item.get('projects') != projects):
                raise ValueError('Classroom microproject scope differs: ' + ident)
            project_count += len(projects)
            for project in projects:
                relative = project.get('editable_path')
                if (not isinstance(relative, str)
                        or not re.fullmatch(r'CLASSROOM_RC6/(targets|student)/(p\d{2}\.mjs|styles\.css)', relative)):
                    raise ValueError('Editable path is outside the classroom target contract')
                name = prefix + relative
                if name not in payload:
                    raise ValueError('Editable classroom source is absent: ' + name)
                expected_edits.add(name)
    edits = embedded.get('editable_files')
    if (not isinstance(edits, list) or not all(isinstance(name, str) for name in edits)
            or edits != sorted(expected_edits) or len(edits) != 38
            or project_count != 40):
        raise ValueError('Actual classroom project/editable inventory differs')
    if sum(name.lower().endswith('.docx') for name in payload) != 30:
        raise ValueError('Actual optional Word reference inventory differs')
    descriptor = rc.strict_json(payload.get('PRESERVED_SOURCE_FILES.json', b'{}'))
    records = descriptor.get('files') if isinstance(descriptor, dict) else None
    if (not isinstance(descriptor, dict)
            or descriptor.get('schema') != 'webtech-preserved-classroom-source-files/v1'
            or descriptor.get('source_material_sha256') != MATERIAL_SHA256
            or descriptor.get('relocation_policy') != 'C07_DERIVATIVE_ROOT_AND_FOUR_EXACT_PREDECESSOR_FILES'
            or not isinstance(records, list) or len(records) != 1156
            or not all(isinstance(record, dict) for record in records)):
        raise ValueError('Preserved-source descriptor scope differs')
    names = []
    for record in records:
        name = record.get('path')
        if (not isinstance(name, str) or name not in payload
                or type(record.get('bytes')) is not int
                or record['bytes'] != len(payload[name])
                or record.get('sha256') != rc.sha(payload[name])):
            raise ValueError('Preserved-source descriptor differs from actual payload')
        names.append(name)
    if (names != sorted(set(names))
            or sum(any(name.startswith(prefix) for prefix in classroom_roots) for name in names) != 266):
        raise ValueError('Preserved classroom source inventory/order differs')
    # Reconstruct authenticated predecessor bytes independently of the supplied
    # preservation descriptor. A self-consistent forged descriptor is insufficient.
    predecessor = classroom_builder.predecessor.build_payload(check_source=False)
    predecessor_descriptor = rc.strict_json(predecessor['PRESERVED_SOURCE_FILES.json'])
    if records != classroom_builder.preserved_records(predecessor_descriptor['files']):
        raise ValueError('Preserved source records differ from the authenticated original selection')
    original_c07 = {name[len(c07.OLD_PREFIX):]: data for name, data in predecessor.items() if name.startswith(c07.OLD_PREFIX)}
    expected_c07 = c07.derive(original_c07, selected['C07'])
    actual_c07 = {name[len(c07.NEW_PREFIX):]: data for name, data in payload.items() if name.startswith(c07.NEW_PREFIX)}
    if actual_c07 != expected_c07:
        raise ValueError('Derived C07 differs from the exact reviewed transformation')
    if any(name.startswith(c07.OLD_PREFIX) for name in payload):
        raise ValueError('Obsolete C07 root remains in successor payload')
    derived = embedded.get('derived_objects')
    expected_derivation = [{'object_id': 'C07',
                           'distribution_carrier_version': c07.VERSION,
                           'descriptor': c07.NEW_PREFIX + c07.DESCRIPTOR_PATH,
                           'descriptor_sha256': rc.sha(expected_c07[c07.DESCRIPTOR_PATH]),
                           'source_files_preserved': len(original_c07)}]
    if derived != expected_derivation:
        raise ValueError('Embedded C07 derivation binding differs')
    for item in objects:
        count = sum(name.startswith(item['payload_root']) for name in names)
        if type(item.get('source_files_preserved')) is not int or item['source_files_preserved'] != count:
            raise ValueError('Per-object preserved-source count differs: ' + item['object_id'])
    expected_dirs = {'STUDENT_EVIDENCE'}
    for name in payload:
        if name.endswith('/package.json'):
            parent = posixpath.dirname(name)
            expected_dirs.add(parent + '/node_modules')
            package = rc.strict_json(payload[name])
            scripts = package.get('scripts', {}) if isinstance(package, dict) else None
            if not isinstance(scripts, dict):
                raise ValueError('Preserved package scripts are malformed: ' + name)
            if any(isinstance(value, str)
                   and re.search(r'(?:^|[\s;&|])vite(?:[\s;&|]|$)', value)
                   for value in scripts.values()):
                expected_dirs.update({parent + '/dist', parent + '/.vite'})
    directories = embedded.get('generated_directories')
    if (not isinstance(directories, list)
            or not all(isinstance(name, str) for name in directories)
            or directories != sorted(expected_dirs)):
        raise ValueError('Generated-directory allowance differs from actual application roots')
    rc.namespace([(name, False) for name in payload]
                 + [(name, True) for name in directories])


def expected_collection(plan):
    source_id = rc.source_identity(ROOT)
    registry_bytes = student.REGISTRY.read_bytes()
    policy_bytes = rc.checked_path(ROOT, POLICY).read_bytes()
    if read_plan() != plan:
        raise ValueError('Plan changed while preparing classroom release')
    if (classroom_builder.VERSION != VERSION
            or classroom_builder.COLLECTION_ROOT != COLLECTION_ROOT):
        raise ValueError('Classroom builder identity differs')
    payload = classroom_builder.build_payload(check_source=True)
    if (not isinstance(payload, dict) or not payload
            or not all(isinstance(name, str) and isinstance(data, bytes)
                       for name, data in payload.items())):
        raise ValueError('Malformed classroom payload')
    rc.namespace([(name, False) for name in payload])
    if not {'index.html', 'CLASSROOM_COLLECTION.json', 'SHA256SUMS.txt', 'PACKAGE_ID.txt'} <= set(payload):
        raise ValueError('Classroom entry point or metadata is absent')
    if payload['SHA256SUMS.txt'] != rc.manifest(payload, {'SHA256SUMS.txt', 'PACKAGE_ID.txt'}):
        raise ValueError('Classroom manifest does not cover the exact payload')
    if payload['PACKAGE_ID.txt'] != (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode():
        raise ValueError('Classroom wrapper PACKAGE_ID differs from its manifest')
    embedded = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    expected = {
        'schema': 'webtech-classroom-collection/v1',
        'status': STATUS, 'distribution_version': VERSION,
        'source_material_sha256': MATERIAL_SHA256,
        'policy_sha256': rc.sha(policy_bytes),
        'selection_registry_sha256': rc.sha(registry_bytes),
        'repository_package_id': source_id,
        'qualificationVerdict': 'NOT_FINAL'
    }
    if not isinstance(embedded, dict) or any(embedded.get(k) != v for k, v in expected.items()):
        raise ValueError('Embedded classroom identity or source/filter binding differs')
    if (embedded.get('native_acceptance') is not False
            or embedded.get('publication_qualified') is not False):
        raise ValueError('Classroom candidate must not claim final acceptance')
    objects = embedded.get('objects')
    if (not isinstance(objects, list) or len(objects) != 30
            or not all(isinstance(item, dict) for item in objects)
            or {item.get('object_id') for item in objects} != rc.OBJECTS):
        raise ValueError('Embedded classroom source-object inventory differs')
    validate_scope(embedded, payload)
    navigation = pages.check_links(payload)
    archive = rc.zip_bytes(payload, COLLECTION_ROOT)
    members = rc.zip_members(archive, normalized_modes=True)
    if members != {COLLECTION_ROOT + name: data for name, data in payload.items()}:
        raise ValueError('Classroom archive payload differs')
    if (rc.source_identity(ROOT) != source_id
            or student.REGISTRY.read_bytes() != registry_bytes
            or rc.checked_path(ROOT, POLICY).read_bytes() != policy_bytes
            or read_plan() != plan):
        raise ValueError('Source, policy, registry or plan changed during build')
    sidecar_name = ARCHIVE + '.sha256'
    assets = {ARCHIVE: archive,
              sidecar_name: (rc.sha(archive) + '  ' + ARCHIVE + '\n').encode()}
    assets['SHA256SUMS.txt'] = rc.manifest(assets)
    return assets, source_id, rc.sha(registry_bytes), rc.sha(policy_bytes), len(payload), navigation


def resolve(asset_dir, preview=False, build=False, plan_path=PLAN):
    if type(preview) is not bool or type(build) is not bool:
        raise ValueError('Preview and build must be real booleans')
    if not preview:
        raise ValueError('Explicit classroom preview required; no final-release mode exists')
    plan = read_plan(plan_path)
    out = rc.output_path(asset_dir, ROOT)
    if any(character in str(out) for character in '\r\n'):
        raise ValueError('Output path injection')
    assets, source_id, registry_sha, policy_sha, payload_count, navigation = expected_collection(plan)
    if out.exists() and set(rc.tree_files(out)) - set(assets):
        raise ValueError('Publish directory contains undeclared files')
    for name, data in assets.items():
        rc.validate_destination(out / name, data)
    if build:
        for name, data in assets.items():
            rc.atomic_write(out / name, data)
    actual = rc.tree_files(out)
    if set(actual) != set(assets):
        raise ValueError('Publish directory must contain exactly the three declared assets')
    for name, data in assets.items():
        if actual[name].read_bytes() != data:
            raise ValueError('Exact classroom release asset differs: ' + name)
    fields = {
        'tag': TAG, 'title': 'Web Technologies filtered classroom prerelease ' + VERSION,
        'notes': NOTES, 'archive': str(out / ARCHIVE),
        'sidecar': str(out / (ARCHIVE + '.sha256')),
        'checksums': str(out / 'SHA256SUMS.txt'),
        'draft': 'true', 'prerelease': 'true',
        'repository_package_id': source_id, 'registry_sha256': registry_sha,
        'policy_sha256': policy_sha, 'archive_sha256': rc.sha(assets[ARCHIVE])
    }
    if any('\n' in value or '\r' in value for value in fields.values()):
        raise ValueError('Workflow-output injection')
    report = {
        'schema': 'webtech-classroom-successor-publication-preparation/v1',
        'status': 'PASS_SCOPED_CLASSROOM_PREPARATION_ONLY',
        'distribution_version': VERSION, 'source_object_count': 30,
        'payload_files': payload_count, 'fields': fields, 'navigation': navigation,
        'draft': True, 'prerelease': True, 'publication_qualified': False,
        'qualificationVerdict': 'NOT_FINAL', 'required_gates': list(rc.GATES),
        'gates': plan['gates'], 'release_created': False, 'tag_created': False,
        'actions_dispatched': 0,
        'limitations': 'A filtered prerelease and bounded automation do not certify the complete corpus, native macOS, interactive browser use, Word, live Moodle, a student pilot or final owner acceptance.'
    }
    return fields, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', default=PLAN)
    parser.add_argument('--asset-dir', required=True)
    parser.add_argument('--allow-preview', action='store_true')
    parser.add_argument('--build', action='store_true')
    parser.add_argument('--github-output', required=True)
    parser.add_argument('--workflow-output', action='store_true')
    args = parser.parse_args()
    fields, report = resolve(args.asset_dir, args.allow_preview, args.build, args.plan)
    data = ''.join(key + '=' + value + '\n' for key, value in fields.items()).encode()
    if args.workflow_output:
        rc.github_output(args.github_output, data)
    else:
        rc.atomic_write(rc.output_path(args.github_output, ROOT), data)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, UnicodeError, zipfile.BadZipFile) as error:
        raise SystemExit('STOP: ' + str(error))
