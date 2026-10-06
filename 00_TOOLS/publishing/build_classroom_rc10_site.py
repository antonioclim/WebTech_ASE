#!/usr/bin/env python3
"""Build the RC10 static reading derivative outside the sealed source checkout.

All thirty unit payloads, twenty-eight entry pages and fourteen tutorials retain
their exact current RC10 reconstructed bytes. Two declared setup entry copies
add only reversible title wrapping CSS. Global presentation and site controls
also differ explicitly. This is not the published release ZIP, a runtime
environment, a Moodle service or evidence of a Pages deployment.
"""
from __future__ import annotations

import argparse
import html
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import build_classroom_rc10 as classroom
import release_contract as rc
import publication_rc10_controls as publication

ROOT = classroom.ROOT
VERSION = classroom.VERSION
PROFILE = 'RC10_STATIC_READING_AND_NAVIGATION_ONLY'
SCOPE_FILE = 'SITE_SCOPE.json'
DOWNLOAD_FILE = 'DOWNLOAD_RC10.html'
DOWNLOAD_SOURCE = '00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/START_HERE.html'
PUBLICATION_NOTE = '90_RELEASES/RC10_PUBLICATION.md'
RECEIPT_COPY = 'PUBLICATION/CLASSROOM_RC10_PUBLICATION.json'
NOTE_COPY = 'PUBLICATION/RC10_PUBLICATION.md'
PROCEDURE_URL = publication.REPOSITORY_URL + '/blob/main/00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md'
NOTE_LINK_REPLACEMENTS = (
    ('../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/README.md', '../README.md'),
    ('../00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/START_HERE.html', '../DOWNLOAD_RC10.html'),
    ('../00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md', PROCEDURE_URL),
)
GLOBAL_HTML_PAGES = ('index.html', 'START_HERE.html', 'QUALIFICATION.html',
                     'COURSE_PLAN.html', 'ASSESSMENT.html')
ENTRY_WRAP_CSS = b'h1{overflow-wrap:anywhere}'
ENTRY_SOURCES = {
    'ENTRY/SETUP_WINDOWS.html': 'bb194285927917df69fed1d60437e283dc1f27c96eb7250048386e9e4f438c77',
    'ENTRY/SETUP_MACOS_LINUX.html': '25d5073f3267c0bc3a253afc07c79c4a183bceb41b088b6cb1e0b43427499698',
}
GLOBAL_TABLE_CSS = b'table{table-layout:fixed;overflow-wrap:anywhere}'
GLOBAL_CSS_PAGES = ('index.html', 'COURSE_PLAN.html')
ADDED_FILES = ('.nojekyll', SCOPE_FILE, DOWNLOAD_FILE, RECEIPT_COPY, NOTE_COPY)
MODIFIED_CORE_FILES = (*GLOBAL_HTML_PAGES, 'README.md', *ENTRY_SOURCES,
                       'SHA256SUMS.txt', 'PACKAGE_ID.txt')
link = classroom.predecessor.link


def read_publication(root=None):
    """Strictly admit the recorded publication, without any live request."""
    location = ROOT if root is None else Path(root)
    receipt = rc.strict_json(rc.checked_path(location, publication.RECEIPT).read_bytes())
    plan = rc.strict_json(rc.checked_path(location, publication.PLAN).read_bytes())
    publication.validate_receipt(receipt, plan)
    return receipt


def asset_table(receipt):
    rows = [('<tr><td>' + link(a['download_url'], a['name']) + '</td><td>'
             + str(a['bytes']) + '</td><td><code>' + html.escape(a['sha256'])
             + '</code></td></tr>') for a in receipt['assets']]
    return ('<table style="table-layout:fixed;overflow-wrap:anywhere">'
            '<caption>The three recorded published RC10 release attachments</caption>'
            '<thead><tr><th>File</th><th>Bytes</th><th>SHA-256</th></tr></thead>'
            '<tbody>' + ''.join(rows) + '</tbody></table>')


