#!/usr/bin/env python3
"""Export exact raw Git blobs with file-backed requests; compare source and modes."""
import argparse,json,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'00_TOOLS/publishing'))
import release_contract as rc

def export_raw(repository,ref,destination):
    # A large simultaneous stdin request/stdout response pipe can deadlock.
    # The complete request uses a seekable file and responses are drained in order.
    raw=subprocess.check_output(['git','-C',str(repository),'ls-tree','-rz',ref])
    items=[]
    for row in raw.split(b'\0'):
        if not row:continue
        header,name=row.split(b'\t',1);mode,kind,oid=header.decode().split();name=name.decode('utf-8')
        rc.safe_name(name)
        if kind!='blob' or mode not in ('100644','100755'):raise ValueError('Unsupported Git entry')
        items.append((mode,oid,name))
    rc.namespace([(n,False) for _,_,n in items])
    payload={};modes={}
    with tempfile.TemporaryFile() as request:
        request.write(('\n'.join(oid for _,oid,_ in items)+'\n').encode());request.seek(0)
        proc=subprocess.Popen(['git','-C',str(repository),'cat-file','--batch'],stdin=request,stdout=subprocess.PIPE)
        try:
            for mode,oid,n in items:
                header=proc.stdout.readline().decode().split()
                if len(header)!=3 or header[:2]!=[oid,'blob']:raise ValueError('Git batch response differs')
                size=int(header[2]);data=proc.stdout.read(size)
                if len(data)!=size or proc.stdout.read(1)!=b'\n':raise ValueError('Truncated Git batch blob')
                payload[n]=data;modes[n]=mode
            if proc.wait()!=0:raise ValueError('Git batch process failed')
        finally:
            if proc.poll() is None:proc.kill();proc.wait()
    out=Path(destination)
    if out.exists():raise ValueError('Use a new raw-export directory')
    out.mkdir(parents=True)
    for n,data in payload.items():
        p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);p.chmod(0o755 if modes[n]=='100755' else 0o644)
    return payload,modes

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--repository',default=str(ROOT));ap.add_argument('--ref',default='HEAD');ap.add_argument('--export',required=True);ap.add_argument('--compare');a=ap.parse_args()
    out=rc.output_path(a.export);payload,modes=export_raw(a.repository,a.ref,out)
    if a.compare:
        actual=rc.tree_files(Path(a.compare),exclude_git=True)
        if set(actual)!=set(payload) or any(actual[n].read_bytes()!=b or bool(actual[n].stat().st_mode&0o111)!=(modes[n]=='100755') for n,b in payload.items()):raise ValueError('Raw Git/source bytes or modes differ')
    print(json.dumps({'status':'PASS_RAW_GIT_EXPORT_AND_COMPARE' if a.compare else 'PASS_RAW_GIT_EXPORT_ONLY','files':len(payload),'ref':a.ref,'source_rc4_recovered':False}))

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,KeyError,TypeError,subprocess.SubprocessError) as e:raise SystemExit('STOP: '+str(e))
