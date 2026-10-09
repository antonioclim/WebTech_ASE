#!/usr/bin/env python3
"""Derive the complete filtered v4.0.0-rc.1 teaching review distribution offline."""
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
                              manifest_from_hashes, CONTROLS, MANIFEST, PACKAGE_ID)

REVIEW_IDENTITY = 'v4.0.0-rc.1'
PREFIX = 'WEBTECH_ASE_EN_GB_CLASSROOM_' + REVIEW_IDENTITY + '/'
ZIP_NAME = PREFIX[:-1] + '.zip'
STAMP = (2026, 10, 9, 0, 0, 0)
EXCLUDED_PREFIXES = ('.github/', '00_TOOLS/publishing/',
                     '00_TOOLS/maintainer/', '00_TOOLS/acceptance/')
DERIVATION = 'metadata/DISTRIBUTION_DERIVATION.json'

STUDENT_TOOLS = '''# Verify this teaching distribution

The complete review distribution contains 14 courses, 14 seminars, two setup units and the support needed by their published commands. Its 40 individual projects and 38 unfinished learner targets retain the supplied contracts.

From the extracted collection root run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs
```

After changing only the declared learner targets or creating declared runtime directories run:

```text
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits
```

Python is an optional independent source check, not a prerequisite for Node classroom projects:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict
```

These checks verify supplied files and project identities. They do not grade your implementation or run a browser. Follow the selected seminar's commands from its stated working directory. [Runtime support](runtime/README.md) describes the operation-selected environment policy.

Keep private drafts, logs, screenshots and PDFs outside the complete extracted collection. General qualification remains **NOT_FINAL**. This v4.0.0-rc.1 review copy has not passed native browser, saved-PDF, Windows/macOS, Word or human acceptance.

Owner publishing, source maintenance and repository automation files are omitted from this student distribution. [The derivation record](../metadata/DISTRIBUTION_DERIVATION.json) identifies its source snapshot and exact filtering. All teaching unit bytes and unit identities are retained.
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

The retained control paths `metadata/current-integrity/REPOSITORY_SHA256SUMS.txt` and `metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt` describe **this filtered distribution**, not the original repository inventory. The manifest has sorted SHA-256 rows for every supplied file except these two self-controls. The distribution package ID is SHA-256 of the exact UTF-8 manifest bytes, followed by LF. These are byte identities, not digital signatures or acceptance results.

[DISTRIBUTION_DERIVATION.json](metadata/DISTRIBUTION_DERIVATION.json) records the original source package ID and commit when authenticated, excluded owner-only files and the two common-guide rewrites. The source package ID and the distribution package ID are distinct. Every one of the 30 complete teaching/setup units retains its original supplied bytes and unit controls. No unit file is filtered out.

C01 retains its `90_AUDIT` identity scheme, C02 retains its `06_AUDIT` scheme and the other units retain their outer manifests. Keep these controls unchanged. The verifier admits only the 38 declared learner targets and 83 declared runtime directories in student-edit mode; it continues checking every protected file.

Store private evidence outside the entire extracted collection. A passing integrity result does not show that your implementation, browser, service, print operation or Moodle submission worked. Read the [qualification scope](00_START_HERE/QUALIFICATION.html) and record actual task observations separately.
'''


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def validate_output(output):
    output = output.absolute()
    for ancestor in [output, *output.parents]:
        if ancestor.is_symlink():
            raise ValueError('Output path traverses a symlink')
    if output.resolve().is_relative_to(ROOT.resolve()) or ROOT.resolve().is_relative_to(output.resolve()):
        raise ValueError('Output directory must be separate from the entire repository')
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError('Output directory is not empty; existing files were preserved')
    return output


def authenticate_commit(expected, files=None):
    if expected is None:
        return None
    if not re.fullmatch(r'[0-9a-f]{40}', expected):
        raise ValueError('Source commit must be a full lowercase Git commit SHA')
    head = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True, timeout=15)
    status = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'],
                            cwd=ROOT, capture_output=True, text=True, timeout=15)
    if head.returncode or status.returncode or head.stdout.strip() != expected or status.stdout:
        raise ValueError('Source commit cannot bind a dirty or different checkout; preserve the source and inspect it')
    flags = subprocess.run(['git', 'ls-files', '-v', '-z'], cwd=ROOT,
                           capture_output=True, timeout=15)
    tree = subprocess.run(['git', 'ls-tree', '-rz', '--full-tree', expected],
                          cwd=ROOT, capture_output=True, timeout=15)
    if flags.returncode or tree.returncode:
        raise ValueError('Cannot authenticate the exact committed source inventory')
    for row in flags.stdout.split(b'\0'):
        if row and (row[:1].islower() or row[:1] == b'S'):
            raise ValueError('Assume-unchanged or skip-worktree flags cannot authenticate a release source')
    committed = {}
    for row in tree.stdout.split(b'\0'):
        if not row:
            continue
        header, name = row.split(b'\t', 1)
        mode, kind, oid = header.split(b' ')
        name = name.decode('utf-8')
        if kind != b'blob' or mode not in (b'100644', b'100755') or name in committed:
            raise ValueError('Release source requires distinct regular Git blob entries')
        committed[name] = oid.decode('ascii')
    if files is None:
        # Used only by narrow local helper checks; a build always supplies its
        # independently verified complete source inventory below.
        files = {name: ROOT / name for name in committed}
    if set(committed) != set(files):
        raise ValueError('Working source inventory differs from the exact commit tree')
    for name, source in files.items():
        content = source.read_bytes()
        git_blob = hashlib.sha1(b'blob ' + str(len(content)).encode('ascii') + b'\0' + content).hexdigest()
        if git_blob != committed[name]:
            raise ValueError('Working source bytes differ from the exact committed Git blob: ' + name)
    return expected


