#!/usr/bin/env python3
"""Independent finite admission for LOCAL2 payloads; no publication authority."""
from __future__ import annotations
import hashlib
import io
import json
from pathlib import Path
import re
import stat
import subprocess
import zipfile

VERSION='3.0.0-rc.10-local.2'
SOURCE_SHA='a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9'
CONTROLS={'SHA256SUMS.txt','PACKAGE_ID.txt'}
GATES={'local_integrity','reference_runtime','headless_browser','native_windows','native_macos','manual_browser','word','moodle_live','human_pilot','owner_acceptance'}
def sha(data):return hashlib.sha256(data).hexdigest()
def inventory(root):
    out={}
    for p in root.rglob('*'):
        if p.is_symlink():raise ValueError('Symlink in candidate')
        if p.is_file():out[p.relative_to(root).as_posix()]=p.read_bytes()
        elif not p.is_dir():raise ValueError('Nonregular candidate node')
    return out
def sums(files,excluded):
    return ''.join(sha(d)+'  '+n+'\n' for n,d in sorted(files.items()) if n not in excluded).encode()
def controls(files):
    expected=sums(files,CONTROLS)
    if files.get('SHA256SUMS.txt')!=expected or files.get('PACKAGE_ID.txt')!=(sha(expected)+'\n').encode():
        raise ValueError('Exact outer inventory/hash/identity mismatch')
    return sha(expected)
def source_files(data):
    if sha(data)!=SOURCE_SHA:raise ValueError('Untrusted predecessor')
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        return {n.split('/',1)[1]:z.read(n) for n in z.namelist() if not n.endswith('/')}
def parsed_output(text):
    stripped=text.strip()
    if stripped.startswith('{'):return json.loads(stripped)
    lines=[line for line in text.splitlines() if line.startswith('{')]
    if not lines:raise ValueError('No structured runtime result')
    return json.loads(lines[-1])