def site_notice(receipt, core_id, homepage=False):
    body = (
        '<section id="static-site-scope" data-site-profile="rc10-static-reading" class="notice">'
        '<h2>Published RC10 classroom download and static reading site</h2><p>'
        + link(receipt['release_url'], 'Download the published RC10 classroom prerelease')
        + '. This site provides reading and navigation. It is not a Node execution environment, '
        'local application server or Moodle submission service. Download and extract the complete '
        'published classroom ZIP before running commands or editing learner files on your computer. '
        'S02 browser observations require its separately started local loopback server.</p><p>'
        + link(DOWNLOAD_FILE, 'Download, verify and extract the three published files')
        + '. General qualification remains NOT_FINAL with all ten broad gates pending. '
        'This static site is a declared presentation derivative with its own outer manifest and '
        'PACKAGE_ID. It is not a release attachment. Its current reconstructed core is distinct '
        'from the published ZIP because it records the current repository seal. '
        'No Pages deployment is observed by this build.</p>'
    )
    if homepage:
        body += (
            '<details><summary>Publication facts, scope and three distinct identities</summary>'
            '<p>Recorded release ID <code>' + str(receipt['release_id']) + '</code>, published at '
            '<code>' + html.escape(receipt['published_at']) + '</code>, with '
            '<code>draft=false</code> and <code>prerelease=true</code>. The recorded owner-started '
            'preparation run passed 15 RC10 tests and 2 Day 0 static tests without skips. '
            'The earlier 52 local Firefox semantic cases were not repeated in that hosted run. '
            'Those observations are separate from this static-site validation.</p>'
            + asset_table(receipt)
            + '<p>Published collection PACKAGE_ID: <code>' + html.escape(receipt['package_id'])
            + '</code>. Published source commit: <code>' + html.escape(receipt['source_commit'])
            + '</code>. Current reconstructed core PACKAGE_ID: <code>' + html.escape(core_id)
            + '</code>. The third identity is ' + link('PACKAGE_ID.txt', 'this site PACKAGE_ID')
            + '. All thirty unit payloads, twenty-eight entry pages and fourteen tutorials are exact '
            'copies of the reconstructed core. Two setup entry copies add only reversible title '
            'wrapping CSS after observed 320-pixel overflow. The two overview tables have a declared '
            'wrapping CSS rule. Entry text, links and scripts remain unchanged. '
            'SITE_SCOPE.json declares these CSS operations and the global publication '
            'wording and presentation derivatives. Unit metadata retains its historical candidate '
            'status as provenance; it does not override the separately recorded publication.</p></details>'
        )
    return body + ('<p>' + link('START_HERE.html', 'Local setup instructions') + ' · '
                   + link('QUALIFICATION.html', 'Pending qualification and actual scope') + ' · '
                   + link(SCOPE_FILE, 'Exact static-site profile') + '</p></section>')


def add_notice(data, notice, name):
    text = data.decode('utf-8')
    if text.count('<main>') != 1 or 'data-site-profile=' in text:
        raise ValueError('Unexpected RC10 global page structure: ' + name)
    return text.replace('<main>', '<main>' + notice, 1).encode('utf-8')


def insert_css(data, css, name):
    if data.count(b'</style>') != 1 or css in data:
        raise ValueError('CSS presentation insertion anchor differs: ' + name)
    return data.replace(b'</style>', css + b'</style>', 1)


def wrap_setup_entry(data, name):
    """Admit the exact RC10 setup entry before a reversible 26-byte insertion."""
    if name not in ENTRY_SOURCES or rc.sha(data) != ENTRY_SOURCES[name]:
        raise ValueError('RC10 setup entry source differs from the declared CSS derivative')
    return insert_css(data, ENTRY_WRAP_CSS, name)


def publication_wording(data, name):
    """Replace only known preparation statements in the five global derivatives."""
    text = data.decode('utf-8')
    replacements = {
        'index.html': [
            ('RC10 documentary candidate ' + VERSION + ', prepared locally and not published.',
             'RC10 instruction-remediated classroom prerelease ' + VERSION + ' is published.', 1),
            ('Web Technologies — RC10 classroom candidate',
             'Web Technologies — published RC10 classroom prerelease', 2)],
        'COURSE_PLAN.html': [
            ('RC10 documentary candidate ' + VERSION + ', prepared locally and not published.',
             'RC10 instruction-remediated classroom prerelease ' + VERSION + ' is published.', 1)],
        'START_HERE.html': [
            ('RC10 is a documentary classroom candidate, prepared and not published.',
             'RC10 is a published instruction-remediated classroom prerelease.', 1)],
        'QUALIFICATION.html': [
            ('RC10 is a prepared documentary candidate and publication is a separate owner action.',
             'RC10 is a published prerelease; publication does not satisfy a pending qualification gate.', 1)],
        'ASSESSMENT.html': [],
    }
    for before, after, count in replacements[name]:
        if text.count(before) != count:
            raise ValueError('RC10 publication wording anchor differs: ' + name)
        text = text.replace(before, after)
    return text.encode('utf-8')


