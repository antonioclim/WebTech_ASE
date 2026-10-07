#!/usr/bin/env python3
"""Derive LOCAL3 from exact, hash-pinned LOCAL2 asset bytes without publication.

Python 3.10+ and the standard library suffice. Learner solutions are not supplied.
The CLI writes only a new or empty directory outside the source checkout.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import io
import json
import math
from pathlib import Path
import re
import stat
import unicodedata
import zipfile

HERE = Path(__file__).resolve().parent
VERSION = '3.0.0-rc.10-local.3'
OLD_VERSION = '3.0.0-rc.10-local.2'
CORE_ZIP = 'WEBTECH_ASE_LOCAL3_CLASSROOM.zip'
SITE_ZIP = 'WEBTECH_ASE_LOCAL3_STATIC.zip'
ROOT_CONTROLS = {'SHA256SUMS.txt', 'PACKAGE_ID.txt'}
GATES = ('local_integrity', 'reference_runtime', 'headless_browser', 'native_windows',
         'native_macos', 'manual_browser', 'word', 'moodle_live', 'human_pilot', 'owner_acceptance')
PINNED = {
    'core': {'filename': 'WEBTECH_ASE_LOCAL2_CLASSROOM.zip', 'bytes': 4530534,
             'sha256': 'da6f1ba38b74a109983e2081cca59090d09f558ede6461fdd3ebb76755149b40',
             'root': 'WEBTECH_LOCAL2', 'files': 1521,
             'package_id': '05399c8787d56b0c28e89fbbf64794dc2facc7ea16b546d5923c768040d6a479'},
    'static': {'filename': 'WEBTECH_ASE_LOCAL2_STATIC.zip', 'bytes': 4555040,
               'sha256': '0bb2fc84fbd8ce89231e1855770f62f450553b860586396d4431beb24403b479',
               'root': 'WEBTECH_LOCAL2_STATIC', 'files': 1523,
               'package_id': '978a5aa0b26655e5c1f430bfd14b686c81555ea240c878e80eb3960f37265bf8'}}
MAX_FILES = 20000
MAX_MEMBER = 256 * 1024 ** 2
MAX_EXPANDED = 1024 ** 3
PROBE_UNITS = {'S01', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'}
ROOT_PAGES = {'index.html', 'README.md', 'START_HERE.html', 'COURSE_PLAN.html',
              'ASSESSMENT.html', 'QUALIFICATION.html', 'DOWNLOAD.html', 'DOWNLOAD_RC10.html'}
PLANNING = ('The planned 30–45-minute work blocks per required project and the shared '
            'setup, AI, PDF and recap time remain unpiloted.')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def strict_json(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError('Duplicate JSON key: ' + key)
            result[key] = value
        return result
    def reject(value):
        raise ValueError('Nonstandard JSON constant: ' + value)
    result = json.loads(data, object_pairs_hook=pairs, parse_constant=reject)
    def visit(value, depth=0):
        if depth > 64:
            raise ValueError('JSON depth limit')
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError('Non-finite JSON number')
        if isinstance(value, dict):
            for item in value.values():
                visit(item, depth+1)
        elif isinstance(value, list):
            for item in value:
                visit(item, depth+1)
    visit(result)
    return result


def safe(name):
    if not isinstance(name, str) or not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe relative path')
    for part in name.split('/'):
        if (part in ('', '.', '..') or re.search(r'[\x00-\x1f\x7f<>:"|?*]', part)
                or part.endswith((' ', '.'))
                or re.match(r'^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)', part, re.I)):
            raise ValueError('Unsafe path: ' + name)
    return name


def namespace(entries):
    explicit, nodes = set(), {}
    for name, directory in entries:
        safe(name)
        if name in explicit:
            raise ValueError('Duplicate ZIP/payload entry: ' + name)
        explicit.add(name)
        parts = name.split('/')
        for index in range(1, len(parts)+1):
            prefix = '/'.join(parts[:index])
            key = unicodedata.normalize('NFC', prefix).casefold()
            kind = 'directory' if index < len(parts) or directory else 'file'
            if key in nodes and nodes[key] != (prefix, kind):
                raise ValueError('Case/Unicode/component collision: ' + prefix)
            nodes[key] = (prefix, kind)


def regular_bytes(path, max_bytes=None):
    path = Path(path).absolute()
    if any(p.is_symlink() for p in (path, *path.parents)) or not path.is_file():
        raise ValueError('Input must be a regular file without symlink ancestors: ' + str(path))
    if max_bytes is not None and path.stat().st_size > max_bytes:
        raise ValueError('Input byte limit: ' + path.name)
    return path.read_bytes()


def manifest(files, excluded=ROOT_CONTROLS):
    return ''.join(sha(data) + '  ' + name + '\n'
                   for name, data in sorted(files.items()) if name not in excluded).encode('utf-8')


def seal(files):
    data = manifest(files)
    files['SHA256SUMS.txt'] = data
    files['PACKAGE_ID.txt'] = (sha(data) + '\n').encode('ascii')


def verify_outer(files):
    namespace([(name, False) for name in files])
    data = manifest(files)
    if files.get('SHA256SUMS.txt') != data or files.get('PACKAGE_ID.txt') != (sha(data)+'\n').encode():
        raise ValueError('Manifest and identity do not cover the exact inventory')


def changed(before, after, excluded=()):
    return [{'path': name, 'before_sha256': sha(before[name]) if name in before else None,
             'after_sha256': sha(after[name]) if name in after else None,
             'before_bytes': len(before[name]) if name in before else None,
             'after_bytes': len(after[name]) if name in after else None}
            for name in sorted(set(before) | set(after))
            if name not in excluded and before.get(name) != after.get(name)]


def authenticate_source(path, profile, contract):
    pin = PINNED[profile]
    row = contract.get(profile)
    if not isinstance(row, dict) or any(row.get(key) != pin[key] for key in
                                           ('filename', 'bytes', 'sha256', 'root', 'package_id')):
        raise ValueError('Base contract differs from fixed published asset: ' + profile)
    data = regular_bytes(path, pin['bytes'])
    if len(data) != pin['bytes'] or sha(data) != pin['sha256']:
        raise ValueError('Base asset size/hash mismatch: ' + profile)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        infos = archive.infolist()
        if len(infos) > MAX_FILES or sum(info.file_size for info in infos) > MAX_EXPANDED:
            raise ValueError('Base ZIP resource limit')
        namespace([(info.filename[:-1] if info.is_dir() else info.filename, info.is_dir()) for info in infos])
        files = {}
        prefix = pin['root'] + '/'
        for info in infos:
            mode = info.external_attr >> 16
            kind = stat.S_IFMT(mode)
            if (info.flag_bits & 1 or kind not in (0, stat.S_IFREG, stat.S_IFDIR)
                    or info.file_size > MAX_MEMBER
                    or (info.file_size > 1024**2 and info.file_size/max(1, info.compress_size) > 2000)
                    or (info.is_dir() and (info.file_size or kind == stat.S_IFREG))
                    or (not info.is_dir() and kind == stat.S_IFDIR)):
                raise ValueError('Base ZIP type/expansion limit')
            if info.filename.rstrip('/') == pin['root'] and info.is_dir():
                continue
            if not info.filename.startswith(prefix):
                raise ValueError('Base ZIP root mismatch')
            if not info.is_dir():
                name = safe(info.filename[len(prefix):])
                files[name] = archive.read(info)
    if len(files) != pin['files'] or files.get('PACKAGE_ID.txt') != (pin['package_id']+'\n').encode():
        raise ValueError('Base file count/package identity mismatch')
    verify_outer(files)
    return files


def patch_allowed(name):
    if name in ROOT_PAGES or re.fullmatch(r'ENTRY/(?:C|S)\d{2}\.html', name) or re.fullmatch(r'TUTORIALS/S\d{2}\.html', name):
        return True
    match = re.fullmatch(r'PACKAGES/(S\d{2})/[^/]+/CLASSROOM_RC6/(.+)', name)
    if not match or match[1] not in {f'S{i:02}' for i in range(1, 15)}:
        return False
    unit, inner = match.groups()
    if inner in {'START.html', 'GUIDE.html', 'README.md', 'CLASSROOM_PLAN_EN_GB.md', 'CLASSROOM_SCOPE.json'}:
        return True
    return (inner == 'PROBE.mjs' and unit in PROBE_UNITS
            or inner == 'http.mjs' and unit in {'S01', 'S02', 'S04', 'S05', 'S07'}
            or inner == 'server.mjs' and unit == 'S04')


def apply_patches(source, profile, records, patch_dir):
    files, seen = dict(source), set()
    roots = [obj['payload_root'] for obj in strict_json(source['CLASSROOM_COLLECTION.json'])['objects']
             if obj['object_id'] in {f'S{i:02}' for i in range(1, 15)}]
    expanded = sum(len(data) for data in source.values())
    for row in records:
        if row.get('profile') not in ('core', 'static', 'both'):
            raise ValueError('Invalid patch profile')
        if row['profile'] not in (profile, 'both'):
            continue
        name = safe(row['target_path'])
        if name in seen or not patch_allowed(name):
            raise ValueError('Duplicate or forbidden patch target: ' + name)
        seen.add(name)
        if name.startswith('PACKAGES/') and not any(name.startswith(prefix+'CLASSROOM_RC6/') for prefix in roots):
            raise ValueError('Patch does not belong to an actual classroom unit: ' + name)
        old = source.get(name)
        if (row.get('old_sha256') != (sha(old) if old is not None else None)
                or row.get('old_bytes') != (len(old) if old is not None else None)):
            raise ValueError('Patch before identity mismatch: ' + name)
        payload = patch_dir/safe(row['payload_path'])
        if not payload.is_file() or payload.stat().st_size > MAX_EXPANDED-expanded+len(old or b''):
            raise ValueError('Patch aggregate byte limit')
        data = regular_bytes(payload, MAX_MEMBER)
        expanded += len(data)-len(old or b'')
        if sha(data) != row.get('new_sha256') or len(data) != row.get('new_bytes'):
            raise ValueError('Patch payload identity mismatch: ' + name)
        if old is None and not name.endswith('/CLASSROOM_RC6/PROBE.mjs'):
            raise ValueError('Only reviewed protected PROBE source additions are admitted')
        if name.endswith('/CLASSROOM_SCOPE.json'):
            before, after = strict_json(old), strict_json(data)
            for field in ('schema', 'seminar', 'classroom_version', 'individual', 'all_projects_required', 'projects'):
                if before.get(field) != after.get(field):
                    raise ValueError('Classroom task contract changed: ' + name + ':' + field)
            if after.get('timing_empirically_validated') is not False:
                raise ValueError('Unpiloted timing cannot be promoted')
        files[name] = data
    return files


def current_text(text):
    text = text.replace(OLD_VERSION, VERSION)
    text = text.replace('WEBTECH_ASE_LOCAL2_CLASSROOM.zip', CORE_ZIP).replace('WEBTECH_ASE_LOCAL2_STATIC.zip', SITE_ZIP)
    text = text.replace('WEBTECH_LOCAL2_STATIC', 'WEBTECH_LOCAL3_STATIC').replace('WEBTECH_LOCAL2', 'WEBTECH_LOCAL3')
    text = text.replace('The retained 60-minute plan remains unpiloted.', PLANNING)
    text = text.replace('The 60-minute schedule remains unpiloted.', PLANNING)
    text = text.replace('The retained 60-minute schedule remains unpiloted.', PLANNING)
    text = text.replace('The retained 60-minute teaching plan remains unpiloted.', PLANNING)
    return text


def inner_seal(unit):
    base = 'CLASSROOM_RC6/'
    old = strict_json(unit[base+'CLASSROOM_BOUNDARY.json'])
    boundary = copy.deepcopy(old)
    excluded = set(boundary['sourceManifestExcluded'])
    actual = {name[len(base):] for name in unit if name.startswith(base)}
    if set(boundary['mutable']) - actual or excluded - actual:
        raise ValueError('Inner mutable/self control is missing')
    expected = actual - set(boundary['mutable']) - excluded
    for name in expected - set(boundary['protected']):
        if name != 'PROBE.mjs':
            raise ValueError('Unexpected protected source addition')
    boundary['protected'] = {name: sha(unit[base+name]) for name in sorted(expected)}
    unit[base+'CLASSROOM_BOUNDARY.json'] = encoded(boundary)
    if base+'SOURCE_MANIFEST.json' in unit:
        source_manifest = strict_json(unit[base+'SOURCE_MANIFEST.json'])
        if source_manifest['targets'] != boundary['mutable']:
            raise ValueError('Source-manifest target policy differs')
        source_manifest['protected'] = {name: sha(unit[base+name]) for name in sorted(expected | {'CLASSROOM_BOUNDARY.json'})}
        unit[base+'SOURCE_MANIFEST.json'] = encoded(source_manifest)
    for field in ('schema', 'referenceNode', 'mutable', 'excludedRuntimeDirectories', 'sourceManifestExcluded', 'trust'):
        if boundary[field] != old[field]:
            raise ValueError('Inner integrity semantics changed')


def verify_inner(unit):
    base = 'CLASSROOM_RC6/'
    boundary = strict_json(unit[base+'CLASSROOM_BOUNDARY.json'])
    actual = {name[len(base):] for name in unit if name.startswith(base)}
    expected = set(boundary['protected']) | set(boundary['mutable']) | set(boundary['sourceManifestExcluded'])
    if actual != expected or boundary['referenceNode'] != 'v24.21.0':
        raise ValueError('Inner inventory/reference runtime differs')
    for mapping in ('protected', 'mutable'):
        if any(sha(unit[base+n]) != digest for n, digest in boundary[mapping].items()):
            raise ValueError('Inner source hashes differ')
    if base+'SOURCE_MANIFEST.json' in unit:
        source = strict_json(unit[base+'SOURCE_MANIFEST.json'])
        if source['targets'] != boundary['mutable'] or set(source['protected']) != set(boundary['protected']) | {'CLASSROOM_BOUNDARY.json'}:
            raise ValueError('Inner source-manifest inventory differs')
        if any(sha(unit[base+n]) != digest for n, digest in source['protected'].items()):
            raise ValueError('Inner source-manifest hashes differ')


def add_backups(source, files, forced=()):
    names = {name for name in source if source[name] != files.get(name)} | set(forced)
    for name in sorted(names):
        target = 'PROVENANCE/LOCAL2/' + name
        if target in source or (target in files and files[target] != source[name]):
            raise ValueError('LOCAL2 backup path collision: ' + target)
        files[target] = source[name]
    return names


def derive(source, profile, records, patch_dir, recipe_id, recipe_hashes, core_id=None, core_files=None):
    original = strict_json(source['CLASSROOM_COLLECTION.json'])
    files = apply_patches(source, profile, records, patch_dir)
    meta = copy.deepcopy(original)
    old_ids = {row['object_id']: row['package_id'] for row in original['objects']}
    new_ids, derived_units, entries = dict(old_ids), [], []
    for name in ROOT_PAGES:
        files[name] = current_text(files[name].decode('utf-8')).encode('utf-8')
    for name in files.copy():
        if re.fullmatch(r'(?:ENTRY/(?:C|S)\d{2}|TUTORIALS/S\d{2})\.html', name):
            files[name] = current_text(files[name].decode('utf-8')).encode('utf-8')
    for obj in meta['objects']:
        ident, prefix = obj['object_id'], obj['payload_root']
        obj['included_in_collection_version'] = VERSION
        if ident not in {f'S{i:02}' for i in range(1, 15)}:
            obj['local3_transfer_scope'] = 'Exact published LOCAL2 unit bytes and unit identity retained; inclusion does not change or qualify this unit.'
            continue
        before = {name[len(prefix):]: data for name, data in source.items() if name.startswith(prefix)}
        unit = {name[len(prefix):]: data for name, data in files.items() if name.startswith(prefix)}
        form = 'CLASSROOM_RC6/EVIDENCE_FORM.html'
        needle = ('<strong>Candidate ' + OLD_VERSION + '.</strong>').encode('utf-8')
        if unit[form].count(needle) != 1:
            raise ValueError('Evidence form notice anchor differs: ' + ident)
        unit[form] = unit[form].replace(needle, ('<strong>Candidate '+VERSION+'.</strong>').encode('utf-8'))
        inner_seal(unit)
        unit['LOCAL_CANDIDATE_README.txt'] = (ident+' — corrective candidate '+VERSION+'\n\n'
            'Use PACKAGE_ID.txt for this unit’s current bytes and LOCAL_CANDIDATE_DERIVATION.json '
            'for its exact LOCAL2 predecessor. The collection preserves every changed predecessor '
            'file under PROVENANCE/LOCAL2. Learner targets, contracts, tests, dependency locks and '
            'original teaching references remain exact. Current classroom guidance plans 30–45 minutes '
            'per required project plus shared setup, AI, PDF and recap time; timing remains unpiloted. '
            'All private evidence belongs outside the entire extracted collection. Existing evidence '
            'record schemas and validation functions are retained. Historical identities describe '
            'earlier bytes; imported drafts retain their recorded identities until deliberately reviewed. '
            'No learner answers or acceptance results are supplied. General qualification remains '
            'NOT_FINAL with all ten gates pending. Build metadata records preparation, not publication.\n').encode('utf-8')
        descriptor = {'schema': 'webtech-local-unit-derivation/v2', 'object_id': ident,
            'candidate_version': VERSION, 'publication_status': 'PUBLICATION_NOT_ASSERTED',
            'predecessor_package_id': old_ids[ident], 'predecessor_zip_sha256': PINNED['core']['sha256'],
            'predecessor_version': OLD_VERSION, 'identity_path': 'PACKAGE_ID.txt',
            'changed_files_before_descriptor_and_package_controls': changed(before, unit, ROOT_CONTROLS | {'LOCAL_CANDIDATE_DERIVATION.json'}),
            'qualificationVerdict': 'NOT_FINAL', 'student_answers_supplied': False, 'final_acceptance': False}
        unit['LOCAL_CANDIDATE_DERIVATION.json'] = encoded(descriptor)
        seal(unit)
        verify_outer(unit)
        verify_inner(unit)
        files.update({prefix+name: data for name, data in unit.items()})
        new_ids[ident] = unit['PACKAGE_ID.txt'].decode().strip()
        obj.update(package_id=new_ids[ident], distribution_carrier_version=VERSION,
            preservation='EXPLICIT_LOCAL3_CORRECTIVE_DERIVATIVE_FROM_EXACT_PUBLISHED_LOCAL2',
            predecessor_local2_package_id=old_ids[ident], derivation=prefix+'LOCAL_CANDIDATE_DERIVATION.json',
            local2_derivation_provenance='PROVENANCE/LOCAL2/'+prefix+'LOCAL_CANDIDATE_DERIVATION.json')
        derived_units.append({'object_id': ident, 'descriptor': obj['derivation'], 'changed_files': changed(before, unit)})
    for obj in meta['objects']:
        name, ident = obj['entry'], obj['object_id']
        text = files[name].decode('utf-8')
        anchor = re.compile(r'(<pre data-identity-scope="current-local-candidate">)([0-9a-f]{64})(</pre>)')
        matches = list(anchor.finditer(text))
        if len(matches) != 1 or matches[0][2] != old_ids[ident]:
            raise ValueError('ENTRY current identity anchor differs: ' + ident)
        files[name] = anchor.sub(lambda match: match[1]+new_ids[ident]+match[3], text).encode('utf-8')
        entries.append({'object_id': ident, 'entry': name, 'previous_unit_id': old_ids[ident],
                        'current_unit_id': new_ids[ident], 'routes_retained': True})
    files['LOCAL_ENTRY_REBINDING.json'] = encoded(entries)
    verifier = source['VERIFY_COLLECTION.mjs']
    needle = ("'"+OLD_VERSION+"'").encode()
    if verifier.count(needle) != 1:
        raise ValueError('Collection verifier version anchor differs')
    files['VERIFY_COLLECTION.mjs'] = verifier.replace(needle, ("'"+VERSION+"'").encode())
    course = strict_json(files['course-map.json'])
    course['distribution_version'] = VERSION
    files['course-map.json'] = encoded(course)
    policy = {'schema': 'webtech-local-executable-derivation-policy/v2', 'candidate_version': VERSION,
        'predecessor_version': OLD_VERSION, 'publication_status': 'PUBLICATION_NOT_ASSERTED',
        'base_asset_identities': PINNED, 'reviewed_patch_manifest_sha256': recipe_hashes['LOCAL3_PATCHES.json'],
        'source_patch_records': records, 'additional_allowed_operations': [
            'Display-only evidence form candidate notice rebinding; functional scripts and record contracts remain exact',
            'Planned 30–45-minute project blocks and shared setup, AI, PDF and recap guidance; unpiloted timing remains explicit',
            'Protected named probes, loopback robustness corrections and private evidence paths outside the entire collection',
            'Inner boundary, source manifest, unit descriptors and identities, current metadata and outer seals',
            'Exact backups of every replaced LOCAL2 file and current preservation registers',
            'Single root verifier distribution-version literal and current ENTRY identities; integrity semantics and learner edit policy retained'],
        'forbidden_operations': ['Learner targets or solutions, contracts, tests, dependency locks, canonical examples and Word reference edits',
            'Changing published RC9, RC10 or LOCAL2 assets, tags, releases or historical recipes',
            'Private evidence inclusion, remote publication, repository writes or GitHub Actions operations'],
        'qualificationVerdict': 'NOT_FINAL', 'qualificationGates': {name: 'pending' for name in GATES},
        'student_answers_supplied': False, 'final_acceptance': False}
    files['LOCAL_DERIVATION_POLICY.json'] = encoded(policy)
    for name in ('PRESERVED_SOURCE_FILES.json', 'PRESERVED_RC10_FILES.json'):
        register = copy.deepcopy(strict_json(source[name]))
        register['files'] = [row for row in register['files']
                             if row['path'] in files and sha(files[row['path']]) == row['sha256']
                             and len(files[row['path']]) == row['bytes']]
        register['claim'] = ('Only listed unchanged ancestor bytes remain present at their original paths. '
                             'Older registers are preserved as historical LOCAL2 provenance.')
        files[name] = encoded(register)
    preserved = strict_json(files['PRESERVED_SOURCE_FILES.json'])['files']
    for obj in meta['objects']:
        obj['source_files_preserved'] = sum(row['path'].startswith(obj['payload_root']) for row in preserved)
    meta.update(distribution_version=VERSION, status='LOCAL3_CORRECTIVE_CANDIDATE_NOT_FINAL',
        candidate_archive_name=CORE_ZIP, publication_status='PUBLICATION_NOT_ASSERTED',
        predecessor_version=OLD_VERSION, predecessor_zip_sha256=PINNED['core']['sha256'],
        predecessor_package_id=PINNED['core']['package_id'], local_build_source_id=recipe_id,
        local_recipe_file_sha256=recipe_hashes, local3_derivation_policy_sha256=sha(files['LOCAL_DERIVATION_POLICY.json']),
        policy_sha256_scope='HISTORICAL_LOCAL2_POLICY_AT_PROVENANCE/LOCAL2/LOCAL_DERIVATION_POLICY.json',
        historical_local2_collection='PROVENANCE/LOCAL2/CLASSROOM_COLLECTION.json',
        source_files_preserved=len(preserved), classroom_source_files_preserved=sum('/CLASSROOM_RC6/' in row['path'] for row in preserved),
        derived_objects=derived_units, qualificationVerdict='NOT_FINAL',
        qualificationGates={name: 'pending' for name in GATES}, native_acceptance=False, publication_qualified=False,
        transfer_scope='Exact unchanged bytes retain only their historical finite evidence. New corrections require their own scoped receipts; all ten broad gates remain pending.')
    files['CLASSROOM_COLLECTION.json'] = encoded(meta)
    if profile == 'static':
        if core_id is None or core_files is None:
            raise ValueError('Static derivation requires the sealed classroom profile')
        old_core_id = PINNED['core']['package_id'].encode()
        for name in ROOT_PAGES:
            files[name] = files[name].replace(old_core_id, core_id.encode())
        files['.nojekyll'] = b''
        scope = {'schema': 'webtech-local-static-profile/v2', 'profile': 'LOCAL_CANDIDATE_STATIC_READING_AND_NAVIGATION_ONLY',
            'candidate_version': VERSION, 'publication_status': 'PUBLICATION_NOT_ASSERTED',
            'classroom_collection_package_id': core_id, 'static_archive_filename': SITE_ZIP,
            'classroom_archive_filename': CORE_ZIP, 'predecessor_static_sha256': PINNED['static']['sha256'],
            'predecessor_static_package_id': PINNED['static']['package_id'],
            'unit_bytes_policy': 'All 30 units are exact matching LOCAL3 classroom payload bytes',
            'derivation_record_scope': 'LOCAL_CANDIDATE_DERIVATION.json records this profile’s exact predecessor delta; SITE_SCOPE binds the separately sealed classroom profile.',
            'changed_reading_pages': [row for row in changed(core_files, files)
                                      if row['path'] in ROOT_PAGES | {'.nojekyll'}],
            'actions_started_by_builder': False, 'publications_made_by_builder': False, 'qualificationVerdict': 'NOT_FINAL',
            'scope': 'Reading and navigation only. Runtime execution, browser behaviour, PDF export and acceptance are not claimed.'}
        files['SITE_SCOPE.json'] = encoded(scope)
    forced = ROOT_CONTROLS | {'LOCAL_CANDIDATE_DERIVATION.json'}
    add_backups(source, files, forced)
    register = {'schema': 'webtech-preserved-published-local2-files/v1', 'profile': profile,
        'predecessor_zip_sha256': PINNED[profile]['sha256'], 'predecessor_package_id': PINNED[profile]['package_id'],
        'claim': 'Every predecessor file is retained either unchanged at its original path or as an exact LOCAL2 provenance backup.',
        'files': [{'path': name, 'retained_at': name if files.get(name) == data and name not in forced else 'PROVENANCE/LOCAL2/'+name,
                   'sha256': sha(data), 'bytes': len(data)} for name, data in sorted(source.items())]}
    files['PRESERVED_LOCAL2_FILES.json'] = encoded(register)
    files['LOCAL_CANDIDATE_DERIVATION.json'] = encoded({'schema': 'webtech-local-collection-derivation/v2',
        'candidate_version': VERSION, 'profile': profile, 'predecessor_version': OLD_VERSION,
        'predecessor_zip_sha256': PINNED[profile]['sha256'], 'predecessor_package_id': PINNED[profile]['package_id'],
        'local_build_source_id': recipe_id, 'changes_before_descriptor_and_collection_controls': changed(source, files, forced),
        'current_unit_ids': new_ids, 'affected_units': sorted(row['object_id'] for row in derived_units),
        'historical_registers': ['RC9_DERIVATIONS.json', 'RC10_DERIVATIONS.json', 'RC10_COLLECTION_DERIVATION.json', 'PRESERVED_RC9_FILES.json', 'PROVENANCE/HISTORICAL/PRESERVED_SOURCE_FILES.json'],
        'qualificationVerdict': 'NOT_FINAL', 'qualificationGates': {name: 'pending' for name in GATES},
        'actions_started_by_builder': False, 'publications_made_by_builder': False})
    seal(files)
    validate_structure(source, files, original)
    return files


def validate_structure(source, files, original):
    verify_outer(files)
    if len(files) > MAX_FILES or sum(len(data) for data in files.values()) > MAX_EXPANDED:
        raise ValueError('Candidate inventory/expanded byte limit')
    for name in original['editable_files']:
        if files[name] != source[name]:
            raise ValueError('Learner target changed: ' + name)
    if len(original['editable_files']) != 38 or len(original['generated_directories']) != 83:
        raise ValueError('Original collection edit policy differs')
    meta = strict_json(files['CLASSROOM_COLLECTION.json'])
    if meta['editable_files'] != original['editable_files'] or meta['generated_directories'] != original['generated_directories']:
        raise ValueError('Collection edit policy changed')
    for obj in original['objects']:
        prefix = obj['payload_root']
        before = {name[len(prefix):]: data for name, data in source.items() if name.startswith(prefix)}
        after = {name[len(prefix):]: data for name, data in files.items() if name.startswith(prefix)}
        if obj['object_id'] not in {f'S{i:02}' for i in range(1, 15)}:
            if before != after:
                raise ValueError('Unchanged course/setup unit changed: ' + obj['object_id'])
        else:
            verify_outer(after)
            verify_inner(after)
            for name, data in before.items():
                if (not name.startswith('CLASSROOM_RC6/') and name not in ROOT_CONTROLS | {'LOCAL_CANDIDATE_DERIVATION.json', 'LOCAL_CANDIDATE_README.txt'}
                        or name.endswith('.docx') or '/targets/' in name or '/student/' in name
                        or '/tests/' in name or '/REACT/' in name or '/support/' in name
                        or name.endswith(('/contract.json', '/checks.mjs', '/check.mjs', '/verify.mjs', '/kit.mjs', '/experiments.mjs', '/try.mjs', '/GEMINI_PROMPT.txt'))):
                    if after.get(name) != data:
                        raise ValueError('Protected historical/contract/target source changed: ' + obj['object_id']+'/'+name)
            form = 'CLASSROOM_RC6/EVIDENCE_FORM.html'
            if after[form].replace(VERSION.encode(), OLD_VERSION.encode()) != before[form]:
                raise ValueError('Evidence form changed beyond its candidate notice')
            if strict_json(after['CLASSROOM_RC6/CLASSROOM_BOUNDARY.json'])['mutable'] != strict_json(before['CLASSROOM_RC6/CLASSROOM_BOUNDARY.json'])['mutable']:
                raise ValueError('Classroom mutable targets changed')
    for name, data in source.items():
        if name.startswith('PROVENANCE/') or name in {'RC9_DERIVATIONS.json', 'RC10_DERIVATIONS.json', 'RC10_COLLECTION_DERIVATION.json', 'PRESERVED_RC9_FILES.json'}:
            if files.get(name) != data:
                raise ValueError('Historical collection control changed: ' + name)
        if files.get(name) != data and files.get('PROVENANCE/LOCAL2/'+name) != data:
            raise ValueError('Changed original lacks an exact backup: ' + name)
    register = strict_json(files['PRESERVED_LOCAL2_FILES.json'])['files']
    if [row['path'] for row in register] != sorted(source):
        raise ValueError('LOCAL2 preservation inventory differs')
    for row in register:
        data = files.get(row['retained_at'])
        if data is None or sha(data) != row['sha256'] or len(data) != row['bytes'] or data != source[row['path']]:
            raise ValueError('LOCAL2 preservation binding differs')
    for name in ('PRESERVED_SOURCE_FILES.json', 'PRESERVED_RC10_FILES.json'):
        for row in strict_json(files[name])['files']:
            data = files.get(row['path'])
            if data is None or sha(data) != row['sha256'] or len(data) != row['bytes']:
                raise ValueError('Current ancestor byte claim differs')
    if meta['qualificationVerdict'] != 'NOT_FINAL' or meta['qualificationGates'] != {name: 'pending' for name in GATES}:
        raise ValueError('General qualification changed')


def build(classroom_base, static_base, patch_dir):
    patch_dir = Path(patch_dir).absolute()
    contract_bytes = regular_bytes(patch_dir/'BASE_INPUTS.json', 1024**2)
    patch_bytes = regular_bytes(patch_dir/'LOCAL3_PATCHES.json', 4*1024**2)
    contract, patches = strict_json(contract_bytes), strict_json(patch_bytes)
    records = patches if isinstance(patches, list) else patches.get('records', patches.get('patch_records'))
    if not isinstance(records, list) or not records or len(records) > 500:
        raise ValueError('Reviewed patch list missing or exceeds finite scope')
    required = {'profile', 'target_path', 'payload_path', 'old_sha256', 'new_sha256', 'old_bytes', 'new_bytes'}
    for row in records:
        if not isinstance(row, dict) or not required <= set(row):
            raise ValueError('Malformed reviewed patch record')
        if (row['profile'] not in ('core', 'static', 'both')
                or type(row['new_bytes']) is not int or not 0 <= row['new_bytes'] <= MAX_MEMBER
                or not isinstance(row['new_sha256'], str) or not re.fullmatch(r'[0-9a-f]{64}', row['new_sha256'])
                or (row['old_sha256'] is None) != (row['old_bytes'] is None)
                or (row['old_sha256'] is not None and (not isinstance(row['old_sha256'], str)
                    or not re.fullmatch(r'[0-9a-f]{64}', row['old_sha256'])
                    or type(row['old_bytes']) is not int or not 0 <= row['old_bytes'] <= MAX_MEMBER))):
            raise ValueError('Patch record field types or bounds differ')
        safe(row['target_path'])
        safe(row['payload_path'])
    recipe_hashes = {'build_local_candidate.py': sha(regular_bytes(Path(__file__), 1024**2)),
                     'LOCAL3_PATCHES.json': sha(patch_bytes), 'BASE_INPUTS.json': sha(contract_bytes)}
    recipe_id = sha(encoded(recipe_hashes))
    original_core = authenticate_source(classroom_base, 'core', contract)
    original_site = authenticate_source(static_base, 'static', contract)
    original_meta = strict_json(original_core['CLASSROOM_COLLECTION.json'])
    for obj in original_meta['objects']:
        prefix = obj['payload_root']
        if {n: d for n, d in original_core.items() if n.startswith(prefix)} != {n: d for n, d in original_site.items() if n.startswith(prefix)}:
            raise ValueError('Predecessor profile unit byte parity differs')
    core = derive(original_core, 'core', records, patch_dir, recipe_id, recipe_hashes)
    site = derive(original_site, 'static', records, patch_dir, recipe_id, recipe_hashes,
                  core['PACKAGE_ID.txt'].decode().strip(), core)
    for obj in strict_json(core['CLASSROOM_COLLECTION.json'])['objects']:
        prefix = obj['payload_root']
        if {n: d for n, d in core.items() if n.startswith(prefix)} != {n: d for n, d in site.items() if n.startswith(prefix)}:
            raise ValueError('Candidate profile unit byte parity differs: ' + obj['object_id'])
    return core, site


def archive(files, root):
    namespace([(name, False) for name in files])
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipped:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(root+'/'+safe(name), (2026, 10, 7, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (0o100755 if name.endswith('.sh') else 0o100644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            zipped.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    data = out.getvalue()
    with zipfile.ZipFile(io.BytesIO(data)) as zipped:
        if zipped.testzip() is not None or {n.split('/', 1)[1]: zipped.read(n) for n in zipped.namelist()} != files:
            raise ValueError('Output ZIP CRC/member equality differs')
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--classroom-base', type=Path, required=True)
    parser.add_argument('--static-base', type=Path, required=True)
    parser.add_argument('--patch-dir', type=Path, default=HERE/'inputs')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.absolute()
    checkout = HERE.parents[2]
    if any(p.is_symlink() for p in (output, *output.parents)):
        raise ValueError('Output path traverses a symlink')
    output = output.resolve()
    if output == checkout or output.is_relative_to(checkout) or checkout.is_relative_to(output):
        raise ValueError('Output must be outside the checkout and its ancestors')
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError('Output must be a new or empty directory')
    core, site = build(args.classroom_base, args.static_base, args.patch_dir)
    output.mkdir(parents=True, exist_ok=True)
    summary = {'schema': 'webtech-local3-build-receipt/v1', 'candidate_version': VERSION,
        'publication_status': 'PUBLICATION_NOT_ASSERTED', 'qualificationVerdict': 'NOT_FINAL',
        'qualificationGates': {name: 'pending' for name in GATES}, 'base_assets': PINNED,
        'local_build_source_id': strict_json(core['CLASSROOM_COLLECTION.json'])['local_build_source_id'],
        'structural_validation': 'PASS_HASH_BOUND_DERIVATIVE_STRUCTURE_ONLY', 'runtime_commands_executed': 0,
        'archives': [], 'actions_started_by_builder': False, 'publications_made_by_builder': False}
    for profile, files, filename, root in [('core', core, CORE_ZIP, 'WEBTECH_LOCAL3'),
                                           ('static', site, SITE_ZIP, 'WEBTECH_LOCAL3_STATIC')]:
        for name, data in sorted(files.items()):
            path = output/profile/name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            path.chmod(0o755 if name.endswith('.sh') else 0o644)
        data = archive(files, root)
        (output/filename).write_bytes(data)
        (output/(filename+'.sha256')).write_bytes((sha(data)+'  '+filename+'\n').encode())
        summary['archives'].append({'profile': profile, 'filename': filename, 'bytes': len(data),
            'sha256': sha(data), 'package_id': files['PACKAGE_ID.txt'].decode().strip(), 'files': len(files), 'zip_root': root})
    (output/'BUILD_RECEIPT.json').write_bytes(encoded(summary))
    (output/'ARCHIVE_SHA256SUMS.txt').write_bytes(''.join(row['sha256']+'  '+row['filename']+'\n' for row in summary['archives']).encode())
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile) as error:
        raise SystemExit('STOP_LOCAL3_BUILD: ' + str(error))
