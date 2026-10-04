#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'publishing'))
from release_contract import repo_path, sha, zip_files


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ('href', 'src', 'action'):
            if values.get(key):
                self.links.append(values[key])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path, required=True)
    args = parser.parse_args()
    site = args.site.resolve()
    errors = []

    def fail(message):
        errors.append(message)
        print('FAIL', message)

    def check_zip(data: bytes, label: str, depth: int = 0):
        if depth > 1:
            raise ValueError(f'Too many nested ZIP levels: {label}')
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            members = zip_files(archive)
            bad = archive.testzip()
            if bad:
                raise ValueError(f'CRC failure: {label}:{bad}')
            for name in members:
                if name.lower().endswith('.zip'):
                    check_zip(archive.read(name), label + '!' + name, depth + 1)

    for relative in ('index.html', '404.html', '.nojekyll', 'downloads.json', 'assets/site.css', 'assets/social-preview-1280x640.png'):
        if not (site / relative).is_file():
            fail(f'missing {relative}')
    try:
        records = json.loads((site / 'downloads.json').read_text(encoding='utf-8'))
        if not isinstance(records, list):
            raise ValueError('download index must be a list')
        indexed = {}
        for record in records:
            if not isinstance(record, dict):
                raise ValueError('download record must be an object')
            relative = record['path']
            repo_path(relative, site)
            if relative in indexed:
                raise ValueError(f'duplicate download record: {relative}')
            indexed[relative] = record
    except (ValueError, KeyError, OSError) as exc:
        indexed = {}
        fail(f'downloads.json: {exc}')
    actual = {p.relative_to(site).as_posix(): p for p in site.rglob('*.zip')}
    if set(actual) != set(indexed):
        fail(f'download index differs: missing={sorted(set(actual) - set(indexed))}, extra={sorted(set(indexed) - set(actual))}')
    for relative, path in actual.items():
        record = indexed.get(relative, {})
        if record.get('bytes') != path.stat().st_size or record.get('sha256') != sha(path):
            fail(f'download metadata mismatch: {relative}')
        side = Path(str(path) + '.sha256')
        if not side.is_file() or side.read_text(encoding='utf-8').strip() != f'{sha(path)}  {path.name}':
            fail(f'download sidecar mismatch: {relative}')
        try:
            check_zip(path.read_bytes(), relative)
        except (ValueError, OSError, zipfile.BadZipFile) as exc:
            fail(f'ZIP {relative}: {exc}')
    for source in site.rglob('*.html'):
        links = LinkParser()
        links.feed(source.read_text(encoding='utf-8'))
        for target in links.links:
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            path = (site / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else (source.parent / unquote(parsed.path))
            path = path.resolve()
            try:
                path.relative_to(site)
            except ValueError:
                fail(f'link escapes site: {source.relative_to(site)} -> {target}')
                continue
            if not path.exists():
                fail(f'broken Pages link: {source.relative_to(site)} -> {target}')
    forbidden = re.compile(r'(PRIVATE_STAGING|TEACHER_GUIDE|GHID_PROFESOR|ANSWER_KEY|CHEIE_RASPUNSURI|TEACHER_CONSOLE|CONSOLE_PROFESOR)', re.I)
    for path in site.rglob('*'):
        if path.is_symlink():
            fail(f'symbolic link in Pages payload: {path.relative_to(site)}')
        if forbidden.search(path.relative_to(site).as_posix()):
            fail(f'private name in Pages payload: {path.relative_to(site)}')
    if errors:
        print(f'VERDICT: FAIL_PAGES_PAYLOAD ({len(errors)} findings)')
        return 2
    print(f'VERDICT: PASS_PAGES_PAYLOAD_INTEGRITY ({len(actual)} ZIP assets; qualification and deployment are separate)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
