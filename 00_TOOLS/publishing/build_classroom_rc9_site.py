#!/usr/bin/env python3
"""Build the current RC9 static reading site outside the source checkout.

All thirty delivered unit payloads, entry pages and fourteen tutorials retain
their exact reconstructed classroom bytes. Site-only global guidance records
the published download separately from this reading derivative and its identity.
No installation, network operation, Pages deployment or Actions dispatch occurs.
"""
from __future__ import annotations

import argparse
import html
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import build_classroom_rc9 as classroom
import release_contract as rc
import publication_controls as publication

ROOT = classroom.ROOT
VERSION = classroom.VERSION
PROFILE = 'RC9_STATIC_READING_AND_NAVIGATION_ONLY'
SCOPE_FILE = 'SITE_SCOPE.json'
DOWNLOAD_FILE = 'DOWNLOAD_RC9.html'
DOWNLOAD_SOURCE = '00_START_HERE/STUDENT_CLASSROOM_PUBLISHED/START_HERE.html'
PUBLICATION_RECORD_COMMIT = 'aaaa8f1e143aba0254e2fb26e3da81a9c5c616fa'
PUBLICATION_RECORD_BASE = publication.REPOSITORY_URL + '/blob/' + PUBLICATION_RECORD_COMMIT + '/'
PINNED_GUIDE = PUBLICATION_RECORD_BASE + DOWNLOAD_SOURCE
GLOBAL_HTML_PAGES = (
    'index.html', 'START_HERE.html', 'QUALIFICATION.html',
    'COURSE_PLAN.html', 'ASSESSMENT.html',
)
ADDED_FILES = ('.nojekyll', SCOPE_FILE, DOWNLOAD_FILE)
MODIFIED_CORE_FILES = (
    'index.html', 'README.md', 'START_HERE.html', 'QUALIFICATION.html',
    'COURSE_PLAN.html', 'ASSESSMENT.html', 'SHA256SUMS.txt', 'PACKAGE_ID.txt',
)


def read_publication(root=None):
    """Admit only the recorded published RC9; no live request is performed."""
    location = ROOT if root is None else Path(root)
    publication.run(location)
    receipt = rc.strict_json(rc.checked_path(location, publication.RECEIPT).read_bytes())
    plan = rc.strict_json(rc.checked_path(location, publication.PLAN).read_bytes())
    # Validate these loaded bytes as well as the independent consistency run.
    # The fixture source-seal bypass never bypasses publication admission.
    publication.validate_receipt(receipt, plan)
    return receipt


def asset_table(receipt):
    rows = []
    for asset in receipt['assets']:
        rows.append('<tr><td>' + classroom.link(asset['download_url'], asset['name'])
                    + '</td><td>' + str(asset['bytes']) + '</td><td><code>'
                    + html.escape(asset['sha256']) + '</code></td></tr>')
    return ('<table style="table-layout:fixed;overflow-wrap:anywhere">'
            '<caption>The three published RC9 attachments recorded by the receipt</caption>'
            '<thead><tr><th>File</th><th>Bytes</th><th>SHA-256</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table>')


def site_notice(receipt, core_id, homepage=False):
    """Give global routes the current download and honest static-site scope."""
    content = (
        '<section id="static-site-scope" data-site-profile="rc9-static-reading" class="notice">'
        '<h2>RC9 static reading preview</h2>'
        '<p>The ' + classroom.link(receipt['release_url'], 'published RC9 classroom prerelease')
        + ' is the established student download. This preview provides reading and navigation. '
        'It is not a Node execution environment, local application server or Moodle submission service. '
        'Run commands and edit learner files only from the complete extracted published classroom ZIP '
        'on your computer. The S02 browser observations require its separately started local loopback server.</p>'
        '<p>' + classroom.link(DOWNLOAD_FILE, 'Download, verify and extract the three published files')
        + ' before following the local setup and task instructions. '
        'This preview has its own outer manifest and PACKAGE_ID; it is not a release attachment '
        'and its reconstructed core is not claimed to be the published ZIP. '
        'General qualification remains NOT_FINAL with all ten broad gates pending. '
        'No Pages deployment has been observed by this build.</p>'
    )
    if homepage:
        counts = receipt['workflow']['tests']
        content += (
            '<p>The receipt records release ID <code>' + str(receipt['release_id'])
            + '</code>, published at <code>' + html.escape(receipt['published_at'])
            + '</code>, with <code>draft=false</code> and <code>prerelease=true</code>. '
            'The recorded preparation run has ' + str(counts['passed']) + ' PASS + '
            + str(counts['skipped']) + ' SKIP; the skip remains a skip. '
            'Those recorded observations are separate from this local static-site check.</p>'
            '<details><summary>Published files and the three distinct byte identities</summary>'
            + asset_table(receipt)
            + '<p>Published classroom package ID: <code>' + html.escape(receipt['package_id'])
            + '</code>. Published source commit: <code>' + html.escape(receipt['source_commit'])
            + '</code>.</p><p>Current reconstructed core package ID: <code>'
            + html.escape(core_id) + '</code>. It records the current repository seal and can '
            'differ from the published classroom package. The preview’s own outer identity is '
            + classroom.link('PACKAGE_ID.txt', 'this site PACKAGE_ID.txt')
            + '. All thirty unit payloads, thirty entry pages and fourteen tutorials preserve '
            'the corresponding reconstructed core bytes.</p></details>'
        )
    content += (
        '<p>' + classroom.link('START_HERE.html', 'Local setup instructions') + ' · '
        + classroom.link('QUALIFICATION.html', 'Actual scope and pending qualification') + ' · '
        + classroom.link(SCOPE_FILE, 'Static site profile and publication identities')
        + '</p></section>'
    )
    return content


