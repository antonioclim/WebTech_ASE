#!/usr/bin/env python3
"""Prepare exactly three RC9 draft-prerelease assets, without network operations."""
from __future__ import annotations
import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_rc9 as builder
import release_contract as rc

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student
import validate_pages_payload as pages

VERSION = builder.VERSION
COLLECTION_ROOT = builder.COLLECTION_ROOT
POLICY = builder.POLICY
PLAN = '90_RELEASES/CLASSROOM_RC9_RELEASE_PLAN.json'
NOTES = '90_RELEASES/NOTES_CLASSROOM_RC9.md'
TAG = 'classroom-en-gb-v' + VERSION
ARCHIVE = 'WEBTECH_ASE_EN_GB_CLASSROOM_v' + VERSION + '.zip'


def read_plan(path=PLAN):
    if path != PLAN:
        raise ValueError('Use the authoritative RC9 plan')
    actual = rc.strict_json((ROOT / path).read_bytes())
    if not isinstance(actual, dict):
        raise ValueError('RC9 plan must be an object')
    if actual.get('draft') is not True or actual.get('prerelease') is not True:
        raise ValueError('RC9 requires real draft and prerelease booleans')
    expected = {
        'schema': 'webtech-classroom-rc9-release-plan/v1',
        'distribution_version': VERSION,
        'source_material_commit': builder.SOURCE_COMMIT,
        'original_material_sha256': builder.SOURCE_MATERIAL,
        'registry': 'metadata/student-selection.json',
        'registry_sha256': rc.sha(student.REGISTRY.read_bytes()),
        'policy': POLICY, 'policy_sha256': rc.sha((ROOT / POLICY).read_bytes()),
        'status': 'candidate', 'draft': True, 'prerelease': True,
        'required_gates': list(rc.GATES), 'gates': actual.get('gates'),
        'collection_root': COLLECTION_ROOT, 'tag': TAG, 'notes': NOTES,
        'object_ids': sorted(rc.OBJECTS), 'archive': ARCHIVE,
    }
    if actual != expected:
        raise ValueError('RC9 plan identity, inventory, flags or bindings differ')
    gates = actual['gates']
    if not isinstance(gates, dict) or set(gates) != set(rc.GATES):
        raise ValueError('All ten broad gates must remain declared')
    for name, gate in gates.items():
        if (not isinstance(gate, dict) or set(gate) != {'status', 'scope'}
                or gate['status'] != 'pending' or not isinstance(gate['scope'], str)
                or not gate['scope'].strip()):
            raise ValueError('Broad gate must remain pending: ' + name)
    builder.read_policy()
    if not (ROOT / NOTES).read_text(encoding='utf-8').strip():
        raise ValueError('English release notes required')
    return actual


