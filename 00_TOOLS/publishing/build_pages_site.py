#!/usr/bin/env python3
"""Generate only the filtered student payload for Pages, outside the checkout."""
import argparse
import release_contract as rc
import build_student_collection as builder

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--output',required=True);a=ap.parse_args()
    payload=builder.build_payload();payload['.nojekyll']=b''
    out=rc.output_path(a.output);rc.write_tree(out,payload)
    print('PASS_FILTERED_PAGES_BUILD_ONLY:',len(payload),'files;',out)

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
