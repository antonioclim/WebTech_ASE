#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, re, sys, zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath

ROOT=Path(__file__).resolve().parents[2]

def sha(path:Path)->str:
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()

class LinkParser(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  for k in ('href','src'):
   if k in d:self.links.append(d[k])

def main()->int:
 ap=argparse.ArgumentParser();ap.add_argument('--site',type=Path,required=True);a=ap.parse_args();site=a.site.resolve();errors=[]
 def fail(msg):errors.append(msg);print('FAIL',msg)
 for rel in ['index.html','404.html','.nojekyll','downloads.json','assets/site.css','assets/social-preview-1280x640.png']:
  if not (site/rel).is_file():fail(f'missing {rel}')
 try:records=json.loads((site/'downloads.json').read_text(encoding='utf-8'))
 except Exception as e:records=[];fail(f'downloads.json: {e}')
 actual={p.relative_to(site).as_posix():p for p in site.rglob('*.zip')}
 indexed={x.get('path'):x for x in records if isinstance(x,dict)}
 if set(actual)!=set(indexed):fail(f'download index differs: missing={sorted(set(actual)-set(indexed))}, extra={sorted(set(indexed)-set(actual))}')
 for rel,p in actual.items():
  rec=indexed.get(rel,{})
  if rec.get('bytes')!=p.stat().st_size or rec.get('sha256')!=sha(p):fail(f'download metadata mismatch: {rel}')
  try:
   with zipfile.ZipFile(p) as z:
    if z.testzip() is not None:fail(f'CRC failure: {rel}')
    for i in z.infolist():
     pp=PurePosixPath(i.filename)
     if pp.is_absolute() or '..' in pp.parts or re.match(r'^[A-Za-z]:',i.filename):fail(f'unsafe ZIP member: {rel}:{i.filename}')
  except Exception as e:fail(f'ZIP {rel}: {e}')
 for html in [site/'index.html',site/'404.html']:
  parser=LinkParser();parser.feed(html.read_text(encoding='utf-8'))
  for target in parser.links:
   t=target.split('#',1)[0].split('?',1)[0]
   if not t or re.match(r'^[a-z]+://',t,re.I) or t.startswith('mailto:'):continue
   q=(html.parent/t).resolve()
   try:q.relative_to(site)
   except ValueError:fail(f'link escapes site: {html.name} -> {target}');continue
   if not q.exists():fail(f'broken Pages link: {html.name} -> {target}')
 forbidden=re.compile(r'(PRIVATE_STAGING|TEACHER_GUIDE|GHID_PROFESOR|ANSWER_KEY|CHEIE_RASPUNSURI|TEACHER_CONSOLE|CONSOLE_PROFESOR)',re.I)
 for p in site.rglob('*'):
  if forbidden.search(p.relative_to(site).as_posix()):fail(f'private name in Pages payload: {p.relative_to(site)}')
 if errors:
  print(f'VERDICT: FAIL_PAGES_PAYLOAD ({len(errors)} findings)');return 2
 print(f'VERDICT: PASS_PAGES_PAYLOAD_FINAL ({len(actual)} ZIP assets)');return 0
if __name__=='__main__':raise SystemExit(main())