def validate_scope(payload):
    """Check actual scope and integrity independently of narrative declarations."""
    rc.namespace([(name, False) for name in payload])
    if payload.get('SHA256SUMS.txt') != rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')):
        raise ValueError('Collection manifest must cover every exact file')
    if payload.get('PACKAGE_ID.txt') != (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode():
        raise ValueError('Collection identity differs')
    meta = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    if not isinstance(meta, dict) or meta.get('native_acceptance') is not False or meta.get('publication_qualified') is not False:
        raise ValueError('RC9 requires real false qualification booleans')
    fixed = {'schema': 'webtech-classroom-collection/v1', 'status': builder.STATUS,
             'distribution_version': VERSION, 'required_microprojects': 40,
             'tutorials': 14, 'optional_docx_references': 30,
             'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
             'publication_qualified': False,
             'qualificationGates': {name: 'pending' for name in rc.GATES}}
    if any(meta.get(key) != value for key, value in fixed.items()):
        raise ValueError('Actual RC9 scope or qualification declaration differs')
    if any(type(meta.get(key)) is not int for key in ('required_microprojects', 'tutorials', 'optional_docx_references')):
        raise ValueError('RC9 scope counts require integers')
    items = meta.get('objects')
    if (not isinstance(items, list) or len(items) != 30
            or {item.get('object_id') for item in items} != rc.OBJECTS):
        raise ValueError('Exactly thirty source units required')
    edits, project_count = set(), 0
    for item in items:
        prefix = item['payload_root']
        rc.safe_name(prefix[:-1])
        for key in ('entry', 'start', 'guide', 'package_id_path'):
            if item.get(key) not in payload:
                raise ValueError('Missing actual unit route: ' + item['object_id'] + '/' + key)
        if payload[item['package_id_path']] != (item['package_id'] + '\n').encode():
            raise ValueError('Unit identity binding differs')
        if item.get('derivation'):
            unit = {name[len(prefix):]: data for name, data in payload.items() if name.startswith(prefix)}
            if unit['SHA256SUMS.txt'] != rc.manifest(unit, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')):
                raise ValueError('Derived unit manifest differs')
            if unit['PACKAGE_ID.txt'] != (rc.sha(unit['SHA256SUMS.txt']) + '\n').encode():
                raise ValueError('Derived unit identity differs')
        if re.fullmatch(r'S\d{2}', item['object_id']):
            scope = rc.strict_json(payload[prefix + 'CLASSROOM_RC6/CLASSROOM_SCOPE.json'])
            if scope['projects'] != item['projects'] or len(scope['projects']) not in (2, 3):
                raise ValueError('Task contract differs')
            project_count += len(scope['projects'])
            for project in scope['projects']:
                name = prefix + project['editable_path']
                if name not in payload or not re.fullmatch(r'CLASSROOM_RC6/(targets|student)/(p\d{2}\.mjs|styles\.css)', project['editable_path']):
                    raise ValueError('Invalid learner target')
                edits.add(name)
            if item.get('tutorial') != 'TUTORIALS/' + item['object_id'] + '.html' or item['tutorial'] not in payload:
                raise ValueError('Detailed tutorial absent')
    if project_count != 40 or len(edits) != 38 or meta['editable_files'] != sorted(edits):
        raise ValueError('Exact project/edit allowlist differs')
    if sum(name.endswith('.docx') for name in payload) != 30:
        raise ValueError('Optional reference count differs')
    preserved = rc.strict_json(payload['PRESERVED_SOURCE_FILES.json'])['files']
    if meta['source_files_preserved'] != len(preserved):
        raise ValueError('Actual preserved count differs')
    for record in preserved:
        if record['path'] not in payload or rc.sha(payload[record['path']]) != record['sha256'] or len(payload[record['path']]) != record['bytes']:
            raise ValueError('Preserved original byte differs')
    return pages.check_links(payload)


def expected_collection(plan):
    source_id = rc.source_identity(ROOT)
    payload = builder.build_payload(check_source=True)
    navigation = validate_scope(payload)
    meta = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    if meta['repository_package_id'] != source_id or meta['policy_sha256'] != rc.sha((ROOT / POLICY).read_bytes()):
        raise ValueError('Embedded current source or policy differs')
    archive = rc.zip_bytes(payload, COLLECTION_ROOT)
    if rc.zip_members(archive, normalized_modes=True) != {COLLECTION_ROOT + name: data for name, data in payload.items()}:
        raise ValueError('ZIP closure differs')
    if rc.source_identity(ROOT) != source_id or read_plan() != plan:
        raise ValueError('Source or plan changed during preparation')
    assets = {ARCHIVE: archive, ARCHIVE + '.sha256': (rc.sha(archive) + '  ' + ARCHIVE + '\n').encode()}
    assets['SHA256SUMS.txt'] = rc.manifest(assets)
    return assets, source_id, len(payload), navigation


def resolve(asset_dir, preview=False, build=False, plan_path=PLAN):
    if type(preview) is not bool or type(build) is not bool:
        raise ValueError('Preview and build require real booleans')
    if not preview:
        raise ValueError('Explicit preview required; no final-release mode exists')
    plan = read_plan(plan_path)
    out = rc.output_path(asset_dir, ROOT)
    if any(character in str(out) for character in '\r\n'):
        raise ValueError('Output path injection')
    assets, source_id, count, navigation = expected_collection(plan)
    if out.exists() and set(rc.tree_files(out)) - set(assets):
        raise ValueError('Publish directory contains undeclared files')
    # Preflight every destination before the first write. A corrupt replay or an
    # unexpected file is refused without replacing the existing asset bytes.
    for name, data in assets.items():
        rc.validate_destination(out / name, data)
    if build:
        for name, data in assets.items():
            rc.atomic_write(out / name, data)
    actual = rc.tree_files(out)
    if set(actual) != set(assets) or any(actual[name].read_bytes() != data for name, data in assets.items()):
        raise ValueError('Exactly the three deterministic declared assets required')
    fields = {'tag': TAG, 'title': 'Web Technologies remediated classroom prerelease ' + VERSION,
              'notes': NOTES, 'archive': str(out / ARCHIVE),
              'sidecar': str(out / (ARCHIVE + '.sha256')), 'checksums': str(out / 'SHA256SUMS.txt'),
              'draft': 'true', 'prerelease': 'true', 'repository_package_id': source_id,
              'archive_sha256': rc.sha(assets[ARCHIVE])}
    if any('\r' in value or '\n' in value for value in fields.values()):
        raise ValueError('Workflow-output injection')
    report = {'schema': 'webtech-classroom-rc9-preparation/v1', 'status': 'PASS_SCOPED_PREPARATION_ONLY',
              'distribution_version': VERSION, 'source_object_count': 30, 'payload_files': count,
              'fields': fields, 'navigation': navigation, 'draft': True, 'prerelease': True,
              'qualificationVerdict': 'NOT_FINAL', 'publication_qualified': False,
              'gates': plan['gates'], 'actions_dispatched': 0, 'release_created': False, 'tag_created': False}
    return fields, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', default=PLAN); parser.add_argument('--asset-dir', required=True)
    parser.add_argument('--allow-preview', action='store_true'); parser.add_argument('--build', action='store_true')
    parser.add_argument('--github-output', required=True); parser.add_argument('--workflow-output', action='store_true')
    args = parser.parse_args()
    asset_path = rc.output_path(args.asset_dir, ROOT)
    output_file = rc.output_path(args.github_output, ROOT)
    if output_file == asset_path or output_file.is_relative_to(asset_path) or asset_path.is_relative_to(output_file):
        raise ValueError('Output receipt must be separate from the exact release-asset directory')
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
