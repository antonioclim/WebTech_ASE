#!/usr/bin/env python3
"""Build and admit LOCAL2 outside the sealed checkout. Never deploy or dispatch."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import urllib.request

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc
from build_local_candidate import main as build_main, SOURCE_SHA, SOURCE_SIZE
from validate_candidate_payload import validate
URL='https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.10/WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip'

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output',type=Path,required=True)
    ap.add_argument('--input-zip',type=Path)
    ap.add_argument('--allow-uncommitted-local-source',action='store_true',help='Local integration rehearsal only; refused inside CI')
    a=ap.parse_args()
    output=rc.output_path(a.output,ROOT)
    source_id=rc.source_identity(ROOT)
    if a.allow_uncommitted_local_source and (os.environ.get('CI')=='true' or os.environ.get('GITHUB_ACTIONS')=='true'):
        raise ValueError('Local working-copy mode is forbidden in CI')
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    dirty=subprocess.check_output(['git','status','--porcelain','--untracked-files=all'],cwd=ROOT,text=True)
    if dirty and not a.allow_uncommitted_local_source:raise ValueError('Committed clean source is required')
    if os.environ.get('GITHUB_ACTIONS')=='true':
        expected=os.environ.get('EXPECTED_SOURCE_SHA','')
        if not re.fullmatch(r'[0-9a-f]{40}',expected) or expected!=commit or expected!=os.environ.get('GITHUB_SHA'):
            raise ValueError('Selected reviewed commit differs from workflow checkout')
    with tempfile.TemporaryDirectory(prefix='webtech-local2-predecessor-') as temp:
        predecessor=Path(temp)/'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip'
        if a.input_zip:
            if a.input_zip.is_symlink() or not a.input_zip.is_file():raise ValueError('Input must be a regular file')
            data=a.input_zip.read_bytes()
        else:
            with urllib.request.urlopen(URL,timeout=60) as response:data=response.read(SOURCE_SIZE+1)
        if len(data)!=SOURCE_SIZE or hashlib.sha256(data).hexdigest()!=SOURCE_SHA:
            raise ValueError('Published predecessor size/hash mismatch')
        predecessor.write_bytes(data)
        saved_argv=sys.argv
        try:
            sys.argv=['build_local_candidate.py','--source-zip',str(predecessor),'--patch-dir',str(HERE/'inputs'),'--output',str(output)]
            build_main()
        finally:sys.argv=saved_argv
        contract=rc.strict_json((HERE/'inputs/EXPECTED_PAYLOADS.json').read_bytes())
        result=validate(output,data,contract)
    if rc.source_identity(ROOT)!=source_id:raise ValueError('Sealed repository changed during build/admission')
    receipt=rc.strict_json((output/'BUILD_RECEIPT.json').read_bytes())
    receipt['execution_source']={'repository':'antonioclim/WebTech_ASE','commit':commit,'repository_package_id':source_id,
        'mode':'LOCAL_INTEGRATION_WORKING_COPY' if dirty else 'COMMITTED_CLEAN_SOURCE',
        'publication_asserted':False,'workflow_execution_asserted':False}
    (output/'BUILD_RECEIPT.json').write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
    (output/'PAYLOAD_VALIDATION.json').write_bytes((json.dumps(result,indent=2)+'\n').encode())
    downloads=output/'downloads';downloads.mkdir()
    for row in receipt['archives']:
        for name in [row['filename'],row['filename']+'.sha256']:shutil.copyfile(output/name,downloads/name)
    for name in ['BUILD_RECEIPT.json','PAYLOAD_VALIDATION.json','ARCHIVE_SHA256SUMS.txt']:shutil.copyfile(output/name,downloads/name)
    notes=(HERE/'CANDIDATE_RELEASE_NOTES.txt').read_text(encoding='utf-8')
    notes+='\nActual build source commit: '+commit+'\nRepository source identity: '+source_id+'\n'
    for row in receipt['archives']:notes+='\n'+row['filename']+'\nSHA256: '+row['sha256']+'\nPayload PACKAGE_ID: '+row['package_id']+'\n'
    (downloads/'CANDIDATE_RELEASE_NOTES.txt').write_text(notes,encoding='utf-8')
    print(json.dumps({'status':result['status'],'runtime_commands':result['runtime_commands_executed'],
        'qualificationVerdict':'NOT_FINAL','output':str(output),'deployment_performed_by_builder':False}))

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError,subprocess.SubprocessError) as e:raise SystemExit('STOP_LOCAL2_BUILD: '+str(e))
