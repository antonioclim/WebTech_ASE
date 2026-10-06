#!/usr/bin/env python3
"""Build the current RC9 static reading site outside the source checkout.

All thirty delivered unit payloads and entry pages remain exact classroom bytes.
Only the homepage reading-profile banner and sealed outer site controls differ.
No installation, network operation, Pages deployment or Actions dispatch occurs.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import build_classroom_rc9 as classroom
import release_contract as rc

VERSION = classroom.VERSION
PROFILE = 'RC9_STATIC_READING_AND_NAVIGATION_ONLY'
SCOPE_FILE = 'SITE_SCOPE.json'
PUBLISHED_RC8 = 'https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.8'
BANNER = (
    '<section id="static-site-scope" data-site-profile="rc9-static-reading" class="notice">'
    '<h2>RC9 static reading preview</h2>'
    '<p>This site provides reading and navigation for the prepared RC9 classroom source. '
    'It is not a Node execution environment, local application server or Moodle submission service. '
    'Run commands and edit learner files only from the complete extracted classroom asset on your computer. '
    'The S02 browser observations require the separately started local loopback server.</p>'
    '<p>This Pages build does not publish an RC9 classroom ZIP or claim FINAL acceptance. '
    'The last published classroom download recorded by this source is '
    '<a href="' + PUBLISHED_RC8 + '">the RC8 prerelease</a>. '
    'RC9 release preparation and publication remain separate owner operations.</p>'
    '<p><a href="START_HERE.html">Read the local setup instructions</a> · '
    '<a href="QUALIFICATION.html">Read the actual scope and pending qualification</a> · '
    '<a href="SITE_SCOPE.json">Inspect this static site profile</a></p></section>'
)


def build_payload(check_source=True):
    """Production authenticates the current seal; tests may scope it explicitly."""
    core = classroom.build_payload(check_source=check_source)
    meta = rc.strict_json(core['CLASSROOM_COLLECTION.json'])
    if meta['distribution_version'] != VERSION or len(meta['objects']) != 30:
        raise ValueError('Current RC9 classroom source inventory differs')
    if '.nojekyll' in core or SCOPE_FILE in core:
        raise ValueError('Site-only controls must not replace core classroom files')
    payload = dict(core)
    homepage = core['index.html'].decode('utf-8')
    if homepage.count('<main>') != 1 or 'data-site-profile=' in homepage:
        raise ValueError('Unexpected RC9 homepage structure')
    payload['index.html'] = homepage.replace('<main>', '<main>' + BANNER, 1).encode('utf-8')
    payload['.nojekyll'] = b''
    payload[SCOPE_FILE] = classroom.encoded({
        'schema': 'webtech-classroom-rc9-static-site/v1',
        'distribution_version': VERSION,
        'profile': PROFILE,
        'source_publication_status': 'PREPARED_NOT_PUBLISHED',
        'core_collection_package_id': core['PACKAGE_ID.txt'].decode().strip(),
        'core_file_count': len(core),
        'objects': sorted(item['object_id'] for item in meta['objects']),
        'unit_payload_policy': 'ALL_THIRTY_UNIT_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_policy': 'ALL_THIRTY_ENTRY_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'site_only_added_files': ['.nojekyll', SCOPE_FILE],
        'modified_core_files': ['index.html', 'SHA256SUMS.txt', 'PACKAGE_ID.txt'],
        'last_published_classroom_download_recorded_by_source': PUBLISHED_RC8,
        'site_is_a_release_asset': False,
        'node_execution_provided': False,
        'moodle_submission_provided': False,
        'qualificationVerdict': 'NOT_FINAL',
        'native_acceptance': False,
        'pages_deployment_observed': False,
        'actions_dispatched': 0,
    })
    # Cover site-only files and the homepage derivative with a new outer identity.
    # Inner unit controls and collection task metadata remain byte-identical.
    payload['SHA256SUMS.txt'] = rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    rc.namespace([(name, False) for name in payload])
    classroom.pages.check_links(payload)
    return payload


def no_overlap(paths):
    if any(a == b or a.is_relative_to(b) or b.is_relative_to(a)
           for i, a in enumerate(paths) for b in paths[i + 1:]):
        raise ValueError('Overlapping site and report outputs')


def preflight_parents(path):
    for parent in path.parents:
        if parent.exists() and not parent.is_dir():
            raise ValueError('Output parent is not a directory: ' + str(parent))


def preflight_tree(path, payload):
    preflight_parents(path)
    if not path.exists():
        return
    actual = rc.tree_files(path)
    if set(actual) != set(payload) or any(actual[name].read_bytes() != data for name, data in payload.items()):
        raise ValueError('Existing different static site output')
    if any(bool(actual[name].stat().st_mode & 0o111) != name.endswith('.sh') for name in actual):
        raise ValueError('Existing static site executable modes differ')


def build_site(output, report=None, check_source=True):
    """Preflight every destination before publishing either local output."""
    out = rc.output_path(output)
    report_path = rc.output_path(report) if report else None
    no_overlap([out] + ([report_path] if report_path else []))
    payload = build_payload(check_source=check_source)
    result = {
        'schema': 'webtech-classroom-rc9-static-site-build/v1',
        'status': 'PASS_RC9_STATIC_SITE_BUILD_ONLY',
        'distribution_version': VERSION, 'profile': PROFILE,
        'files': len(payload), 'output': str(out),
        'package_id': payload['PACKAGE_ID.txt'].decode().strip(),
        'source_seal_checked': check_source is True,
        'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
        'pages_deployment_observed': False, 'actions_dispatched': 0,
    }
    data = classroom.encoded(result)
    preflight_tree(out, payload)
    if report_path:
        preflight_parents(report_path)
        rc.validate_destination(report_path, data)
    rc.write_tree(out, payload)
    if report_path:
        rc.atomic_write(report_path, data)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    parser.add_argument('--report')
    args = parser.parse_args()
    print(classroom.encoded(build_site(args.output, args.report)).decode(), end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
