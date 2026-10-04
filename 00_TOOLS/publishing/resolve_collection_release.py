#!/usr/bin/env python3
"""Prepare one filtered English candidate without replacing different assets.

This resolver binds the complete source, fixed 30-object registry and generated
collection to one exact deterministic ZIP. It deliberately has no final-release
mode and never publishes from Python. The manual workflow creates a new draft
candidate; it does not enable GitHub's immutable-release account setting.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import build_student_collection as collection_builder
import release_contract as rc

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student

PLAN = '90_RELEASES/COLLECTION_RELEASE_PLAN.json'
VERSION = '3.0.0-rc.6'
ARCHIVE = 'WEBTECH_ASE_EN_GB_v' + VERSION + '.zip'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_RC6/'
TAG = 'collection-en-gb-v' + VERSION
NOTES = '90_RELEASES/NOTES_COLLECTION_RC6.md'
PLAN_KEYS = {
    'schema', 'distribution_version', 'source_commit', 'registry',
    'registry_sha256', 'status', 'draft', 'prerelease', 'required_gates',
    'gates', 'collection_root', 'tag', 'notes', 'object_ids', 'archive'
}


def read_plan(path=PLAN):
    if path != PLAN:
        raise ValueError('Use the authoritative full-collection release plan')
    plan = rc.strict_json(rc.checked_path(ROOT, path).read_bytes())
    if not isinstance(plan, dict) or set(plan) != PLAN_KEYS:
        raise ValueError('Collection plan fields differ')
    expected = {
        'schema': 'webtech-collection-release-plan/v1',
        'distribution_version': VERSION,
        'registry': 'metadata/student-selection.json',
        'status': 'candidate',
        'collection_root': COLLECTION_ROOT,
        'tag': TAG,
        'notes': NOTES,
        'archive': ARCHIVE
    }
    if any(plan.get(key) != value for key, value in expected.items()):
        raise ValueError('Candidate identity, paths or version differ')
    if plan['draft'] is not True or plan['prerelease'] is not True:
        raise ValueError('Candidate draft/prerelease flags cannot be changed')
    if not re.fullmatch(r'[0-9a-f]{40}', str(plan['source_commit'])):
        raise ValueError('A lowercase provenance commit is required')
    if plan['registry_sha256'] != rc.sha(student.REGISTRY.read_bytes()):
        raise ValueError('Collection plan registry binding differs')
    if plan['object_ids'] != sorted(rc.OBJECTS):
        raise ValueError('Exactly the fixed thirty objects are required')
    if plan['required_gates'] != list(rc.GATES):
        raise ValueError('All ten qualification gates are mandatory')
    gates = plan['gates']
    if not isinstance(gates, dict) or set(gates) != set(rc.GATES):
        raise ValueError('Qualification gate inventory differs')
    for gate, value in gates.items():
        if (not isinstance(value, dict) or set(value) != {'status', 'scope'}
                or value['status'] != 'pending'
                or not isinstance(value['scope'], str) or not value['scope'].strip()):
            raise ValueError('This candidate plan keeps every gate pending: ' + gate)
    notes = rc.checked_path(ROOT, plan['notes'])
    if not notes.is_file() or not notes.read_text(encoding='utf-8').strip():
        raise ValueError('English candidate release notes are absent')
    return plan


def expected_collection(plan):
    """Rebuild and validate the complete candidate before reading any output."""
    source_id = rc.source_identity(ROOT)
    registry_bytes = student.REGISTRY.read_bytes()
    registry = student.read_registry()
    if (read_plan() != plan or rc.sha(registry_bytes) != plan['registry_sha256']
            or registry['distribution_version'] != plan['distribution_version']
            or registry['source_commit'] != plan['source_commit']
            or registry.get('qualified_release') is not False):
        raise ValueError('Registry version, provenance or candidate status differs')
    payload = collection_builder.build_payload(check_source=True)
    required = {'index.html', 'COLLECTION.json', 'SHA256SUMS.txt'}
    if not required <= set(payload):
        raise ValueError('Collection entry point or integrity metadata is absent')
    if payload['SHA256SUMS.txt'] != rc.manifest(payload, {'SHA256SUMS.txt'}):
        raise ValueError('Collection manifest does not cover every payload file')
    embedded = rc.strict_json(payload['COLLECTION.json'])
    if (not isinstance(embedded, dict)
            or embedded.get('schema') != 'webtech-student-collection/v2'
            or embedded.get('distribution_version') != VERSION
            or embedded.get('selection_registry_sha256') != rc.sha(registry_bytes)
            or embedded.get('native_acceptance') is not False
            or embedded.get('publication_qualified') is not False
            or embedded.get('status') != collection_builder.CANDIDATE_STATUS):
        raise ValueError('Embedded collection candidate identity differs')
    records = embedded.get('objects')
    if (not isinstance(records, list) or len(records) != 30
            or not all(isinstance(item, dict) for item in records)
            or {item.get('object_id') for item in records} != rc.OBJECTS):
        raise ValueError('Embedded collection object scope differs')
    selected = {item['object_id']: item for item in registry['objects']}
    for item in records:
        original = selected[item['object_id']]
        for key, registry_key in (
            ('archive_sha256', 'archive_sha256'), ('package_id', 'package_id'),
            ('payload_root', 'collection_payload_root'),
            ('carrier_version', 'carrier_version'), ('payload_files', 'archive_files')
        ):
            if item.get(key) != original[registry_key]:
                raise ValueError('Embedded object binding differs: ' + item['object_id'])
    archive = rc.zip_bytes(payload, COLLECTION_ROOT)
    members = rc.zip_members(archive, normalized_modes=True)
    if members != {COLLECTION_ROOT + name: data for name, data in payload.items()}:
        raise ValueError('Complete collection ZIP payload differs')
    if (rc.source_identity(ROOT) != source_id
            or student.REGISTRY.read_bytes() != registry_bytes):
        raise ValueError('Source or registry changed while preparing the collection')
    sidecar_name = ARCHIVE + '.sha256'
    sidecar = (rc.sha(archive) + '  ' + ARCHIVE + '\n').encode()
    assets = {ARCHIVE: archive, sidecar_name: sidecar}
    assets['SHA256SUMS.txt'] = rc.manifest(assets)
    return assets, source_id, rc.sha(registry_bytes), len(payload)


def resolve(asset_dir, preview=False, build=False, plan_path=PLAN):
    if type(preview) is not bool or type(build) is not bool:
        raise ValueError('Preview and build must be real booleans')
    if not preview:
        raise ValueError('Explicit candidate preview is required; no final mode exists')
    plan = read_plan(plan_path)
    out = rc.output_path(asset_dir, ROOT)
    if any(character in str(out) for character in '\r\n'):
        raise ValueError('Output path injection')
    assets, source_id, registry_sha, payload_count = expected_collection(plan)
    if out.exists() and set(rc.tree_files(out)) - set(assets):
        raise ValueError('Publish directory contains undeclared files')
    # Preflight every individual destination before writing. These exclusive,
    # idempotent file writes are not a transaction across the three assets.
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
            raise ValueError('Full deterministic collection asset differs: ' + name)
    fields = {
        'tag': plan['tag'],
        'title': 'Web Technologies complete English candidate ' + VERSION,
        'notes': plan['notes'],
        'archive': str(out / ARCHIVE),
        'sidecar': str(out / (ARCHIVE + '.sha256')),
        'checksums': str(out / 'SHA256SUMS.txt'),
        'draft': 'true', 'prerelease': 'true',
        'repository_package_id': source_id,
        'registry_sha256': registry_sha,
        'archive_sha256': rc.sha(assets[ARCHIVE])
    }
    if any('\n' in value or '\r' in value for value in fields.values()):
        raise ValueError('Workflow-output injection')
    return fields, {
        'schema': 'webtech-collection-publication-preparation/v1',
        'status': 'PASS_COMPLETE_CANDIDATE_RESOLUTION_ONLY',
        'distribution_version': VERSION, 'object_count': 30,
        'payload_files': payload_count, 'fields': fields,
        'draft': True, 'prerelease': True, 'publication_qualified': False,
        'required_gates': list(rc.GATES),
        'release_created': False, 'tag_created': False, 'actions_dispatched': 0,
        'limitations': 'Byte integrity and deterministic packaging do not provide native, browser, Word, Moodle, linguistic, pilot or owner acceptance.'
    }


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
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