def build(output_dir, source_commit=None):
    output = validate_output(output_dir)
    meta, files, source_identity = verify_source(ROOT)
    source_commit = authenticate_commit(source_commit, files)
    source_units = verify_units(ROOT, meta, files)
    course, projects = verify_course_map(ROOT, meta, files)
    source_links = verify_links(ROOT, meta, course, files)
    progress = verify_progress(ROOT, meta)
    if progress.get('phase') != 'T07_CANDIDATE_PREPARED' or progress.get('next_phase') is not None:
        raise ValueError('The complete T07 source is required; there is no T08')
    if DERIVATION in files:
        raise ValueError('Build from the complete sealed source, not a previously derived distribution')
    excluded = [name for name in sorted(files) if name.startswith(EXCLUDED_PREFIXES)]
    payload = {name: source.read_bytes() for name, source in files.items()
               if name not in CONTROLS and name not in excluded}
    rewrites=[]
    for name, text in [('00_TOOLS/README.md', STUDENT_TOOLS), ('INTEGRITY.md', STUDENT_INTEGRITY)]:
        before = payload[name]
        after = text.encode('utf-8')
        payload[name] = after
        rewrites.append({'path': name, 'source_sha256': sha(before),
                         'distribution_sha256': sha(after),
                         'reason': 'Student guidance retains runnable verification routes and omits owner-only maintenance/publishing links.'})
    derivation = {'schema': 'webtech-filtered-teaching-distribution/v1',
                  'final_target_version': '4.0.0', 'review_identity': REVIEW_IDENTITY,
                  'source_commit': source_commit,
                  'source_commit_state': 'AUTHENTICATED_CLEAN_GIT_HEAD' if source_commit else 'UNBOUND_LOCAL_SOURCE_SNAPSHOT',
                  'source_repository_package_id': source_identity['repository_package_id'],
                  'source_file_count': len(files),
                  'excluded_prefixes': list(EXCLUDED_PREFIXES),
                  'excluded_files': [{'path': name, 'source_sha256': sha(files[name].read_bytes())} for name in excluded],
                  'rewritten_files': rewrites,
                  'preserved_unit_count': 30,
                  'preservation_scope': 'Every byte of every course, seminar and setup EN_GB unit, including canonical examples, lockfiles, references, controls and unfinished learner targets. All 28 week frontdoors and tutorials remain.',
                  'identity_method': 'Recalculate only the two whole-distribution self-controls after adding this record. Unit identities stay unchanged. The final distribution ID is outside this manifest-covered record to avoid self-reference.',
                  'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
                  'publication_performed': False,
                  'limitation': 'This record binds a build derivation. It does not authenticate authorship, execute learner applications or qualify a browser/native platform. Publication state is reported externally.'}
    payload[DERIVATION] = json_bytes(derivation)
    manifest = manifest_from_hashes({name: sha(content) for name, content in payload.items()})
    distribution_id = sha(manifest)
    payload[MANIFEST] = manifest
    payload[PACKAGE_ID] = (distribution_id+'\n').encode('ascii')
    output.mkdir(parents=True, exist_ok=True)
    staging = output / '.staging' / PREFIX[:-1]
    staging.mkdir(parents=True)
    for name, content in sorted(payload.items()):
        item=staging/name
        item.parent.mkdir(parents=True, exist_ok=True)
        with item.open('xb') as handle:
            handle.write(content)
        item.chmod(0o755 if name.endswith('.sh') else 0o644)
    dist_meta, dist_files, dist_source = verify_source(staging)
    dist_units = verify_units(staging, dist_meta, dist_files)
    dist_course, dist_projects = verify_course_map(staging, dist_meta, dist_files)
    dist_links = verify_links(staging, dist_meta, dist_course, dist_files)
    verify_progress(staging, dist_meta)
    if dist_units != source_units or dist_projects != projects:
        raise ValueError('Complete unit identities or project contracts changed during filtering')
    for unit in meta['objects']:
        base=unit['payload_root']
        for name, source in files.items():
            if name.startswith(base) and payload.get(name) != source.read_bytes():
                raise ValueError('Teaching unit byte changed in derivation: '+name)
    process=subprocess.run(['node', str(staging/'00_TOOLS/qa/VERIFY_COLLECTION.mjs')],
                           cwd=staging, capture_output=True, text=True, timeout=120)
    if process.returncode:
        raise ValueError('Independent Node distribution check failed: '+process.stderr.strip()[:1000])
    node=json.loads(process.stdout)
    if node.get('repository_package_id') != distribution_id or node.get('files') != len(payload):
        raise ValueError('Independent distribution byte-check reports disagree')
    archive=output/ZIP_NAME
    with archive.open('xb') as handle:
        with zipfile.ZipFile(handle,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as zipped:
            for name, content in sorted(payload.items()):
                info=zipfile.ZipInfo(PREFIX+name,STAMP)
                info.create_system=3
                info.compress_type=zipfile.ZIP_DEFLATED
                info.external_attr=(0o100755 if name.endswith('.sh') else 0o100644)<<16
                zipped.writestr(info,content,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
        handle.flush();os.fsync(handle.fileno())
    _, after_files, after=verify_source(ROOT)
    if after['repository_package_id'] != source_identity['repository_package_id'] or set(after_files) != set(files):
        raise ValueError('Source changed during packaging; preserve output for inspection')
    with zipfile.ZipFile(archive) as zipped:
        if zipped.testzip() is not None or zipped.namelist() != [PREFIX+n for n in sorted(payload)]:
            raise ValueError('Created ZIP CRC or member inventory differs')
        for name, content in payload.items():
            if zipped.read(PREFIX+name) != content:
                raise ValueError('Created ZIP member bytes differ: '+name)
    digest=sha(archive.read_bytes())
    with (output/(ZIP_NAME+'.sha256')).open('x',encoding='ascii',newline='\n') as handle:
        handle.write(digest+'  '+ZIP_NAME+'\n')
    with (output/'FILES_MANIFEST.txt').open('xb') as handle:
        handle.write(manifest)
    receipt={'schema':'webtech-filtered-student-build/v1',
             'status':'PASS_COMPLETE_FILTERED_TEACHING_BYTES_AND_STATIC_ROUTES_ONLY',
             'final_target_version':'4.0.0','review_identity':REVIEW_IDENTITY,
             'distribution_status':'PREPARED_REVIEW_PRERELEASE_NOT_PUBLISHED',
             'archive':ZIP_NAME,'archive_root':PREFIX,'archive_sha256':digest,
             'archive_bytes':archive.stat().st_size,'files':len(payload),
             'source_commit':source_commit,'source_commit_state':derivation['source_commit_state'],
             'source_repository_package_id':source_identity['repository_package_id'],
             'source_file_count':len(files),'distribution_package_id':distribution_id,
             'excluded_owner_files':len(excluded),'rewritten_common_guides':rewrites,
             'units':len(dist_units),'projects':dist_projects,
             'source_document_links':source_links,'distribution_document_links':dist_links,
             'independent_node_check':node,'candidate_progress':progress,
             'all_unit_bytes_preserved':True,'qualificationVerdict':'NOT_FINAL',
             'native_acceptance':False,'applications_executed':False,
             'rendered_browser_executed':False,'saved_pdf_executed':False,
             'actions_dispatched':0,'software_installed':False,'publication_performed':False,
             'release_assets':[ZIP_NAME,ZIP_NAME+'.sha256','FILES_MANIFEST.txt','BUILD_RECEIPT.json'],
             'limit':'Static routes and bytes only. A fresh extraction and actual selected task commands require their own external evidence. Required native/browser/PDF checks have not passed; this artifact cannot qualify stable v4.0.0.'}
    with (output/'BUILD_RECEIPT.json').open('xb') as handle:
        handle.write(json_bytes(receipt))
    shutil.rmtree(output/'.staging')
    return receipt


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,required=True,help='A new or empty directory outside the entire repository.')
    parser.add_argument('--source-commit',help='Optional exact SHA of this clean checkout; omit only for explicitly unbound local development checks.')
    args=parser.parse_args()
    result=build(args.output_dir,args.source_commit)
    print(json.dumps({key:result[key] for key in ['status','review_identity','archive','archive_sha256','archive_bytes','files','source_commit','source_repository_package_id','distribution_package_id','excluded_owner_files','units','projects','qualificationVerdict']},indent=2))


if __name__=='__main__':
    try:
        main()
    except (ValueError,OSError,KeyError,TypeError,subprocess.TimeoutExpired,zipfile.BadZipFile) as error:
        raise SystemExit('STOP_FILTERED_STUDENT_BUILD: '+str(error))
