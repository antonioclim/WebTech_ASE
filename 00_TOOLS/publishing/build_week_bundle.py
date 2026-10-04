#!/usr/bin/env python3
"""Build reproducible weekly archives from the explicitly selected release plan."""
from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path

from release_contract import ROOT, read_plan, repo_path, selection, sha, state, validate_week, zip_files

STAMP = (2026, 10, 4, 12, 0, 0)


def info(name: str) -> zipfile.ZipInfo:
    item = zipfile.ZipInfo(name, date_time=STAMP)
    item.compress_type = zipfile.ZIP_DEFLATED
    item.external_attr = 0o100644 << 16
    item.create_system = 3
    return item


def payload(week: str, lang: str, item: dict, plan: dict | None = None, week_entry: dict | None = None) -> dict[str, bytes]:
    plan = plan or read_plan()
    week_entry = week_entry or plan['weeks'][week]
    validate_week(plan, week, week_entry)
    course, seminar = (repo_path(item[k]) for k in ('course', 'seminar'))
    if course.name == seminar.name:
        raise ValueError('Course and seminar archive names must differ')
    for path in (course, seminar):
        if not path.is_file():
            raise ValueError(f'Missing source package: {path.relative_to(ROOT)}')
        with zipfile.ZipFile(path) as archive:
            zip_files(archive)
            bad = archive.testzip()
            if bad:
                raise ValueError(f'CRC failure in source {path.name}: {bad}')
    qualification = state(plan, week_entry)
    readme = (
        f'# WebTech_ASE — Week {week}, {lang}\n\n'
        f"Distribution version: {week_entry['version']}. Status: {qualification['status']}.\n\n"
        '1. Extract this outer weekly ZIP into a new folder.\n'
        '2. Check the two inner ZIP hashes against `SHA256SUMS.txt`.\n'
        '3. Extract each inner student ZIP into its own folder. Do not work inside a ZIP preview.\n'
        '4. Read `00_START_HERE/README_STUDENT.txt` in C02, or `00_START_HERE/README.md` in the other objects, then run `VERIFY_PACKAGE`.\n'
        '5. Use the course or seminar launcher named below; there is no outer `index.html`.\n\n'
        + ('Course: `OPEN_PRESENTATION.cmd` / `OPEN_PRESENTATION.sh`.\n' if week == '01' else
           'Course: `START_COURSE_02.cmd` / `START_COURSE_02.sh`.\n' if week == '02' else 'Course: follow its package README.\n')
        + 'Seminar: `OPEN_BEGINNER_GUIDE.cmd` / `OPEN_BEGINNER_GUIDE.sh`; follow the guide before editing.\n\n'
        'Integrity checks establish byte identity. Runtime, browser, native-platform, Word, Moodle and teaching-pilot '
        'qualification are separate gates recorded in `RELEASE.json`.\n'
    ).encode('utf-8')
    release = json.dumps({
        'schema': 'webtech-ase-week-bundle-v2', 'week': week, 'language': lang,
        'repository_version': plan.get('repository_version'), 'distribution_version': week_entry['version'],
        'tag': week_entry['tag'], 'status': qualification['status'],
        'draft': bool(qualification['draft']), 'prerelease': bool(qualification['prerelease']),
        'required_gates': qualification['required_gates'] or [], 'gates': qualification['gates'] or {},
        'source_commit': plan.get('source_commit'), 'packages': [course.name, seminar.name],
    }, indent=2, ensure_ascii=False).encode('utf-8') + b'\n'
    manifest = f'{sha(course)}  {course.name}\n{sha(seminar)}  {seminar.name}\n'.encode('utf-8')
    package_id = hashlib.sha256(manifest).hexdigest().encode('ascii') + b'\n'
    method = b'# PACKAGE_ID method\n\n`PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 bytes of `SHA256SUMS.txt`.\n'
    return {'README.md': readme, 'RELEASE.json': release, 'SHA256SUMS.txt': manifest,
            'PACKAGE_ID.txt': package_id, 'PACKAGE_ID_METHOD.md': method,
            course.name: course.read_bytes(), seminar.name: seminar.read_bytes()}


def build(week: str, lang: str, item: dict, plan: dict | None = None, week_entry: dict | None = None) -> Path:
    out = repo_path(item['bundle'])
    out.parent.mkdir(parents=True, exist_ok=True)
    files = payload(week, lang, item, plan, week_entry)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(files, key=str.casefold):
            archive.writestr(info(name), files[name])
    Path(str(out) + '.sha256').write_text(f'{sha(out)}  {out.name}\n', encoding='utf-8')
    return out


def verify(week: str, lang: str, item: dict, plan: dict | None = None, week_entry: dict | None = None) -> None:
    out = repo_path(item['bundle'])
    expected = payload(week, lang, item, plan, week_entry)
    if not out.is_file():
        raise ValueError(f'Missing weekly bundle: {out.relative_to(ROOT)}')
    side = Path(str(out) + '.sha256')
    if not side.is_file() or side.read_text(encoding='utf-8').strip() != f'{sha(out)}  {out.name}':
        raise ValueError(f'Sidecar mismatch: {out.relative_to(ROOT)}')
    with zipfile.ZipFile(out) as archive:
        members = zip_files(archive)
        if archive.testzip() is not None:
            raise ValueError(f'CRC failure: {out.relative_to(ROOT)}')
        if list(members) != sorted(expected, key=str.casefold):
            raise ValueError(f'Unexpected member order or set: {out.relative_to(ROOT)}')
        for name, data in expected.items():
            if archive.read(name) != data:
                raise ValueError(f'Content mismatch {name} in {out.relative_to(ROOT)}')
        if archive.read('PACKAGE_ID.txt').decode().strip() != hashlib.sha256(archive.read('SHA256SUMS.txt')).hexdigest():
            raise ValueError(f'PACKAGE_ID mismatch: {out.relative_to(ROOT)}')


def main() -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--build-all', action='store_true')
    group.add_argument('--verify-all', action='store_true')
    parser.add_argument('--weeks', help='Comma-separated week numbers; default: every planned week')
    parser.add_argument('--language', help='Exactly one planned language; default: all planned languages')
    args = parser.parse_args()
    try:
        plan = read_plan()
        count = 0
        for week, language, entry, item in selection(plan, args.weeks, args.language):
            if args.build_all:
                build(week, language, item, plan, entry)
            verify(week, language, item, plan, entry)
            count += 1
        print(f'VERDICT: PASS_BUNDLE_INTEGRITY ({count} weekly bundles; qualification remains as declared)')
        return 0
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as exc:
        parser.exit(2, f'FAIL_BUNDLE_INTEGRITY: {exc}\n')


if __name__ == '__main__':
    raise SystemExit(main())
