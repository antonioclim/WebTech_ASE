#!/usr/bin/env python3
"""Admit only the exact RC10 static reading derivative and its recorded scope.

Independent semantic checks admit the publication facts, preserved unit/entry/
tutorial bytes, finite local targets and fragments. Exact reconstruction also
rejects self-resealed edits. No native qualification or deployment is inferred.
"""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/publishing'))
import build_classroom_rc10_site as builder
import release_contract as rc
import validate_pages_payload as links
import publication_rc10_controls as publication

GLOBAL_HTML = ('index.html', 'START_HERE.html', 'QUALIFICATION.html',
               'COURSE_PLAN.html', 'ASSESSMENT.html', 'DOWNLOAD_RC10.html')
EXPECTED_ADDED = {'.nojekyll', 'SITE_SCOPE.json', 'DOWNLOAD_RC10.html',
                  'PUBLICATION/CLASSROOM_RC10_PUBLICATION.json', 'PUBLICATION/RC10_PUBLICATION.md'}
EXPECTED_CHANGED = {'index.html', 'START_HERE.html', 'QUALIFICATION.html',
                    'COURSE_PLAN.html', 'ASSESSMENT.html', 'README.md',
                    'ENTRY/SETUP_WINDOWS.html', 'ENTRY/SETUP_MACOS_LINUX.html',
                    'SHA256SUMS.txt', 'PACKAGE_ID.txt'}
ENTRY_IDENTITIES = {
    'ENTRY/SETUP_WINDOWS.html': (
        'bb194285927917df69fed1d60437e283dc1f27c96eb7250048386e9e4f438c77',
        '5314647cf782c16a744e7f11875c34be7d8994e2e472a55e3d598b56f77f5f05'),
    'ENTRY/SETUP_MACOS_LINUX.html': (
        '25d5073f3267c0bc3a253afc07c79c4a183bceb41b088b6cb1e0b43427499698',
        '5e2d6c0a39bda26aeb7babd9bd13966b352750431d7efb09e70430f756d8ef34'),
}


class PageFacts(HTMLParser):
    def __init__(self, strict_ids=False):
        super().__init__()
        self.urls, self.langs, self.ids = [], [], set()
        self.strict_ids = strict_ids

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        ident = values.get('id')
        if ident:
            if self.strict_ids and ident in self.ids:
                raise ValueError('Duplicate global-page fragment: ' + ident)
            self.ids.add(ident)
        if tag == 'a' and values.get('name'):
            self.ids.add(values['name'])
        if tag == 'html':
            self.langs.append(values.get('lang'))
        if tag == 'a' and values.get('href'):
            self.urls.append(values['href'])


def local_fragments(payload):
    """Check every finite local HTML anchor; external URLs are recorded scope only."""
    facts = {}
    for name, data in payload.items():
        if name.lower().endswith('.html'):
            page = PageFacts(strict_ids=name in GLOBAL_HTML)
            page.feed(data.decode('utf-8'))
            facts[name] = page
    count = 0
    for name, page in facts.items():
        for url in page.urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.fragment:
                continue
            target = links.local_target(name, url, payload) if parsed.path else name
            if target not in facts or unquote(parsed.fragment) not in facts[target].ids:
                raise ValueError('Missing static local fragment: ' + name + ' -> ' + url)
            count += 1
    return count


def finite_markdown_links(payload):
    """Admit local targets in only the two new site guidance Markdown files."""
    count = 0
    for name in ('README.md', 'PUBLICATION/RC10_PUBLICATION.md'):
        text = payload[name].decode('utf-8')
        for url in re.findall(r'\[[^\]]*\]\(([^\s()]+)\)', text):
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc:
                if parsed.scheme != 'https' or not parsed.netloc:
                    raise ValueError('Unsupported static Markdown external URL: ' + url)
                continue
            target = links.local_target(name, url, payload) if parsed.path else name
            if target not in payload:
                raise ValueError('Missing static Markdown target: ' + name + ' -> ' + url)
            if parsed.fragment:
                if not target.lower().endswith('.html'):
                    raise ValueError('Unadmitted static Markdown fragment: ' + url)
                page = PageFacts()
                page.feed(payload[target].decode('utf-8'))
                if unquote(parsed.fragment) not in page.ids:
                    raise ValueError('Missing static Markdown HTML fragment: ' + url)
            count += 1
    return count


