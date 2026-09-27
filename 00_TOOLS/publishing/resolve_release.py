#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def sha(p:Path)->str:
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def emit(path:Path,key:str,value:str)->None:
 with path.open('a',encoding='utf-8') as f:f.write(f'{key}={value}\n')
def main()->int:
 ap=argparse.ArgumentParser();ap.add_argument('--week',required=True);ap.add_argument('--github-output',type=Path,required=True);a=ap.parse_args()
 plan=json.loads((ROOT/'90_RELEASES/RELEASE_PLAN.json').read_text(encoding='utf-8'))
 if plan.get('status')!='final' or plan.get('prerelease') is not False: raise SystemExit('Release plan is not final')
 if a.week not in plan['weeks']: raise SystemExit(f'Week {a.week} is not in the release plan')
 item=plan['weeks'][a.week]; assets=[]
 for lang in ('RO','EN_GB'):
  p=ROOT/item['languages'][lang]['bundle']; side=Path(str(p)+'.sha256')
  if not p.is_file() or not side.is_file(): raise SystemExit(f'Missing release asset or sidecar: {p}')
  if side.read_text(encoding='utf-8').strip()!=f'{sha(p)}  {p.name}': raise SystemExit(f'Sidecar mismatch: {p}')
  assets.extend([p.relative_to(ROOT).as_posix(),side.relative_to(ROOT).as_posix()])
 emit(a.github_output,'tag',item['tag']);emit(a.github_output,'title',item['title']);emit(a.github_output,'notes',item['notes']);emit(a.github_output,'assets',' '.join(assets))
 print(item['tag']); return 0
if __name__=='__main__':raise SystemExit(main())
