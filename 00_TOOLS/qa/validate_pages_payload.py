#!/usr/bin/env python3
"""Exact generated payload admission and bounded offline local-link checks."""
import argparse,json,posixpath,re,sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote,urlsplit
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc
import build_student_collection as builder

class Links(HTMLParser):
    def __init__(self):super().__init__();self.urls=[]
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if value and key in ('href','src','action','poster'):self.urls.append(value)

def local_target(name,url,payload):
    parsed=urlsplit(url)
    if parsed.scheme or parsed.netloc or not parsed.path:return None
    decoded=unquote(parsed.path)
    if '\\' in decoded or re.search(r'[\x00-\x1f]',decoded):raise ValueError('Unsafe local URL')
    parts=decoded.split('/')
    if decoded.startswith('/'):
        if any(p in ('.','..') for p in parts):raise ValueError('App-root traversal')
        parent=Path(name).parent
        app=None
        for p in [parent,*parent.parents]:
            if (p/'package.json').as_posix() in payload:app=p.as_posix();break
        if app is None:raise ValueError('Absolute URL without an application root: '+name+' '+url)
        clean=decoded.lstrip('/')
        html_root=Path(name).parent.as_posix()
        candidates=[html_root+'/'+clean,html_root+'/public/'+clean,app+'/'+clean,app+'/public/'+clean]
        # This immutable introductory server explicitly maps /assets/site.css
        # to public/site.css. It is a source mapping, not a generic missing-link exemption.
        if clean=='assets/site.css' and '/S01/' in name and '/P02_TINY_HTTP_SERVER/' in name:
            source=payload.get(app+'/src/server.js',b'')
            if b"['/assets/site.css', { fileUrl: new URL('../public/site.css', import.meta.url)" in source:
                candidates.append(app+'/public/site.css')
        if not clean:candidates=[app+'/index.html',app+'/public/index.html']
    else:
        target=posixpath.normpath(posixpath.join(posixpath.dirname(name),decoded))
        if target=='..' or target.startswith('../') or target.startswith('/'):raise ValueError('Collection traversal')
        candidates=[target,target+'/index.html']
    for candidate in candidates:
        if candidate in payload:return candidate
    raise ValueError('Missing static target: '+name+' -> '+url)

def check_links(payload):
    count=0;application_assets=[]
    for name,data in payload.items():
        if not name.lower().endswith('.html'):continue
        parser=Links();parser.feed(data.decode('utf-8'))
        for url in parser.urls:
            target=local_target(name,url,payload)
            if target:
                count+=1
                if urlsplit(url).path.startswith('/'):application_assets.append({'from':name,'url':url,'target':target,'scope':'STATIC_ASSET_ONLY'})
    return {'local_links':count,'application_root_assets':application_assets,'live_routes_qualified':False}

def run(site):
    expected=builder.build_payload();expected['.nojekyll']=b''
    actual=rc.tree_files(Path(site))
    if set(actual)!=set(expected):raise ValueError('Pages exact inventory mismatch')
    if any(actual[n].read_bytes()!=b for n,b in expected.items()):raise ValueError('Pages payload bytes mismatch')
    if any(bool(actual[n].stat().st_mode&0o111)!=n.endswith('.sh') for n in actual):raise ValueError('Pages file mode mismatch')
    return {'schema':'webtech-pages-qualification/v2','status':'PASS_STATIC_PAYLOAD_ONLY','files':len(actual),**check_links(expected),'native_acceptance':False}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--site',required=True);ap.add_argument('--report');a=ap.parse_args();r=run(a.site);data=(json.dumps(r,indent=2)+'\n').encode()
    if a.report:rc.atomic_write(rc.output_path(a.report),data)
    print(data.decode(),end='')
if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
