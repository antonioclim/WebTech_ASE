"""Fetch exact existing LOCAL3 public inputs once and extract bounded safe copies."""
from pathlib import Path, PurePosixPath
import argparse
import hashlib
import json
import re
import stat
import sys
import unicodedata
import urllib.parse
import urllib.request
import zipfile

HERE = Path(__file__).resolve().parent
HOSTS = {'github.com', 'api.github.com', 'release-assets.githubusercontent.com', 'objects.githubusercontent.com'}

def trusted_url(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname not in HOSTS or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError('Unapproved public download URL')
    return url

class PublicRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        trusted_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def fetch(url, limit, destination=None):
    # No credentials, token headers, retry or caller-selected URL.
    req = urllib.request.Request(trusted_url(url), headers={'User-Agent': 'WebTech-LOCAL3-finite-evidence', 'Accept': 'application/vnd.github+json' if 'api.github.com' in url else 'application/octet-stream'})
    opener = urllib.request.build_opener(PublicRedirects())
    with opener.open(req, timeout=45) as response:
        if response.status != 200:
            raise ValueError('Public response was not HTTP 200')
        trusted_url(response.geturl())
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError('Public response exceeded the bounded byte limit')
    if destination is not None:
        Path(destination).write_bytes(data)
    return data

def safe_member(name):
    if not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe ZIP path')
    parts = tuple(name.split('/'))
    if '/'.join(PurePosixPath(name).parts) != name:
        raise ValueError('Noncanonical ZIP path')
    for part in parts:
        if part in ('', '.', '..') or re.search(r'[\x00-\x1f\x7f<>:"|?*]', part) or part.endswith((' ', '.')) or re.match(r'^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)', part, re.I):
            raise ValueError('Unsafe ZIP component')
    return parts

def inspect_archive(path, expected, destination):
    payload = path.read_bytes()
    if len(payload) != expected['bytes'] or hashlib.sha256(payload).hexdigest() != expected['sha256']:
        raise ValueError('Published archive byte identity differs')
    destination.mkdir(parents=True, exist_ok=False)
    names, canonical, total = set(), set(), 0
    with zipfile.ZipFile(path) as z:
        regular = [x for x in z.infolist() if not x.is_dir()]
        if len(regular) != expected['files'] or len(z.infolist()) > 4000:
            raise ValueError('Published ZIP file inventory differs')
        for item in z.infolist():
            parts = safe_member(item.filename.rstrip('/'))
            if parts[0] != expected['root'] or item.flag_bits & 1:
                raise ValueError('ZIP root or encryption is unsupported')
            kind = stat.S_IFMT(item.external_attr >> 16)
            if kind not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise ValueError('ZIP contains an unsupported filesystem entry')
            if (kind == stat.S_IFDIR and not item.is_dir()) or (kind == stat.S_IFREG and item.is_dir()):
                raise ValueError('ZIP entry mode disagrees with its path')
            folded = unicodedata.normalize('NFC', item.filename.rstrip('/')).casefold()
            if item.filename in names or folded in canonical:
                raise ValueError('Duplicate ZIP name or case collision')
            names.add(item.filename)
            canonical.add(folded)
            total += item.file_size
            if total > expected['uncompressed_bytes']:
                raise ValueError('ZIP expansion exceeds the reviewed total')
        if total != expected['uncompressed_bytes'] or z.testzip() is not None:
            raise ValueError('ZIP expansion or CRC differs')
        for item in regular:
            target = destination.joinpath(*safe_member(item.filename))
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as out:
                out.write(z.read(item))
    root = destination / expected['root']
    manifest = (root / 'SHA256SUMS.txt').read_bytes()
    if (root / 'PACKAGE_ID.txt').read_text() != hashlib.sha256(manifest).hexdigest() + '\n' or hashlib.sha256(manifest).hexdigest() != expected['package_id']:
        raise ValueError('Published profile identity differs')
    return {'name': expected['name'], 'bytes': len(payload), 'sha256': expected['sha256'], 'files': len(regular), 'package_id': expected['package_id'], 'extracted_root': str(root), 'zip_crc_pass': True}

def run(config, work, report):
    result = {'schema': 'webtech-local3-hosted-public-inputs/v1', 'status': 'FAIL_PUBLIC_INPUTS', 'attempts_per_url': 1, 'rows': [], 'qualificationVerdict': 'NOT_FINAL', 'qualificationGatesUpdated': False}
    try:
        work.mkdir(parents=True, exist_ok=False)
        release = json.loads(fetch(config['release_api_url'], 250000))
        tag = json.loads(fetch(config['tag_api_url'], 20000))
        if release['id'] != config['release_id'] or release['draft'] or not release['prerelease'] or release['tag_name'] != config['tag']:
            raise ValueError('Existing published prerelease identity differs')
        if tag['object']['type'] != 'commit' or tag['object']['sha'] != config['build_commit']:
            raise ValueError('Existing build tag target differs')
        actual = {a['name']: a for a in release['assets']}
        if len(release['assets']) != len(config['assets']) or len(actual) != len(config['assets']) or set(actual) != {a['name'] for a in config['assets']}:
            raise ValueError('Existing eight-asset inventory differs')
        for a in config['assets']:
            live = actual[a['name']]
            if any(live[k] != a[k] for k in ('id', 'name', 'size', 'digest', 'browser_download_url')) or live['state'] != 'uploaded':
                raise ValueError('Published asset metadata differs: ' + a['name'])
        (work / 'observed_release.json').write_text(json.dumps(release, indent=2) + '\n')
        (work / 'observed_tag.json').write_text(json.dumps(tag, indent=2) + '\n')
        for profile in config['profiles']:
            archive = work / profile['name']
            fetch(profile['url'], profile['bytes'], archive)
            result['rows'].append(inspect_archive(archive, profile, work / profile['profile']))
        result['status'] = 'PASS_EXACT_PUBLISHED_INPUTS'
        return_code = 0
    except Exception as error:
        result['error'] = {'type': type(error).__name__, 'message': str(error)}
        return_code = 2
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(result, indent=2) + '\n')
    print(result['status'])
    return return_code

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if not args.work.is_absolute() or not args.report.is_absolute():
        parser.error('Work and report paths must be absolute')
    sys.exit(run(json.loads((HERE / 'PUBLISHED_INPUTS.json').read_text()), args.work, args.report))
