#!/usr/bin/env python3
"""Derive the narrowly corrected C07 carrier from authenticated RC6 bytes.

The original carrier remains immutable. This derivative changes the current
source registry and its structural guard, preserves their predecessor bytes
and identity controls, and makes no native/runtime qualification claim.
"""
from __future__ import annotations

import json
import re

import release_contract as rc

OLD_PREFIX = 'PACKAGES/C07/WEBTECH_ASE_C07_EN_GB_v1.1.2_RC6/'
NEW_PREFIX = 'PACKAGES/C07/WEBTECH_ASE_C07_EN_GB_v1.1.3_RC8/'
DISPLACED = ('CANONICAL_SOURCES.json', 'tools/examples.mjs',
             'SHA256SUMS.txt', 'PACKAGE_ID.txt')
DESCRIPTOR_PATH = 'C07_REGISTRY_DERIVATION_RC8.json'
VERSION = '1.1.3-rc.8'
SOURCE_ARCHIVE_SHA256 = '96f13c8f2917f7f866af6d860809cbb3d4769444b1bf4fd40a7230d719c8b530'
SOURCE_PACKAGE_ID = 'b1e140d1da4cdb104914deb31bd1b419d95b95607db02c306c9703f20ec985f7'
SOURCE_REGISTRY_SHA256 = '382f923d276be986d7efd794af29b8d0fe1be848b9a0a1a42dabb34f93068fbf'
SOURCE_RUNNER_SHA256 = '7d5ae95765eb2b91da81d60a1520b9225352d070e1f4ab9a47dd043084029589'
SOURCE_DESCRIPTOR_SHA256 = '1c5d6b8917f45f79ad4ffba2f2e295a84775c3b054e7affd577a24010351ad16'
SOURCE_FIELDS = {
    'object_id': 'C07',
    'language': 'EN_GB',
    'carrier_version': '1.1.2-rc.6',
    'archive': '01_WEEKS/WEEK_07/C07_COURSE/EN_GB/CURRENT/WEBTECH_ASE_C07_EN_GB_SUCCESSOR_RC6.zip',
    'archive_sha256': SOURCE_ARCHIVE_SHA256,
    'archive_root_prefix': 'WEBTECH_ASE_C07_EN_GB_v1.1.2_RC6/',
    'archive_root': 'WEBTECH_ASE_C07_EN_GB_v1.1.2_RC6',
    'archive_files': 54,
    'package_id_path': 'PACKAGE_ID.txt',
    'package_id': SOURCE_PACKAGE_ID,
    'collection_payload_root': OLD_PREFIX,
}
EXAMPLE_NAMES = ('01-relationship-shapes', '02-eager-loading-query-count',
                 '03-resource-contract', '04-pagination-stability',
                 '05-transaction-timeline')
EXAMPLE_FILES = ('README.md', 'example.js', 'package.json', 'package-lock.json')
EXPECTED_PATHS = frozenset(
    'canonical/' + example + '/' + name
    for example in EXAMPLE_NAMES for name in EXAMPLE_FILES
) | {'canonical/reading-list-next.md'}
CORRECTED_PATHS = frozenset(
    'canonical/' + example + '/' + name
    for example in EXAMPLE_NAMES for name in ('package.json', 'package-lock.json')
)