def download_guide(receipt, core_id):
    text = rc.checked_path(ROOT, DOWNLOAD_SOURCE).read_text(encoding='utf-8')
    replacements = {
        '../../index.html': 'index.html',
        '../../90_RELEASES/RC10_PUBLICATION.md': NOTE_COPY,
        '../../90_RELEASES/CLASSROOM_RC10_PUBLICATION.json': RECEIPT_COPY,
    }
    for before, after in replacements.items():
        original = 'href="' + before + '"'
        if original not in text:
            raise ValueError('RC10 download guide link anchor differs: ' + before)
        text = text.replace(original, 'href="' + html.escape(after, quote=True) + '"')
    if 'href="../' in text:
        raise ValueError('Unresolved repository-relative RC10 download guide link')
    for asset in receipt['assets']:
        if asset['download_url'] not in text or asset['sha256'] not in text:
            raise ValueError('RC10 download guide asset identity differs')
    return add_notice(text.encode('utf-8'), site_notice(receipt, core_id) + (
        '<p class="status">These download instructions apply to the complete published classroom '
        'ZIP. The text-version link opens this static site’s separate scope README. The publication '
        'receipt below is an exact finite source copy. The note changes only three link targets for '
        'this site; its maintainer procedure URL points to evolving main rather than a pinned '
        'release source. The exact operation and hashes are declared in SITE_SCOPE.json. This build does not '
        'recheck the live release or download its binary assets.</p>'), DOWNLOAD_FILE)


def site_readme(receipt, core_id):
    assets = '\n'.join('- [' + a['name'] + '](' + a['download_url'] + ') — '
                       + str(a['bytes']) + ' bytes; SHA-256 `' + a['sha256'] + '`.'
                       for a in receipt['assets'])
    return (
        '# Published RC10 classroom download and static reading site\n\n'
        'The [published RC10 prerelease](' + receipt['release_url'] + ') is the current student '
        'distribution, release ID `' + str(receipt['release_id']) + '`, published at `'
        + receipt['published_at'] + '` with `draft=false` and `prerelease=true`. Follow '
        '[the download, verification and extraction guide](' + DOWNLOAD_FILE + ') and download '
        'exactly these three release attachments:\n\n' + assets + '\n\n'
        'This site provides static reading and navigation only. It does not execute Node '
        'applications, start local servers or accept Moodle submissions. Read [setup](START_HERE.html), '
        'choose the course or seminar from [the home page](index.html) and perform commands in the '
        'complete extracted published classroom ZIP on your own computer. S02 needs the documented '
        'local loopback server. From the extracted collection root run `node VERIFY_COLLECTION.mjs` '
        'before editing and `node VERIFY_COLLECTION.mjs --allow-student-edits` after editing only '
        'declared learner targets. Task checks are separate; record actual outcomes. Complete every '
        'required microproject individually, review the evidence PDF and submit only through your '
        'lecturer’s actual authorised Moodle Assignment. This site establishes no grade or receipt.\n\n'
        'Published collection PACKAGE_ID: `' + receipt['package_id'] + '`. Published source commit: `'
        + receipt['source_commit'] + '`. Current reconstructed core PACKAGE_ID: `' + core_id + '`. '
        'The core records the current repository seal and therefore differs from the published '
        'ZIP. This static derivative has a third outer identity in [PACKAGE_ID.txt](PACKAGE_ID.txt). '
        'All thirty unit payloads, twenty-eight entry pages and fourteen tutorials preserve their exact '
        'reconstructed core bytes. Two setup entry copies add only the reversible 26-byte CSS rule '
        '`h1{overflow-wrap:anywhere}` before the sole closing style tag; removing it restores the '
        'exact entry source bytes. The two overview pages add only the 48-byte CSS rule '
        '`table{table-layout:fixed;overflow-wrap:anywhere}` to their global presentation derivatives. '
        'These changes address observed horizontal overflow at a 320-pixel viewport. Entry text, '
        'links and scripts remain unchanged. The exact operations and source/site hashes appear '
        'in SITE_SCOPE.json. The five global HTML notices and known publication wording, '
        'this README and outer controls differ. The download guide, exact finite publication receipt, '
        'publication note with three explicit link-target changes, `.nojekyll` and SITE_SCOPE.json '
        'are site additions. The note’s maintainer procedure URL points to evolving main; it is '
        'not a pinned release-source link. SITE_SCOPE.json records its source/site hashes and exact '
        'replacement URLs. Frozen classroom recipes, '
        'templates and teaching payloads remain unchanged. Historical candidate descriptors record '
        'reconstructed provenance rather than a current publication verdict.\n\n'
        'The recorded owner-started preparation run passed 15 RC10 tests and 2 Day 0 static tests '
        'with no skips. The earlier 52 local Firefox semantic cases were not repeated in that run. '
        'This is recorded evidence, not a new hosted execution or release download. General '
        'qualification remains `NOT_FINAL`; all ten broad gates remain pending. This build does '
        'not establish a Pages deployment, native acceptance, Word/PDF layout, live Moodle or a '
        'genuine student pilot. The 60-minute plan is unpiloted. Read [qualification](QUALIFICATION.html), '
        '[assessment](ASSESSMENT.html), [site scope](SITE_SCOPE.json), [recorded publication]('
        + NOTE_COPY + ') and [the finite receipt](' + RECEIPT_COPY + ').\n'
    ).encode('utf-8')


