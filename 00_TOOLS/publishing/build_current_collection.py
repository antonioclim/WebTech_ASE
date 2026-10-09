#!/usr/bin/env python3
"""Build an offline deterministic v4 candidate ZIP without publishing anything."""
from __future__ import annotations

import argparse
import json
import os
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
from current_contract import verify_source, verify_units, verify_course_map, verify_links, verify_progress, sha, VERSION

PREFIX = 'WEBTECH_ASE_CANDIDATE_v4.0.0/'
ZIP_NAME = 'WEBTECH_ASE_CANDIDATE_v4.0.0.zip'
STAMP = (2026, 10, 9, 0, 0, 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, required=True, help='A new or empty directory outside the repository.')
    args = parser.parse_args()
    output = args.output_dir.absolute()
    for ancestor in [output, *output.parents]:
        if ancestor.is_symlink():
            raise ValueError('Output path traverses a symlink')
    if output.resolve().is_relative_to(ROOT.resolve()) or ROOT.resolve().is_relative_to(output.resolve()):
        raise ValueError('Output directory must be separate from the entire repository')
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError('Output directory is not empty; existing files were preserved')
    meta, files, identity = verify_source(ROOT)
    units = verify_units(ROOT, meta, files)
    course, projects = verify_course_map(ROOT, meta, files)
    links = verify_links(ROOT, meta, course, files)
    progress = verify_progress(ROOT, meta)
    output.mkdir(parents=True, exist_ok=True)
    archive = output / ZIP_NAME
    with archive.open('xb') as handle:
        with zipfile.ZipFile(handle, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipped:
            for name, source in sorted(files.items()):
                content = source.read_bytes()
                info = zipfile.ZipInfo(PREFIX + name, STAMP)
                info.create_system = 3
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o100755 if name.endswith('.sh') else 0o100644) << 16
                zipped.writestr(info, content, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        handle.flush()
        os.fsync(handle.fileno())
    # Reject a source change during packaging and retain the partial output.
    _, after_files, after = verify_source(ROOT)
    if after['repository_package_id'] != identity['repository_package_id'] or set(after_files) != set(files):
        raise ValueError('Source changed during packaging; preserve output for inspection')
    with zipfile.ZipFile(archive) as zipped:
        if zipped.testzip() is not None:
            raise ValueError('Created ZIP CRC check failed')
        names = zipped.namelist()
        if names != [PREFIX + name for name in sorted(files)]:
            raise ValueError('Created ZIP inventory differs')
        for name, source in files.items():
            if zipped.read(PREFIX + name) != source.read_bytes():
                raise ValueError('Created ZIP member differs: ' + name)
    digest = sha(archive.read_bytes())
    with (output / (ZIP_NAME + '.sha256')).open('x', encoding='ascii', newline='\n') as sidecar:
        sidecar.write(digest + '  ' + ZIP_NAME + '\n')
    receipt = {'schema': 'webtech-current-offline-build/v1', 'status': 'PASS_DETERMINISTIC_CANDIDATE_BYTES_ONLY',
               'distribution_version': VERSION, 'distribution_status': 'LOCAL_CANDIDATE_NOT_PUBLISHED', 'archive': ZIP_NAME, 'archive_sha256': digest,
               'archive_bytes': archive.stat().st_size, 'archive_root': PREFIX, 'files': len(files),
               'repository_package_id': identity['repository_package_id'], 'units': len(units),
               'projects': projects, 'document_links': links,
               'candidate_progress': progress,
               'derivation_scope': 'Local candidate checkout with the retained folder structure. T01–T03 are prepared with explicit limits; T04–T07 review remains pending. This artifact is not a published release or final acceptance and does not replace any earlier published ZIP.',
               'qualificationVerdict': 'NOT_FINAL', 'applications_executed': False,
               'native_acceptance': False, 'actions_dispatched': 0, 'published': False,
               'software_installed': False}
    with (output / 'BUILD_RECEIPT.json').open('x', encoding='utf-8', newline='\n') as report:
        json.dump(receipt, report, ensure_ascii=False, indent=2)
        report.write('\n')
    print(json.dumps(receipt, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile) as error:
        raise SystemExit('STOP_CURRENT_OFFLINE_BUILD: ' + str(error))
