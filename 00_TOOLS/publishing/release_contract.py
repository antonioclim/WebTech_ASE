#!/usr/bin/env python3
"""Bounded, strict release primitives. Integrity is not publisher authentication."""
from __future__ import annotations
import datetime as dt
import hashlib
import io
import json
import math
import os
import re
import stat
import tempfile
import unicodedata
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GATES = ('local_integrity', 'reference_runtime', 'headless_browser', 'native_windows',
         'native_macos', 'manual_browser', 'word', 'moodle_live', 'human_pilot', 'owner_acceptance')
OBJECTS = {f'{kind}{n:02}' for kind in 'CS' for n in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
STAMP = (2026, 10, 4, 0, 0, 0)
MAX_ENTRIES = 20_000
MAX_MEMBER = 256 * 1024**2
MAX_CONTAINER = 1024**3
MAX_SCAN = 2 * 1024**3
MAX_DEPTH = 8

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError('Duplicate JSON key: ' + key)
        result[key] = value
    return result

def strict_json(data):
    def reject(value):
        raise ValueError('Nonstandard JSON constant: ' + value)
    result = json.loads(data, object_pairs_hook=pairs, parse_constant=reject)
    def finite(value):
        if isinstance(value,float) and not math.isfinite(value):
            raise ValueError('Non-finite JSON number')
        if isinstance(value,dict):
            for v in value.values():finite(v)
        elif isinstance(value,list):
            for v in value:finite(v)
    finite(result)
    return result

def safe_name(name: str) -> str:
    if not isinstance(name, str) or not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe relative path')
    for part in name.split('/'):
        if part in ('', '.', '..') or part[-1:] in (' ', '.') or re.search(r'[\x00-\x1f\x7f<>:"|?*]', part):
            raise ValueError('Unsafe path component: ' + name)
        if re.match(r'^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)', part, re.I):
            raise ValueError('Reserved Windows path: ' + name)
    return name

def namespace(entries):
    """Admit explicit and implicit directories, including component collisions."""
    explicit = set()
    nodes = {}
    for name, directory in entries:
        safe_name(name)
        if name in explicit:
            raise ValueError('Duplicate entry: ' + name)
        explicit.add(name)
        parts = name.split('/')
        for i in range(1, len(parts) + 1):
            prefix = '/'.join(parts[:i])
            key = unicodedata.normalize('NFC', prefix).casefold()
            kind = 'directory' if i < len(parts) or directory else 'file'
            if key in nodes and nodes[key] != (prefix, kind):
                raise ValueError('Case/Unicode/file-directory collision: ' + prefix)
            nodes[key] = (prefix, kind)

def checked_path(root: Path, rel: str) -> Path:
    safe_name(rel)
    root = root.absolute()
    path = root / rel
    for current in [path, *path.parents]:
        if current.is_symlink():
            raise ValueError('Symlink or dangling symlink: ' + str(current))
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path escapes root')
    return path

def tree_files(root: Path, exclude_git=False):
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Expected a real directory')
    result = {}
    entries = []
    for current, dirs, files in os.walk(root, followlinks=False):
        p = Path(current)
        if exclude_git:
            dirs[:] = [d for d in dirs if not (p == root and d == '.git') and d != '__pycache__']
            files = [f for f in files if not (p == root and f == '.git')]
        for name in dirs + files:
            q = p / name
            mode = q.lstat().st_mode
            if stat.S_ISLNK(mode) or not (stat.S_ISDIR(mode) or stat.S_ISREG(mode)):
                raise ValueError('Non-regular source entry: ' + str(q))
            rel = q.relative_to(root).as_posix()
            entries.append((rel, stat.S_ISDIR(mode)))
            if stat.S_ISREG(mode):
                result[rel] = q
    namespace(entries)
    return result

def zip_members(data: bytes, budget=None, depth=0, normalized_modes=False):
    """Check budgets and metadata before expanding any member or its CRC."""
    if depth >= MAX_DEPTH:
        raise ValueError('Nested-container depth limit')
    budget = budget if budget is not None else {'bytes': 0}
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        infos = z.infolist()
        if len(infos) > MAX_ENTRIES:
            raise ValueError('ZIP entry budget')
        total = sum(i.file_size for i in infos)
        if total > MAX_CONTAINER or budget['bytes'] + total > MAX_SCAN:
            raise ValueError('ZIP expanded byte budget')
        entries = []
        for info in infos:
            name = info.filename[:-1] if info.is_dir() else info.filename
            entries.append((name, info.is_dir()))
            mode = info.external_attr >> 16
            kind = stat.S_IFMT(mode)
            if info.flag_bits & 1 or kind not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise ValueError('Encrypted or special ZIP entry')
            if kind == stat.S_IFDIR and not info.is_dir() or kind == stat.S_IFREG and info.is_dir():
                raise ValueError('ZIP directory type mismatch')
            if info.is_dir() and info.file_size != 0:
                raise ValueError('ZIP directory carries data')
            if normalized_modes and not info.is_dir():
                expected_mode = 0o100755 if name.endswith('.sh') else 0o100644
                if info.create_system != 3 or mode != expected_mode:
                    raise ValueError('Selected ZIP executable/type mode differs')
            if info.file_size > MAX_MEMBER or (info.file_size > 1024**2 and info.file_size / max(1, info.compress_size) > 2000):
                raise ValueError('ZIP member expansion budget')
        namespace(entries)
        budget['bytes'] += total
        return {i.filename: z.read(i) for i in infos if not i.is_dir()}

def zip_bytes(payload: dict[str, bytes], prefix='') -> bytes:
    namespace([(n, False) for n in payload])
    if prefix:
        safe_name(prefix[:-1] if prefix.endswith('/') else prefix)
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(payload.items()):
            info = zipfile.ZipInfo(prefix + name, STAMP)
            info.create_system = 3
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100755 if name.endswith('.sh') else 0o100644) << 16
            z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return out.getvalue()

