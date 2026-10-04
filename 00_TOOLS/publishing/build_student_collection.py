#!/usr/bin/env python3
"""Build the filtered candidate from exact selected ZIP members and sealed templates."""
import argparse, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/qa'))
import student_release as student
import release_contract as rc

def build_payload(check_source=True):
    registry=student.read_registry()
    if check_source:rc.source_identity(ROOT)
    template=ROOT/'00_START_HERE/STUDENT_COLLECTION'
    payload={n:p.read_bytes() for n,p in rc.tree_files(template).items()}
    records=[]
    for o in registry['objects']:
        files=student.verify_object(o)
        prefix=o['collection_payload_root'];rc.safe_name(prefix[:-1])
        for n,b in files.items():payload[prefix+n]=b
        records.append({'object_id':o['object_id'],'carrier_version':o['carrier_version'],'archive_sha256':o['archive_sha256'],'payload_root':prefix,'payload_files':len(files),'entry':'ENTRY/'+o['object_id']+'.html','start':prefix+o['student_start'],'guide':prefix+o['student_guide'],'form':prefix+o['student_form'] if o.get('student_form') else None,'package_id_path':o['package_id_path'],'package_id':o['package_id'],'recovery_provenance':o['recovery_provenance']})
    payload['COLLECTION.json']=(json.dumps({'schema':'webtech-student-collection/v2','status':'RECONSTRUCTED_CANDIDATE_NOT_FINAL_ACCEPTANCE','distribution_version':registry['distribution_version'],'selection_registry_sha256':rc.sha(student.REGISTRY.read_bytes()),'objects':records,'native_acceptance':False,'publication_qualified':False},ensure_ascii=False,indent=2)+'\n').encode()
    payload['RECOVERY_NOTES.md']=b'# Reconstructed candidate 3.0.0-rc.5\n\nThis edition recovers the exact student payloads of the preserved RC4 collection for 29 objects. S02 is a new carrier with the publicly reviewed Windows root-argument correction and resealed authentic identity. The individual ZIPs are new deterministic containers; their hashes do not reproduce the original RC4 ZIPs. The RC4 maintainer source was unavailable: release controls were reconstructed and require their own fresh checks.\n\nStart with index.html. Full extraction is required before using launchers. Static navigation does not certify running applications, native Windows/macOS behaviour, Word, Moodle, a genuine AI conversation, student workload or institutional acceptance. Never interpret PACKAGE_ID as a grade or acceptance decision. Ask the lecturer for current assessment requirements.\n'
    payload['SHA256SUMS.txt']=rc.manifest(payload)
    return payload

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--zip');ap.add_argument('--site');ap.add_argument('--report');a=ap.parse_args()
    if not a.zip and not a.site:raise ValueError('Choose ZIP or site output')
    paths=[rc.output_path(p) for p in (a.zip,a.site,a.report) if p]
    if any(x==y or x.is_relative_to(y) or y.is_relative_to(x) for i,x in enumerate(paths) for y in paths[i+1:]):raise ValueError('Overlapping outputs')
    payload=build_payload();result={'schema':'webtech-collection-build/v2','status':'PASS_BUILD_ONLY','files':len(payload),'distribution_version':'3.0.0-rc.5','native_acceptance':False,'outputs':[]}
    if a.zip:
        out=rc.output_path(a.zip);data=rc.zip_bytes(payload,'WEBTECH_ASE_EN_GB_RC5/');rc.validate_destination(out,data)
        rc.atomic_write(out,data);result['outputs'].append({'path':str(out),'sha256':rc.sha(data)})
    if a.site:
        out=rc.output_path(a.site);rc.write_tree(out,payload);result['outputs'].append({'path':str(out),'files':len(payload)})
    data=(json.dumps(result,indent=2)+'\n').encode()
    if a.report:rc.atomic_write(rc.output_path(a.report),data)
    print(data.decode(),end='')

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
