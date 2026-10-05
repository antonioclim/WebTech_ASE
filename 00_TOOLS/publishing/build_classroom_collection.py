#!/usr/bin/env python3
"""Build a separate classroom wrapper while preserving sealed teaching units."""
from __future__ import annotations

import argparse
import html
import json
import posixpath
import re
import sys
from pathlib import Path
from urllib.parse import quote

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/qa'))
import build_student_collection as source_builder
import release_contract as rc
import student_release as student
import validate_pages_payload as pages

VERSION = '3.0.0-rc.7'
COLLECTION_ROOT = 'WEBTECH_ASE_EN_GB_CLASSROOM_RC7/'
POLICY = 'metadata/classroom-release-policy.json'
TEMPLATE = '00_START_HERE/STUDENT_CLASSROOM_RC7'
STATUS = 'FILTERED_CLASSROOM_PRERELEASE_NOT_FINAL'
SOURCE_COMMIT = 'cab9751b6af7ddc6d73961e7768db7c300c72434'
SOURCE_MATERIAL = '5c9d9a2aa07fe0eccc03239940a1cfbd895d07b906c9b99cfcd5188e4d464ec4'


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def page(title, content, home):
    style = 'body{font:17px/1.55 system-ui;color:#172a3b;background:#f5f8fb;margin:0}main{max-width:1050px;margin:24px auto;padding:24px;background:white}h1{line-height:1.2}a{color:#064b83}a:focus-visible{outline:3px solid #bd5900;outline-offset:3px}p,li,code{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bccbd8;padding:10px;text-align:left;vertical-align:top}.notice{padding:15px;background:#fff3db;border-left:4px solid #a35a00}code,pre{font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}nav{margin-bottom:20px}@media(max-width:600px){main{margin:0;padding:15px}td,th{padding:6px}}'
    return ('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + html.escape(title) + '</title><style>' + style + '</style></head><body><main><nav><a href="' + html.escape(home, quote=True) + '">Collection home</a></nav><h1>' + html.escape(title) + '</h1>' + content + '</main></body></html>').encode()


def link(path, label):
    return '<a href="' + html.escape(path, quote=True) + '">' + html.escape(label) + '</a>'


def read_policy():
    policy = rc.strict_json(rc.checked_path(ROOT, POLICY).read_bytes())
    expected = {
        'schema': 'webtech-classroom-filter-policy/v1',
        'distribution_version': VERSION,
        'source_material_commit': SOURCE_COMMIT,
        'source_material_sha256': SOURCE_MATERIAL,
        'object_ids': sorted(rc.OBJECTS),
        'course_policy': 'WHOLE_AUTHENTIC_OBJECT_UNCHANGED',
        'setup_policy': 'WHOLE_AUTHENTIC_OBJECT_UNCHANGED',
        'seminar_policy': 'ALL_CLASSROOM_RC6_BYTES_UNCHANGED_WITH_EXPLICIT_REFERENCE_NOTICES',
        'expected_preserved_source_files': 1156,
        'expected_classroom_source_files': 266,
        'expected_microprojects': 40,
        'expected_editable_files': 38,
        'expected_retained_docx': 30,
        'reference_notices': 'MANUAL_PINNED_SOURCE_LINK_AND_CURRENT_CLASSROOM_RETURN',
        'final_acceptance': False
    }
    if not isinstance(policy, dict) or policy != expected:
        raise ValueError('Classroom filter policy differs from the reviewed policy')
    return policy


def notice(name, obj, scope, kind):
    prefix = obj['collection_payload_root']
    legacy = scope[kind]
    original = obj['projection'] + '/' + legacy
    source_url = 'https://github.com/antonioclim/WebTech_ASE/blob/' + SOURCE_COMMIT + '/' + quote(original, safe='/')
    rel = lambda target: posixpath.relpath(prefix + target, posixpath.dirname(name))
    content = '<p class="notice">This is a reference notice, not an editable evidence form or a full-application lesson. The original full-project route is retained in the source repository and is outside this classroom archive.</p>'
    content += '<p>For the current individual classroom assignment, use ' + link(rel('CLASSROOM_RC6/START.html'), 'the classroom start') + ' and ' + link(rel('CLASSROOM_RC6/EVIDENCE_FORM.html'), 'the current classroom evidence form') + '.</p>'
    content += '<p>' + link(source_url, 'View the exact retained original in the source repository') + '. This optional online reference has its original fields and completion requirements. Completing the bounded classroom projects does not complete that separate contract.</p>'
    return page(obj['object_id'] + ' — original full-project reference', content, posixpath.relpath('index.html', posixpath.dirname(name)))


def seminar_entry(obj, scope, package_id):
    prefix = obj['collection_payload_root']
    content = '<p class="notice">Work individually on every listed classroom microproject. The retained original full applications are separate optional references. The course and seminar teaching units retain their original inner versions; this archive is the new filtered RC7 wrapper.</p>'
    content += '<ol><li>' + link('../' + prefix + 'CLASSROOM_RC6/START.html', 'Open the classroom start') + '.</li><li>' + link('../' + prefix + 'CLASSROOM_RC6/GUIDE.html', 'Follow the step-by-step classroom guide') + '.</li><li>' + link('../' + prefix + 'CLASSROOM_RC6/EVIDENCE_FORM.html', 'Record your own evidence and save one reviewed PDF') + '.</li></ol>'
    content += '<h2>Package identity for your record</h2><p>Use this filtered seminar identity, also saved in ' + link('../' + prefix + 'PACKAGE_ID.txt', 'PACKAGE_ID.txt') + '. SOURCE_PACKAGE_ID.txt is provenance for the original full package and is not the identity of this filtered seminar.</p><pre>' + html.escape(package_id) + '</pre><h2>Required individual projects</h2><table><thead><tr><th>Project</th><th>Work to complete</th><th>Editable file</th></tr></thead><tbody>'
    for project in scope['projects']:
        content += '<tr><td>' + html.escape(project['id'] + ': ' + project['title']) + '</td><td>' + html.escape(project['completeScope']) + '</td><td><code>' + html.escape(project['editable_path']) + '</code></td></tr>'
    content += '</tbody></table><h2>Verify before editing</h2><p>From the fully extracted collection root, run <code>node VERIFY_COLLECTION.mjs</code>. Then follow this seminar guide. After editing your declared target files or installing dependencies, use <code>node VERIFY_COLLECTION.mjs --allow-student-edits</code> to check the protected files. Neither result is a project grade.</p>'
    if obj['object_id'] in ('S03', 'S06'):
        content += '<p>Use the commands documented in this classroom guide. This package does not include the optional kit <code>serve</code> command implementation; do not invoke it.</p>'
    content += '<p>Record actual outcomes, including blocked or unexecuted work. A sample or synthetic fixture is not your evidence. The planned 60-minute schedule has not been validated by a cohort pilot.</p>'
    return page(obj['object_id'] + ' — individual classroom route', content, '../index.html')


def unit_entry(obj):
    prefix = obj['collection_payload_root']
    guide = '../' + prefix + obj['student_guide']
    start = '../' + prefix + obj['student_start']
    content = '<p>This complete teaching unit is copied without changes from the authenticated RC6 selection. Its original package identity and package-specific verification commands remain intact.</p><ol><li>' + link(start, 'Read the unit start instructions') + '.</li><li>' + link(guide, 'Open the course presentation or setup guide') + '.</li></ol>'
    content += '<p>Use the HTML route for normal navigation. Any Word handout is an optional reference format; Microsoft Word layout, native macOS behaviour and institutional submission are not certified by this prerelease.</p>'
    return page(obj['object_id'] + ' — teaching unit', content, '../index.html')


def build_payload(check_source=True):
    policy = read_policy()
    source_id = rc.source_identity(ROOT) if check_source else (ROOT / 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt').read_text().strip()
    registry = student.read_registry()
    full = source_builder.build_payload(check_source=False)
    if rc.sha(rc.zip_bytes(full, source_builder.COLLECTION_ROOT)) != SOURCE_MATERIAL:
        raise ValueError('Original RC6 material differs from the frozen authenticated archive')
    payload = {name:path.read_bytes() for name,path in rc.tree_files(ROOT / TEMPLATE).items()}
    source_records, objects, editable, notices, generated_dirs = [], [], [], [], {'STUDENT_EVIDENCE'}
    protected_count = project_count = 0
    for obj in registry['objects']:
        ident, prefix = obj['object_id'], obj['collection_payload_root']
        rc.safe_name(prefix[:-1])
        source_files = {name[len(prefix):]:data for name,data in full.items() if name.startswith(prefix)}
        if not source_files:
            raise ValueError('Empty source object: ' + ident)
        seminar = bool(re.fullmatch(r'S\d{2}', ident))
        selected = {name:data for name,data in source_files.items() if not seminar or name.startswith('CLASSROOM_RC6/')}
        for name, data in selected.items():
            path = prefix + name
            if path in payload:
                raise ValueError('Filter/template collision: ' + path)
            payload[path] = data
            source_records.append({'path':path, 'sha256':rc.sha(data), 'bytes':len(data)})
            if name.endswith('/package.json') or name == 'package.json':
                parent = posixpath.dirname(path)
                generated_dirs.add(posixpath.join(parent, 'node_modules'))
                scripts = rc.strict_json(data).get('scripts', {})
                if any(isinstance(value, str) and re.search(r'(?:^|[\s;&|])vite(?:[\s;&|]|$)', value) for value in scripts.values()):
                    generated_dirs.update({parent + '/dist', parent + '/.vite'})
        record = {'object_id':ident, 'payload_root':prefix, 'source_carrier_version':obj['carrier_version'], 'source_archive_sha256':obj['archive_sha256'], 'source_package_id':obj['package_id'], 'source_files_preserved':len(selected), 'entry':'ENTRY/' + ident + '.html', 'preservation':'CLASSROOM_SUBSET_NEW_IDENTITY' if seminar else 'WHOLE_OBJECT_EXACT_BYTES_ORIGINAL_IDENTITY'}
        if seminar:
            scope = rc.strict_json(selected['CLASSROOM_RC6/CLASSROOM_SCOPE.json'])
            if scope['seminar'] != ident or scope['classroom_version'] != '1.0.0-rc.6':
                raise ValueError('Classroom inner identity differs')
            protected_count += len(selected)
            project_count += len(scope['projects'])
            record['projects'] = scope['projects']
            record['start'] = prefix + 'CLASSROOM_RC6/START.html'
            record['guide'] = prefix + 'CLASSROOM_RC6/GUIDE.html'
            record['form'] = prefix + 'CLASSROOM_RC6/EVIDENCE_FORM.html'
            for project in scope['projects']:
                path = prefix + project['editable_path']
                if path not in payload:
                    raise ValueError('Declared student target is absent')
                editable.append(path)
            for kind in ('legacy_form', 'legacy_guide'):
                legacy = scope[kind]
                rc.safe_name(legacy)
                if legacy not in source_files or not legacy.lower().endswith('.html'):
                    raise ValueError('Expected retained source reference differs')
                name = prefix + legacy
                if name in payload:
                    raise ValueError('A reference notice would replace classroom source')
                payload[name] = notice(name, obj, scope, kind)
                notices.append({'path':name,'kind':kind,'original_source_sha256':rc.sha(source_files[legacy]),'object_id':ident})
            payload[prefix + 'SOURCE_PACKAGE_ID.txt'] = (obj['package_id'] + '\n').encode()
            payload[prefix + 'SOURCE_PROVENANCE.json'] = encoded({'schema':'webtech-filtered-seminar-source/v1','source_material_sha256':SOURCE_MATERIAL,'source_material_commit':SOURCE_COMMIT,'source_object_id':ident,'source_archive_sha256':obj['archive_sha256'],'source_package_id':obj['package_id'],'classroom_inner_version':'1.0.0-rc.6','original_full_package_bundled':False})
            package_files = {name[len(prefix):]:data for name,data in payload.items() if name.startswith(prefix)}
            manifest = rc.manifest(package_files)
            package_id = rc.sha(manifest)
            payload[prefix + 'SHA256SUMS.txt'] = manifest
            payload[prefix + 'PACKAGE_ID.txt'] = (package_id + '\n').encode()
            record['package_id_path'], record['package_id'] = prefix + 'PACKAGE_ID.txt', package_id
            payload[record['entry']] = seminar_entry(obj, scope, package_id)
        else:
            record['start'] = prefix + obj['student_start']
            record['guide'] = prefix + obj['student_guide']
            record['form'] = prefix + obj['student_form'] if obj.get('student_form') else None
            record['package_id_path'], record['package_id'] = prefix + obj['package_id_path'], obj['package_id']
            payload[record['entry']] = unit_entry(obj)
        objects.append(record)
    editable = sorted(set(editable))
    source_records.sort(key=lambda item:item['path'])
    if len(source_records) != 1156 or protected_count != 266 or project_count != 40 or len(editable) != 38 or len(notices) != 28:
        raise ValueError('Reviewed selection counts differ')
    if sum(name.lower().endswith('.docx') for name in payload) != 30:
        raise ValueError('Optional Word reference inventory differs')
    payload['PRESERVED_SOURCE_FILES.json'] = encoded({'schema':'webtech-preserved-classroom-source-files/v1','source_material_sha256':SOURCE_MATERIAL,'files':source_records})
    payload['REFERENCE_NOTICES.json'] = encoded({'schema':'webtech-classroom-reference-notices/v1','source_material_commit':SOURCE_COMMIT,'notices':notices})
    metadata = {'schema':'webtech-classroom-collection/v1','status':STATUS,'distribution_version':VERSION,'classroom_inner_version':'1.0.0-rc.6','source_material_sha256':SOURCE_MATERIAL,'source_material_commit':SOURCE_COMMIT,'selection_registry_sha256':rc.sha(student.REGISTRY.read_bytes()),'policy_sha256':rc.sha((ROOT/POLICY).read_bytes()),'repository_package_id':source_id,'objects':sorted(objects,key=lambda item:item['object_id']),'editable_files':editable,'generated_directories':sorted(generated_dirs),'source_files_preserved':len(source_records),'classroom_source_files_preserved':protected_count,'required_microprojects':project_count,'optional_docx_references':30,'qualificationVerdict':'NOT_FINAL','qualificationGates':{name:'pending' for name in rc.GATES},'native_acceptance':False,'publication_qualified':False,'transfer_scope':'Identical classroom source bytes retain their existing bounded RC6 evidence. New entry pages, reference notice targets, generated controls and new package IDs are not certified by that previous browser run.'}
    payload['CLASSROOM_COLLECTION.json'] = encoded(metadata)
    objects_by_id = {obj['object_id']:obj for obj in objects}
    rows = []
    for week in range(1,15):
        rows.append('<tr><td>' + str(week) + '</td><td>' + link(objects_by_id[f'C{week:02}']['entry'],'Course ' + str(week)) + '</td><td>' + link(objects_by_id[f'S{week:02}']['entry'],'Seminar ' + str(week)) + '</td></tr>')
    body = '<p class="notice">Filtered classroom prerelease ' + VERSION + '. Extract the whole archive before opening files. Follow the current seminar route and complete every listed microproject individually. The original full seminar applications are reference material outside this archive.</p><p>' + link('START_HERE.html','First-time setup and verification') + ' · ' + link('QUALIFICATION.html','What has and has not been verified') + '</p><table><thead><tr><th>Week</th><th>Course</th><th>Individual seminar</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table><h2>Setup</h2><p>' + link(objects_by_id['SETUP_WINDOWS']['entry'],'Windows setup') + ' · ' + link(objects_by_id['SETUP_MACOS_LINUX']['entry'],'macOS/Linux setup') + '</p>'
    payload['index.html'] = page('Web Technologies — classroom collection', body, 'index.html')
    payload['COURSE_PLAN.html'] = page('Fourteen-week course and seminar route', body, 'index.html')
    pages.check_links(payload)
    rc.namespace([(name,False) for name in payload])
    payload['SHA256SUMS.txt'] = rc.manifest(payload)
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    return payload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip')
    parser.add_argument('--site')
    parser.add_argument('--report')
    args = parser.parse_args()
    if not args.zip and not args.site:
        raise ValueError('Choose ZIP or extracted-tree output')
    paths = [rc.output_path(value) for value in (args.zip,args.site,args.report) if value]
    if any(a==b or a.is_relative_to(b) or b.is_relative_to(a) for i,a in enumerate(paths) for b in paths[i+1:]):
        raise ValueError('Overlapping output paths')
    payload = build_payload()
    report = {'schema':'webtech-classroom-build/v1','status':'PASS_SCOPED_BUILD_ONLY','files':len(payload),'distribution_version':VERSION,'package_id':payload['PACKAGE_ID.txt'].decode().strip(),'qualificationVerdict':'NOT_FINAL','native_acceptance':False,'outputs':[]}
    if args.zip:
        output = rc.output_path(args.zip)
        data = rc.zip_bytes(payload,COLLECTION_ROOT)
        rc.atomic_write(output,data)
        report['outputs'].append({'path':str(output),'bytes':len(data),'sha256':rc.sha(data)})
    if args.site:
        output = rc.output_path(args.site)
        rc.write_tree(output,payload)
        report['outputs'].append({'path':str(output),'files':len(payload)})
    data = encoded(report)
    if args.report:
        rc.atomic_write(rc.output_path(args.report),data)
    print(data.decode(),end='')


if __name__ == '__main__':
    try:
        main()
    except (ValueError,OSError,KeyError,TypeError) as error:
        raise SystemExit('STOP: ' + str(error))