def publication_note():
    """Preserve publication prose and rewrite only three exact Markdown targets."""
    source = rc.checked_path(ROOT, PUBLICATION_NOTE).read_bytes()
    text = source.decode('utf-8')
    for before, after in NOTE_LINK_REPLACEMENTS:
        original = '](' + before + ')'
        if text.count(original) != 1:
            raise ValueError('RC10 publication note link anchor differs: ' + before)
        text = text.replace(original, '](' + after + ')', 1)
    return text.encode('utf-8'), source


def compose_payload(core, receipt):
    """Compose an admitted core; production callers reconstruct it themselves."""
    meta = rc.strict_json(core['CLASSROOM_COLLECTION.json'])
    if meta['distribution_version'] != VERSION or len(meta['objects']) != 30:
        raise ValueError('RC10 reconstructed classroom inventory differs')
    if any(name in core for name in ADDED_FILES):
        raise ValueError('Site-only controls cannot replace core classroom files')
    payload = dict(core)
    core_id = core['PACKAGE_ID.txt'].decode().strip()
    for name in GLOBAL_HTML_PAGES:
        global_page = publication_wording(core[name], name)
        if name in GLOBAL_CSS_PAGES:
            global_page = insert_css(global_page, GLOBAL_TABLE_CSS, name)
        payload[name] = add_notice(global_page,
                                   site_notice(receipt, core_id, name == 'index.html'), name)
    for name in ENTRY_SOURCES:
        payload[name] = wrap_setup_entry(core[name], name)
    payload['README.md'] = site_readme(receipt, core_id)
    payload[DOWNLOAD_FILE] = download_guide(receipt, core_id)
    payload[RECEIPT_COPY] = rc.checked_path(ROOT, publication.RECEIPT).read_bytes()
    payload[NOTE_COPY], note_source = publication_note()
    payload['.nojekyll'] = b''
    payload[SCOPE_FILE] = classroom.encoded({
        'schema': 'webtech-classroom-rc10-static-site/v1', 'distribution_version': VERSION,
        'profile': PROFILE, 'source_publication_status': receipt['status'],
        'published_classroom_package_id': receipt['package_id'],
        'published_source_commit': receipt['source_commit'], 'release_id': receipt['release_id'],
        'release_url': receipt['release_url'], 'published_at': receipt['published_at'],
        'published_assets': receipt['assets'], 'recorded_workflow': receipt['workflow'],
        'qualification_gates': receipt['qualification_gates'],
        'current_core_collection_package_id': core_id,
        'current_repository_package_id': meta['repository_package_id'], 'core_file_count': len(core),
        'objects': sorted(item['object_id'] for item in meta['objects']),
        'unit_payload_policy': 'ALL_THIRTY_UNIT_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_policy': 'TWENTY_EIGHT_EXACT_CORE_ENTRY_COPIES_AND_TWO_DECLARED_CSS_ONLY_DERIVATIVES',
        'entry_derivatives': [
            {'path': name, 'operation': 'INSERT_EXACT_CSS_BEFORE_SOLE_STYLE_CLOSE',
             'css': ENTRY_WRAP_CSS.decode('ascii'), 'bytes_added': len(ENTRY_WRAP_CSS),
             'source_sha256': rc.sha(core[name]), 'site_sha256': rc.sha(payload[name]),
             'reason': 'Wrap the setup entry title after observed horizontal overflow at 320 pixels',
             'text_links_and_scripts_unchanged': True}
            for name in ENTRY_SOURCES],
        'tutorial_policy': 'ALL_FOURTEEN_TUTORIAL_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'site_only_added_files': list(ADDED_FILES), 'modified_core_files': list(MODIFIED_CORE_FILES),
        'global_html_derivatives': [
            {'path': name, 'source_sha256': rc.sha(core[name]), 'site_sha256': rc.sha(payload[name]),
             'operation': 'KNOWN_PUBLICATION_WORDING_AND_STATIC_SCOPE_NOTICE'}
            for name in GLOBAL_HTML_PAGES],
        'global_css_derivatives': [
            {'path': name,
             'operation': 'INSERT_EXACT_CSS_BEFORE_SOLE_STYLE_CLOSE_IN_GLOBAL_PRESENTATION_DERIVATIVE',
             'css': GLOBAL_TABLE_CSS.decode('ascii'), 'bytes_added': len(GLOBAL_TABLE_CSS),
             'source_sha256': rc.sha(core[name]), 'site_sha256': rc.sha(payload[name]),
             'reason': 'Wrap overview tables after observed horizontal overflow at 320 pixels',
             'text_links_and_scripts_unchanged_by_css': True}
            for name in GLOBAL_CSS_PAGES],
        'publication_receipt_validation': 'PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY',
        'publication_record_policy': 'FINITE_EXACT_RECEIPT_AND_BOUNDED_NOTE_LINK_DERIVATIVE',
        'publication_note_derivative': {
            'path': NOTE_COPY, 'source_path': PUBLICATION_NOTE,
            'source_sha256': rc.sha(note_source), 'site_sha256': rc.sha(payload[NOTE_COPY]),
            'operation': 'REWRITE_EXACT_THREE_REPOSITORY_LINK_TARGETS',
            'url_replacements': [{'from': before, 'to': after}
                                 for before, after in NOTE_LINK_REPLACEMENTS],
            'external_procedure_url_policy': 'EVOLVING_MAIN_GUIDE_NOT_PINNED_RELEASE_SOURCE',
            'text_unchanged_except_link_targets': True,
        },
        'published_asset_bytes_reverified_by_site_build': False,
        'site_is_a_release_asset': False, 'node_execution_provided': False,
        'moodle_submission_provided': False, 'qualificationVerdict': 'NOT_FINAL',
        'native_acceptance': False, 'pages_deployment_observed': False, 'actions_dispatched': 0,
    })
    payload['SHA256SUMS.txt'] = rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    rc.namespace([(name, False) for name in payload])
    classroom.pages.check_links(payload)
    return payload


