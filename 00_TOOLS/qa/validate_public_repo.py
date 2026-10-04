#!/usr/bin/env python3
"""Whole-current-source strict route; no week scope can weaken this check."""
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc
import repository_controls as maintenance
import student_release as student
import build_week_bundle as weeks
import build_student_collection as collection
import validate_pages_payload as pages

def run():
    identity=rc.source_identity(ROOT)
    selected=student.run()
    controls=maintenance.run()
    plan=weeks.read_plan();bundles=[weeks.verify(w,item) for w,item in sorted(plan['weeks'].items())]
    navigation=pages.check_links(collection.build_payload())
    return {'schema':'webtech-whole-source-validation/v2','status':'PASS_STRICT_LOCAL_INTEGRITY_ONLY','repository_package_id':identity,'registry_sha256':rc.sha(student.REGISTRY.read_bytes()),'selected_objects':len(selected['objects']),'maintenance':controls,'weeks':bundles,'navigation':navigation,'release_qualified':False,'native_acceptance':False,'actions_dispatched':0}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--strict',action='store_true');ap.add_argument('--report');a=ap.parse_args()
    result=run();data=(json.dumps(result,indent=2)+'\n').encode()
    if a.report:rc.atomic_write(rc.output_path(a.report),data)
    print(data.decode(),end='')
if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
