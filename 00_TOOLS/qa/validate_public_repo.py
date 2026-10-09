#!/usr/bin/env python3
"""Verify v4 candidate source integrity, exact project inventory and static routes."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from current_contract import verify_source, verify_units, verify_course_map, verify_links, verify_progress, strict_json, VERSION

ROOT = Path(__file__).resolve().parents[2]


def run(allow_edits=False):
    meta, paths, source = verify_source(ROOT, allow_edits)
    units = verify_units(ROOT, meta, paths, allow_edits)
    course, projects = verify_course_map(ROOT, meta, paths)
    links = verify_links(ROOT, meta, course, paths)
    progress = verify_progress(ROOT, meta)
    args = ['node', str(ROOT / '00_TOOLS/qa/VERIFY_COLLECTION.mjs')]
    if allow_edits:
        args.append('--allow-student-edits')
    process = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=120)
    if process.returncode:
        raise ValueError('Independent Node byte check failed: ' + process.stderr.strip()[:1000])
    node = strict_json(process.stdout)
    if (node.get('status') != source['status'] or node.get('repository_package_id') != source['repository_package_id']
            or node.get('files') != source['files'] or node.get('qualificationVerdict') != 'NOT_FINAL'
            or node.get('actionsStarted') is not False
            or node.get('distribution_version') != VERSION
            or node.get('requiredProjectIDsChecked') is not True
            or node.get('published') is not False
            or sorted(node.get('allowedStudentChanges', [])) != sorted(source['allowedStudentChanges'])):
        raise ValueError('Independent byte-check reports disagree')
    return {'schema': 'webtech-current-repository-validation/v1',
            'status': 'PASS_V4_CANDIDATE_PROTECTED_SOURCE_AND_STATIC_ROUTES_ONLY' if allow_edits else 'PASS_V4_CANDIDATE_INITIAL_SOURCE_AND_STATIC_ROUTES_ONLY',
            'distribution_version': VERSION, 'distribution_status': 'LOCAL_CANDIDATE_NOT_PUBLISHED', 'source': source, 'units': units,
            'projects': projects, 'document_links': links, 'independent_node_check': node,
            'candidate_progress': progress, 'published': False,
            'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
            'applications_executed': False, 'rendered_browser_executed': False,
            'actions_dispatched': 0, 'software_installed': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--strict', action='store_true', help='Explicit current full-source check; all checks run in either mode.')
    parser.add_argument('--allow-student-edits', action='store_true', help='Admit only the declared thirty-eight learner targets and eighty-three runtime directories.')
    parser.add_argument('--report', type=Path, help='Optional new JSON report file outside the entire repository.')
    args = parser.parse_args()
    result = run(args.allow_student_edits)
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        path = args.report.absolute()
        for ancestor in [path, *path.parents]:
            if ancestor.is_symlink():
                raise ValueError('Report path traverses a symlink')
        if path.resolve().is_relative_to(ROOT.resolve()):
            raise ValueError('Reports must be outside the entire repository')
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('x', encoding='utf-8', newline='\n') as output:
            output.write(text)
    print(text, end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, subprocess.TimeoutExpired) as error:
        raise SystemExit('STOP_CURRENT_REPOSITORY_VALIDATION: ' + str(error))
