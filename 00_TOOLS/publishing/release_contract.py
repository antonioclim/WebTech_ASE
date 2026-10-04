"""Small, dependency-free path and release-selection contract shared by local tools."""
from __future__ import annotations

import hashlib
import json
import re
import stat
import unicodedata
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[2]
VERSION_RE = re.compile(r"[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?")


def sha(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def safe_relative(value: str) -> PurePosixPath:
    if not isinstance(value, str) or not value or '\\' in value or '\x00' in value:
        raise ValueError(f'Invalid relative path: {value!r}')
    parts = value.split('/')
    if value.startswith('/') or any(p in ('', '.', '..') for p in parts) or any(':' in p for p in parts):
        raise ValueError(f'Unsafe relative path: {value!r}')
    return PurePosixPath(value)


def repo_path(value: str, root: Path = ROOT) -> Path:
    parts = safe_relative(value).parts
    path = root.joinpath(*parts)
    # Resolving also prevents an existing symlink from escaping the root.
    path.resolve().relative_to(root.resolve())
    return path


def zip_files(archive: zipfile.ZipFile) -> dict[str, zipfile.ZipInfo]:
    """Reject ambiguity before callers build a member dictionary or extract bytes."""
    result: dict[str, zipfile.ZipInfo] = {}
    seen: set[str] = set()
    spellings: dict[str, str] = {}
    infos = archive.infolist()
    if len(infos) > 20000 or sum(i.file_size for i in infos) > 1024 * 1024 * 1024:
        raise ValueError('ZIP exceeds inspection budget (20000 members / 1 GiB)')
    for item in infos:
        name = item.filename
        path_name = name[:-1] if item.is_dir() and name.endswith('/') else name
        safe_relative(path_name)
        key = unicodedata.normalize('NFC', path_name).casefold()
        if key in seen:
            raise ValueError(f'Duplicate or case/Unicode-colliding ZIP member: {name}')
        seen.add(key)
        components = path_name.split('/')
        for count in range(1, len(components) + 1):
            prefix = '/'.join(components[:count])
            prefix_key = unicodedata.normalize('NFC', prefix).casefold()
            if prefix_key in spellings and spellings[prefix_key] != prefix:
                raise ValueError(f'Case/Unicode-colliding ZIP path components: {name}')
            spellings[prefix_key] = prefix
        if item.flag_bits & 1:
            raise ValueError(f'Encrypted ZIP member: {name}')
        mode = (item.external_attr >> 16) & 0xffff
        if stat.S_ISLNK(mode):
            raise ValueError(f'Symbolic-link ZIP member: {name}')
        if stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR):
            raise ValueError(f'Special-file ZIP member: {name}')
        if len(name) > 240:
            raise ValueError(f'ZIP member exceeds 240 characters: {name}')
        if not item.is_dir():
            result[name] = item
    # A file cannot also be a parent directory, even with different letter case.
    file_keys = {unicodedata.normalize('NFC', n).casefold() for n in result}
    for name in result:
        parts = name.split('/')
        for count in range(1, len(parts)):
            parent = unicodedata.normalize('NFC', '/'.join(parts[:count])).casefold()
            if parent in file_keys:
                raise ValueError(f'ZIP file/directory collision: {name}')
    return result


def read_plan(root: Path = ROOT) -> dict:
    plan = json.loads((root / '90_RELEASES/RELEASE_PLAN.json').read_text(encoding='utf-8'))
    if not isinstance(plan.get('weeks'), dict) or not plan['weeks']:
        raise ValueError('Release plan needs a non-empty weeks map')
    return plan


def selection(plan: dict, weeks: str | None = None, language: str | None = None):
    requested = [v.strip().zfill(2) for v in weeks.split(',')] if weeks else sorted(plan['weeks'])
    if len(set(requested)) != len(requested) or any(not re.fullmatch(r'[0-9]{2}', w) for w in requested):
        raise ValueError('Weeks must be distinct comma-separated numbers, such as 01,02')
    for week in requested:
        if week not in plan['weeks']:
            raise ValueError(f'Week {week} is absent from the release plan')
        entry = plan['weeks'][week]
        languages = entry.get('languages', {})
        wanted = [language] if language else sorted(languages)
        if not wanted:
            raise ValueError(f'Week {week} declares no languages')
        for lang in wanted:
            if lang not in languages:
                raise ValueError(f'Week {week} has no {lang} distribution')
            yield week, lang, entry, languages[lang]


def state(plan: dict, week: dict) -> dict:
    return {key: week.get(key, plan.get(key)) for key in ('status', 'draft', 'prerelease', 'required_gates', 'gates')}


def validate_week(plan: dict, number: str, item: dict) -> None:
    version = item.get('version')
    if not isinstance(version, str) or not VERSION_RE.fullmatch(version):
        raise ValueError(f'Invalid release version for week {number}: {version!r}')
    tag = item.get('tag', '')
    if not isinstance(tag, str) or not re.fullmatch(r'[A-Za-z0-9._-]+', tag) or not tag.startswith(f'week-{number}-') or not tag.endswith(f'v{version}'):
        raise ValueError(f'Release tag must identify week {number} and version {version}')
    qualification = state(plan, item)
    if qualification['status'] not in ('final', 'release-candidate', 'preview', 'work-in-progress'):
        raise ValueError(f'Unrecognised release status for week {number}')
    for key in ('draft', 'prerelease'):
        if qualification[key] is not None and not isinstance(qualification[key], bool):
            raise ValueError(f'{key} must be a JSON boolean')
    if qualification['status'] != 'final' and qualification['prerelease'] is not True:
        raise ValueError(f'Non-final week {number} must declare prerelease: true')
    if qualification['status'] == 'final' and qualification['prerelease'] is not False:
        raise ValueError(f'Final week {number} must declare prerelease: false')
    required = qualification['required_gates']
    gates = qualification['gates']
    if not isinstance(required, list) or not required or not all(isinstance(name, str) and re.fullmatch(r"[a-z][a-z0-9_]*", name) for name in required) or len(set(required)) != len(required):
        raise ValueError(f'Week {number} must explicitly declare distinct required qualification gates')
    if not isinstance(gates, dict):
        raise ValueError(f'Week {number} gates must be a map')
    for key in ('title', 'notes'):
        value = item.get(key)
        if not isinstance(value, str) or not value or '\n' in value or '\r' in value:
            raise ValueError(f'Week {number} needs a single-line {key}')
    repo_path(item['notes'])
