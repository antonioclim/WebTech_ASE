#!/usr/bin/env python3
"""Build a publication candidate derivative from the exact frozen RC10 archive.

This is a separate, explicit derivation policy. It does not amend or call the
historical documentary-only RC10 generator, publish anything or start Actions.
Python 3.10+ and the standard library are sufficient.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import zipfile

from candidate_pages import generate_candidate_pages, annotate_form
from entry_rebind_helper import rebind_entry

VERSION = '3.0.0-rc.10-local.2'
SOURCE_SHA = 'a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9'
SOURCE_ID = '1ae203d4bba59319b00406852fd36d283b17baea76bb905dbc7d7ae050a31156'
SOURCE_SIZE = 4357345
PATCH_MANIFEST_SHA = '03bf3f228df761b94a665ce78df60846f25233773968cb8f10544f49b59d3fe1'
CORE_ZIP = 'WEBTECH_ASE_LOCAL2_CLASSROOM.zip'
SITE_ZIP = 'WEBTECH_ASE_LOCAL2_STATIC.zip'
ROOT_CONTROLS = {'SHA256SUMS.txt', 'PACKAGE_ID.txt'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def safe(name):
    if not name or '\\' in name or name.startswith('/'):
        raise ValueError('Unsafe path: ' + name)
    if any(x in ('', '.', '..') or re.search(r'[\x00-\x1f\x7f<>:"|?*]', x)
           or x.endswith((' ', '.')) for x in name.split('/')):
        raise ValueError('Unsafe path: ' + name)
    return name


def manifest(files, excluded):
    return ''.join(sha(data) + '  ' + name + '\n'
                   for name, data in sorted(files.items()) if name not in excluded).encode()


def seal(files, identity='PACKAGE_ID.txt', sums='SHA256SUMS.txt', include_identity=False):
    files[identity] = (sha(manifest(files, {identity, sums})) + '\n').encode()
    files[sums] = manifest(files, {sums} if include_identity else {identity, sums})


def authenticate_source(source_zip):
    data = source_zip.read_bytes()
    if len(data) != SOURCE_SIZE or sha(data) != SOURCE_SHA:
        raise ValueError('Input is not the complete authenticated published RC10 archive')
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        if z.testzip() is not None:
            raise ValueError('Source ZIP CRC error')
        names = [n for n in z.namelist() if not n.endswith('/')]
        if len(names) != len(set(names)) or len({n.casefold() for n in names}) != len(names):
            raise ValueError('Source ZIP path collision')
        roots = {safe(n).split('/')[0] for n in names}
        if roots != {'WEBTECH_ASE_EN_GB_CLASSROOM_RC10'}:
            raise ValueError('Unexpected source archive root')
        files = {n.split('/', 1)[1]: z.read(n) for n in names}
    if files['PACKAGE_ID.txt'] != (SOURCE_ID + '\n').encode():
        raise ValueError('Frozen collection identity mismatch')
    verify_outer(files)
    if len(files) != 1452:
        raise ValueError('Source inventory mismatch')
    return files


def verify_outer(files):
    expected = manifest(files, ROOT_CONTROLS)
    if files.get('SHA256SUMS.txt') != expected or files.get('PACKAGE_ID.txt') != (sha(expected) + '\n').encode():
        raise ValueError('Collection controls do not cover the exact file inventory')


def changed(before, after, excluded=()):
    return [{'path': n, 'before_sha256': sha(before[n]) if n in before else None,
             'after_sha256': sha(after[n]) if n in after else None,
             'before_bytes': len(before[n]) if n in before else None,
             'after_bytes': len(after[n]) if n in after else None}
            for n in sorted(set(before) | set(after))
            if n not in excluded and before.get(n) != after.get(n)]


def archive(files, root):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(root + '/' + safe(name), (2026, 10, 7, 0, 0, 0))
            info.create_system = 3
            info.external_attr = ((0o100755 if name.endswith('.sh') else 0o100644) << 16)
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return output.getvalue()


def build(source_zip, patch_dir):
    source = authenticate_source(source_zip)
    files = dict(source)
    patch_bytes = (patch_dir / 'PUBLIC_SOURCE_CORRECTIONS.json').read_bytes()
    if sha(patch_bytes) != PATCH_MANIFEST_SHA:
        raise ValueError('Reviewed corrections manifest identity mismatch')
    patches = json.loads(patch_bytes)
    records = [r for r in patches['patch_records'] if r['scope'] == 'PUBLIC_CLASSROOM_SOURCE']
    if len(records) != 28 or len({r['target_path'] for r in records}) != 28:
        raise ValueError('The reviewed 28-file patch allowlist differs')
    for r in records:
        name = safe(r['target_path'])
        data = (patch_dir / safe(r['payload_path'])).read_bytes()
        if (sha(source[name]) != r['old_sha256'] or len(source[name]) != r['old_bytes']
                or sha(data) != r['new_sha256'] or len(data) != r['new_bytes']):
            raise ValueError('A patch is not bound to the frozen source: ' + name)
        files[name] = data

    original = json.loads(source['CLASSROOM_COLLECTION.json'])
    meta = copy.deepcopy(original)
    policy = {'schema': 'webtech-local-executable-derivation-policy/v1',
        'candidate_version': VERSION, 'publication_status': 'PUBLICATION_NOT_ASSERTED',
        'published_rc10_zip_sha256': SOURCE_SHA, 'published_rc10_package_id': SOURCE_ID,
        'corrections_manifest_sha256': sha(patch_bytes), 'source_patch_records': records,
        'additional_allowed_operations': ['Display-only local provenance notices outside the screen-only main element in the 14 evidence forms, visible also when printing; exactly three identity display strings may be reworded: STUDENT_LABELS.packageId, the printable packageId label and the released-package validation hint; all contract metadata and functional script logic remain exact patched bytes',
            'Reseal protected classroom boundary and source-manifest hashes without changing mutable targets or allowlists',
            'New local unit descriptors and readmes for the 15 affected units',
            'Rebind the collection verifier single distribution-version literal; all integrity semantics remain unchanged',
            'Rebind ENTRY identities and provenance labels; keep instructional routes',
            'Regenerate collection pages, metadata, preservation records and collection controls',
            'Derive a separate static reading profile with a hidden .nojekyll marker and scope record'],
        'forbidden_operations': ['Student answer, contract, lockfile or canonical example edits beyond the exact reviewed patch list',
            'Changing published RC9 or RC10 assets, tags, releases or their historical generator policies',
            'Automatic publication by this builder, inclusion of private evidence or starting/rerunning/cancelling GitHub Actions by this builder'],
        'qualificationVerdict': 'NOT_FINAL', 'student_answers_supplied': False, 'final_acceptance': False}
    files['LOCAL_DERIVATION_POLICY.json'] = encoded(policy)
    recipe = {p.name: sha(p.read_bytes()) for p in sorted(Path(__file__).parent.glob('*.py'))}
    local_source_id = sha(encoded({'recipe_files': recipe, 'policy_sha256': sha(files['LOCAL_DERIVATION_POLICY.json']),
                                  'published_source_sha256': SOURCE_SHA, 'patch_manifest_sha256': sha(patch_bytes)}))
    files['PROVENANCE/PUBLISHED_RC10.json'] = encoded({'schema': 'webtech-published-predecessor/v1',
        'scope': 'HISTORICAL_INPUT_ONLY_NOT_A_PUBLICATION_RECEIPT_FOR_THIS_LOCAL_CANDIDATE',
        'repository': 'antonioclim/WebTech_ASE', 'tag': 'classroom-en-gb-v3.0.0-rc.10',
        'asset_id': 616617532, 'asset_name': 'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip', 'asset_bytes': SOURCE_SIZE,
        'asset_sha256': SOURCE_SHA, 'collection_package_id': SOURCE_ID,
        'repository_package_id': original['repository_package_id']})
    for n in ('PRESERVED_SOURCE_FILES.json', 'CLASSROOM_COLLECTION.json'):
        files['PROVENANCE/HISTORICAL/' + n] = source[n]

    affected = {r['target_path'].split('/')[1] for r in records if r['target_path'].startswith('PACKAGES/')}
    if affected != {'C02'} | {f'S{i:02}' for i in range(1, 15)}:
        raise ValueError('Affected object set differs from reviewed scope')
    old_ids = {o['object_id']: o['package_id'] for o in original['objects']}
    entry_meta = {'candidate_version': VERSION, 'qualification_verdict': 'NOT_FINAL', 'units': {}}
    derived = []
    for obj in meta['objects']:
        ident, prefix = obj['object_id'], obj['payload_root']
        before = {n[len(prefix):]: d for n, d in source.items() if n.startswith(prefix)}
        unit = {n[len(prefix):]: d for n, d in files.items() if n.startswith(prefix)}
        identity = obj['package_id_path'][len(prefix):]
        obj['published_rc10_package_id'] = obj['package_id']
        if ident in affected:
            if ident.startswith('S'):
                form = 'CLASSROOM_RC6/EVIDENCE_FORM.html'
                unit[form] = annotate_form(unit[form].decode(), version=VERSION).encode()
                base = 'CLASSROOM_RC6/'
                boundary = json.loads(unit[base + 'CLASSROOM_BOUNDARY.json'])
                for name in boundary['protected']:
                    boundary['protected'][name] = sha(unit[base + name])
                unit[base + 'CLASSROOM_BOUNDARY.json'] = encoded(boundary)
                if base + 'SOURCE_MANIFEST.json' in unit:
                    inner = json.loads(unit[base + 'SOURCE_MANIFEST.json'])
                    for name in inner['protected']:
                        inner['protected'][name] = sha(unit[base + name])
                    unit[base + 'SOURCE_MANIFEST.json'] = encoded(inner)
            unit['LOCAL_CANDIDATE_README.txt'] = (
                ident + ' — publication candidate ' + VERSION + '\n\n'
                'This unit contains explicitly reviewed runtime or interface corrections. '
                'Read LOCAL_CANDIDATE_DERIVATION.json for its changes and use ' + identity + ' for current bytes. '
                'Preserved RC10_README.md, RC10_DERIVATION.json and older descriptors describe historical bytes; '
                'their unchanged-runtime claims do not cover this local derivative. '
                'Contracts, incomplete learner targets and dependency locks remain exact. '
                'The inner RC6 evidence schema is retained so previous private drafts can still be imported. '
                'An imported old package ID remains historical: only observations actually made against this '
                'candidate may name its current unit identity. No student answers are supplied. '
                'General qualification remains NOT_FINAL. Build metadata describes derivation, not deployment. Use an owner publication receipt to identify actual published bytes.\n').encode()
            sums = '06_AUDIT/SHA256SUMS.txt' if ident == 'C02' else 'SHA256SUMS.txt'
            descriptor = {'schema': 'webtech-local-unit-derivation/v1', 'object_id': ident,
                'candidate_version': VERSION, 'publication_status': 'PUBLICATION_NOT_ASSERTED',
                'predecessor_package_id': old_ids[ident], 'predecessor_zip_sha256': SOURCE_SHA,
                'changed_files_before_descriptor_and_package_controls': changed(before, unit, {identity, sums}),
                'identity_path': identity, 'qualificationVerdict': 'NOT_FINAL',
                'student_answers_supplied': False, 'final_acceptance': False}
            unit['LOCAL_CANDIDATE_DERIVATION.json'] = encoded(descriptor)
            seal(unit, identity, sums, ident == 'C02')
            files.update({prefix + n: d for n, d in unit.items()})
            readme_path = prefix + 'LOCAL_CANDIDATE_README.txt'
            descriptor_path = prefix + 'LOCAL_CANDIDATE_DERIVATION.json'
            obj.update(package_id=unit[identity].decode().strip(), distribution_carrier_version=VERSION,
                       preservation='EXPLICIT_LOCAL_EXECUTABLE_DERIVATIVE_AUTHENTICATED_PUBLISHED_RC10',
                       historical_derivation=obj.get('derivation'), derivation=descriptor_path)
            derived.append({'object_id': ident, 'descriptor': descriptor_path,
                            'changed_files': changed(before, unit)})
        else:
            readme_path = 'PROVENANCE/UNITS/' + ident + '.txt'
            descriptor_path = 'PROVENANCE/UNITS/' + ident + '.json'
            files[readme_path] = (ident + ': every unit payload byte and its existing identity remain '
                'exact published RC10 bytes. Its inclusion in the local collection does not qualify '
                'native use or teaching outcomes. General qualification remains NOT_FINAL.\n').encode()
            files[descriptor_path] = encoded({'schema': 'webtech-local-exact-unit-transfer/v1',
                'object_id': ident, 'candidate_collection_version': VERSION, 'unit_bytes_changed': False,
                'predecessor_and_current_package_id': old_ids[ident], 'predecessor_zip_sha256': SOURCE_SHA,
                'qualificationVerdict': 'NOT_FINAL'})
            obj['local_transfer_descriptor'] = descriptor_path
        entry_meta['units'][ident] = {'package_id_path': obj['package_id_path'],
            'candidate_readme_path': readme_path, 'candidate_derivation_path': descriptor_path}
    new_ids = {o['object_id']: o['package_id'] for o in meta['objects']}
    entry_audits = []
    for obj in meta['objects']:
        name = obj['entry']
        text, audit = rebind_entry(source[name].decode(), obj['object_id'], old_ids, new_ids, entry_meta)
        files[name] = text.encode()
        entry_audits.append(audit)
    files['LOCAL_ENTRY_REBINDING.json'] = encoded(entry_audits)
    verifier = source['VERIFY_COLLECTION.mjs']
    if verifier.count(b"'3.0.0-rc.10'") != 1:
        raise ValueError('Collection verifier version anchor differs')
    files['VERIFY_COLLECTION.mjs'] = verifier.replace(b"'3.0.0-rc.10'", ("'" + VERSION + "'").encode())
    course_map = json.loads(files['course-map.json'])
    course_map['distribution_version'] = VERSION
    files['course-map.json'] = encoded(course_map)
    original_preserved = json.loads(source['PRESERVED_SOURCE_FILES.json'])
    preserved = [r for r in original_preserved['files'] if files.get(r['path']) == source[r['path']]]
    files['PRESERVED_SOURCE_FILES.json'] = encoded({'schema': 'webtech-preserved-classroom-source-files/v2',
        'source_material_sha256': original_preserved['source_material_sha256'], 'files': preserved,
        'changed_files': 'LOCAL_CANDIDATE_DERIVATION.json',
        'claim': 'Only the listed original-source files retain exact current bytes. Historical preservation registers are provenance, not current-byte claims.'})
    for obj in meta['objects']:
        obj['source_files_preserved'] = sum(r['path'].startswith(obj['payload_root']) for r in preserved)
    meta.update(distribution_version=VERSION, status='LOCAL_EXECUTABLE_CORRECTIONS_CANDIDATE_NOT_FINAL',
        candidate_archive_name=CORE_ZIP,
        publication_status='PUBLICATION_NOT_ASSERTED', local_build_source_id=local_source_id,
        repository_package_id_scope='HISTORICAL_PUBLISHED_RC10_SOURCE_ONLY_NOT_A_NEW_REPOSITORY_SEAL',
        local_recipe_file_sha256=recipe, policy_sha256=sha(files['LOCAL_DERIVATION_POLICY.json']),
        predecessor_zip_sha256=SOURCE_SHA, predecessor_package_id=SOURCE_ID,
        source_files_preserved=len(preserved), classroom_source_files_preserved=sum('/CLASSROOM_RC6/' in r['path'] for r in preserved),
        derived_objects=derived, historical_derived_objects='PROVENANCE/HISTORICAL/CLASSROOM_COLLECTION.json',
        transfer_scope='Only exact listed bytes retain their historical bounded evidence. Runtime/interface changes require their own scoped receipts; all broad gates remain pending.')
    files['CLASSROOM_COLLECTION.json'] = encoded(meta)
    originals = {n: source[n].decode() for n in ('index.html', 'START_HERE.html', 'QUALIFICATION.html', 'COURSE_PLAN.html', 'ASSESSMENT.html', 'README.md')}
    files.update({n: t.encode() for n, t in generate_candidate_pages(meta, version=VERSION, original_pages=originals).items()})
    files['PRESERVED_RC10_FILES.json'] = encoded({'schema': 'webtech-preserved-published-rc10-files/v1',
        'predecessor_zip_sha256': SOURCE_SHA, 'predecessor_package_id': SOURCE_ID,
        'files': [{'path': n, 'sha256': sha(d), 'bytes': len(d)} for n, d in sorted(source.items())
                  if n not in ROOT_CONTROLS and files.get(n) == d]})
    files['LOCAL_CANDIDATE_DERIVATION.json'] = encoded({'schema': 'webtech-local-collection-derivation/v1',
        'candidate_version': VERSION, 'predecessor_zip_sha256': SOURCE_SHA,
        'predecessor_package_id': SOURCE_ID, 'local_build_source_id': local_source_id,
        'changes_before_descriptor_and_collection_controls': changed(source, files, ROOT_CONTROLS),
        'current_unit_ids': new_ids, 'affected_units': sorted(affected),
        'historical_registers': ['RC9_DERIVATIONS.json', 'RC10_DERIVATIONS.json', 'RC10_COLLECTION_DERIVATION.json', 'PRESERVED_RC9_FILES.json', 'PROVENANCE/HISTORICAL/PRESERVED_SOURCE_FILES.json'],
        'qualificationVerdict': 'NOT_FINAL', 'actions_started_by_builder': False, 'publications_made_by_builder': False})
    for name in original['editable_files']:
        if files[name] != source[name]:
            raise ValueError('Learner target changed: ' + name)
    for name in source:
        if name.endswith(('.docx', 'package-lock.json', '/contract.json', '/CLASSROOM_SCOPE.json')) and files[name] != source[name]:
            raise ValueError('Protected dependency, contract or Word bytes changed: ' + name)
    seal(files)
    verify_outer(files)

    site = dict(files)
    core_id = files['PACKAGE_ID.txt'].decode().strip()
    # Static pages guide readers towards the executable classroom archive.
    # The static ZIP is a distinct reading profile, not a second learner runtime.
    site.update({n: t.encode() for n, t in generate_candidate_pages(meta, version=VERSION, core_identity=core_id, profile='static', original_pages=originals).items()})
    site['.nojekyll'] = b''
    site['SITE_SCOPE.json'] = encoded({'schema': 'webtech-local-static-profile/v1',
        'profile': 'LOCAL_CANDIDATE_STATIC_READING_AND_NAVIGATION_ONLY', 'candidate_version': VERSION,
        'publication_status': 'PUBLICATION_NOT_ASSERTED', 'classroom_collection_package_id': core_id,
        'static_archive_filename': SITE_ZIP, 'derivation_record_scope': 'LOCAL_CANDIDATE_DERIVATION.json describes the matching classroom core; this SITE_SCOPE.json describes the separate static derivative',
        'classroom_archive_filename': CORE_ZIP, 'unit_bytes_policy': 'All 30 unit payloads are exact candidate classroom bytes',
        'actions_started_by_builder': False, 'publications_made_by_builder': False, 'qualificationVerdict': 'NOT_FINAL',
        'changed_reading_pages': changed(files, site, ROOT_CONTROLS),
        'scope': 'Reading and navigation only. Node runtimes, npm shells, evidence completion and native acceptance are not claimed by static hosting.'})
    seal(site)
    verify_outer(site)
    return files, site


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--source-zip', type=Path, required=True)
    ap.add_argument('--patch-dir', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    absolute = args.output.absolute()
    if any(p.is_symlink() for p in (absolute, *absolute.parents)):
        raise ValueError('Output path must not traverse a symlink')
    source_root = Path(__file__).resolve().parent.parents[2]
    args.output = absolute.resolve()
    if args.output == source_root or source_root in args.output.parents or args.output in source_root.parents:
        raise ValueError('Output must be outside the source tree and its ancestors')
    if args.output.exists() and any(args.output.iterdir()):
        raise ValueError('Output must be a new or empty directory')
    core, site = build(args.source_zip, args.patch_dir)
    args.output.mkdir(parents=True, exist_ok=True)
    summary = {'schema': 'webtech-local-candidate-build-receipt/v1', 'candidate_version': VERSION,
               'publication_status': 'PUBLICATION_NOT_ASSERTED', 'qualificationVerdict': 'NOT_FINAL',
               'original_zip_sha256': SOURCE_SHA, 'archives': [], 'actions_started_by_builder': False, 'publications_made_by_builder': False}
    for kind, files, zip_name, zip_root in [('core', core, CORE_ZIP, 'WEBTECH_LOCAL2'), ('static', site, SITE_ZIP, 'WEBTECH_LOCAL2_STATIC')]:
        for name, data in sorted(files.items()):
            p = args.output / kind / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data)
            p.chmod(0o755 if name.endswith('.sh') else 0o644)
        zipped = archive(files, zip_root)
        (args.output / zip_name).write_bytes(zipped)
        (args.output / (zip_name + '.sha256')).write_bytes((sha(zipped) + '  ' + zip_name + '\n').encode('utf-8'))
        summary['archives'].append({'profile': kind, 'filename': zip_name, 'bytes': len(zipped),
            'sha256': sha(zipped), 'package_id': files['PACKAGE_ID.txt'].decode().strip(), 'files': len(files), 'zip_root': zip_root})
    (args.output / 'BUILD_RECEIPT.json').write_bytes(encoded(summary))
    (args.output / 'ARCHIVE_SHA256SUMS.txt').write_bytes(''.join(r['sha256'] + '  ' + r['filename'] + '\n' for r in summary['archives']).encode('utf-8'))
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
