#!/usr/bin/env python3
"""Build the reviewed LOCAL3 derivative outside a clean, sealed checkout.

Reads the two immutable LOCAL2 assets once each. Does not publish or dispatch.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/publishing'))
import release_contract as rc
from build_local_candidate import main as build_main

def sha(data): return hashlib.sha256(data).hexdigest()

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--classroom-base', type=Path)
    ap.add_argument('--static-base', type=Path)
    args = ap.parse_args()
    output = rc.output_path(args.output, ROOT)
    identity = rc.source_identity(ROOT)
    commit = subprocess.check_output(['git','rev-parse','HEAD'], cwd=ROOT, text=True).strip()
    if subprocess.check_output(['git','status','--porcelain','--untracked-files=all'], cwd=ROOT, text=True).strip():
        raise ValueError('Committed clean source is required')
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        expected = os.environ.get('EXPECTED_SOURCE_SHA','')
        if not re.fullmatch('[0-9a-f]{40}', expected) or expected != commit or expected != os.environ.get('GITHUB_SHA'):
            raise ValueError('Selected workflow commit differs from the reviewed commit')
    bases = rc.strict_json((HERE/'inputs/BASE_INPUTS.json').read_bytes())
    with tempfile.TemporaryDirectory(prefix='webtech-local3-bases-') as temp:
        inputs = {}
        for profile, provided in [('core',args.classroom_base),('static',args.static_base)]:
            record = bases[profile]
            target = Path(temp)/record['filename']
            if provided:
                if provided.is_symlink() or not provided.is_file(): raise ValueError('Input must be a regular file')
                data = provided.read_bytes()
            else:
                with urllib.request.urlopen(record['url'], timeout=60) as response:
                    data = response.read(record['bytes']+1)
            if len(data) != record['bytes'] or sha(data) != record['sha256']:
                raise ValueError('Published LOCAL2 base size/hash differs: '+profile)
            target.write_bytes(data)
            inputs[profile] = target
        saved = sys.argv
        try:
            sys.argv = ['build_local_candidate.py','--classroom-base',str(inputs['core']),
                        '--static-base',str(inputs['static']),'--patch-dir',str(HERE/'inputs'),'--output',str(output)]
            build_main()
        finally:
            sys.argv = saved
    expected_payloads = rc.strict_json((HERE/'inputs/EXPECTED_PAYLOADS.json').read_bytes())
    receipt = rc.strict_json((output/'BUILD_RECEIPT.json').read_bytes())
    actual_rows = {row['filename']:row for row in receipt['archives']}
    for expected in expected_payloads['archives']:
        row = actual_rows.get(expected['filename'])
        if not row or any(row[key] != expected[key] for key in ['sha256','bytes','package_id','files']):
            raise ValueError('Rebuilt candidate differs from reviewed exact payload: '+expected['filename'])
        actual = (output/row['filename']).read_bytes()
        if len(actual) != row['bytes'] or sha(actual) != row['sha256']: raise ValueError('Output archive byte mismatch')
    if len(actual_rows) != 2: raise ValueError('Unexpected archive inventory')
    if rc.source_identity(ROOT) != identity: raise ValueError('Sealed checkout changed during build')
    receipt['execution_source'] = {'repository':'antonioclim/WebTech_ASE','commit':commit,
        'repository_package_id':identity,'mode':'COMMITTED_CLEAN_SOURCE',
        'publication_asserted':False,'workflow_execution_asserted':False}
    (output/'BUILD_RECEIPT.json').write_bytes((json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode())
    validation = {'schema':'webtech-local3-repository-payload-admission/v1',
        'status':'PASS_EXACT_REVIEWED_PAYLOADS_AND_SOURCE_IDENTITY',
        'archives':list(actual_rows.values()),'runtime_commands_executed':0,
        'qualificationVerdict':'NOT_FINAL','all_ten_general_gates':'pending',
        'source_unchanged':True,'deployment_performed':False,'actions_dispatched':0}
    (output/'PAYLOAD_VALIDATION.json').write_bytes((json.dumps(validation,indent=2)+'\n').encode())
    downloads = output/'downloads'
    downloads.mkdir()
    for name in [*actual_rows,*[n+'.sha256' for n in actual_rows],
                 'BUILD_RECEIPT.json','PAYLOAD_VALIDATION.json','ARCHIVE_SHA256SUMS.txt']:
        shutil.copyfile(output/name, downloads/name)
    notes = (HERE/'CANDIDATE_RELEASE_NOTES.txt').read_text(encoding='utf-8')
    notes += '\nActual build source commit: '+commit+'\nRepository source identity: '+identity+'\n'
    for row in actual_rows.values():
        notes += '\n'+row['filename']+'\nSHA256: '+row['sha256']+'\nPayload PACKAGE_ID: '+row['package_id']+'\n'
    (downloads/'CANDIDATE_RELEASE_NOTES.txt').write_text(notes,encoding='utf-8')
    print(json.dumps(validation,indent=2))

if __name__ == '__main__':
    try: main()
    except (ValueError,OSError,KeyError,TypeError,subprocess.SubprocessError) as error:
        raise SystemExit('STOP_LOCAL3_BUILD: '+str(error))
