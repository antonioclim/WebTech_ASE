#!/usr/bin/env python3
"""Build from a frozen preparation source; reject the later published-release portal."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
from current_contract import (verify_source, verify_units, verify_course_map,
                              verify_links, verify_progress, sha,
                              manifest_from_hashes, strict_json, CONTROLS, MANIFEST, PACKAGE_ID)

VERSION = '4.0.0'
PROFILE_PATH = 'metadata/PUBLICATION_PROFILE.json'
PROFILE_ID = 'windows-observed-v4.0.0'
STAMP = (2026, 10, 10, 0, 0, 0)
EXCLUDED_PREFIXES = ('.github/', '00_TOOLS/publishing/',
                     '00_TOOLS/maintainer/', '00_TOOLS/acceptance/')
DERIVATION = 'metadata/DISTRIBUTION_DERIVATION.json'
PUBLISHED_RELEASE_PATH = 'metadata/PUBLISHED_RELEASE.json'

STUDENT_TOOLS = '''# Verify this Windows-profile teaching distribution

The complete distribution contains 14 courses, 14 seminars, two setup units and their runnable support. Its 40 required individual projects and 38 unfinished learner targets retain their supplied contracts. The declared publication profile is `windows-observed-v4.0.0`; see [the exact profile](../metadata/PUBLICATION_PROFILE.json) and [qualification scope](../00_START_HERE/QUALIFICATION.html).

From the extracted collection root run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs
```

After changing only the declared learner targets or creating declared runtime directories run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits
```

Python provides an optional independent check:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict
```

These checks verify supplied bytes and project identities. They neither grade an implementation nor execute a browser. Follow each selected seminar's commands from its stated working directory. [Runtime support](runtime/README.md) describes the operation-selected policy.

General qualification remains **NOT_FINAL** and broad native acceptance remains false. Source technical eligibility applies only to the declared observed Windows profile with its recorded limits. The packaging tool does not repeat the owner browser/PDF batch or execute native macOS. Retained macOS/Linux guidance and historical Word references do not extend the accepted profile. Keep private drafts, logs, screenshots and PDFs outside the complete extracted collection.

Owner publishing, maintenance, acceptance and automation files are omitted. [The derivation record](../metadata/DISTRIBUTION_DERIVATION.json) binds the exact authenticated source commit, source identity and filtering. All teaching unit bytes and unit identities are retained. Preparing this archive performs no publication and changes no frozen release.
'''

STUDENT_INTEGRITY = '''# Teaching distribution integrity

Open a terminal in the extracted collection root. Before editing run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs
```

After changing only the declared learner targets or creating declared runtime directories run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits
```

The retained paths `metadata/current-integrity/REPOSITORY_SHA256SUMS.txt` and `metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt` identify this filtered distribution, rather than the original repository inventory. The manifest covers every supplied file except these two self-controls, with sorted SHA-256 rows and UTF-8/LF bytes. PACKAGE_ID is SHA-256 of those exact manifest bytes, followed by LF. Byte identities are neither signatures nor acceptance results.

[The derivation record](metadata/DISTRIBUTION_DERIVATION.json) records the exact clean source commit, source package identity, excluded owner files and two rewritten common guides. Source and distribution identities differ. All 30 complete teaching/setup units retain their supplied bytes, identities and committed file modes. C01 retains `90_AUDIT`, C02 retains `06_AUDIT` and other units retain their outer controls. Student-edit mode admits only the 38 declared learner targets and 83 runtime directories while continuing to check protected files.

Read [the Windows publication profile](metadata/PUBLICATION_PROFILE.json) and [qualification limits](00_START_HERE/QUALIFICATION.html). Source technical eligibility is separate from broad native acceptance, completed student work or publication. The build does not execute browser, PDF, native macOS or Moodle operations. Keep private evidence outside the entire collection.
'''


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def validate_output(output):
    output = Path(output).absolute()
    for ancestor in [output, *output.parents]:
        if ancestor.is_symlink():
            raise ValueError('Output path traverses a symlink')
    if output.resolve().is_relative_to(ROOT.resolve()) or ROOT.resolve().is_relative_to(output.resolve()):
        raise ValueError('Output directory must be separate from the entire repository')
    if output.exists():
        raise ValueError('Output directory already exists; use a new destination and preserve existing files')
    return output


def publication_identity(version, release_tag, mode):
    if version != VERSION or mode not in ('final', 'review'):
        raise ValueError('Explicit version 4.0.0 and mode final or review required')
    if release_tag == 'v4.0.0-rc.1':
        raise ValueError('Frozen RC1 identity is protected; never replace its assets or tag')
    if mode == 'final':
        if release_tag != 'v4.0.0':
            raise ValueError('Final mode requires explicit release tag v4.0.0')
    else:
        match = re.fullmatch(r'v4\.0\.0-rc\.([1-9][0-9]*)', release_tag or '')
        if not match or int(match.group(1)) < 2:
            raise ValueError('Review mode requires an explicitly selected v4.0.0-rc.N identity with N >= 2')
    root = 'WEBTECH_ASE_EN_GB_CLASSROOM_' + release_tag
    return {'version': version, 'mode': mode, 'release_tag': release_tag,
            'archive_root': root + '/', 'archive': root + '.zip'}


def authenticate_commit(expected, files):
    if not isinstance(expected, str) or not re.fullmatch(r'[0-9a-f]{40}', expected):
        raise ValueError('An explicit complete lowercase source commit SHA is required')
    def git(*args, binary=False):
        result = subprocess.run(['git', *args], cwd=ROOT, capture_output=True,
                                text=not binary, timeout=30)
        if result.returncode:
            raise ValueError('Git cannot authenticate the complete release source: ' + ' '.join(args[:2]))
        return result.stdout
    top = git('rev-parse', '--show-toplevel').strip()
    head = git('rev-parse', 'HEAD').strip()
    status = git('status', '--porcelain=v1', '--untracked-files=all', '--ignore-submodules=none')
    if Path(top).resolve() != ROOT.resolve() or head != expected or status:
        raise ValueError('Release source must be the exact clean complete checkout HEAD')
    for row in git('ls-files', '-v', '-z', binary=True).split(b'\0'):
        if row and (row[:1].islower() or row[:1] == b'S'):
            raise ValueError('Assume-unchanged and skip-worktree flags cannot authenticate release source')
    entries = {}
    modes = {}
    for row in git('ls-tree', '-rz', '--full-tree', '--long', expected, binary=True).split(b'\0'):
        if not row:
            continue
        header, encoded_name = row.split(b'\t', 1)
        mode, kind, oid, size = header.split()
        name = encoded_name.decode('utf-8')
        if kind != b'blob' or mode not in (b'100644', b'100755') or name in entries:
            raise ValueError('Only distinct regular committed Git blobs are admitted')
        entries[name] = (oid.decode('ascii'), int(size))
        modes[name] = int(mode, 8) & 0o777
    if set(entries) != set(files):
        raise ValueError('Supplied source inventory differs from the exact committed Git tree')
    for name, path in files.items():
        content = path.read_bytes()
        observed = hashlib.sha1(b'blob ' + str(len(content)).encode('ascii') + b'\0' + content).hexdigest()
        if (observed, len(content)) != entries[name]:
            raise ValueError('Source bytes or size differ from committed Git blob: ' + name)
        # Windows does not represent Unix executable bits. Archive permissions
        # always come from the authenticated Git tree, never a filename suffix.
        if os.name != 'nt' and path.stat().st_mode & 0o777 != modes[name]:
            raise ValueError('Source mode differs from committed Git mode: ' + name)
    tree = git('rev-parse', expected + '^{tree}').strip()
    if not re.fullmatch(r'[0-9a-f]{40}', tree):
        raise ValueError('Malformed authenticated source tree identity')
    return {'source_commit': expected, 'source_tree': tree,
            'source_commit_state': 'AUTHENTICATED_CLEAN_COMPLETE_GIT_HEAD',
            'git_blob_count': len(entries), 'committed_modes': modes,
            'source_inventory_blob_sizes_and_modes_authenticated': True}


def verify_publication_profile(meta, progress, files):
    profile = strict_json(files[PROFILE_PATH].read_bytes())
    if (profile.get('schema') != 'webtech-publication-profile/v1'
            or profile.get('profile_id') != PROFILE_ID
            or profile.get('final_target_version') != VERSION
            or profile.get('technical_qualification') != 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS'
            or profile.get('publication_qualified') is not True
            or profile.get('qualificationVerdict') != 'NOT_FINAL'
            or profile.get('native_acceptance') is not False
            or profile.get('published') is not False
            or profile.get('distribution_status') != 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED'
            or meta.get('publication_profile') != PROFILE_PATH
            or meta.get('technical_qualification') != 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS'
            or meta.get('publication_qualified') is not True
            or meta.get('qualificationVerdict') != 'NOT_FINAL'
            or meta.get('native_acceptance') is not False
            or meta.get('published') is not False
            or meta.get('distribution_status') != 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED'
            or meta.get('status') != 'WINDOWS_PROFILE_V4_0_0_SOURCE_PREPARED_NOT_PUBLISHED'
            or progress.get('phase') != 'T07_WINDOWS_PROFILE_SOURCE_PREPARED'
            or progress.get('next_phase') is not None):
        raise ValueError('Declared Windows source technical eligibility or general qualification differs')
    return profile


def reject_postpublication_portal_source():
    published_record = ROOT / PUBLISHED_RELEASE_PATH
    if published_record.exists() or published_record.is_symlink():
        raise ValueError(
            'Postpublication portal source cannot prepare new v4.0.0 archives. '
            'Use the frozen v4.0.0 source commit '
            'f86668d6784e1b97b9057ae2e2080113efce45e3 and its committed builders '
            'for reproduction; preserve the published four assets and both release tags.')


def snapshot_source():
    reject_postpublication_portal_source()
    meta, files, identity = verify_source(ROOT)
    units = verify_units(ROOT, meta, files)
    course, projects = verify_course_map(ROOT, meta, files)
    links = verify_links(ROOT, meta, course, files)
    progress = verify_progress(ROOT, meta)
    profile = verify_publication_profile(meta, progress, files)
    return meta, files, identity, units, course, projects, links, progress, profile


def check_source_unchanged(files, identity, binding):
    _, after_files, after = verify_source(ROOT)
    if after['repository_package_id'] != identity['repository_package_id'] or set(after_files) != set(files):
        raise ValueError('Source changed during packaging; preserve output for inspection')
    after_binding = authenticate_commit(binding['source_commit'], after_files)
    if after_binding != binding:
        raise ValueError('Committed source authentication changed during packaging')


def write_zip(archive, prefix, payload, modes):
    with archive.open('xb') as handle:
        with zipfile.ZipFile(handle, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipped:
            for name, content in sorted(payload.items()):
                info = zipfile.ZipInfo(prefix + name, STAMP)
                info.create_system = 3
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o100000 | modes.get(name, 0o644)) << 16
                zipped.writestr(info, content, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        handle.flush()
        os.fsync(handle.fileno())
    with zipfile.ZipFile(archive) as zipped:
        if zipped.testzip() is not None or zipped.namelist() != [prefix + name for name in sorted(payload)]:
            raise ValueError('Created ZIP CRC or member inventory differs')
        for name, content in payload.items():
            item = zipped.getinfo(prefix + name)
            if (zipped.read(prefix + name) != content
                    or (item.external_attr >> 16) & 0o777 != modes.get(name, 0o644)):
                raise ValueError('Created ZIP member bytes or committed mode differ: ' + name)


def build(output_dir, source_commit, version, release_tag, mode):
    selected = publication_identity(version, release_tag, mode)
    output = validate_output(output_dir)
    meta, files, identity, units, course, projects, links, progress, profile = snapshot_source()
    binding = authenticate_commit(source_commit, files)
    if DERIVATION in files:
        raise ValueError('Build from complete sealed source, not a previously derived distribution')
    excluded = [name for name in sorted(files) if name.startswith(EXCLUDED_PREFIXES)]
    if len(excluded) != 10:
        raise ValueError('Exactly ten declared owner-only files must be excluded')
    payload = {name: path.read_bytes() for name, path in files.items()
               if name not in CONTROLS and name not in excluded}
    rewrites = []
    for name, text in [('00_TOOLS/README.md', STUDENT_TOOLS), ('INTEGRITY.md', STUDENT_INTEGRITY)]:
        before = payload[name]
        payload[name] = text.encode('utf-8')
        rewrites.append({'path': name, 'source_sha256': sha(before),
                         'distribution_sha256': sha(payload[name]),
                         'reason': 'Student verification and declared Windows profile guidance, omitting owner-only links.'})
    derivation = {'schema': 'webtech-filtered-teaching-distribution/v2',
                  'final_target_version': VERSION, 'distribution_identity': selected,
                  'source_commit': binding['source_commit'], 'source_tree': binding['source_tree'],
                  'source_commit_state': binding['source_commit_state'],
                  'source_repository_package_id': identity['repository_package_id'],
                  'source_file_count': len(files), 'publication_profile_path': PROFILE_PATH,
                  'publication_profile_id': PROFILE_ID, 'publication_profile_sha256': sha(files[PROFILE_PATH].read_bytes()),
                  'technical_qualification': meta['technical_qualification'],
                  'publication_qualified': True,
                  'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
                  'publication_performed': False,
                  'excluded_prefixes': list(EXCLUDED_PREFIXES),
                  'excluded_files': [{'path': name, 'source_sha256': sha(files[name].read_bytes())} for name in excluded],
                  'rewritten_files': rewrites, 'preserved_unit_count': 30,
                  'all_unit_bytes_and_committed_modes_preserved': True,
                  'preservation_scope': 'All course, seminar and setup unit bytes, including canonical sources, lockfiles, references, controls and unfinished learner targets. All frontdoors and tutorials remain.',
                  'identity_method': 'The two whole-distribution self-controls are recalculated after this record. Unit identities and publication-profile/current-qualification bytes are preserved.',
                  'limitation': 'The exact commit and declared source profile qualify provenance and technical eligibility only. This builder does not execute browser, PDF, native platform or Moodle checks and performs no publication.'}
    payload[DERIVATION] = json_bytes(derivation)
    manifest = manifest_from_hashes({name: sha(content) for name, content in payload.items()})
    distribution_id = sha(manifest)
    payload[MANIFEST], payload[PACKAGE_ID] = manifest, (distribution_id + '\n').encode('ascii')
    output.mkdir(parents=True, exist_ok=False)
    staging = output / '.staging' / selected['archive_root'].rstrip('/')
    staging.mkdir(parents=True)
    modes = binding['committed_modes']
    for name, content in sorted(payload.items()):
        path = staging / name
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('xb') as handle:
            handle.write(content)
        path.chmod(modes.get(name, 0o644))
    dist_meta, dist_files, _ = verify_source(staging)
    dist_units = verify_units(staging, dist_meta, dist_files)
    dist_course, dist_projects = verify_course_map(staging, dist_meta, dist_files)
    dist_links = verify_links(staging, dist_meta, dist_course, dist_files)
    verify_progress(staging, dist_meta)
    if dist_units != units or dist_projects != projects:
        raise ValueError('Teaching unit identities or project contracts changed during filtering')
    for obj in meta['objects']:
        for name, path in files.items():
            if name.startswith(obj['payload_root']) and payload.get(name) != path.read_bytes():
                raise ValueError('Teaching unit byte changed during derivation: ' + name)
    for name in [PROFILE_PATH, 'metadata/CURRENT_QUALIFICATION.json']:
        if payload[name] != files[name].read_bytes():
            raise ValueError('Declared profile or current qualification record changed during derivation')
    process = subprocess.run(['node', str(staging / '00_TOOLS/qa/VERIFY_COLLECTION.mjs')],
                             cwd=staging, capture_output=True, text=True, timeout=120)
    if process.returncode:
        raise ValueError('Independent Node distribution check failed: ' + process.stderr.strip()[:1000])
    node = strict_json(process.stdout)
    if (node.get('repository_package_id') != distribution_id or node.get('files') != len(payload)
            or node.get('qualificationVerdict') != 'NOT_FINAL'
            or node.get('native_acceptance') is not False
            or node.get('publication_qualified') is not True
            or node.get('published') is not False
            or node.get('distribution_status') != 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED'):
        raise ValueError('Independent distribution byte-check reports disagree')
    archive = output / selected['archive']
    write_zip(archive, selected['archive_root'], payload, modes)
    check_source_unchanged(files, identity, binding)
    digest = sha(archive.read_bytes())
    with (output / (selected['archive'] + '.sha256')).open('x', encoding='ascii', newline='\n') as handle:
        handle.write(digest + '  ' + selected['archive'] + '\n')
    with (output / 'FILES_MANIFEST.txt').open('xb') as handle:
        handle.write(manifest)
    receipt = {'schema': 'webtech-filtered-student-build/v2',
               'status': 'PASS_FILTERED_WINDOWS_PROFILE_BYTES_AND_STATIC_ROUTES_ONLY',
               'final_target_version': VERSION, 'distribution_identity': selected,
               'distribution_status': 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED',
               'archive': selected['archive'], 'archive_root': selected['archive_root'],
               'archive_sha256': digest, 'archive_bytes': archive.stat().st_size, 'files': len(payload),
               'source_commit': binding['source_commit'], 'source_tree': binding['source_tree'],
               'source_commit_state': binding['source_commit_state'],
               'source_repository_package_id': identity['repository_package_id'],
               'source_file_count': len(files), 'distribution_package_id': distribution_id,
               'publication_profile': profile, 'publication_profile_sha256': sha(files[PROFILE_PATH].read_bytes()),
               'technical_qualification': meta['technical_qualification'],
               'publication_qualified': True, 'qualificationVerdict': 'NOT_FINAL',
               'native_acceptance': False, 'published': False, 'publication_performed': False,
               'excluded_owner_files': len(excluded), 'rewritten_common_guides': rewrites,
               'units': len(dist_units), 'projects': dist_projects,
               'source_document_links': links, 'distribution_document_links': dist_links,
               'independent_node_check': node, 'candidate_progress': progress,
               'all_unit_bytes_and_committed_modes_preserved': True,
               'applications_executed': False, 'rendered_browser_executed': False,
               'saved_pdf_executed': False, 'native_macos_executed': False,
               'actions_dispatched': 0, 'software_installed': False,
               'release_assets': [selected['archive'], selected['archive'] + '.sha256', 'FILES_MANIFEST.txt', 'BUILD_RECEIPT.json'],
               'limit': 'Earlier owner observations are recorded in the preserved qualification/profile records. This build validates exact committed supplied bytes and static routes; it does not repeat those observations, establish learner completion, qualify another platform or publish the archive.'}
    with (output / 'BUILD_RECEIPT.json').open('xb') as handle:
        handle.write(json_bytes(receipt))
    shutil.rmtree(output / '.staging')
    return receipt


def add_public_arguments(parser):
    parser.add_argument('--output-dir', type=Path, required=True, help='A new directory outside the entire checkout; existing directories are rejected.')
    parser.add_argument('--source-commit', required=True, help='Full lowercase SHA of the exact clean complete checkout HEAD.')
    parser.add_argument('--version', required=True, choices=[VERSION], help='Explicit final-target version.')
    parser.add_argument('--mode', required=True, choices=['final', 'review'], help='Prepared final identity or explicitly selected later review identity; neither publishes.')
    parser.add_argument('--release-tag', required=True, help='v4.0.0 in final mode, or an explicit v4.0.0-rc.N with N >= 2 in review mode.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    add_public_arguments(parser)
    args = parser.parse_args()
    result = build(args.output_dir, args.source_commit, args.version, args.release_tag, args.mode)
    print(json.dumps({key: result[key] for key in ['status', 'distribution_identity', 'archive', 'archive_sha256', 'archive_bytes', 'files', 'source_commit', 'source_tree', 'source_repository_package_id', 'distribution_package_id', 'excluded_owner_files', 'units', 'projects', 'qualificationVerdict']}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, subprocess.TimeoutExpired, zipfile.BadZipFile) as error:
        raise SystemExit('STOP_FILTERED_STUDENT_BUILD: ' + str(error))
