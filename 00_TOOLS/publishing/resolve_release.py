#!/usr/bin/env python3
"""Resolve checked English candidate assets; pending gates block final release."""
import argparse,json,re,sys
from pathlib import Path
import release_contract as rc
import build_week_bundle as week_builder
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/qa'))
import student_release as student

def resolve(week,preview=False,receipt=None,plan_path=week_builder.PLAN):
    if type(preview) is not bool:raise ValueError('Preview must be a real boolean')
    plan=week_builder.read_plan(plan_path)
    rc.source_identity(ROOT)
    if week not in plan['weeks']:raise ValueError('Unknown week')
    item=plan['weeks'][week];week_builder.verify(week,item)
    if not preview:
        if not receipt:raise ValueError('Final release requires the ten observed qualification gates')
        rc.qualify(receipt,student.REGISTRY.read_bytes(),ROOT)
        # This edition is permanently labelled candidate; qualification alone
        # does not silently change plan flags or a version into a final release.
        raise ValueError('Current plan is a candidate; a reviewed successor final plan is required')
    tag='week-'+week+'-en-gb-v3.0.0-rc.5';out=week_builder.bundle_path(week,item)
    notes=rc.checked_path(ROOT,item['notes'])
    if not notes.is_file():raise ValueError('Release notes absent')
    fields={'tag':tag,'title':'Web Technologies Week '+week+' English candidate 3.0.0-rc.5','notes':item['notes'],'assets':out.relative_to(ROOT).as_posix()+' '+Path(str(out)+'.sha256').relative_to(ROOT).as_posix(),'draft':'true','prerelease':'true'}
    if any('\n' in v or '\r' in v for v in fields.values()):raise ValueError('Output injection')
    return fields

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--week',required=True);ap.add_argument('--language',choices=['EN_GB'],default='EN_GB');ap.add_argument('--plan',default=week_builder.PLAN);ap.add_argument('--allow-preview',action='store_true');ap.add_argument('--receipt');ap.add_argument('--github-output',required=True);ap.add_argument('--workflow-output',action='store_true');a=ap.parse_args()
    fields=resolve(a.week,a.allow_preview,a.receipt,a.plan);data=''.join(k+'='+v+'\n' for k,v in fields.items()).encode()
    if a.workflow_output:rc.github_output(a.github_output,data)
    else:rc.atomic_write(rc.output_path(a.github_output),data)
    print(json.dumps({'status':'PASS_RESOLUTION_ONLY','draft':True,'prerelease':True,'fields':fields,'release_created':False}))
if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