def exact_tree(value, expected, label):
    """Retain JSON types recursively, including zero versus false in suite rows."""
    publication.exact(value, expected, label)
    if type(expected) is dict:
        for key, item in expected.items():
            exact_tree(value[key], item, label + ' ' + key)
    elif type(expected) is list:
        for number, item in enumerate(expected):
            exact_tree(value[number], item, label + ' ' + str(number))


def validate_profile(payload, core):
    """Check facts and byte-preservation independently of presentation constants."""
    receipt = rc.strict_json(rc.checked_path(ROOT, publication.RECEIPT).read_bytes())
    plan = rc.strict_json(rc.checked_path(ROOT, publication.PLAN).read_bytes())
    publication.validate_receipt(receipt, plan)
    scope = rc.strict_json(payload['SITE_SCOPE.json'])
    fields = {
        'schema': 'webtech-classroom-rc10-static-site/v1', 'distribution_version': '3.0.0-rc.10',
        'profile': 'RC10_STATIC_READING_AND_NAVIGATION_ONLY',
        'source_publication_status': 'PUBLISHED_PRERELEASE',
        'published_classroom_package_id': receipt['package_id'],
        'published_source_commit': receipt['source_commit'], 'release_id': receipt['release_id'],
        'release_url': receipt['release_url'], 'published_at': receipt['published_at'],
        'published_assets': receipt['assets'], 'recorded_workflow': receipt['workflow'],
        'qualification_gates': receipt['qualification_gates'],
        'site_is_a_release_asset': False, 'node_execution_provided': False,
        'moodle_submission_provided': False, 'native_acceptance': False,
        'pages_deployment_observed': False, 'actions_dispatched': 0,
        'published_asset_bytes_reverified_by_site_build': False,
        'qualificationVerdict': 'NOT_FINAL',
        'unit_payload_policy': 'ALL_THIRTY_UNIT_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_policy': 'TWENTY_EIGHT_EXACT_CORE_ENTRY_COPIES_AND_TWO_DECLARED_CSS_ONLY_DERIVATIVES',
        'tutorial_policy': 'ALL_FOURTEEN_TUTORIAL_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'publication_receipt_validation': 'PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY',
        'publication_record_policy': 'FINITE_EXACT_RECEIPT_AND_BOUNDED_NOTE_LINK_DERIVATIVE',
        'core_file_count': len(core),
    }
    for key, value in fields.items():
        exact_tree(scope.get(key), value, 'static site ' + key)
    if set(payload) - set(core) != EXPECTED_ADDED or set(core) - set(payload):
        raise ValueError('Static site declared additions differ')
    changed = {name for name in core if core[name] != payload[name]}
    if changed != EXPECTED_CHANGED:
        raise ValueError('Static site undeclared core derivative')
    if (type(scope.get('site_only_added_files')) is not list
            or len(scope['site_only_added_files']) != len(EXPECTED_ADDED)
            or set(scope['site_only_added_files']) != EXPECTED_ADDED
            or type(scope.get('modified_core_files')) is not list
            or len(scope['modified_core_files']) != len(EXPECTED_CHANGED)
            or set(scope['modified_core_files']) != EXPECTED_CHANGED):
        raise ValueError('Static site derivative inventory declaration differs')
    meta = rc.strict_json(core['CLASSROOM_COLLECTION.json'])
    if payload['CLASSROOM_COLLECTION.json'] != core['CLASSROOM_COLLECTION.json']:
        raise ValueError('Static site core provenance metadata changed')
    publication.exact(scope.get('current_repository_package_id'),
                      meta['repository_package_id'], 'static current source seal')
    publication.exact(scope.get('current_core_collection_package_id'),
                      core['PACKAGE_ID.txt'].decode().strip(), 'static core identity')
    identities = [scope['current_core_collection_package_id'], receipt['package_id'],
                  payload['PACKAGE_ID.txt'].decode().strip()]
    if any(not isinstance(v, str) or not re.fullmatch(r'[0-9a-f]{64}', v) for v in identities):
        raise ValueError('Static/core/published identity format differs')
    if len(set(identities)) != 3:
        raise ValueError('Static/core/published identities must remain distinct')
    if (type(scope.get('objects')) is not list or len(scope['objects']) != 30
            or set(scope['objects']) != rc.OBJECTS):
        raise ValueError('Static site thirty-object inventory differs')
    unit_files = set()
    entries = set()
    for item in meta['objects']:
        prefix = item['payload_root'].rstrip('/') + '/'
        names = {name for name in core if name.startswith(prefix)}
        if not names:
            raise ValueError('Static site unit payload absent')
        unit_files.update(names)
        entries.add(item['entry'])
    tutorials = {name for name in core if name.startswith('TUTORIALS/')}
    if len(entries) != 30 or len(tutorials) != 14:
        raise ValueError('Static preserved entry/tutorial inventory differs')
    for name in unit_files | (entries - set(ENTRY_IDENTITIES)) | tutorials:
        if payload[name] != core[name]:
            raise ValueError('Static site protected teaching bytes changed: ' + name)
    # Pin these two actual RC10 originals independently of the builder's recipe.
    css = b'h1{overflow-wrap:anywhere}'
    entry_derivatives = []
    for name, (source_digest, site_digest) in ENTRY_IDENTITIES.items():
        marker = css + b'</style>'
        entry = payload[name]
        if entry.count(b'</style>') != 1 or entry.count(marker) != 1:
            raise ValueError('Static setup entry wrapping CSS differs: ' + name)
        restored = entry.replace(marker, b'</style>', 1)
        if (restored != core[name] or rc.sha(restored) != source_digest
                or rc.sha(entry) != site_digest):
            raise ValueError('Static setup entry CSS derivative bytes differ: ' + name)
        entry_derivatives.append({
            'path': name, 'operation': 'INSERT_EXACT_CSS_BEFORE_SOLE_STYLE_CLOSE',
            'css': 'h1{overflow-wrap:anywhere}', 'bytes_added': 26,
            'source_sha256': source_digest, 'site_sha256': site_digest,
            'reason': 'Wrap the setup entry title after observed horizontal overflow at 320 pixels',
            'text_links_and_scripts_unchanged': True})
    exact_tree(scope.get('entry_derivatives'), entry_derivatives,
               'static setup entry CSS declarations')
    expected_derivatives = [
        {'path': name, 'source_sha256': rc.sha(core[name]), 'site_sha256': rc.sha(payload[name]),
         'operation': 'KNOWN_PUBLICATION_WORDING_AND_STATIC_SCOPE_NOTICE'}
        for name in GLOBAL_HTML[:-1]]
    exact_tree(scope.get('global_html_derivatives'), expected_derivatives,
               'static global derivatives')
    css_derivatives = []
    for name in ('index.html', 'COURSE_PLAN.html'):
        css = b'table{table-layout:fixed;overflow-wrap:anywhere}'
        if payload[name].count(b'</style>') != 1 or payload[name].count(css + b'</style>') != 1:
            raise ValueError('Static overview table wrapping CSS differs: ' + name)
        css_derivatives.append({
            'path': name,
            'operation': 'INSERT_EXACT_CSS_BEFORE_SOLE_STYLE_CLOSE_IN_GLOBAL_PRESENTATION_DERIVATIVE',
            'css': 'table{table-layout:fixed;overflow-wrap:anywhere}', 'bytes_added': 48,
            'source_sha256': rc.sha(core[name]), 'site_sha256': rc.sha(payload[name]),
            'reason': 'Wrap overview tables after observed horizontal overflow at 320 pixels',
            'text_links_and_scripts_unchanged_by_css': True})
    exact_tree(scope.get('global_css_derivatives'), css_derivatives,
               'static overview CSS declarations')
    if (payload['PUBLICATION/CLASSROOM_RC10_PUBLICATION.json']
            != rc.checked_path(ROOT, publication.RECEIPT).read_bytes()):
        raise ValueError('Static finite publication receipt copy differs')
    # This independent recipe must match only the declared three URL targets.
    note_source = rc.checked_path(ROOT, '90_RELEASES/RC10_PUBLICATION.md').read_bytes()
    note_text = note_source.decode('utf-8')
    replacements = [
        ('../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/README.md', '../README.md'),
        ('../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/START_HERE.html', '../DOWNLOAD_RC10.html'),
        ('../00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md',
         'https://github.com/antonioclim/WebTech_ASE/blob/main/00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md'),
    ]
    for before, after in replacements:
        if note_text.count('](' + before + ')') != 1:
            raise ValueError('Static source note URL anchor differs')
        note_text = note_text.replace('](' + before + ')', '](' + after + ')', 1)
    if payload['PUBLICATION/RC10_PUBLICATION.md'] != note_text.encode('utf-8'):
        raise ValueError('Static bounded publication note derivative differs')
    note_derivative = {
        'path': 'PUBLICATION/RC10_PUBLICATION.md', 'source_path': '90_RELEASES/RC10_PUBLICATION.md',
        'source_sha256': rc.sha(note_source), 'site_sha256': rc.sha(payload['PUBLICATION/RC10_PUBLICATION.md']),
        'operation': 'REWRITE_EXACT_THREE_REPOSITORY_LINK_TARGETS',
        'url_replacements': [{'from': before, 'to': after} for before, after in replacements],
        'external_procedure_url_policy': 'EVOLVING_MAIN_GUIDE_NOT_PINNED_RELEASE_SOURCE',
        'text_unchanged_except_link_targets': True,
    }
    exact_tree(scope.get('publication_note_derivative'), note_derivative,
               'static bounded publication note declaration')
    manifest = rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    if (payload['.nojekyll'] != b'' or payload['SHA256SUMS.txt'] != manifest
            or payload['PACKAGE_ID.txt'] != (rc.sha(manifest) + '\n').encode()):
        raise ValueError('Static site outer seal differs')
    globals_facts = {}
    for name in GLOBAL_HTML:
        text = payload[name].decode('utf-8')
        page = PageFacts(strict_ids=True)
        page.feed(text)
        if page.langs != ['en-GB']:
            raise ValueError('Global static language differs: ' + name)
        if (re.search(r'prepared.{0,20}(?:and )?not published|prepared documentary candidate'
                      r'|publication is a separate owner action|current published predecessor',
                      text, re.IGNORECASE)
                or 'PREPARED_NOT_PUBLISHED' in text
                or re.search(r'(?:last|current) published.{0,80}\bRC[89]\b', text, re.IGNORECASE)):
            raise ValueError('Stale static publication guidance: ' + name)
        if (text.count('data-site-profile="rc10-static-reading"') != 1
                or receipt['release_url'] not in page.urls
                or 'DOWNLOAD_RC10.html' not in page.urls
                or 'all ten broad gates pending' not in text
                or 'not a Node execution environment' not in text):
            raise ValueError('Global static publication/scope context absent: ' + name)
        globals_facts[name] = page
    for asset in receipt['assets']:
        if (asset['download_url'] not in globals_facts['DOWNLOAD_RC10.html'].urls
                or asset['sha256'] not in payload['DOWNLOAD_RC10.html'].decode()):
            raise ValueError('Published asset absent from static download guide')
    readme = payload['README.md'].decode('utf-8')
    if (receipt['release_url'] not in readme or 'all ten broad gates remain pending' not in readme
            or re.search(r'prepared.{0,20}not published|current published predecessor',
                         readme, re.IGNORECASE)):
        raise ValueError('Static README publication context differs')
    return {'publication_profile': 'PASS_RECORDED_PUBLICATION_FACTS_ONLY',
            'global_pages': len(GLOBAL_HTML), 'local_fragment_checks': local_fragments(payload),
            'site_markdown_local_links': finite_markdown_links(payload),
            'unit_files_compared': len(unit_files), 'entry_pages_compared': len(entries),
            'entry_pages_byte_exact': len(entries) - len(ENTRY_IDENTITIES),
            'entry_css_only_derivatives': len(ENTRY_IDENTITIES),
            'tutorial_files_compared': len(tutorials), 'published_package_id': receipt['package_id'],
            'current_core_package_id': identities[0],
            'site_identity_matches_published_archive': False}


