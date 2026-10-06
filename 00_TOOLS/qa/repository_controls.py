#!/usr/bin/env python3
"""Whole maintenance source checks with explicit scope and finite resource limits."""
import ast,io,json,posixpath,re,subprocess,sys,zipfile
from pathlib import Path
from urllib.parse import unquote,urlsplit
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc
import current_navigation
import publication_controls
TEXT_SUFFIXES={'.md','.txt','.html','.css','.csv','.json','.yaml','.yml','.cff','.py','.js','.mjs','.cjs','.jsx','.ts','.tsx','.sh','.cmd','.bat','.ps1','.xml','.svg'}
LANGUAGE_RECEIPT='metadata/language-review.json'
CONTROL_PATHS={LANGUAGE_RECEIPT,'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt','metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'}
SECRET_PATTERNS=[('github_classic',re.compile(rb'\bgh[pousr]_[A-Za-z0-9]{36}\b')),('github_fine_grained',re.compile(rb'\bgithub_pat_[A-Za-z0-9_]{70,}\b')),('aws_access_key',re.compile(rb'\bAKIA[0-9A-Z]{16}\b')),('google_api',re.compile(rb'\bAIza[0-9A-Za-z_-]{35}\b')),('private_key',re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'))]

def language_text_files(root=ROOT):
    return {n:p for n,p in rc.tree_files(root,exclude_git=True).items() if n not in CONTROL_PATHS and (p.suffix.lower() in TEXT_SUFFIXES or p.name in ('.gitattributes','.gitignore','LICENSE','NOTICE'))}

def language_review(root=ROOT):
    data=rc.strict_json((root/LANGUAGE_RECEIPT).read_bytes());paths=language_text_files(root)
    if data.get('schema')!='webtech-language-review/v2':raise ValueError('Language receipt schema differs')
    hashes=data.get('text_files');classifications=data.get('classifications')
    if not isinstance(hashes,dict) or set(hashes)!=set(paths) or not isinstance(classifications,dict) or set(classifications)!=set(paths):raise ValueError('Language review text inventory differs')
    allowed={'EN_GB','HISTORICAL_SOURCE','LANGUAGE_NEUTRAL','PERMITTED_MULTILINGUAL_EXAMPLE'}
    for n,p in paths.items():
        if hashes[n]!=rc.sha(p.read_bytes()) or classifications[n] not in allowed:raise ValueError('Language disposition/hash differs: '+n)
    return {'covered_text_paths':len(paths),'natural_language_fluency_certified':False,'method':'Hash-bound purpose dispositions; not independent human linguistic review'}

def workflows(root=ROOT):
    lock=rc.strict_json((root/'metadata/github-actions-lock.json').read_bytes())['actions'];found=set();records=[]
    files=sorted([*(root/'.github/workflows').glob('*.yml'),*(root/'.github/workflows').glob('*.yaml')])
    if not files:raise ValueError('No workflow definitions found')
    def walk(value):
        if isinstance(value,dict):
            for k,v in value.items():
                if k=='uses':
                    if not isinstance(v,str):raise ValueError('Invalid Action reference')
                    m=re.fullmatch(r'([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)@([0-9a-f]{40})',v)
                    if not m or m[1] not in lock or lock[m[1]]['sha']!=m[2]:raise ValueError('Action reference/lock differs: '+v)
                    found.add(m[1])
                walk(v)
        elif isinstance(value,list):
            for v in value:walk(v)
    for p in files:
        d=rc.unique_yaml(p.read_text())
        if not isinstance(d,dict) or not isinstance(d.get('on'),dict) or set(d['on'])!={'workflow_dispatch'}:raise ValueError('Only workflow_dispatch is authorised: '+p.name)
        walk(d);records.append({'workflow':p.name,'events':['workflow_dispatch'],'dispatched_by_validator':False})
    if found!=set(lock):raise ValueError('Unused/missing Action lock entries')
    return records

def preserved_source(root=ROOT):
    d=rc.strict_json((root/'metadata/preserved-main.json').read_bytes());count=0;retired=d.get('retired_originals',{})
    for n,entry in {**d['files'],**retired}.items():
        p=rc.checked_path(root,n)
        if not p.is_file() or rc.sha(p.read_bytes())!=entry['sha256'] or bool(p.stat().st_mode&0o111)!=entry['executable']:raise ValueError('Preserved main file changed: '+n)
        count+=1
    return {'main_files':len(d['files']),'retired_original_files':len(retired),'total_hash_and_mode_guards':count}

def scan(root=ROOT):
    paths=rc.tree_files(root,exclude_git=True);seen=set();budget={'bytes':0};hits=[];stats={'source_files':len(paths),'distinct_payloads':0,'containers':0,'syntax_cases':0,'json_documents':0,'yaml_documents':0};errors=[]
    node=subprocess.check_output(['node','--version'],text=True).strip()
    if node!='v24.21.0':raise ValueError('Use exact reference Node v24.21.0; observed '+node)
    def examine(data,label,suffix,depth=0):
        key=(rc.sha(data),suffix.lower())
        if key in seen:return
        seen.add(key);stats['distinct_payloads']+=1
        for kind,pattern in SECRET_PATTERNS:
            if pattern.search(data):hits.append({'path':label,'kind':kind,'value':'REDACTED'})
        if data[:4] in (b'PK\x03\x04',b'PK\x05\x06',b'PK\x07\x08') or suffix.lower() in ('.zip','.docx','.xlsx','.pptx'):
            members=rc.zip_members(data,budget,depth);stats['containers']+=1
            for n,b in members.items():examine(b,label+'!'+n,Path(n).suffix,depth+1)
        elif suffix.lower()=='.json':
            rc.strict_json(data);stats['json_documents']+=1
        elif suffix.lower() in ('.yml','.yaml','.cff'):
            rc.unique_yaml(data.decode('utf-8'));stats['yaml_documents']+=1
        elif suffix.lower()=='.py':
            ast.parse(data,filename=label);stats['syntax_cases']+=1
        elif suffix.lower() in ('.js','.mjs','.cjs','.sh'):
            command=['bash','-n'] if suffix.lower()=='.sh' else ['node','--check','--input-type='+('commonjs' if suffix.lower()=='.cjs' else 'module')]
            p=subprocess.run(command,input=data,capture_output=True,timeout=30)
            if p.returncode:raise ValueError('Syntax check failed: '+label+' '+p.stderr.decode(errors='replace')[:450])
            stats['syntax_cases']+=1
    for n,p in paths.items():
        try:examine(p.read_bytes(),n,p.suffix)
        except (ValueError,OSError,SyntaxError,zipfile.BadZipFile,subprocess.TimeoutExpired) as e:errors.append(str(e))
    if errors:raise ValueError('Source scan failures: '+json.dumps(errors[:30]))
    if hits:raise ValueError('Secret-pattern candidates require review: '+json.dumps(hits))
    return {**stats,'expanded_unique_scan_bytes':budget['bytes'],'node':node,'secret_pattern_candidates':hits,'limits':{'members_per_zip':rc.MAX_ENTRIES,'member_bytes':rc.MAX_MEMBER,'container_bytes':rc.MAX_CONTAINER,'aggregate_bytes':rc.MAX_SCAN,'nested_depth':rc.MAX_DEPTH},'limitations':'Finite pattern and syntax checks are not proof of absence of every credential or of runtime correctness.'}

def maintenance_links(root=ROOT):
    from validate_pages_payload import Links
    scope=['README.md','current-outline.md','index.html','00_TOOLS/maintainer/SUCCESSOR_RC6.md']
    scope.extend(p.relative_to(root).as_posix() for p in (root/'ENTRY').glob('*.html'))
    count=0
    for name in scope:
        p=rc.checked_path(root,name);text=p.read_text()
        if p.suffix=='.html':
            parser=Links();parser.feed(text);urls=parser.urls
        else:urls=re.findall(r'\[[^\]]*\]\(([^\s)]+)\)',text)
        for url in urls:
            parsed=urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.path:continue
            decoded=unquote(parsed.path)
            if '\\' in decoded or decoded.startswith('/'):raise ValueError('Unsafe maintenance URL')
            target=posixpath.normpath(posixpath.join(posixpath.dirname(name),decoded))
            q=rc.checked_path(root,target)
            if not q.is_file() and not (q.is_dir() and (q/'index.html').is_file()):raise ValueError('Missing current maintenance target: '+name+' -> '+url)
            count+=1
    return {'current_frontdoor_files':len(scope),'local_links':count,'historical_documents_scope':'Preserved historical bytes; not a claim that every old command/link targets the current edition'}

def run(root=ROOT):
    return {'schema':'webtech-maintenance-controls/v2','status':'PASS_MAINTENANCE_CONTROLS_ONLY','preserved_source':preserved_source(root),'workflows':workflows(root),'language_review':language_review(root),'maintenance_links':maintenance_links(root),'publication':publication_controls.run(root),'current_navigation':current_navigation.run(root),'scan':scan(root),'actions_dispatched':0}

if __name__=='__main__':
    try:print(json.dumps(run(),indent=2))
    except (ValueError,OSError,KeyError,TypeError) as e:raise SystemExit('STOP: '+str(e))