def add_notice(data, notice, name):
    text = data.decode('utf-8')
    if text.count('<main>') != 1 or 'data-site-profile=' in text:
        raise ValueError('Unexpected RC9 global page structure: ' + name)
    return text.replace('<main>', '<main>' + notice, 1).encode('utf-8')


def download_guide(receipt, core_id):
    """Retain the established download guide with finite site-local links."""
    text = rc.checked_path(ROOT, DOWNLOAD_SOURCE).read_text(encoding='utf-8')
    replacements = {
        '../../index.html': 'index.html',
        '../../90_RELEASES/RC9_PUBLICATION.md': PUBLICATION_RECORD_BASE + '90_RELEASES/RC9_PUBLICATION.md',
        '../../90_RELEASES/CLASSROOM_RC9_PUBLICATION.json': PUBLICATION_RECORD_BASE + publication.RECEIPT,
    }
    for before, after in replacements.items():
        original = 'href="' + before + '"'
        if original not in text:
            raise ValueError('Published download guide link differs: ' + before)
        text = text.replace(original, 'href="' + html.escape(after, quote=True) + '"')
    if 'href="../' in text:
        raise ValueError('Unresolved repository-relative download guide link')
    for asset in receipt['assets']:
        if asset['download_url'] not in text or asset['sha256'] not in text:
            raise ValueError('Published download guide asset identity differs')
    notice = site_notice(receipt, core_id) + (
        '<p class="status">This page reproduces the established published download instructions '
        'within the reading preview. The instructions below apply to the downloaded published ZIP. '
        'The text-version links lead to this preview’s README, which explains its separate scope. '
        + classroom.link(PINNED_GUIDE, 'Inspect the pinned original download guide') + '.</p>'
    )
    return add_notice(text.encode('utf-8'), notice, DOWNLOAD_FILE)


def site_readme(receipt, core_id):
    asset_lines = [
        '- [' + item['name'] + '](' + item['download_url'] + ') — '
        + str(item['bytes']) + ' bytes; SHA-256 `' + item['sha256'] + '`.'
        for item in receipt['assets']
    ]
    counts = receipt['workflow']['tests']
    text = (
        '# RC9 static reading preview and published classroom download\n\n'
        'The [published RC9 prerelease](' + receipt['release_url'] + ') is the established '
        'student distribution. It was published at `' + receipt['published_at'] + '` with '
        'release ID `' + str(receipt['release_id']) + '`, `draft=false` and `prerelease=true`. '
        'Follow [the complete download, verification and extraction guide](' + DOWNLOAD_FILE + ') '
        'before starting local work. Download exactly these three attached files:\n\n'
        + '\n'.join(asset_lines) + '\n\n'
        'This site provides static reading and navigation only. It does not run Node applications, '
        'start local servers or accept Moodle submissions. Read [the setup instructions](START_HERE.html), '
        'choose this week’s course or seminar from [the home page](index.html) and perform the commands '
        'only in the complete extracted published classroom ZIP on your own computer. '
        'For S02, start the documented local loopback server before making browser observations.\n\n'
        'From the extracted collection root, run `node VERIFY_COLLECTION.mjs` before editing and '
        '`node VERIFY_COLLECTION.mjs --allow-student-edits` after editing only the declared learner '
        'targets. Task checks are separate. Complete every required microproject individually and '
        'record actual outcomes. Use the current seminar evidence form, review its PDF and submit '
        'through the actual Moodle Assignment authorised by your lecturer. This preview does not '
        'establish a submission receipt or grade.\n\n'
        'The published classroom package ID is `' + receipt['package_id'] + '`, tied to source '
        'commit `' + receipt['source_commit'] + '`. The current reconstructed core package ID is `'
        + core_id + '`. Reconstruction records the current repository seal and may therefore '
        'differ from the published ZIP. This preview has a third, separately sealed outer identity '
        'in [PACKAGE_ID.txt](PACKAGE_ID.txt); it is not one of the three release attachments. '
        'All thirty unit payloads, thirty entry pages and fourteen tutorials retain their corresponding '
        'reconstructed core bytes. The five global HTML notices, this README, download guide and '
        'outer site controls are explicit site derivatives. Frozen recipes and templates remain unchanged.\n\n'
        'The receipt records ' + str(counts['passed']) + ' PASS + ' + str(counts['skipped'])
        + ' SKIP in the existing owner-started preparation run. The skipped case is not a PASS. '
        'General qualification remains `NOT_FINAL`; all ten broad gates remain pending. '
        'Static consistency of the receipt is not a new live release verification. '
        'This build does not observe a Pages deployment, native acceptance, live Moodle or a genuine '
        'student pilot. The 60-minute plan remains an unpiloted estimate.\n\n'
        'Read [qualification scope](QUALIFICATION.html), [evidence and assessment](ASSESSMENT.html) '
        'and [the exact site profile](SITE_SCOPE.json). The [pinned original download guide]('
        + PINNED_GUIDE + ') retains the full source instructions. Historical inner versions and carrier names '
        'record provenance and do not redirect the current download to an older release.\n'
    )
    return text.encode('utf-8')