def run(site, check_source=True):
    location = rc.output_path(site)
    source_id = rc.source_identity(ROOT) if check_source else None
    receipt = builder.read_publication()
    core = builder.classroom.build_payload(check_source=check_source)
    expected = builder.compose_payload(core, receipt)
    actual = rc.tree_files(location)
    if set(actual) != set(expected):
        raise ValueError('RC10 static site exact inventory mismatch')
    if any(actual[n].read_bytes() != data for n, data in expected.items()):
        raise ValueError('RC10 static site exact bytes mismatch')
    if any(bool(actual[n].stat().st_mode & 0o111) != n.endswith('.sh') for n in actual):
        raise ValueError('RC10 static site executable modes mismatch')
    if check_source and (rc.source_identity(ROOT) != source_id
                         or rc.strict_json(core['CLASSROOM_COLLECTION.json'])['repository_package_id'] != source_id):
        raise ValueError('Source changed during RC10 static site validation')
    return {
        'schema': 'webtech-classroom-rc10-static-site-validation/v1',
        'status': 'PASS_RC10_STATIC_SITE_ONLY', 'distribution_version': '3.0.0-rc.10',
        'profile': 'RC10_STATIC_READING_AND_NAVIGATION_ONLY', 'files': len(actual),
        'package_id': expected['PACKAGE_ID.txt'].decode().strip(),
        'source_seal_checked': check_source is True,
        **validate_profile(expected, core), **links.check_links(expected),
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
    if report_path:
        data = builder.classroom.encoded(result)
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