def _encoded(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def _require(condition, message):
    if not condition:
        raise ValueError('C07 derivative: ' + message)


def _registry_rows(data: bytes) -> list[dict]:
    rows = rc.strict_json(data)
    _require(isinstance(rows, list) and len(rows) == 21,
             'exactly 21 canonical registry entries are required')
    seen = set()
    for row in rows:
        _require(isinstance(row, dict), 'invalid canonical registry entry')
        name, digest = row.get('path'), row.get('sha256')
        _require(isinstance(name, str) and name in EXPECTED_PATHS,
                 'unexpected canonical path')
        _require(name not in seen, 'duplicate canonical path: ' + name)
        _require(isinstance(digest, str) and re.fullmatch('[0-9a-f]{64}', digest),
                 'invalid canonical SHA-256: ' + name)
        seen.add(name)
    _require(seen == EXPECTED_PATHS, 'canonical path set differs')
    return rows


def _runner_derivative(original: bytes) -> bytes:
    """Replace only sourceBoundary; the authenticated source pins this splice."""
    source = original.decode('utf-8')
    start = source.index('export function sourceBoundary(id)')
    end = source.index('export function preflight(id)', start)
    replacement = '''export function sourceBoundary(id){
 rootFor(id);
 const prefix='canonical/'+EXAMPLES[id]+'/',names=['README.md','example.js','package.json','package-lock.json'];
 const expected=new Set(names.map(name=>prefix+name)),allExpected=new Set(['canonical/reading-list-next.md']);
 for(const name of Object.values(EXAMPLES))for(const file of names)allExpected.add('canonical/'+name+'/'+file);
 const errors=[],seen=new Set();let rows=[];
 try{
  const registryPath=path.join(ROOT,'CANONICAL_SOURCES.json');
  if(lstatSync(registryPath).isSymbolicLink()||!lstatSync(registryPath).isFile())throw new Error('Source registry is not a regular file');
  const registry=JSON.parse(readFileSync(registryPath,'utf8'));
  if(!Array.isArray(registry)||registry.length!==allExpected.size)throw new Error('Incomplete expected source registry');
  for(const row of registry){
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.path!=='string'||typeof row.sha256!=='string'||!allExpected.has(row.path)||!(/^[0-9a-f]{64}$/).test(row.sha256)){
    errors.push('Malformed or unexpected source registry entry');continue;
   }
   if(seen.has(row.path))errors.push(row.path+': Duplicate source registry path');
   seen.add(row.path);
   if(row.path.startsWith(prefix))rows.push(row);
  }
  if(seen.size!==allExpected.size||[...allExpected].some(name=>!seen.has(name)))errors.push('Incomplete expected source registry');
  const selected=new Set(rows.map(row=>row.path));
  if(rows.length!==4||selected.size!==4||[...expected].some(name=>!selected.has(name)))errors.push('Incomplete expected example source registry');
  for(const row of rows){try{
   let current=ROOT;
   for(const component of row.path.split('/')){
    current=path.join(current,component);
    if(lstatSync(current).isSymbolicLink())throw new Error('Source path contains a symbolic link');
   }
   const p=path.join(ROOT,row.path),resolved=realpathSync(p),root=realpathSync(ROOT)+path.sep;
   if(!resolved.startsWith(root)||!lstatSync(p).isFile())throw new Error('Not a project-local regular file');
   if(createHash('sha256').update(readFileSync(p)).digest('hex')!==row.sha256)throw new Error('Hash mismatch');
  }catch(e){errors.push(row.path+': '+e.message);}}
 }catch(e){errors.push('Source registry: '+e.message);}
 return {files:rows.length,errors};
}
'''
    return (source[:start] + replacement + source[end:]).encode('utf-8')


def derive(files: dict[str, bytes], source_object: dict) -> dict[str, bytes]:
    """Return relative successor carrier files from the frozen relative source.

    Caller separately authenticates the original ZIP against the pinned archive
    SHA. Here the original fixed manifest/package ID binds every source byte.
    """
    _require(isinstance(files, dict) and isinstance(source_object, dict),
             'file mapping and source object are required')
    _require(all(isinstance(name, str) and isinstance(data, bytes)
                 for name, data in files.items()), 'invalid file mapping')
    _require(all(source_object.get(key) == value for key, value in SOURCE_FIELDS.items()),
             'source object differs from the frozen C07 identity')
    _require(len(files) == SOURCE_FIELDS['archive_files'], 'source inventory count differs')
    rc.namespace([(name, False) for name in files])
    _require(not any(name.startswith('PREDECESSOR_RC6/') for name in files),
             'unexpected predecessor namespace')
    _require(DESCRIPTOR_PATH not in files, 'unexpected successor descriptor')
    for name in (*DISPLACED, 'DERIVED_CARRIER.json'):
        _require(name in files, 'missing source control: ' + name)
    _require(files['PACKAGE_ID.txt'] == (SOURCE_PACKAGE_ID + '\n').encode(),
             'source package ID differs')
    _require(rc.sha(files['SHA256SUMS.txt']) == SOURCE_PACKAGE_ID,
             'source manifest identity differs')
    _require(files['SHA256SUMS.txt'] == rc.manifest(files, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')),
             'source manifest does not authenticate every payload byte')
    for name, expected in (
            ('CANONICAL_SOURCES.json', SOURCE_REGISTRY_SHA256),
            ('tools/examples.mjs', SOURCE_RUNNER_SHA256),
            ('DERIVED_CARRIER.json', SOURCE_DESCRIPTOR_SHA256)):
        _require(rc.sha(files[name]) == expected, 'source control hash differs: ' + name)

    rows = _registry_rows(files['CANONICAL_SOURCES.json'])
    descriptor = rc.strict_json(files['DERIVED_CARRIER.json'])
    changes = descriptor.get('content_changes_before_sealing')
    _require(isinstance(changes, list) and all(isinstance(item, dict) for item in changes),
             'invalid preceding change descriptor')
    change_map = {item.get('path'): item for item in changes}
    _require(len(change_map) == len(changes), 'duplicate preceding change path')
    _require({name for name in change_map if name.startswith('canonical/')} == CORRECTED_PATHS,
             'preceding canonical change set differs')
    corrections = []
    for row in rows:
        name = row['path']
        _require(name in files, 'canonical source is missing: ' + name)
        current = rc.sha(files[name])
        if name in CORRECTED_PATHS:
            change = change_map[name]
            _require(change.get('change') == 'BYTES'
                     and row['sha256'] == change.get('before_sha256')
                     and current == change.get('after_sha256')
                     and len(files[name]) == change.get('after_bytes'),
                     'documented canonical predecessor/current bytes differ: ' + name)
            previous = row['sha256']
            row['previous_carrier_sha256'] = previous
            row['sha256'] = current
            corrections.append({'path': name, 'previous_carrier_sha256': previous,
                                'sha256': current})
        else:
            _require(row['sha256'] == current, 'unchanged canonical hash differs: ' + name)
    _require(len(corrections) == 10, 'exactly ten documented corrections are required')

    result = dict(files)
    for name in DISPLACED:
        result['PREDECESSOR_RC6/' + name] = files[name]
    result['CANONICAL_SOURCES.json'] = _encoded(rows)
    result['tools/examples.mjs'] = _runner_derivative(files['tools/examples.mjs'])
    transformed = ('CANONICAL_SOURCES.json', 'tools/examples.mjs')
    result[DESCRIPTOR_PATH] = _encoded({
        'schema': 'webtech-c07-registry-derivation/v1',
        'object_id': 'C07',
        'carrier_version': VERSION,
        'distribution_version': '3.0.0-rc.8',
        'source_carrier_version': source_object['carrier_version'],
        'source_archive': source_object['archive'],
        'source_archive_sha256': SOURCE_ARCHIVE_SHA256,
        'source_package_id': SOURCE_PACKAGE_ID,
        'source_descriptor_sha256': SOURCE_DESCRIPTOR_SHA256,
        'source_registry_sha256': SOURCE_REGISTRY_SHA256,
        'source_runner_sha256': SOURCE_RUNNER_SHA256,
        'source_collection_material_sha256': 'daae107351c43d2c5efb7196dbd9b0f36ab98039f66886d0d80478f6f4f5b502',
        'source_collection_version': '3.0.0-rc.7',
        'source_collection_commit': 'b734bca1cc0b0cf591ccb76e71a4dc733af3a7fe',
        'transformations': [
            {'path': name, 'before_sha256': rc.sha(files[name]),
             'after_sha256': rc.sha(result[name]), 'before_bytes': len(files[name]),
             'after_bytes': len(result[name])}
            for name in transformed
        ],
        'corrected_registry_rows': sorted(corrections, key=lambda item: item['path']),
        'predecessor_files': [
            {'path': name, 'preserved_path': 'PREDECESSOR_RC6/' + name,
             'sha256': rc.sha(files[name]), 'bytes': len(files[name])}
            for name in DISPLACED
        ],
        'guard_change': 'Require the exact unique canonical registry paths and hashes; reject malformed entries, traversal, symlinks and mismatched source bytes.',
        'original_descriptor_preserved': True,
        'canonical_payload_bytes_changed': False,
        'original_carrier_overwritten': False,
        'identity_contract': {
            'method': 'manifest-sha256', 'manifest': 'SHA256SUMS.txt',
            'package_id': 'PACKAGE_ID.txt',
            'manifest_exclusions': ['SHA256SUMS.txt', 'PACKAGE_ID.txt'],
        },
        'identity_controls_regenerated': True,
        'qualificationVerdict': 'NOT_FINAL',
        'native_acceptance': False,
        'publication_qualified': False,
    })
    result['SHA256SUMS.txt'] = rc.manifest(result, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    result['PACKAGE_ID.txt'] = (rc.sha(result['SHA256SUMS.txt']) + '\n').encode()
    for name, data in files.items():
        if name not in DISPLACED:
            _require(result[name] == data, 'unexpected changed source payload: ' + name)
    _require(all(rc.sha(result[row['path']]) == row['sha256']
                 for row in _registry_rows(result['CANONICAL_SOURCES.json'])),
             'corrected registry does not bind current bytes')
    return result