def build_payload(check_source=True):
    source_id = rc.source_identity(ROOT) if check_source else None
    receipt = read_publication()
    core = classroom.build_payload(check_source=check_source)
    payload = compose_payload(core, receipt)
    if check_source and (rc.source_identity(ROOT) != source_id
                         or rc.strict_json(core['CLASSROOM_COLLECTION.json'])['repository_package_id'] != source_id):
        raise ValueError('Source changed during RC10 static site composition')
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
    if set(actual) != set(payload) or any(actual[n].read_bytes() != d for n, d in payload.items()):
        raise ValueError('Existing different static site output')
    if any(bool(actual[n].stat().st_mode & 0o111) != n.endswith('.sh') for n in actual):
        raise ValueError('Existing static site executable modes differ')


def build_site(output, report=None, check_source=True):
    out = rc.output_path(output)
    report_path = rc.output_path(report) if report else None
    no_overlap([out] + ([report_path] if report_path else []))
    payload = build_payload(check_source=check_source)
    scope = rc.strict_json(payload[SCOPE_FILE])
    result = {
        'schema': 'webtech-classroom-rc10-static-site-build/v1',
        'status': 'PASS_RC10_STATIC_SITE_BUILD_ONLY', 'distribution_version': VERSION,
        'profile': PROFILE, 'files': len(payload), 'output': str(out),
        'package_id': payload['PACKAGE_ID.txt'].decode().strip(),
        'published_classroom_package_id': scope['published_classroom_package_id'],
        'current_core_collection_package_id': scope['current_core_collection_package_id'],
        'source_publication_status': scope['source_publication_status'],
        'source_seal_checked': check_source is True, 'qualificationVerdict': 'NOT_FINAL',
        'native_acceptance': False, 'pages_deployment_observed': False, 'actions_dispatched': 0,
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
