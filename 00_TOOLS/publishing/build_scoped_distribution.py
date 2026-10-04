#!/usr/bin/env python3
"""Replay or verify the frozen Week 01/02 EN student distribution; never publish.

Default: verify the catalogued ZIP and its sidecar. To build, provide --build and
an explicit --output. Input changes and different replay bytes fail before any
output. Existing different output/sidecar bytes are never overwritten.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import tempfile
import zipfile
import zlib
from pathlib import Path

sys.dont_write_bytecode = True
from release_contract import ROOT, repo_path, safe_relative, zip_files

CATALOG = ROOT / '90_RELEASES/SCOPED_DISTRIBUTION.json'
OBJECT_ORDER = ['C01', 'S01', 'C02', 'S02']
INPUT_PATHS = {'90_RELEASES/CURRENT_OBJECTS.json', '90_RELEASES/RELEASE_PLAN.json', '90_RELEASES/LOCAL_QA_WEEK01_02.json'}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def manifest_rows(data: bytes) -> dict[str, str]:
    text = data.decode('utf-8')
    require(data.endswith(b'\n') and b'\r' not in data, 'Manifest must use UTF-8/LF with a final LF')
    rows: dict[str, str] = {}
    seen: set[str] = set()
    for line in text.splitlines():
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        require(match is not None, 'Invalid manifest row')
        value, relative = match.groups()
        safe_relative(relative)
        key = relative.casefold()
        require(key not in seen, f'Duplicate/colliding manifest path: {relative}')
        seen.add(key)
        rows[relative] = value
    require(bool(rows), 'Manifest is empty')
    return rows


def inspect_object(data: bytes, obj: dict) -> None:
    """Inspect complete pristine distribution bytes, including the package ID relation."""
    require(digest(data) == obj['sha256'] and len(data) == obj['bytes'], f'Object archive hash/size mismatch: {obj["id"]}')
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        members = zip_files(archive)
        prefix = obj['package_root'] + '/'
        require(all(name.startswith(prefix) for name in members), f'Wrong object root: {obj["id"]}')
        require(archive.testzip() is None, f'Object CRC failure: {obj["id"]}')
        files = {name[len(prefix):]: archive.read(info) for name, info in members.items()}
    require(len(files) == obj['files'], f'Object file count mismatch: {obj["id"]}')
    unit = obj['id']
    audit = '06_AUDIT' if unit == 'C02' else '90_AUDIT'
    identity = audit + '/PACKAGE_ID.txt'
    require(identity in files and re.fullmatch(rb'[0-9a-f]{64}\n', files[identity]) is not None, f'Invalid object PACKAGE_ID: {unit}')
    require(files[identity].decode().strip() == obj['package_id'], f'Object PACKAGE_ID differs from registry: {unit}')
    if unit in ('C01', 'S01'):
        manifest = audit + '/PAYLOAD_SHA256SUMS.txt'
        excluded = {manifest, identity}
        derived = digest(files[manifest])
    elif unit == 'C02':
        manifest = audit + '/SHA256SUMS.txt'
        excluded = {manifest}
        require(b'sorted by exact ordinal relative path' in files[audit + '/PACKAGE_ID_METHOD.txt'], 'C02 ordinal identity declaration missing')
        rows = manifest_rows(files[manifest])
        require(list(rows) == sorted(rows), 'C02 manifest order is not canonical')
        canonical = ''.join(f'{rows[name]}  {name}\n' for name in sorted(rows)).encode()
        require(files[manifest] == canonical and identity in rows, 'C02 manifest bytes/ID membership are not canonical')
        derived = digest(''.join(f'{rows[name]}  {name}\n' for name in sorted(rows) if name != identity).encode())
    else:
        manifest = audit + '/IMMUTABLE_MANIFEST.sha256'
        mutable = files[audit + '/MUTABLE_PATHS.txt'].decode('utf-8').splitlines()
        require(mutable == ['02_PROJECTS/RESPONSIVE_CARD_GRID/public/styles.css'], 'S02 mutable allowance differs from frozen contract')
        require(mutable[0] in files, 'S02 mutable file missing')
        excluded = {manifest, identity, *mutable}
        derived = digest(files[manifest])
    rows = manifest_rows(files[manifest])
    actual = {name: digest(content) for name, content in files.items() if name not in excluded}
    require(rows == actual, f'Object manifest hashes/exact file set mismatch: {unit}')
    require(derived == obj['package_id'], f'Object PACKAGE_ID derivation mismatch: {unit}')


def prepare(catalog: dict, root: Path = ROOT) -> dict[str, bytes]:
    """Verify frozen inputs and derive expected members without recompressing."""
    require(catalog.get('schema') == 'webtech-ase-scoped-distribution-v1', 'Unsupported scoped distribution schema')
    require(catalog.get('scope') == {'weeks': ['01', '02'], 'language': 'EN_GB', 'object_ids': OBJECT_ORDER}, 'Scope must be exactly the four Week 01/02 English objects')
    require(catalog.get('status') == 'release-candidate', 'Frozen distribution must remain a release candidate')
    require(set(catalog['frozen_inputs']) == INPUT_PATHS, 'Frozen input declarations differ from the recipe')
    provenance = catalog['provenance']
    for key in ('remediation_baseline_commit', 'reviewed_source_commit', 'reviewed_source_tree'):
        require(re.fullmatch(r'[0-9a-f]{40}', provenance.get(key, '')) is not None, f'Invalid provenance {key}')
    for relative, expected in catalog['frozen_inputs'].items():
        path = repo_path(relative, root)
        require(path.is_file() and not path.is_symlink(), f'Frozen input missing/unsafe: {relative}')
        require(digest(path.read_bytes()) == expected, f'Frozen input changed: {relative}; use a new reviewed distribution version')
    recipe = catalog['recipe']
    require(recipe['registry'] == '90_RELEASES/CURRENT_OBJECTS.json', 'Unexpected registry path')
    registry = json.loads(repo_path(recipe['registry'], root).read_text(encoding='utf-8'))
    require(registry['source_commit'] == provenance['remediation_baseline_commit'], 'Registry baseline differs from provenance')
    require(registry['distribution_version'] == catalog['distribution_version'] and registry['status'] == catalog['status'], 'Registry version/status mismatch')
    require(registry['languages'] == ['EN_GB'], 'Registry language mismatch')
    objects = registry['objects']
    require([obj['id'] for obj in objects] == OBJECT_ORDER, 'Registry object order/set differs from frozen selection')
    require(recipe['manifest_order'] == OBJECT_ORDER, 'Unexpected manifest order')
    files: dict[str, bytes] = {}
    lines = []
    for obj in objects:
        require(obj['language'] == 'EN_GB' and obj['week'] == obj['id'][1:] and obj['status'] == 'release-candidate', f'Object scope/status mismatch: {obj["id"]}')
        path = repo_path(obj['zip'], root)
        require(path.is_file() and not path.is_symlink(), f'Missing/unsafe object archive: {obj["id"]}')
        require(path.name == obj['package_root'] + '.zip', f'Object archive/root naming mismatch: {obj["id"]}')
        payload = path.read_bytes()
        inspect_object(payload, obj)
        files[path.name] = payload
        lines.append(f'{obj["sha256"]}  {path.name}\n')
    require(len(files) == 4, 'Duplicate object archive names')
    files['SHA256SUMS.txt'] = ''.join(lines).encode('utf-8')
    require(digest(files['SHA256SUMS.txt']) == catalog['archive']['package_id'], 'Combined manifest PACKAGE_ID mismatch')
    files['PACKAGE_ID.txt'] = digest(files['SHA256SUMS.txt']).encode() + b'\n'
    files['RELEASE.json'] = (json.dumps(registry, indent=2, ensure_ascii=True) + '\n').encode('utf-8')
    require(digest(files['RELEASE.json']) == recipe['release_json_sha256'], 'Frozen RELEASE.json changed')
    readme = repo_path(recipe['readme'], root)
    require(readme.is_file() and not readme.is_symlink(), 'Frozen student README missing/unsafe')
    files['README.md'] = readme.read_bytes()
    require(digest(files['README.md']) == recipe['readme_sha256'], 'Frozen student README changed')
    require(recipe['timestamp'] == [2026, 10, 4, 0, 0, 0] and recipe['compression'] == 'deflate' and recipe['compression_level'] == 6 and recipe['create_system'] == 3 and recipe['file_mode'] == '100644' and recipe['member_order'] == 'case-sensitive lexical path order', 'Unsupported frozen ZIP recipe')
    root_name = catalog['archive']['root_name']
    safe_relative(root_name)
    require('/' not in root_name and root_name == f'WEBTECH_ASE_WEEKS_01_02_EN_GB_v{catalog["distribution_version"]}', 'Unexpected combined root name')
    return files


def replay(catalog: dict, files: dict[str, bytes]) -> bytes:
    """Build only when this writer reproduces the exact frozen archive bytes."""
    recipe = catalog['recipe']
    root_name = catalog['archive']['root_name']
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name in sorted(files):
            info = zipfile.ZipInfo(root_name + '/' + name, tuple(recipe['timestamp']))
            info.create_system = 3
            info.create_version = info.extract_version = 20
            info.external_attr = 0o100644 << 16
            archive.writestr(info, files[name], compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
    data = stream.getvalue()
    require(len(data) == catalog['archive']['bytes'] and digest(data) == catalog['archive']['sha256'], 'Byte replay differs from frozen ZIP; inputs passed but ZIP/compressor writer differs. Never overwrite RC1. Observed recipe writer: ' + str(recipe['writer_observed']) + f'; current zlib: {zlib.ZLIB_RUNTIME_VERSION}')
    inspect_combined(data, catalog, files)
    return data


def inspect_combined(data: bytes, catalog: dict, expected: dict[str, bytes]) -> None:
    require(len(data) == catalog['archive']['bytes'] and digest(data) == catalog['archive']['sha256'], 'Combined archive hash/size mismatch')
    prefix = catalog['archive']['root_name'] + '/'
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        members = zip_files(archive)
        names = [prefix + name for name in sorted(expected)]
        require(list(members) == names and len(archive.infolist()) == len(names), 'Combined member set/order differs')
        require(archive.comment == b'' and archive.testzip() is None, 'Combined ZIP comment/CRC mismatch')
        for name, info in members.items():
            require(archive.read(info) == expected[name[len(prefix):]], f'Combined member content mismatch: {name}')
            require(info.date_time == tuple(catalog['recipe']['timestamp']) and info.compress_type == 8 and info.create_system == 3 and info.create_version == 20 and info.extract_version == 20 and info.external_attr == 0o100644 << 16 and info.flag_bits == 0 and info.internal_attr == 0 and info.extra == b'' and info.comment == b'', f'Combined member metadata mismatch: {name}')


def atomic_create(path: Path, data: bytes) -> None:
    if path.exists():
        require(path.is_file() and not path.is_symlink() and path.read_bytes() == data, f'Refusing to overwrite different/unsafe bytes: {path}')
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='scoped-distribution-', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        try:
            os.link(temporary, path)  # Exclusive atomic creation: never replace an existing path.
        except FileExistsError:
            require(path.is_file() and not path.is_symlink() and path.read_bytes() == data, f'Output changed concurrently: {path}')
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--verify', action='store_true', help='Default: verify the frozen registered archive')
    group.add_argument('--build', action='store_true', help='Replay bytes only to an explicit output path')
    parser.add_argument('--output', type=Path, help='Required with --build')
    parser.add_argument('--archive', type=Path, help='Verify a supplied copy instead of the registered archive')
    args = parser.parse_args()
    if args.build and (args.output is None or args.archive is not None):
        parser.error('--build requires --output and cannot use --archive')
    if not args.build and args.output is not None:
        parser.error('--output is only valid with --build')
    try:
        catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
        files = prepare(catalog)
        rebuilt = replay(catalog, files) if args.build else None
        path = args.output if args.build else (args.archive or repo_path(catalog['archive']['path'], ROOT))
        require(not path.is_symlink(), f'Unsafe archive output/input: {path}')
        side = Path(str(path) + '.sha256')
        side_bytes = f'{catalog["archive"]["sha256"]}  {path.name}\n'.encode('utf-8')
        if args.build:
            # Validate both existing destinations before creating either new file.
            for target, content in ((path, rebuilt), (side, side_bytes)):
                require(not target.is_symlink(), f'Unsafe output path: {target}')
                if target.exists():
                    require(target.is_file() and target.read_bytes() == content, f'Refusing to overwrite different bytes: {target}')
            atomic_create(path, rebuilt)
            atomic_create(side, side_bytes)
        require(path.is_file(), f'Missing combined archive: {path}')
        inspect_combined(path.read_bytes(), catalog, files)
        require(side.is_file() and not side.is_symlink() and side.read_bytes() == side_bytes, f'Missing or different combined sidecar: {side}')
        print(f'VERDICT: PASS_SCOPED_DISTRIBUTION_INTEGRITY ({catalog["id"]}; SHA256={catalog["archive"]["sha256"]}; nested identities unchanged; qualification remains declared)')
        return 0
    except (ValueError, KeyError, TypeError, OSError, UnicodeError, zipfile.BadZipFile) as exc:
        parser.exit(2, f'FAIL_SCOPED_DISTRIBUTION: {exc}\n')


if __name__ == '__main__':
    raise SystemExit(main())
