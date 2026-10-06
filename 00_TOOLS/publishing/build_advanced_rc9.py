#!/usr/bin/env python3
"""Build five separately labelled optional RC9 advanced source derivatives.

Frozen RC6 inputs are authenticated before transformation. No installation,
network, release publication or Actions operation is performed.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import release_contract as rc
from rc9_code import derive_advanced_seminar, derive_seminar

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import student_release as student
from identity_policies import POLICIES

VERSION = '3.0.0-rc.9'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_ADVANCED_RC9/'
OBJECTS = ('S03', 'S06', 'S07', 'S09', 'S13')
STATUS = 'OPTIONAL_ADVANCED_SOURCE_PRERELEASE_NOT_FINAL'


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def changes(before, after, exclude=()):
    return [{'path': name, 'before_sha256': rc.sha(before[name]), 'after_sha256': rc.sha(after[name]),
             'before_bytes': len(before[name]), 'after_bytes': len(after[name])}
            for name in sorted(after) if name not in exclude and before[name] != after[name]]


def rebind_hash_map(files, control, plans, root_key, hashes_key, prefix=''):
    for plan in plans.values():
        base = prefix + plan[root_key].rstrip('/') + '/'
        rows = plan[hashes_key]
        for relative, digest in rows.items():
            name = base + relative
            if name not in files or not re.fullmatch('[0-9a-f]{64}', str(digest)):
                raise ValueError('Advanced project source contract differs: ' + control + ':' + name)
            rows[relative] = rc.sha(files[name])
    files[control] = encoded(plans)


def rebind_project_controls(ident, files):
    if ident == 'S03':
        name = '02_PROJECTS/tools/projects.json'
        plans = rc.strict_json(files[name])
        if set(plans) != {'P01', 'P02', 'P03'}:
            raise ValueError('S03 reviewed project contract differs')
        rebind_hash_map(files, name, plans, 'path', 'hashes', '02_PROJECTS/')
        # The native exact-package checker needs the complete fixed RC6 edit
        # exclusions; adding these existing classroom paths does not add an edit.
        files['90_AUDIT/MUTABLE_PATHS.txt'] = ('\n'.join(POLICIES[ident]['mutable_paths']) + '\n').encode()
    elif ident in ('S06', 'S07'):
        name = 'tools/PROJECT_CONTRACT.json' if ident == 'S06' else 'PROJECT_CONTRACT.json'
        plans = rc.strict_json(files[name])
        if not {'p01', 'p02', 'p03'}.issubset(plans):
            raise ValueError(ident + ' reviewed project contract differs')
        rebind_hash_map(files, name, plans, 'root', 'files')
    elif ident == 'S09':
        name = 'support/code/PROJECT_BASELINES_v1.2.0.json'
        contract = rc.strict_json(files[name])
        before_digest = rc.sha(files[name])
        plans = contract['projects']
        if set(plans) != {'p01', 'p02', 'p03'}:
            raise ValueError('S09 reviewed project contract differs')
        for plan in plans.values():
            for relative in plan['files']:
                source = plan['root'] + '/' + relative
                if source not in files:
                    raise ValueError('S09 project source missing: ' + source)
                plan['files'][relative] = rc.sha(files[source])
        files[name] = encoded(contract)
        runner = 'tools/S09_SUPPORT_v1_2_0.mjs'
        before = "const baselineDigest='" + before_digest + "';"
        text = files[runner].decode()
        if text.count(before) != 1:
            raise ValueError('S09 reviewed baseline authority pin differs')
        files[runner] = text.replace(before, "const baselineDigest='" + rc.sha(files[name]) + "';", 1).encode()
    elif ident == 'S13':
        name = 'SOURCE_HISTORICAL_TOOLS/p01-baseline.json'
        rows = rc.strict_json(files[name])
        for relative in rows:
            source = 'projects/p01/student/' + relative
            if source not in files:
                raise ValueError('S13 P01 baseline source missing: ' + source)
            rows[relative] = rc.sha(files[source])
        files[name] = encoded(rows)


def rebind_classroom_controls(files):
    prefix = 'CLASSROOM_RC6/'
    boundary_name, manifest_name = prefix + 'CLASSROOM_BOUNDARY.json', prefix + 'SOURCE_MANIFEST.json'
    boundary = rc.strict_json(files[boundary_name])
    for table in ('protected', 'mutable'):
        for relative in boundary[table]:
            boundary[table][relative] = rc.sha(files[prefix + relative])
    files[boundary_name] = encoded(boundary)
    if manifest_name not in files:
        return
    manifest = rc.strict_json(files[manifest_name])
    for table in ('protected', 'targets'):
        for relative in manifest[table]:
            manifest[table][relative] = rc.sha(files[prefix + relative])
    files[manifest_name] = encoded(manifest)


def rebind_s13_authority(files):
    name = 'TOOLS/PROTECTION_AUTHORITY.json'
    authority = rc.strict_json(files[name])
    if (authority['allowed_edit'] != 'projects/p01/student/src/worker-client.js'
            or set(authority['bookkeeping']) != {'TOOLS/PROTECTION_AUTHORITY.json', 'TOOLS/entry.mjs',
                                                 'SHA256SUMS.txt', 'PACKAGE_ID.txt', 'FILE_INDEX.csv'}):
        raise ValueError('S13 reviewed protection edit/bookkeeping contract differs')
    authority['target_version'] = VERSION
    authority['source'] = 'RC9 optional source derivative of authenticated RC6; current hashes do not establish completed objectives or external qualification.'
    excluded = set(authority['bookkeeping']) | {authority['allowed_edit']}
    authority['protected'] = {path: {'bytes': len(files[path]), 'sha256': rc.sha(files[path])}
                              for path in sorted(files) if path not in excluded}
    edit = files[authority['allowed_edit']]
    authority['initial_edit'] = {'bytes': len(edit), 'sha256': rc.sha(edit)}
    files[name] = encoded(authority)
    entry = 'TOOLS/entry.mjs'
    text = files[entry].decode()
    pattern = re.compile(r'^const pins=(\{.*\});$', re.M)
    hits = list(pattern.finditer(text))
    if len(hits) != 1:
        raise ValueError('S13 reviewed embedded tool pins differ')
    pins = rc.strict_json(hits[0].group(1).encode())
    if name not in pins or any(path not in files for path in pins):
        raise ValueError('S13 reviewed pinned tool inventory differs')
    pins = {path: rc.sha(files[path]) for path in pins}
    files[entry] = pattern.sub('const pins=' + json.dumps(pins) + ';', text).encode()


def reseal_index(ident, files):
    policy = POLICIES[ident]
    if not policy.get('index'):
        return
    buffer = io.StringIO(newline='')
    writer = csv.DictWriter(buffer, fieldnames=policy['index_columns'], lineterminator='\n')
    writer.writeheader()
    excluded = set(policy['index_exclusions'])
    for path in sorted(set(files) - excluded):
        row = {'path': path}
        if ident == 'S03':
            row.update(role='student_mutable' if path in policy['mutable_paths'] else
                       'identity_special' if path in (policy['manifest'], policy['package_id']) else
                       'audit' if path.startswith('90_AUDIT/') else 'public_student',
                       identity_policy='excluded_from_immutable_identity' if path in policy['mutable_paths'] else
                       'controlled_by_immutable_manifest')
        elif ident == 'S13':
            row.update(role='PUBLIC_STUDENT_RELEASE_CANDIDATE_NOT_FINAL', bytes=len(files[path]), sha256=rc.sha(files[path]))
        else:
            raise ValueError('Unsupported reviewed advanced index')
        writer.writerow(row)
    files[policy['index']] = buffer.getvalue().encode()


def derive_object(ident, source, source_object):
    if ident not in OBJECTS:
        raise ValueError('Unsupported optional advanced object')
    files = derive_advanced_seminar(ident, source)
    if ident in ('S03', 'S06'):
        files = derive_seminar(ident, files)
    rebind_project_controls(ident, files)
    rebind_classroom_controls(files)
    policy = POLICIES[ident]
    controls = {policy['manifest'], policy['package_id'], policy.get('index'), 'DERIVED_CARRIER.json',
                'TOOLS/PROTECTION_AUTHORITY.json', 'TOOLS/entry.mjs'}
    files['DERIVED_CARRIER.json'] = encoded({
        'schema': 'webtech-advanced-carrier-derivation/v1', 'object_id': ident,
        'carrier_version': VERSION, 'distribution_version': VERSION,
        'status': STATUS, 'qualified_release': False, 'technical_completion': 'NOT_ESTABLISHED',
        'source_archive': source_object['archive'], 'source_archive_sha256': source_object['archive_sha256'],
        'source_package_id': source_object['package_id'], 'source_projection': source_object['projection'],
        'previous_descriptor_sha256': rc.sha(source['DERIVED_CARRIER.json']),
        'identity_contract': {key: value for key, value in policy.items() if key != 'mutable_paths'},
        'mutable_paths': policy['mutable_paths'],
        'content_changes_before_control_reseal': changes(source, files, controls),
        'control_reseal': 'Fixed existing edit policy retained; project hashes and existing authority pins rebound to these reviewed derivatives. Outer ADVANCED_COLLECTION.json records every changed control after resealing.',
        'historical_native_whole_package_verifier': 'RESEALED_AND_LOCALLY_TESTABLE' if ident == 'S03' else
            'NO_HISTORICAL_NATIVE_WHOLE_PACKAGE_COMMAND_PROMOTED' if ident == 'S07' else
            'RC6_CLASSROOM_EXCLUSION_INCOMPATIBILITY_USE_VERIFY_ADVANCED_FOR_CLEAN_OUTER_IDENTITY',
        'historical_documents': 'Retained source teaching/qualification text is historical; this descriptor and outer README state current optional scope.'})
    if ident == 'S13':
        rebind_s13_authority(files)
    reseal_index(ident, files)
    files[policy['manifest']] = rc.manifest(files, policy['manifest_exclusions'])
    files[policy['package_id']] = (rc.sha(files[policy['manifest']]) + '\n').encode()
    student.verify_identity(ident, files)
    return files


README = '''# Optional advanced source — RC9 candidate

This separate package contains repaired full source for S03, S06, S07, S09 and S13. It is optional reference material, outside the filtered classroom collection and its 40 microprojects. It does not establish completed student objectives, native-platform qualification or a final release.

From this extracted root run `node VERIFY_ADVANCED.mjs` before making a working copy. It checks the exact current clean package bytes. Match the ZIP checksum with the separately supplied build report; a local manifest alone does not authenticate origin.

Native entry guards now use real platform paths. S13 P01 serves only six declared browser assets from its module directory, rejects unsupported methods, symlinks and unlisted targets, and never serves package/test files. S03/S06 no longer advertise an absent classroom server.

Project source-boundary baselines and their existing authority pins have been rebound without widening assessed edit paths. `ADVANCED_COLLECTION.json` records source archive identities, new identities and every before/after hash. Original carriers remain in repository history; this package does not duplicate them.

Historical full-source documents, forms and qualification claims are retained as source reference. Follow the current filtered classroom guide/form for required submissions. These optional sources do not inherit a new browser, Word, Moodle, Windows/macOS or cohort acceptance. Prepare project-local dependencies separately with the exact lockfile only when deliberately executing an optional example; no dependency installation occurs during this build.

The historical S06/S09/S13 whole-package commands assume a manifest convention different from the RC6 classroom exclusions and are not promoted to RC9 acceptance. S07's historical identity-method document also omits those classroom exclusions; no historical whole-package command is promoted here. Use the outer verifier for clean identity and the rebound project source-boundary checks for permitted edits. S03's native package mutable-path catalogue has been corrected to the existing six fixed paths; a package PASS still proves bytes only.

After edits or dependency preparation, outer clean-package verification will fail by design. Preserve the clean extraction and work in a separate copy. Do not treat an expected starter assertion failure, a missing prerequisite or a zero preflight exit as a completed objective.
'''


VERIFY = r'''import { readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
try {
 const sums=await readFile(join(root,'SHA256SUMS.txt')),id=await readFile(join(root,'PACKAGE_ID.txt'),'utf8');
 if(id!==sha(sums)+'\n')throw Error('PACKAGE_ID_MISMATCH');
 const expected=new Map(),text=sums.toString('utf8');
 if(Buffer.from(text).compare(sums)||text.includes('\r')||!text.endsWith('\n'))throw Error('MANIFEST_ENCODING');
 for(const line of text.slice(0,-1).split('\n')){const m=/^([a-f0-9]{64})  (.+)$/.exec(line);if(!m||m[2].startsWith('/')||m[2].includes('\\')||m[2].split('/').some(p=>!p||p==='.'||p==='..')||expected.has(m[2])||['SHA256SUMS.txt','PACKAGE_ID.txt'].includes(m[2]))throw Error('MANIFEST_PATH');expected.set(m[2],m[1]);}
 if([...expected.keys()].join('\n')!==[...expected.keys()].sort().join('\n'))throw Error('MANIFEST_ORDER');
 const actual=[];async function walk(dir,prefix=''){for(const entry of await readdir(dir,{withFileTypes:true})){const name=prefix+entry.name,file=join(dir,entry.name),s=await lstat(file);if(s.isSymbolicLink()||s.nlink!==1&&!s.isDirectory())throw Error('NON_REGULAR_OR_HARDLINK '+name);if(s.isDirectory())await walk(file,name+'/');else if(s.isFile())actual.push(name);else throw Error('SPECIAL_FILE '+name);}}
 await walk(root);const wanted=[...expected.keys(),'SHA256SUMS.txt','PACKAGE_ID.txt'].sort();
 if(actual.sort().join('\n')!==wanted.join('\n'))throw Error('EXACT_FILE_SET');
 for(const [name,digest]of expected)if(sha(await readFile(join(root,name)))!==digest)throw Error('CHANGED '+name);
 const metadata=JSON.parse(await readFile(join(root,'ADVANCED_COLLECTION.json'),'utf8'));
 if(metadata.status!=='OPTIONAL_ADVANCED_SOURCE_PRERELEASE_NOT_FINAL'||metadata.qualified_release!==false||metadata.objects.map(x=>x.object_id).join(',')!=='S03,S06,S07,S09,S13')throw Error('OPTIONAL_SCOPE');
 console.log(JSON.stringify({status:'PASS_OPTIONAL_ADVANCED_CLEAN_BYTES_ONLY',package_id:id.trim(),files:wanted.length,optional_objects:5,technical_completion:'NOT_ESTABLISHED',qualificationVerdict:'NOT_FINAL'}));
} catch(error){console.error(JSON.stringify({status:'STOP_ADVANCED_INTEGRITY',reason:error.message}));process.exitCode=2;}
'''


def build_payload(check_source=True):
    if check_source:
        rc.source_identity(ROOT)
    registry = student.read_registry()
    selected = {row['object_id']: row for row in registry['objects'] if row['object_id'] in OBJECTS}
    if set(selected) != set(OBJECTS):
        raise ValueError('Five fixed optional advanced objects required')
    payload = {'README.md': README.encode(), 'VERIFY_ADVANCED.mjs': VERIFY.encode()}
    records = []
    for ident in OBJECTS:
        row = selected[ident]
        source = student.verify_object(row)
        derivative = derive_object(ident, source, row)
        prefix = 'PACKAGES/' + ident + '/'
        payload.update({prefix + name: data for name, data in derivative.items()})
        records.append({'object_id': ident, 'root': prefix, 'source_archive': row['archive'],
            'source_archive_sha256': row['archive_sha256'], 'source_package_id': row['package_id'],
            'package_id': derivative[POLICIES[ident]['package_id']].decode().strip(),
            'payload_files': len(derivative), 'changes': changes(source, derivative),
            'identity_contract': {key: value for key, value in POLICIES[ident].items() if key != 'mutable_paths'}})
    payload['ADVANCED_COLLECTION.json'] = encoded({'schema': 'webtech-advanced-collection/v1',
        'distribution_version': VERSION, 'status': STATUS, 'qualified_release': False,
        'technical_completion': 'NOT_ESTABLISHED', 'qualificationVerdict': 'NOT_FINAL',
        'source_registry_sha256': rc.sha(student.REGISTRY.read_bytes()), 'objects': records,
        'classroom_core_inclusion': False, 'actions_dispatched': 0,
        'warning': 'Optional repaired source only. Historical documents are not current qualification or required submission authority.'})
    rc.namespace([(name, False) for name in payload])
    payload['SHA256SUMS.txt'] = rc.manifest(payload)
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    return payload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip', type=Path)
    parser.add_argument('--site', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    if not args.zip and not args.site:
        parser.error('Choose --zip and/or --site outside the source checkout')
    destinations = {}
    if args.zip:
        destinations['zip'] = rc.output_path(args.zip)
        destinations['sidecar'] = rc.output_path(Path(str(destinations['zip']) + '.sha256'))
    if args.site:
        destinations['site'] = rc.output_path(args.site)
    if args.report:
        destinations['report'] = rc.output_path(args.report)
    pairs = list(destinations.items())
    for number, (first_name, first) in enumerate(pairs):
        for second_name, second in pairs[number + 1:]:
            if first == second or first.is_relative_to(second) or second.is_relative_to(first):
                raise ValueError('Advanced outputs overlap: ' + first_name + ' / ' + second_name)
    payload = build_payload()
    archive = rc.zip_bytes(payload, COLLECTION_ROOT)
    report = {'schema': 'webtech-advanced-build-report/v1', 'status': STATUS,
              'zip_sha256': rc.sha(archive), 'zip_bytes': len(archive), 'files': len(payload),
              'package_id': payload['PACKAGE_ID.txt'].decode().strip(), 'optional_objects': list(OBJECTS),
              'actions_dispatched': 0, 'qualificationVerdict': 'NOT_FINAL'}
    outputs = {}
    if 'zip' in destinations:
        outputs['zip'] = archive
        outputs['sidecar'] = (rc.sha(archive) + '  ' + destinations['zip'].name + '\n').encode()
    if 'report' in destinations:
        outputs['report'] = encoded(report)
    # Validate every requested file, including the automatic sidecar, before
    # publishing any artifact. A conflicting existing tree also refuses early.
    for name, data in outputs.items():
        rc.validate_destination(destinations[name], data)
    if 'site' in destinations and destinations['site'].exists():
        actual = rc.tree_files(destinations['site'])
        if (set(actual) != set(payload)
                or any(actual[name].read_bytes() != data for name, data in payload.items())
                or any(bool(path.stat().st_mode & 0o111) != name.endswith('.sh') for name, path in actual.items())):
            raise ValueError('Existing different advanced output tree')
    for name, data in outputs.items():
        rc.atomic_write(destinations[name], data)
    if 'site' in destinations:
        rc.write_tree(destinations['site'], payload)
    print(json.dumps(report, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