def manifest(payload, exclude=()):
    return ''.join(sha(value) + '  ' + name + '\n' for name, value in sorted(payload.items()) if name not in exclude).encode()

def parse_manifest(data):
    rows = {}
    for line in data.decode('utf-8').splitlines():
        if not re.fullmatch(r'[0-9a-f]{64}  .+', line):
            raise ValueError('Malformed SHA256 manifest')
        digest, name = line.split('  ', 1)
        safe_name(name)
        if name in rows:
            raise ValueError('Duplicate manifest path')
        rows[name] = digest
    namespace([(n, False) for n in rows])
    return rows

def output_path(path, root=ROOT):
    path = Path(path).expanduser().absolute()
    for p in [path, *path.parents]:
        if p.is_symlink():
            raise ValueError('Output symlink')
    resolved = path.resolve()
    if resolved == root.resolve() or resolved.is_relative_to(root.resolve()) or root.resolve().is_relative_to(resolved):
        raise ValueError('Output must be outside source tree')
    return resolved

def validate_destination(path, data):
    for p in [path, *path.parents]:
        if p.is_symlink():
            raise ValueError('Output symlink')
    if path.exists() and (not path.is_file() or path.read_bytes() != data):
        raise ValueError('Existing different output: ' + str(path))

def atomic_write(path, data):
    """Exclusive atomic file publication; identical-byte replay is admitted."""
    path = Path(path)
    validate_destination(path, data)
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.'+path.name+'.', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.chmod(name, 0o644)
        try:
            os.link(name, path, follow_symlinks=False)
        except FileExistsError:
            validate_destination(path, data)
    finally:
        os.unlink(name)

def write_tree(path, payload):
    path = output_path(path)
    if path.exists():
        actual = tree_files(path)
        if set(actual) != set(payload) or any(actual[n].read_bytes() != b for n, b in payload.items()):
            raise ValueError('Existing different output directory')
        if any(bool(actual[n].stat().st_mode & 0o111) != n.endswith('.sh') for n in actual):
            raise ValueError('Existing output executable modes differ')
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = Path(tempfile.mkdtemp(prefix='.'+path.name+'.', dir=path.parent))
    try:
        for n, data in payload.items():
            safe_name(n)
            p = temp/n
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data)
            p.chmod(0o755 if n.endswith('.sh') else 0o644)
        # os.rename is not an exclusive directory publication on every OS.
        # Refuse existing paths; concurrent directory builders are unsupported.
        if path.exists() or path.is_symlink():
            raise ValueError('Output directory appeared during build')
        os.rename(temp, path)
    finally:
        if temp.exists():
            import shutil
            shutil.rmtree(temp)

