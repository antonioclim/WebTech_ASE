#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, zipfile
from pathlib import Path, PurePosixPath

ROOT=Path(__file__).resolve().parents[2]
STAMP=(2026,9,27,12,0,0)

def sha(path:Path)->str:
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
 return h.hexdigest()

def info(name:str,mode:int=0o100644)->zipfile.ZipInfo:
 z=zipfile.ZipInfo(name,date_time=STAMP); z.compress_type=zipfile.ZIP_DEFLATED; z.external_attr=(mode&0xFFFF)<<16; z.create_system=3; return z

def payload(week:str,lang:str,item:dict)->dict[str,bytes]:
 course=ROOT/item['course']; seminar=ROOT/item['seminar']
 for p in (course,seminar):
  if not p.is_file(): raise SystemExit(f'Missing source package: {p.relative_to(ROOT)}')
 readme=(f'# WebTech_ASE — Week {week}, {lang}\n\n'
         'Extract both student ZIP files before use. Verify `SHA256SUMS.txt` first.\n'
         'The seminar package contains the individual experiment, Gemini audit and Moodle evidence workflow.\n').encode()
 release=json.dumps({'schema':'webtech-ase-week-bundle-v1','week':week,'language':lang,'repository_version':'2.0.0','status':'final','packages':[course.name,seminar.name]},indent=2).encode()+b'\n'
 manifest=(f'{sha(course)}  {course.name}\n{sha(seminar)}  {seminar.name}\n').encode()
 pid=hashlib.sha256(manifest).hexdigest().encode()+b'\n'
 method=(b'# PACKAGE_ID method\n\n`PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 bytes of `SHA256SUMS.txt`.\n')
 return {'README.md':readme,'RELEASE.json':release,'SHA256SUMS.txt':manifest,'PACKAGE_ID.txt':pid,'PACKAGE_ID_METHOD.md':method,course.name:course.read_bytes(),seminar.name:seminar.read_bytes()}

def build(week:str,lang:str,item:dict)->Path:
 out=ROOT/item['bundle']; out.parent.mkdir(parents=True,exist_ok=True)
 files=payload(week,lang,item)
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for name in sorted(files,key=str.casefold): z.writestr(info(name),files[name])
 Path(str(out)+'.sha256').write_text(f'{sha(out)}  {out.name}\n',encoding='utf-8')
 return out

def verify(week:str,lang:str,item:dict)->None:
 out=ROOT/item['bundle']; expected=payload(week,lang,item)
 if not out.is_file(): raise SystemExit(f'Missing weekly bundle: {out.relative_to(ROOT)}')
 side=Path(str(out)+'.sha256')
 if not side.is_file() or side.read_text(encoding='utf-8').strip()!=f'{sha(out)}  {out.name}': raise SystemExit(f'Sidecar mismatch: {out.relative_to(ROOT)}')
 with zipfile.ZipFile(out) as z:
  if z.testzip() is not None: raise SystemExit(f'CRC failure: {out.relative_to(ROOT)}')
  names=[i.filename for i in z.infolist() if not i.is_dir()]
  if names!=sorted(expected,key=str.casefold): raise SystemExit(f'Unexpected member order or set: {out.relative_to(ROOT)}')
  for n,data in expected.items():
   if z.read(n)!=data: raise SystemExit(f'Content mismatch {n} in {out.relative_to(ROOT)}')
  if z.read('PACKAGE_ID.txt').decode().strip()!=hashlib.sha256(z.read('SHA256SUMS.txt')).hexdigest(): raise SystemExit(f'PACKAGE_ID mismatch: {out.relative_to(ROOT)}')

def main()->int:
 ap=argparse.ArgumentParser(); g=ap.add_mutually_exclusive_group(required=True); g.add_argument('--build-all',action='store_true'); g.add_argument('--verify-all',action='store_true'); a=ap.parse_args()
 plan=json.loads((ROOT/'90_RELEASES/RELEASE_PLAN.json').read_text(encoding='utf-8'))
 for week,w in sorted(plan['weeks'].items()):
  for lang,item in sorted(w['languages'].items()):
   if a.build_all: build(week,lang,item)
   verify(week,lang,item)
 print('VERDICT: PASS_WEEKLY_BUNDLES_FINAL')
 return 0
if __name__=='__main__': raise SystemExit(main())
