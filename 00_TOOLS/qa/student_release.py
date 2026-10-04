#!/usr/bin/env python3
"""Verify the explicit 30-object collection, its authentic identities and source."""
from __future__ import annotations
import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc
from identity_policies import POLICIES
REGISTRY = ROOT/'metadata/student-selection.json'

def read_registry():
    d = rc.strict_json(REGISTRY.read_bytes())
    if d.get('schema') != 'webtech-student-selection/v2' or d.get('distribution_version') != '3.0.0-rc.5':
        raise ValueError('Unsupported current registry')
    objects = d.get('objects')
    if not isinstance(objects, list) or len(objects) != 30 or {o.get('object_id') for o in objects} != rc.OBJECTS:
        raise ValueError('Exactly 30 distinct fixed objects required')
    if not re.fullmatch('[0-9a-f]{40}',str(d.get('source_commit',''))):
        raise ValueError('Invalid source provenance commit')
    if d.get('qualified_release') is not False:
        raise ValueError('This registry is a candidate, not a qualified final edition')
    return d

def verify_identity(ident, files, expected_pid=None):
    policy = POLICIES[ident]
    m, pidpath = policy['manifest'], policy['package_id']
    excluded = set(policy['manifest_exclusions'])
    if not excluded <= set(files) or m not in excluded:
        raise ValueError('Identity exclusions missing from package: '+ident)
    # Package-edit boundaries are fixed in code, not selected by mutable JSON.
    method = policy['method']
    if method in ('manifest-sha256','tw2026-package-id-v2','payload-excluding-audit-sha256'):
        expected_manifest = rc.manifest(files, excluded)
        if files[m] != expected_manifest:
            raise ValueError('Authentic manifest bytes/set differ: '+ident)
        value = rc.sha(files[m])
        if method == 'tw2026-package-id-v2':
            template = 'TW2026-PACKAGE-ID-v2\nmanifest-sha256 '+value+'\nfile-index-sha256 '+rc.sha(files[policy['index']])+'\n'
            value = rc.sha(template.encode())
        elif method == 'payload-excluding-audit-sha256':
            value = rc.sha(rc.manifest(files, policy['identity_input_exclusions']))
    elif method in ('sorted-payload-lines-sha256','compact-manifest-json-sha256'):
        d = rc.strict_json(files[m])
        records = d.get(policy['descriptor_array'])
        if not isinstance(records,list) or not all(isinstance(r,dict) for r in records):
            raise ValueError('Invalid identity descriptor')
        paths = [r.get('path') for r in records]
        if paths != sorted(set(files)-excluded):
            raise ValueError('Descriptor inventory/order differs')
        for record in records:
            p = record['path']
            if record.get('sha256') != rc.sha(files[p]) or type(record.get('bytes')) is not int or record['bytes'] != len(files[p]):
                raise ValueError('Descriptor bytes/hash differ')
            if ident == 'S10' and (type(record.get('mutable')) is not bool or record['mutable'] != (p in policy['mutable_paths'])):
                raise ValueError('Descriptor edit boundary differs')
        if method == 'sorted-payload-lines-sha256':
            value = rc.sha(rc.manifest(files, excluded))
            if d.get('package_id') != value:
                raise ValueError('Descriptor embedded ID differs')
        else:
            compact = {'schema':d['schema'],'entries':[{k:r[k] for k in ('path','sha256','bytes','mutable')} for r in records]}
            value = rc.sha(json.dumps(compact,ensure_ascii=False,separators=(',',':')).encode())
    else:
        raise ValueError('Unknown identity method')
    if files[pidpath] != (value+'\n').encode() or expected_pid is not None and value != expected_pid:
        raise ValueError('Authentic package ID differs: '+ident)
    if 'DERIVED_CARRIER.json' in files:
        descriptor = rc.strict_json(files['DERIVED_CARRIER.json'])
        expected_contract = {k:v for k,v in policy.items() if k != 'mutable_paths'}
        if descriptor.get('object_id') != ident or descriptor.get('identity_contract') != expected_contract:
            raise ValueError('Carrier identity policy differs from code: '+ident)
    if policy.get('index'):
        rows = list(csv.DictReader(io.StringIO(files[policy['index']].decode('utf-8'))))
        columns = policy['index_columns']
        reader = csv.DictReader(io.StringIO(files[policy['index']].decode('utf-8')))
        if reader.fieldnames != columns:
            raise ValueError('Index columns differ')
        field = 'relative_path' if 'relative_path' in columns else 'path'
        wanted = sorted(set(files)-set(policy['index_exclusions']))
        if [r[field] for r in rows] != wanted:
            raise ValueError('CSV index set/order differs: '+ident)
        for row in rows:
            p = row[field]
            if 'sha256' in columns and row['sha256'] != rc.sha(files[p]):
                raise ValueError('CSV member SHA differs: '+p)
            length = 'bytes' if 'bytes' in columns else 'size_bytes' if 'size_bytes' in columns else None
            if length and row[length] != str(len(files[p])):
                raise ValueError('CSV member length differs')
            if 'mode' in columns and row['mode'] != ('0o755' if p.endswith('.sh') else '0o644'):
                raise ValueError('CSV mode differs')
            if 'mutable' in columns and row['mutable'] != ('YES' if p in policy['mutable_paths'] else 'NO'):
                raise ValueError('CSV edit boundary differs')
            if ident == 'S03' and 'role' in columns:
                expected_role = 'student_mutable' if p in policy['mutable_paths'] else 'identity_special' if p in (m,pidpath) else 'audit' if p.startswith('90_AUDIT/') else 'public_student'
                if row['role'] != expected_role:
                    raise ValueError('CSV role differs')
            if ident == 'S05' and 'classification' in columns:
                classification = 'mutable' if p in policy['mutable_paths'] else 'control' if p == m else 'immutable'
                if row['classification'] != classification:
                    raise ValueError('CSV classification differs')
            if ident in ('S11','S12','S13','S14'):
                field_label = 'role' if 'role' in columns else 'classification'
                if row[field_label] != 'PUBLIC_STUDENT_RELEASE_CANDIDATE_NOT_FINAL':
                    raise ValueError('CSV publication classification differs')
            if 'identity_policy' in columns:
                # The authentic S03 index labels identity controls separately
                # through its role column; the exclusion flag denotes student edits.
                required = 'excluded_from_immutable_identity' if p in policy['mutable_paths'] else 'controlled_by_immutable_manifest'
                if row['identity_policy'] != required:
                    raise ValueError('CSV identity policy differs')
    return value

