#!/usr/bin/env python3
"""Standard-library contracts for the v4 candidate repository and distribution."""
from __future__ import annotations

import hashlib
import json
import math
import os
import posixpath
import re
import stat
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

VERSION = '4.0.0'
LATEST_PUBLISHED_VERSION = '3.0.0'
PROGRESS = 'metadata/CANDIDATE_PROGRESS.json'
METADATA = 'metadata/CLASSROOM_COLLECTION.json'
COURSE_MAP = 'metadata/course-map.json'
MANIFEST = 'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt'
PACKAGE_ID = 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'
CONTROLS = {MANIFEST, PACKAGE_ID}
OBJECTS = {f'{kind}{n:02}' for kind in 'CS' for n in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
GATES = {'local_integrity', 'reference_runtime', 'headless_browser', 'native_windows', 'native_macos', 'manual_browser', 'word', 'moodle_live', 'human_pilot', 'owner_acceptance'}
REQUIRED_PROJECT_IDS = {week: ['P01', 'P02'] if week == 1 else ['P01', 'P03'] if week == 14 else ['P01', 'P02', 'P03'] for week in range(1, 15)}
MAX_NODES = 20000
MAX_BYTES = 1024 * 1024 * 1024


def sha(data):
    return hashlib.sha256(data).hexdigest()


def strict_json(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError('Duplicate JSON key: ' + key)
            result[key] = value
        return result
    def constant(value):
        raise ValueError('Nonstandard JSON constant: ' + value)
    result = json.loads(data, object_pairs_hook=pairs, parse_constant=constant)
    def finite(value):
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError('Non-finite JSON number')
        if isinstance(value, dict):
            for item in value.values():
                finite(item)
        elif isinstance(value, list):
            for item in value:
                finite(item)
    finite(result)
    return result


def safe_name(name):
    if not isinstance(name, str) or not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe relative path')
    for part in name.split('/'):
        if (part in ('', '.', '..') or part[-1:] in (' ', '.')
                or re.search(r'[\x00-\x1f\x7f<>:"|?*]', part)
                or re.match(r'^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)', part, re.I)):
            raise ValueError('Unsafe path component: ' + name)
    return name


def checked_path(root, name):
    safe_name(name)
    root = Path(root).absolute()
    item = root / name
    for part in [item, *item.parents]:
        if part.is_symlink():
            raise ValueError('Symlink in path: ' + str(part))
    if not item.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path escapes repository')
    return item


def inventory(root, generated=()):
    root = Path(root).absolute()
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Expected a real repository directory')
    generated = set(generated)
    result = {}
    names = {}
    visited = 0
    total = 0
    for current, dirs, files in os.walk(root, followlinks=False):
        base = Path(current)
        retain = []
        for name in sorted(dirs + files):
            item = base / name
            relative = safe_name(item.relative_to(root).as_posix())
            mode = item.lstat().st_mode
            if stat.S_ISLNK(mode) or not (stat.S_ISREG(mode) or stat.S_ISDIR(mode)):
                raise ValueError('Non-regular source entry: ' + relative)
            if relative == '.git':
                continue
            key = unicodedata.normalize('NFC', relative).casefold()
            if key in names and names[key] != relative:
                raise ValueError('Case/Unicode namespace collision: ' + relative)
            names[key] = relative
            visited += 1
            if visited > MAX_NODES:
                raise ValueError('Source inventory node limit')
            if stat.S_ISDIR(mode):
                if relative not in generated:
                    retain.append(name)
            else:
                result[relative] = item
                total += item.stat().st_size
                if total > MAX_BYTES:
                    raise ValueError('Source inventory byte limit')
        dirs[:] = retain
    return result


def parse_manifest(data):
    text = data.decode('utf-8')
    if not text.endswith('\n') or '\r' in text:
        raise ValueError('Manifest must use UTF-8 and LF')
    rows = {}
    for line in text[:-1].split('\n'):
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        if not match:
            raise ValueError('Malformed manifest row')
        digest, name = match.groups()
        safe_name(name)
        if name in rows:
            raise ValueError('Duplicate manifest path: ' + name)
        rows[name] = digest
    if list(rows) != sorted(rows):
        raise ValueError('Manifest path order differs')
    return rows


def manifest_from_hashes(hashes):
    return ''.join(digest + '  ' + name + '\n' for name, digest in sorted(hashes.items())).encode('utf-8')


def read_metadata(root):
    meta = strict_json(checked_path(root, METADATA).read_bytes())
    if (meta.get('schema') != 'webtech-classroom-collection/v1'
            or meta.get('distribution_version') != VERSION
            or meta.get('final_target_version') != VERSION
            or meta.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or meta.get('distribution_status') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
            or meta.get('candidate_progress') != PROGRESS
            or meta.get('qualificationVerdict') != 'NOT_FINAL'
            or meta.get('native_acceptance') is not False
            or meta.get('publication_qualified') is not False
            or meta.get('published') is not False):
        raise ValueError('Current collection identity or qualification differs')
    gates = meta.get('qualificationGates')
    if not isinstance(gates, dict) or set(gates) != GATES or any(value != 'pending' for value in gates.values()):
        raise ValueError('All ten general qualification gates must remain pending')
    edits = meta.get('editable_files')
    generated = meta.get('generated_directories')
    if not isinstance(edits, list) or len(edits) != 38 or len(set(edits)) != 38:
        raise ValueError('Exactly thirty-eight distinct learner targets required')
    pattern = r'01_WEEKS/WEEK_([0-9]{2})/S\1_SEMINAR/EN_GB/CLASSROOM_RC6/(targets|student)/.+\.(mjs|js|json|css)'
    for name in edits:
        if not re.fullmatch(pattern, safe_name(name)):
            raise ValueError('Learner target boundary differs: ' + name)
    if not isinstance(generated, list) or len(generated) != 83 or len(set(generated)) != 83:
        raise ValueError('Declared runtime directory inventory differs')
    for name in generated:
        safe_name(name)
        if name != 'STUDENT_EVIDENCE' and not name.startswith(('01_WEEKS/', '00_SETUP/')):
            raise ValueError('Runtime directory escapes unit roots')
    return meta


def verify_progress(root, meta):
    progress = strict_json(checked_path(root, PROGRESS).read_bytes())
    if (progress.get('schema') != 'webtech-candidate-progress/v1'
            or progress.get('candidate_version') != VERSION
            or progress.get('final_target_version') != VERSION
            or progress.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or progress.get('distribution_status') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
            or progress.get('qualificationVerdict') != 'NOT_FINAL'
            or progress.get('native_acceptance') is not False
            or progress.get('publication_qualified') is not False
            or progress.get('published') is not False
            or progress.get('qualificationGates') != meta['qualificationGates']
            or progress.get('phase') != 'T01_CANDIDATE_PREPARED'
            or progress.get('next_phase') != 'T02'):
        raise ValueError('Candidate progress identity, distribution or qualification differs')
    tranches = progress.get('tranches')
    if not isinstance(tranches, list) or len(tranches) != 7:
        raise ValueError('Exactly seven candidate tranches required')
    for number, tranche in enumerate(tranches, 1):
        expected_units = [f'{kind}{week:02}' for week in range(number * 2 - 1, number * 2 + 1) for kind in ('C', 'S')]
        if (tranche.get('id') != f'T{number:02}' or tranche.get('units') != expected_units
                or tranche.get('acceptance_status') != 'PENDING'
                or tranche.get('implementation_status') != ('COMPLETE_WITH_EXPLICIT_LIMITS' if number == 1 else 'PENDING')):
            raise ValueError('T01-only candidate progress boundary differs')
    return {'phase': progress.get('phase'), 'next_phase': progress.get('next_phase'),
            'implementation_scope': progress.get('implementation_scope'),
            'global_qualification': 'NOT_FINAL', 'published': False}


def verify_source(root, allow_edits=False):
    root = Path(root).absolute()
    meta = read_metadata(root)
    paths = inventory(root, meta['generated_directories'] if allow_edits else ())
    manifest = checked_path(root, MANIFEST).read_bytes()
    rows = parse_manifest(manifest)
    if set(rows) != set(paths) - CONTROLS:
        raise ValueError('Whole-repository manifest inventory differs')
    identity = sha(manifest)
    if checked_path(root, PACKAGE_ID).read_bytes() != (identity + '\n').encode('ascii'):
        raise ValueError('Whole-repository identity differs')
    allowed = set(meta['editable_files']) if allow_edits else set()
    changes = []
    for name, digest in rows.items():
        if sha(paths[name].read_bytes()) != digest:
            if name not in allowed:
                raise ValueError('Protected source bytes differ: ' + name)
            changes.append(name)
    return meta, paths, {'status': 'PASS_PROTECTED_FILES_ONLY' if allow_edits else 'PASS_INITIAL_BYTES_ONLY',
                         'repository_package_id': identity, 'files': len(paths),
                         'allowedStudentChanges': changes, 'qualificationVerdict': 'NOT_FINAL'}


def object_root(ident):
    if ident == 'SETUP_WINDOWS':
        return '00_SETUP/WINDOWS/EN_GB/'
    if ident == 'SETUP_MACOS_LINUX':
        return '00_SETUP/MACOS_LINUX/EN_GB/'
    return f'01_WEEKS/WEEK_{ident[1:]}/{ident}_{"COURSE" if ident[0] == "C" else "SEMINAR"}/EN_GB/'


def verify_units(root, meta, paths, allow_edits=False):
    objects = meta.get('objects')
    if not isinstance(objects, list) or len(objects) != 30 or {o.get('object_id') for o in objects} != OBJECTS:
        raise ValueError('Exactly thirty distinct current objects required')
    allowed = set(meta['editable_files']) if allow_edits else set()
    reports = []
    for obj in objects:
        ident = obj['object_id']
        base = object_root(ident)
        if obj.get('payload_root') != base:
            raise ValueError('Current object root differs: ' + ident)
        if obj.get('included_in_collection_version') != VERSION:
            raise ValueError('Current object candidate version differs: ' + ident)
        for field in ('entry', 'start', 'guide', 'package_id_path'):
            name = obj.get(field)
            if not isinstance(name, str) or name not in paths:
                raise ValueError('Current object route missing: ' + ident + '/' + field)
            if field != 'entry' and not name.startswith(base):
                raise ValueError('Current object route leaves its unit: ' + ident)
        form = obj.get('form')
        if form is not None and (form not in paths or not form.startswith(base)):
            raise ValueError('Current evidence form missing: ' + ident)
        if re.fullmatch('S[0-9]{2}', ident) and form is None:
            raise ValueError('Seminar evidence form required: ' + ident)
        if ident == 'C01':
            unit_manifest = '90_AUDIT/PAYLOAD_SHA256SUMS.txt'
            unit_id = '90_AUDIT/PACKAGE_ID.txt'
        elif ident == 'C02':
            unit_manifest = '06_AUDIT/SHA256SUMS.txt'
            unit_id = '06_AUDIT/PACKAGE_ID.txt'
        else:
            unit_manifest = 'SHA256SUMS.txt'
            unit_id = 'PACKAGE_ID.txt'
        if obj['package_id_path'] != base + unit_id:
            raise ValueError('Current unit ID location differs: ' + ident)
        unit = {name[len(base):]: item for name, item in paths.items() if name.startswith(base)}
        rows = parse_manifest(unit[unit_manifest].read_bytes())
        exclusions = {unit_manifest} if ident == 'C02' else {unit_manifest, unit_id}
        if set(rows) != set(unit) - exclusions:
            raise ValueError('Unit manifest inventory differs: ' + ident)
        for name, digest in rows.items():
            if sha(unit[name].read_bytes()) != digest and base + name not in allowed:
                raise ValueError('Protected unit bytes differ: ' + ident + '/' + name)
        if ident == 'C02':
            identity = sha(manifest_from_hashes({name: digest for name, digest in rows.items() if name != unit_id}))
        else:
            identity = sha(unit[unit_manifest].read_bytes())
        if obj.get('package_id') != identity or unit[unit_id].read_bytes() != (identity + '\n').encode('ascii'):
            raise ValueError('Unit identity differs: ' + ident)
        reports.append({'object_id': ident, 'files': len(unit), 'package_id': identity})
    return reports


def verify_course_map(root, meta, paths):
    course = strict_json(checked_path(root, COURSE_MAP).read_bytes())
    weeks = course.get('weeks')
    if (course.get('schema') != 'webtech-classroom-course-map/v1'
            or course.get('distribution_version') != VERSION
            or course.get('final_target_version') != VERSION
            or course.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or course.get('distribution_status') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
            or course.get('candidate_progress') != PROGRESS
            or course.get('qualification') != 'NOT_FINAL'
            or course.get('native_acceptance') is not False
            or course.get('publication_qualified') is not False
            or course.get('published') is not False
            or course.get('required_project_count') != 40
            or not isinstance(weeks, list) or len(weeks) != 14
            or {week.get('week') for week in weeks} != set(range(1, 15))):
        raise ValueError('Current fourteen-week course map differs')
    targets = set()
    count = 0
    for week in weeks:
        number = str(week['week']).zfill(2)
        sid = 'S' + number
        if week.get('course_id') != 'C' + number or week.get('seminar_id') != sid or week.get('individual_in_class') is not True:
            raise ValueError('Individual current week requirements differ')
        if week.get('tutorial') not in paths:
            raise ValueError('Current tutorial missing: ' + sid)
        projects = week.get('required_projects')
        expected_ids = REQUIRED_PROJECT_IDS[week['week']]
        if not isinstance(projects, list) or [project.get('id') for project in projects] != expected_ids:
            raise ValueError('Exact required project IDs/order differ: ' + sid)
        selected = next((obj for obj in meta['objects'] if obj.get('object_id') == sid), None)
        selected_projects = selected.get('projects') if selected else None
        if not isinstance(selected_projects, list) or [project.get('id') for project in selected_projects] != expected_ids:
            raise ValueError('Exact collection project IDs/order differ: ' + sid)
        if [(project.get('id'), project.get('title'), project.get('editable_file')) for project in projects] != [(project.get('id'), project.get('title'), project.get('editable_path')) for project in selected_projects]:
            raise ValueError('Course map and collection project contracts differ: ' + sid)
        for project in projects:
            target = object_root(sid) + safe_name(project['editable_file'])
            if target not in paths:
                raise ValueError('Required project target missing: ' + target)
            targets.add(target)
            count += 1
    if count != 40 or len(targets) != 38 or targets != set(meta['editable_files']) or meta.get('required_microprojects') != 40:
        raise ValueError('Forty required projects or thirty-eight learner targets differ')
    return course, {'weeks': 14, 'required_projects': count, 'editable_targets': len(targets)}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.langs = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'html':
            self.langs.append(values.get('lang'))
        attribute = 'href' if tag in ('a', 'link') else 'src' if tag in ('img', 'script', 'iframe') else None
        if attribute and attribute in values:
            self.urls.append(values[attribute])


def verify_links(root, meta, course, paths):
    scope = {'README.md', '00_START_HERE/README.md'}
    for obj in meta['objects']:
        scope.update(name for name in (obj.get('entry'), obj.get('start'), obj.get('guide'), obj.get('form')) if name)
    scope.update(week['tutorial'] for week in course['weeks'])
    scope.update(name for name in paths if name.startswith('00_START_HERE/') and name.endswith(('.html', '.md')))
    count = 0
    skipped = 0
    for name in sorted(scope):
        text = paths[name].read_text(encoding='utf-8')
        if name.endswith('.html'):
            parser = Links()
            parser.feed(text)
            if parser.langs != ['en-GB']:
                raise ValueError('Current HTML navigation language differs: ' + name)
            urls = parser.urls
        elif name.endswith('.md'):
            text = re.sub(r'```[^\n]*\n.*?```', '', text, flags=re.S)
            urls = re.findall(r'\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)', text)
        else:
            continue
        for url in urls:
            value = urlsplit(url.strip('<>'))
            if value.scheme or value.netloc or not value.path:
                continue
            decoded = unquote(value.path)
            if '${' in decoded or '{{' in decoded:
                skipped += 1
                continue
            if decoded.startswith('/') or '\\' in decoded or '\x00' in decoded:
                raise ValueError('Unsafe current document URL: ' + name)
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), decoded))
            item = checked_path(root, target)
            folder = target.rstrip('/') + '/'
            directory_link = item.is_dir() and (folder + 'index.html' in paths or (name.endswith('.md') and any(path.startswith(folder) for path in paths)))
            if target not in paths and not directory_link:
                raise ValueError('Missing local document target: ' + name + ' -> ' + url)
            count += 1
    return {'documents': len(scope), 'local_links': count, 'dynamic_targets_not_asserted': skipped,
            'scope': 'Current frontdoors, selected unit start/guide/form pages and fourteen tutorials; external links and dynamic application routes are not network-tested.'}
