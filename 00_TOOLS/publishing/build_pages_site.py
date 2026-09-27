#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]

def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
 return h.hexdigest()

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--output',type=Path,default=ROOT/'_site'); a=ap.parse_args()
 out=a.output.resolve()
 if out.exists(): shutil.rmtree(out)
 out.mkdir(parents=True)
 for name in ['index.html','404.html']:
  shutil.copy2(ROOT/name,out/name)
 shutil.copytree(ROOT/'assets',out/'assets')
 shutil.copytree(ROOT/'90_RELEASES',out/'90_RELEASES')
 for platform in ['WINDOWS','MACOS_LINUX']:
  src=ROOT/'00_SETUP'/platform/'DOWNLOAD'
  shutil.copytree(src,out/'00_SETUP'/platform/'DOWNLOAD')
 records=[]
 for p in sorted(out.rglob('*.zip')):
  records.append({'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)})
 (out/'downloads.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
 (out/'.nojekyll').write_text('',encoding='utf-8')
 print(f'Pages payload: {out} ({len(records)} ZIP assets)')
if __name__=='__main__': main()