def validate(output,predecessor_bytes,contract,node='node',run_runtime=True):
    source=source_files(predecessor_bytes)
    baseline=json.loads(source['CLASSROOM_COLLECTION.json'])
    profiles={k:inventory(output/k) for k in ('core','static')}
    report={'schema':'webtech-local2-payload-admission/v1','qualificationVerdict':'NOT_FINAL',
        'publication_asserted':False,'actions_dispatched_by_validator':0,'profiles':[],
        'runtime_scope':'Untouched starter and protected-source controls, not student implementation acceptance',
        'runtime_commands':[]}
    for kind,files in profiles.items():
        identity=controls(files)
        reference=contract[kind]
        if identity!=reference['package_id'] or len(files)!=reference['files']:
            raise ValueError('Payload differs from reviewed public recipe contract: '+kind)
        meta=json.loads(files['CLASSROOM_COLLECTION.json'])
        if (meta['distribution_version']!=VERSION or meta['qualificationVerdict']!='NOT_FINAL'
            or meta['native_acceptance'] is not False or meta['publication_qualified'] is not False
            or set(meta['qualificationGates'])!=GATES or any(v!='pending' for v in meta['qualificationGates'].values())):
            raise ValueError('General qualification or version was promoted')
        if len(meta['objects'])!=30 or len(meta['editable_files'])!=38 or meta['required_microprojects']!=40:
            raise ValueError('Teaching or edit boundary differs')
        for n in meta['editable_files']:
            if files[n]!=source[n]:raise ValueError('Learner answer supplied: '+n)
        for n,d in source.items():
            if n.endswith(('.docx','package-lock.json','/contract.json','/CLASSROOM_SCOPE.json')) and files[n]!=d:
                raise ValueError('Protected contract, Word or lockfile changed')
        for obj in meta['objects']:
            prefix=obj['payload_root'];ident=obj['object_id']
            old=next(o for o in baseline['objects'] if o['object_id']==ident)
            ipath=obj['package_id_path'][len(prefix):]
            unit={n[len(prefix):]:d for n,d in files.items() if n.startswith(prefix)}
            if unit[ipath]!=(obj['package_id']+'\n').encode():raise ValueError('Unit identity registry mismatch')
            if ident=='C02' or re.fullmatch(r'S\d{2}',ident):
                manifest='06_AUDIT/SHA256SUMS.txt' if ident=='C02' else 'SHA256SUMS.txt'
                pid=sha(sums(unit,{ipath,manifest}))
                final=sums(unit,{manifest} if ident=='C02' else {ipath,manifest})
                if obj['package_id']!=pid or unit[manifest]!=final:raise ValueError('Unit seal mismatch: '+ident)
            else:
                original={n[len(prefix):]:d for n,d in source.items() if n.startswith(prefix)}
                if original!=unit or obj['package_id']!=old['package_id']:
                    raise ValueError('Unchanged unit was changed: '+ident)
            if obj['package_id'].encode() not in files[obj['entry']]:raise ValueError('ENTRY identity binding missing')
        name=reference['filename']
        with zipfile.ZipFile(output/name) as z:
            if z.testzip() is not None:raise ValueError('ZIP CRC failed')
            expected={reference['zip_root']+'/'+n:d for n,d in files.items()}
            if len(z.namelist())!=len(expected) or set(z.namelist())!=set(expected):raise ValueError('ZIP exact inventory differs')
            for info in z.infolist():
                if z.read(info)!=expected[info.filename]:raise ValueError('ZIP body differs from validated payload')
                mode=0o100755 if info.filename.endswith('.sh') else 0o100644
                if info.create_system!=3 or info.external_attr>>16!=mode:raise ValueError('ZIP file mode differs')
        archive_bytes=(output/name).read_bytes()
        if (output/(name+'.sha256')).read_bytes()!=(sha(archive_bytes)+'  '+name+'\n').encode():
            raise ValueError('Archive checksum sidecar differs')
        report['profiles'].append({'profile':kind,'package_id':identity,'files':len(files),
                                  'archive_sha256':sha(archive_bytes),'archive_bytes':len(archive_bytes)})
    if profiles['static'].get('.nojekyll')!=b'':raise ValueError('Static hidden marker missing or changed')
    scope=json.loads(profiles['static']['SITE_SCOPE.json'])
    if scope['classroom_collection_package_id']!=profiles['core']['PACKAGE_ID.txt'].decode().strip():
        raise ValueError('Static/core binding differs')
    for n,d in profiles['core'].items():
        if n.startswith(('PACKAGES/','ENTRY/','TUTORIALS/')) and profiles['static'].get(n)!=d:
            raise ValueError('Static changed a sealed classroom route or unit')
    if run_runtime:
        version=subprocess.check_output([node,'--version'],text=True).strip()
        if version!='v24.21.0':raise ValueError('Exact reference Node v24.21.0 required')
        meta=json.loads(profiles['core']['CLASSROOM_COLLECTION.json'])
        for obj in meta['objects']:
            ident=obj['object_id']
            if not re.fullmatch(r'S\d{2}',ident):continue
            unit=output/'core'/obj['payload_root']/'CLASSROOM_RC6'
            commands=[(['verify.mjs','initial'],'PASS_INITIAL_CLASSROOM_SOURCE'),
                      (['kit.mjs','initial'],'PASS_ORIGINAL_STARTER_ASSERTIONS') if int(ident[1:])<=7
                      else (['check.mjs','initial'],'PASS_UNTOUCHED_CLASSROOM_STARTER')]
            for args,status in commands:
                run=subprocess.run([node,*args],cwd=unit,text=True,capture_output=True,timeout=30)
                actual=parsed_output(run.stdout)
                if run.returncode!=0 or actual.get('status')!=status:raise ValueError('Reference starter/source control failed: '+ident+' '+str(args))
                report['runtime_commands'].append({'unit':ident,'command':['node',*args],'status':status,
                    'exit_code':run.returncode,'stdout_sha256':sha(run.stdout.encode()),'stderr_sha256':sha(run.stderr.encode())})
    if any(inventory(output/k)!=v for k,v in profiles.items()):raise ValueError('Candidate changed during validation')
    report['status']='PASS_REVIEWED_BYTES_AND_REFERENCE_STARTER_CONTROLS' if run_runtime else 'PASS_REVIEWED_PAYLOAD_BYTES_ONLY'
    report['runtime_commands_executed']=len(report['runtime_commands'])
    return report
