#!/usr/bin/env python3
"""Prepare exactly three RC10 draft-prerelease assets, without network operations."""
from __future__ import annotations
import argparse
import json
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
import build_classroom_rc10 as builder
import release_contract as rc

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student

VERSION = builder.VERSION
COLLECTION_ROOT = builder.COLLECTION_ROOT
POLICY = builder.POLICY
PLAN = '90_RELEASES/CLASSROOM_RC10_RELEASE_PLAN.json'
NOTES = '90_RELEASES/NOTES_CLASSROOM_RC10.md'
TAG = 'classroom-en-gb-v' + VERSION
ARCHIVE = 'WEBTECH_ASE_EN_GB_CLASSROOM_v' + VERSION + '.zip'


def read_plan(path=PLAN):
    if path != PLAN:
        raise ValueError('Use the authoritative RC10 plan')
    actual = rc.strict_json((ROOT / path).read_bytes())
    if not isinstance(actual, dict):
        raise ValueError('RC10 plan must be an object')
    if actual.get('draft') is not True or actual.get('prerelease') is not True:
        raise ValueError('RC10 requires real draft and prerelease booleans')
    expected = {
        'schema': 'webtech-classroom-rc10-release-plan/v1',
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
        raise ValueError('RC10 plan identity, inventory, flags or bindings differ')
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
    """Use the new candidate's independent scope validator, never an RC9 alias."""
    return builder.validate_scope(payload)


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
    if rc.source_identity(ROOT) != source_id or read_plan() != plan:
        raise ValueError('Source or plan changed during asset output')
    actual = rc.tree_files(out)
    if set(actual) != set(assets) or any(actual[name].read_bytes() != data for name, data in assets.items()):
        raise ValueError('Exactly the three deterministic declared assets required')
    fields = {'tag': TAG, 'title': 'Web Technologies instruction-remediated classroom prerelease ' + VERSION,
              'notes': NOTES, 'archive': str(out / ARCHIVE),
              'sidecar': str(out / (ARCHIVE + '.sha256')), 'checksums': str(out / 'SHA256SUMS.txt'),
              'draft': 'true', 'prerelease': 'true', 'repository_package_id': source_id,
              'archive_sha256': rc.sha(assets[ARCHIVE])}
    if any('\r' in value or '\n' in value for value in fields.values()):
        raise ValueError('Workflow-output injection')
    report = {'schema': 'webtech-classroom-rc10-preparation/v1', 'status': 'PASS_SCOPED_PREPARATION_ONLY',
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
