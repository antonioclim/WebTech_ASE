#!/usr/bin/env python3
"""Construct or verify deterministic 14-week English candidate bundles."""
import argparse,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/qa'))
import release_contract as rc
import student_release as student
PLAN='90_RELEASES/FULL_COLLECTION_PLAN.json'

def read_plan(path=PLAN):
    if path!=PLAN:raise ValueError('Use the authoritative full collection plan')
    d=rc.strict_json((ROOT/path).read_bytes())
    if d.get('schema')!='webtech-full-collection-plan/v2' or d.get('distribution_version')!='3.0.0-rc.5':raise ValueError('Invalid full plan')
    if not re.fullmatch('[0-9a-f]{40}',str(d.get('source_commit',''))):raise ValueError('Invalid provenance commit')
    if d.get('registry')!='metadata/student-selection.json' or d.get('registry_sha256')!=rc.sha(student.REGISTRY.read_bytes()):raise ValueError('Plan registry binding differs')
    if set(d.get('weeks',{}))!={f'{n:02}' for n in range(1,15)}:raise ValueError('Exactly fourteen weeks required')
    if d.get('status')!='candidate' or d.get('draft') is not True or d.get('prerelease') is not True:raise ValueError('Candidate publication flags are fixed')
    if set(d.get('required_gates',[]))!=set(rc.GATES) or len(d['required_gates'])!=10:raise ValueError('The fixed qualification policy cannot be reduced')
    return d

def payload(week,item):
    registry=student.read_registry();by={o['object_id']:o for o in registry['objects']};files={};routes=[];packages=[]
    for ident in ('C'+week,'S'+week):
        o=by[ident];pin=item['objects'].get(ident)
        if pin!={'archive':o['archive'],'sha256':o['archive_sha256']}:raise ValueError('Weekly archive pin differs')
        members=student.verify_object(o)
        archive=rc.checked_path(ROOT,o['archive']);data=archive.read_bytes()
        if rc.sha(data)!=o['archive_sha256']:raise ValueError('Weekly archive changed during validation')
        # Bind the retained second read to the same exact member set/bytes.
        raw=rc.zip_members(data);prefix=o['archive_root_prefix'];actual={n[len(prefix):]:b for n,b in raw.items() if n.startswith(prefix)}
        if actual!=members or len(actual)!=len(raw):raise ValueError('Weekly archive read differs')
        files[archive.name]=data;packages.append({'object_id':ident,'archive':archive.name,'sha256':rc.sha(data),'package_id':o['package_id'],'root_prefix':prefix})
        paths=[('Start',o['student_start']),('Guide',o['student_guide'])]
        if o.get('student_form'):paths.append(('Form',o['student_form']))
        routes.append('## '+ident+'\n\nExtract `'+archive.name+'` into its own folder. '+('Its top-level folder is `'+prefix.rstrip('/')+'`.' if prefix else 'This is a flat archive; keep its contents together in that separate folder.'))
        routes.extend('- '+label+': `'+prefix+path+'`' for label,path in paths)
        if 'VERIFY_PACKAGE.cmd' in members:routes.append('- Windows integrity check, from the extracted package root: `VERIFY_PACKAGE.cmd`.')
        if 'VERIFY_PACKAGE.sh' in members:routes.append('- Bash integrity check, from the extracted package root: `./VERIFY_PACKAGE.sh`.')
        if 'VERIFY_PACKAGE.cmd' not in members and 'VERIFY_PACKAGE.sh' not in members:routes.append('- Follow the actual package start and guide above; no universal launcher is assumed.')
    if set(item['objects'])!=set(('C'+week,'S'+week)):raise ValueError('Unexpected week object IDs')
    files['README.md']=('# Web Technologies — Week '+week+' English candidate\n\nCandidate 3.0.0-rc.5, pending external acceptance. First extract this outer ZIP, then both inner ZIPs. Do not run files inside an archive viewer. SHA256SUMS covers two inner ZIPs, README and RELEASE metadata. PACKAGE_ID hashes the manifest; the manifest excludes itself, PACKAGE_ID and its method file. The external sidecar identifies the complete outer ZIP.\n\n'+'\n\n'.join(routes)+'\n\nIntegrity is not native, browser, Word, Moodle, pilot, AI or institutional acceptance. Complete Day 0 and follow the lecturer\'s current assessment requirements.\n').encode()
    files['RELEASE.json']=(json.dumps({'schema':'webtech-week-candidate/v2','week':week,'language':'EN_GB','distribution_version':'3.0.0-rc.5','source_commit':read_plan()['source_commit'],'status':'candidate','packages':packages,'covered_files':4,'total_files':7},indent=2)+'\n').encode()
    files['SHA256SUMS.txt']=rc.manifest(files)
    files['PACKAGE_ID.txt']=(rc.sha(files['SHA256SUMS.txt'])+'\n').encode()
    files['PACKAGE_ID_METHOD.md']=b'# Outer bundle identity\n\nPACKAGE_ID is SHA256 of the exact manifest bytes. The manifest covers exactly README.md, RELEASE.json and two complete inner ZIPs. It excludes SHA256SUMS.txt, PACKAGE_ID.txt and this method file. The sidecar covers the complete container. Hashes are unsigned consistency evidence, not authentication or completed qualification.\n'
    return files

def expected_bytes(week,item):return rc.zip_bytes(payload(week,item))
def bundle_path(week,item):
    expected='90_RELEASES/assets/WebTech_ASE_WEEK_'+week+'_EN_GB_v3.0.0-rc.5.zip'
    if item.get('bundle')!=expected:raise ValueError('Unexpected output asset path')
    return rc.checked_path(ROOT,expected)

def verify(week,item):
    out=bundle_path(week,item);data=out.read_bytes();side=Path(str(out)+'.sha256')
    if not side.is_file() or side.read_bytes()!=(rc.sha(data)+'  '+out.name+'\n').encode():raise ValueError('Weekly sidecar missing/different')
    rc.zip_members(data)
    if data!=expected_bytes(week,item):raise ValueError('Complete deterministic ZIP bytes/metadata/compression differ')
    return {'week':week,'archive_sha256':rc.sha(data),'status':'PASS_COMPLETE_CONTAINER_IDENTITY'}

def main():
    ap=argparse.ArgumentParser();g=ap.add_mutually_exclusive_group(required=True);g.add_argument('--build-all',action='store_true');g.add_argument('--verify-all',action='store_true');ap.add_argument('--plan',default=PLAN);ap.add_argument('--language',choices=['EN_GB'],default='EN_GB');ap.add_argument('--weeks');a=ap.parse_args()
    plan=read_plan(a.plan);weeks=a.weeks.split(',') if a.weeks else sorted(plan['weeks'])
    if len(weeks)!=len(set(weeks)) or any(w not in plan['weeks'] for w in weeks):raise ValueError('Invalid week scope')
    result=[]
    for w in weeks:
        item=plan['weeks'][w]
        if a.build_all:
            out=bundle_path(w,item);data=expected_bytes(w,item);side=Path(str(out)+'.sha256');sdata=(rc.sha(data)+'  '+out.name+'\n').encode()
            rc.validate_destination(out,data);rc.validate_destination(side,sdata);rc.atomic_write(out,data);rc.atomic_write(side,sdata)
        result.append(verify(w,item))
    print(json.dumps({'status':'PASS_WEEKLY_CONTAINER_IDENTITY_ONLY','weeks':result,'native_acceptance':False},indent=2))
if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
