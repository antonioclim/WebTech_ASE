#!/usr/bin/env python3
"""Build an unpublished complete Windows-profile source ZIP from an exact clean commit."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
from build_student_collection import (ROOT, VERSION, PROFILE_PATH, PROFILE_ID,
    add_public_arguments, publication_identity, validate_output, snapshot_source,
    authenticate_commit, write_zip, check_source_unchanged, sha, json_bytes)


def build(output_dir, source_commit, version, release_tag, mode):
    selected = publication_identity(version, release_tag, mode)
    selected = {**selected, 'archive_root': 'WEBTECH_ASE_COMPLETE_SOURCE_' + release_tag + '/',
                'archive': 'WEBTECH_ASE_COMPLETE_SOURCE_' + release_tag + '.zip'}
    output = validate_output(output_dir)
    meta, files, identity, units, course, projects, links, progress, profile = snapshot_source()
    binding = authenticate_commit(source_commit, files)
    payload = {name: path.read_bytes() for name, path in files.items()}
    output.mkdir(parents=True, exist_ok=False)
    archive = output / selected['archive']
    write_zip(archive, selected['archive_root'], payload, binding['committed_modes'])
    check_source_unchanged(files, identity, binding)
    digest = sha(archive.read_bytes())
    with (output / (selected['archive'] + '.sha256')).open('x', encoding='ascii', newline='\n') as handle:
        handle.write(digest + '  ' + selected['archive'] + '\n')
    receipt = {'schema': 'webtech-current-offline-build/v2',
               'status': 'PASS_COMPLETE_WINDOWS_PROFILE_COMMITTED_SOURCE_BYTES_ONLY',
               'distribution_version': VERSION, 'distribution_identity': selected,
               'distribution_status': 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED',
               'archive': selected['archive'], 'archive_root': selected['archive_root'],
               'archive_sha256': digest, 'archive_bytes': archive.stat().st_size, 'files': len(files),
               'source_commit': binding['source_commit'], 'source_tree': binding['source_tree'],
               'source_commit_state': binding['source_commit_state'],
               'repository_package_id': identity['repository_package_id'], 'units': len(units),
               'projects': projects, 'document_links': links, 'candidate_progress': progress,
               'publication_profile': profile, 'publication_profile_path': PROFILE_PATH,
               'publication_profile_id': PROFILE_ID, 'publication_profile_sha256': sha(files[PROFILE_PATH].read_bytes()),
               'technical_qualification': meta['technical_qualification'], 'publication_qualified': True,
               'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False,
               'all_committed_source_bytes_and_modes_preserved': True,
               'applications_executed': False, 'rendered_browser_executed': False,
               'saved_pdf_executed': False, 'native_macos_executed': False,
               'actions_dispatched': 0, 'published': False, 'publication_performed': False,
               'software_installed': False,
               'limit': 'Complete source archive for provenance and integration review, separate from the filtered classroom asset. The packaging check neither repeats recorded owner observations nor extends the declared Windows technical profile or performs publication.'}
    with (output / 'BUILD_RECEIPT.json').open('xb') as handle:
        handle.write(json_bytes(receipt))
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    add_public_arguments(parser)
    args = parser.parse_args()
    print(json.dumps(build(args.output_dir, args.source_commit, args.version, args.release_tag, args.mode), indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, subprocess.TimeoutExpired, zipfile.BadZipFile) as error:
        raise SystemExit('STOP_CURRENT_OFFLINE_BUILD: ' + str(error))
