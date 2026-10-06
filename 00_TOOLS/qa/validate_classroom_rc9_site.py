#!/usr/bin/env python3
"""Reproduce the exact RC9 static reading payload and admit only that tree.

Checks bytes, inventory, modes, profile and finite local links. This does not
execute Node projects, qualify native platforms or observe a Pages deployment.
"""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
import posixpath
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/publishing'))
import build_classroom_rc9_site as builder
import release_contract as rc
import validate_pages_payload as links
import publication_controls as publication

GLOBAL_HTML = ('index.html', 'START_HERE.html', 'QUALIFICATION.html',
               'COURSE_PLAN.html', 'ASSESSMENT.html', 'DOWNLOAD_RC9.html')


class PageFacts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.ids = set()
        self.langs = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get('id'):
            if values['id'] in self.ids:
                raise ValueError('Duplicate global-page fragment: ' + values['id'])
            self.ids.add(values['id'])
        if tag == 'html':
            self.langs.append(values.get('lang'))
        if tag == 'a' and values.get('href'):
            self.urls.append(values['href'])


def validate_profile(payload):
    """Check publication facts independently of the builder's banner constants."""
    receipt = rc.strict_json(rc.checked_path(ROOT, publication.RECEIPT).read_bytes())
    plan = rc.strict_json(rc.checked_path(ROOT, publication.PLAN).read_bytes())
    publication.validate_receipt(receipt, plan)
    scope = rc.strict_json(payload['SITE_SCOPE.json'])
    fields = {
        'schema': 'webtech-classroom-rc9-static-site/v3',
        'source_publication_status': 'PUBLISHED_PRERELEASE',
        'published_classroom_package_id': receipt['package_id'],
        'published_source_commit': receipt['source_commit'],
        'release_id': receipt['release_id'], 'release_url': receipt['release_url'],
        'published_at': receipt['published_at'], 'published_assets': receipt['assets'],
        'recorded_workflow_tests': receipt['workflow']['tests'],
        'qualification_gates': receipt['qualification_gates'],
        'site_is_a_release_asset': False, 'node_execution_provided': False,
        'moodle_submission_provided': False, 'native_acceptance': False,
        'pages_deployment_observed': False, 'actions_dispatched': 0,
        'qualificationVerdict': 'NOT_FINAL',
        'unit_payload_policy': 'ALL_THIRTY_UNIT_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_policy': 'TWENTY_NINE_EXACT_CORE_ENTRY_COPIES_AND_ONE_DECLARED_CSS_ONLY_DERIVATIVE',
        'tutorial_policy': 'ALL_FOURTEEN_TUTORIAL_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_derivatives': [{
            'path': 'ENTRY/SETUP_MACOS_LINUX.html',
            'operation': 'INSERT_EXACT_CSS_BEFORE_SOLE_STYLE_CLOSE',
            'css': 'h1{overflow-wrap:anywhere}', 'bytes_added': 26,
            'source_sha256': 'ad65f1ba73cc9e0251ed101344a0c3e3b9145696cb13bd235551eabd390f678a',
            'site_sha256': '2f9c4cef2f9991d554478d0be673c9ee714c52d768ae109f30ecd0fe3e856bbc',
            'reason': 'Wrap the macOS/Linux setup title on narrow screens',
            'text_and_links_unchanged': True,
        }],
    }
    for key, value in fields.items():
        publication.exact(scope.get(key), value, 'static site ' + key)
    # Authenticate the complete entry independently of the builder's constants.
    entry = payload['ENTRY/SETUP_MACOS_LINUX.html']
    marker = b'h1{overflow-wrap:anywhere}</style>'
    if entry.count(b'</style>') != 1 or entry.count(marker) != 1:
        raise ValueError('Static setup entry CSS derivative differs')
    original = entry.replace(marker, b'</style>', 1)
    if (rc.sha(original) != fields['entry_derivatives'][0]['source_sha256']
            or rc.sha(entry) != fields['entry_derivatives'][0]['site_sha256']):
        raise ValueError('Static setup entry derivative bytes differ')
    core_meta = rc.strict_json(payload['CLASSROOM_COLLECTION.json'])
    publication.exact(scope.get('current_repository_package_id'),
                      core_meta['repository_package_id'], 'static source seal')
    ids = (scope.get('current_core_collection_package_id'),
           scope.get('published_classroom_package_id'),
           payload['PACKAGE_ID.txt'].decode().strip())
    if any(not isinstance(value, str) or not re.fullmatch(r'[0-9a-f]{64}', value)
           for value in ids) or len(set(ids)) != 3:
        raise ValueError('Static/core/published identities must remain distinct')
    if set(scope['objects']) != rc.OBJECTS or len(scope['objects']) != 30:
        raise ValueError('Static site thirty-object inventory differs')
    pages = {}
    for name in GLOBAL_HTML:
        text = payload[name].decode('utf-8')
        facts = PageFacts()
        facts.feed(text)
        if facts.langs != ['en-GB']:
            raise ValueError('Global static page language differs: ' + name)
        if ('PREPARED_NOT_PUBLISHED' in text or 'prepared, not published' in text
                or '/releases/tag/classroom-en-gb-v3.0.0-rc.8' in text
                or re.search(r'last published classroom download.{0,80}\bRC8\b'
                             r'|the RC8 prerelease', text, re.IGNORECASE)):
            raise ValueError('Stale static publication guidance: ' + name)
        if name != 'DOWNLOAD_RC9.html' and (
                'data-site-profile="rc9-static-reading"' not in text
                or receipt['release_url'] not in facts.urls
                or 'DOWNLOAD_RC9.html' not in facts.urls):
            raise ValueError('Global static/download context absent: ' + name)
        pages[name] = facts
    for asset in receipt['assets']:
        if asset['download_url'] not in pages['DOWNLOAD_RC9.html'].urls:
            raise ValueError('Published asset absent from static download guide')
    readme = payload['README.md'].decode()
    if ('prepared, not published' in readme or 'last published RC8' in readme
            or 'resolve_classroom_rc9.py' in readme or 'workflow_dispatch' in readme):
        raise ValueError('Stale static README guidance')
    anchors = 0
    for name, facts in pages.items():
        for url in facts.urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.fragment:
                continue
            target = (posixpath.normpath(posixpath.join(posixpath.dirname(name),
                      unquote(parsed.path))) if parsed.path else name)
            if target not in pages:
                if target not in payload:
                    raise ValueError('Missing global fragment target: ' + target)
                other = PageFacts()
                other.feed(payload[target].decode('utf-8'))
            else:
                other = pages[target]
            if unquote(parsed.fragment) not in other.ids:
                raise ValueError('Missing global fragment: ' + name + ' -> ' + url)
            anchors += 1
    return {'publication_profile': 'PASS_RECORDED_PUBLICATION_FACTS_ONLY',
            'global_pages': len(pages), 'local_fragment_checks': anchors,
            'published_package_id': receipt['package_id'],
            'current_core_package_id': ids[0],
            'site_identity_matches_published_archive': False}


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
        **validate_profile(expected),
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