def verify_object(o):
    ident = o['object_id']
    archive = rc.checked_path(ROOT,o['archive'])
    data = archive.read_bytes()
    if rc.sha(data) != o['archive_sha256']:
        raise ValueError('Selected archive SHA differs: '+ident)
    side = Path(str(archive)+'.sha256')
    if not side.is_file() or side.read_bytes() != (rc.sha(data)+'  '+archive.name+'\n').encode():
        raise ValueError('Mandatory exact ZIP sidecar missing/different')
    raw = rc.zip_members(data,normalized_modes=True)
    prefix = o['archive_root_prefix']
    if prefix:
        rc.safe_name(prefix[:-1])
        if not prefix.endswith('/'):
            raise ValueError('Malformed ZIP root prefix')
    if any(not p.startswith(prefix) for p in raw):
        raise ValueError('Selected ZIP root differs')
    members = {p[len(prefix):]:b for p,b in raw.items()}
    rc.namespace([(p,False) for p in members])
    if len(members) != o['archive_files']:
        raise ValueError('Selected ZIP file count differs')
    projection = rc.checked_path(ROOT,o['projection'])
    actual = rc.tree_files(projection)
    if set(actual) != set(members) or any(actual[n].read_bytes() != b for n,b in members.items()):
        raise ValueError('Archive/projection exact identity differs: '+ident)
    for n,p in actual.items():
        if bool(p.stat().st_mode & 0o111) != n.endswith('.sh'):
            raise ValueError('Projection executable mode differs: '+ident+'/'+n)
    for field in ('student_start','student_guide','student_form'):
        n = o.get(field)
        if n is not None:
            rc.safe_name(n)
            if n not in members:
                raise ValueError('Student route missing: '+ident+'/'+field)
    if not o.get('student_start') or not o.get('student_guide'):
        raise ValueError('Explicit start and guide are mandatory')
    verify_identity(ident,members,o['package_id'])
    if ident == 'S02' and b'-Root "%~dp0."' not in members['VERIFY_PACKAGE.cmd']:
        raise ValueError('S02 Windows root regression')
    return members

def run(mode='integrity',receipt=None):
    d = read_registry()
    records = []
    for o in d['objects']:
        files = verify_object(o)
        records.append({'object_id':o['object_id'],'archive_sha256':o['archive_sha256'],'package_id':o['package_id'],'payload_files':len(files),'identity_method':POLICIES[o['object_id']]['method']})
    pid = rc.source_identity(ROOT)
    if mode == 'final':
        if not receipt:
            raise ValueError('Final mode requires real observations for all ten gates')
        rc.qualify(receipt,REGISTRY.read_bytes(),ROOT)
    return {'schema':'webtech-selection-integrity/v2','status':'PASS_INTEGRITY_ONLY' if mode=='integrity' else 'PASS_QUALIFICATION_RECEIPT','repository_package_id':pid,'registry_sha256':rc.sha(REGISTRY.read_bytes()),'objects':records,'release_qualification':mode=='final','native_tests_executed_by_this_command':False}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--mode',choices=['integrity','final'],default='integrity');ap.add_argument('--receipt');ap.add_argument('--report');a=ap.parse_args()
    result=run(a.mode,a.receipt);data=(json.dumps(result,indent=2)+'\n').encode()
    if a.report:rc.atomic_write(rc.output_path(a.report),data)
    print(data.decode(),end='')

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