def build_payload(check_source=True):
    """Production authenticates the current seal; tests may scope it explicitly."""
    receipt = read_publication()
    core = classroom.build_payload(check_source=check_source)
    meta = rc.strict_json(core['CLASSROOM_COLLECTION.json'])
    if meta['distribution_version'] != VERSION or len(meta['objects']) != 30:
        raise ValueError('Current RC9 classroom source inventory differs')
    if any(name in core for name in ADDED_FILES):
        raise ValueError('Site-only controls must not replace core classroom files')
    payload = dict(core)
    core_id = core['PACKAGE_ID.txt'].decode().strip()
    for name in GLOBAL_HTML_PAGES:
        payload[name] = add_notice(core[name], site_notice(receipt, core_id, name == 'index.html'), name)
    payload['README.md'] = site_readme(receipt, core_id)
    payload[DOWNLOAD_FILE] = download_guide(receipt, core_id)
    payload['.nojekyll'] = b''
    payload[SCOPE_FILE] = classroom.encoded({
        'schema': 'webtech-classroom-rc9-static-site/v2',
        'distribution_version': VERSION,
        'profile': PROFILE,
        'source_publication_status': receipt['status'],
        'published_classroom_package_id': receipt['package_id'],
        'published_source_commit': receipt['source_commit'],
        'release_id': receipt['release_id'],
        'release_url': receipt['release_url'],
        'published_at': receipt['published_at'],
        'published_assets': receipt['assets'],
        'recorded_workflow_tests': receipt['workflow']['tests'],
        'qualification_gates': receipt['qualification_gates'],
        'current_core_collection_package_id': core_id,
        'current_repository_package_id': meta['repository_package_id'],
        'core_file_count': len(core),
        'objects': sorted(item['object_id'] for item in meta['objects']),
        'unit_payload_policy': 'ALL_THIRTY_UNIT_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'entry_policy': 'ALL_THIRTY_ENTRY_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'tutorial_policy': 'ALL_FOURTEEN_TUTORIAL_BYTES_EXACT_CORE_CLASSROOM_COPY',
        'site_only_added_files': list(ADDED_FILES),
        'modified_core_files': list(MODIFIED_CORE_FILES),
        'last_published_classroom_download_recorded_by_source': receipt['release_url'],
        'publication_receipt_validation': 'PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY',
        'publication_record_source_commit': PUBLICATION_RECORD_COMMIT,
        'published_asset_bytes_reverified_by_site_build': False,
        'site_is_a_release_asset': False,
        'node_execution_provided': False,
        'moodle_submission_provided': False,
        'qualificationVerdict': 'NOT_FINAL',
        'native_acceptance': False,
        'pages_deployment_observed': False,
        'actions_dispatched': 0,
    })
    # Cover site-only files and global guidance derivatives with a new identity.
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
    scope = rc.strict_json(payload[SCOPE_FILE])
    result = {
        'schema': 'webtech-classroom-rc9-static-site-build/v1',
        'status': 'PASS_RC9_STATIC_SITE_BUILD_ONLY',
        'distribution_version': VERSION, 'profile': PROFILE,
        'files': len(payload), 'output': str(out),
        'package_id': payload['PACKAGE_ID.txt'].decode().strip(),
        'published_classroom_package_id': scope['published_classroom_package_id'],
        'current_core_collection_package_id': scope['current_core_collection_package_id'],
        'source_publication_status': scope['source_publication_status'],
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