def unique_yaml(data):
    import yaml
    for token in yaml.scan(data):
        if isinstance(token, (yaml.tokens.AnchorToken, yaml.tokens.AliasToken)):
            raise ValueError('YAML anchors/aliases are outside policy')
    class Loader(yaml.BaseLoader):
        pass
    def mapping(loader, node):
        result = {}
        for key, value in node.value:
            k = loader.construct_object(key, deep=True)
            if not isinstance(k, str) or k in result:
                raise ValueError('Duplicate or non-string YAML key')
            result[k] = loader.construct_object(value, deep=True)
        return result
    Loader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, mapping)
    return yaml.load(data, Loader=Loader)

def source_identity(root=ROOT):
    names = tree_files(root, exclude_git=True)
    controls = {'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt', 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'}
    m = root/'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt'
    pid = root/'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'
    rows = parse_manifest(m.read_bytes())
    if set(rows) != set(names)-controls:
        raise ValueError('Whole-source inventory mismatch')
    for n, digest in rows.items():
        if sha(names[n].read_bytes()) != digest:
            raise ValueError('Whole-source bytes changed: ' + n)
    expected = sha(m.read_bytes())
    if pid.read_bytes() != (expected+'\n').encode():
        raise ValueError('Whole-source identity mismatch')
    return expected

def qualify(receipt_path, registry_bytes, root=ROOT):
    # Recheck actual source before consulting any assertion in a receipt.
    pid = source_identity(root)
    d = strict_json(Path(receipt_path).read_bytes())
    if not isinstance(d, dict) or d.get('schema') != 'webtech-release-qualification/v2' or d.get('status') != 'PASS':
        raise ValueError('A structured current qualification receipt is required')
    if d.get('registry_sha256') != sha(registry_bytes) or d.get('repository_package_id') != pid:
        raise ValueError('Qualification receipt is bound to different bytes')
    if not isinstance(d.get('object_ids'), list) or len(d['object_ids']) != 30 or set(d['object_ids']) != OBJECTS:
        raise ValueError('Qualification object scope differs')
    gates = d.get('gates')
    if not isinstance(gates, dict) or set(gates) != set(GATES):
        raise ValueError('All ten fixed gates are mandatory')
    now = dt.datetime.now(dt.timezone.utc)
    for gate in GATES:
        item = gates[gate]
        if not isinstance(item, dict) or item.get('status') != 'PASS' or not isinstance(item.get('observations'), list) or not item['observations']:
            raise ValueError('Missing structured observations: ' + gate)
        observed = set()
        for record in item['observations']:
            if not isinstance(record, dict):
                raise ValueError('Malformed observation')
            for field in ('observer', 'role', 'checks'):
                if not isinstance(record.get(field), str) or len(record[field].strip()) < 3:
                    raise ValueError('Missing observation field: ' + field)
            platform = record.get('platform')
            if not isinstance(platform, dict) or not all(isinstance(platform.get(k), str) and platform[k].strip() for k in ('name','version')):
                raise ValueError('Versioned platform is required')
            if gate == 'native_windows' and 'windows' not in platform['name'].lower() or gate == 'native_macos' and not re.search(r'macos|mac os', platform['name'], re.I):
                raise ValueError('Native platform mismatch')
            when = dt.datetime.fromisoformat(record.get('observed_at', '').replace('Z','+00:00'))
            if when.tzinfo is None or when > now:
                raise ValueError('Timezone-aware nonfuture observation required')
            ids = record.get('object_ids')
            if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)) or not set(ids) <= OBJECTS:
                raise ValueError('Observation object scope invalid')
            observed.update(ids)
            evidence = record.get('evidence')
            if not isinstance(evidence, dict) or not re.fullmatch('[0-9a-f]{64}',str(evidence.get('sha256',''))):
                raise ValueError('Retained evidence SHA required')
            e = checked_path(Path(receipt_path).absolute().parent, evidence.get('path',''))
            if not e.is_file() or sha(e.read_bytes()) != evidence['sha256']:
                raise ValueError('Evidence absent or changed')
        if observed != OBJECTS:
            raise ValueError('Gate does not cover every selected object: ' + gate)
    return d

def github_output(path, data):
    p = Path(path).absolute()
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('GITHUB_OUTPUT') != str(p):
        raise ValueError('Explicit real workflow-output environment required')
    for q in [p, *p.parents]:
        if q.is_symlink():
            raise ValueError('Workflow-output symlink')
    fd = os.open(p, os.O_WRONLY | getattr(os,'O_NOFOLLOW',0))
    with os.fdopen(fd,'wb') as f:
        info = os.fstat(f.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_size != 0:
            raise ValueError('Workflow output must be a precreated empty regular file')
        f.write(data)
