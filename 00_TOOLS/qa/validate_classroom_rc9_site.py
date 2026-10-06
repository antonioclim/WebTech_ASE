#!/usr/bin/env python3
"""Reproduce the exact RC9 static reading payload and admit only that tree.

Checks bytes, inventory, modes, profile and finite local links. This does not
execute Node projects, qualify native platforms or observe a Pages deployment.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/publishing'))
import build_classroom_rc9_site as builder
import release_contract as rc
import validate_pages_payload as links


def run(site, check_source=True):
    location = rc.output_path(site)
    expected = builder.build_payload(check_source=check_source)
    actual = rc.tree_files(location)
    if set(actual) != set(expected):
        raise ValueError('RC9 static site exact inventory mismatch')
    if any(actual[name].read_bytes() != data for name, data in expected.items()):
        raise ValueError('RC9 static site exact bytes mismatch')
    if any(bool(actual[name].stat().st_mode & 0o111) != name.endswith('.sh') for name in actual):
        raise ValueError('RC9 static site executable modes mismatch')
    scope = rc.strict_json(expected[builder.SCOPE_FILE])
    if scope['profile'] != builder.PROFILE or scope['node_execution_provided'] is not False:
        raise ValueError('RC9 static reading profile differs')
    return {
        'schema': 'webtech-classroom-rc9-static-site-validation/v1',
        'status': 'PASS_RC9_STATIC_SITE_ONLY',
        'distribution_version': builder.VERSION,
        'profile': builder.PROFILE, 'files': len(actual),
        'package_id': expected['PACKAGE_ID.txt'].decode().strip(),
        'source_seal_checked': check_source is True,
        **links.check_links(expected),
        'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
        'node_execution_provided': False, 'moodle_submission_provided': False,
        'pages_deployment_observed': False, 'actions_dispatched': 0,
    }


def validate_site(site, report=None, check_source=True):
    location = rc.output_path(site)
    report_path = rc.output_path(report) if report else None
    builder.no_overlap([location] + ([report_path] if report_path else []))
    if report_path:
        builder.preflight_parents(report_path)
    result = run(location, check_source=check_source)
    data = builder.classroom.encoded(result)
    if report_path:
        rc.validate_destination(report_path, data)
        rc.atomic_write(report_path, data)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', required=True)
    parser.add_argument('--report')
    args = parser.parse_args()
    print(builder.classroom.encoded(validate_site(args.site, args.report)).decode(), end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
