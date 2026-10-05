#!/usr/bin/env python3
"""Independent, bounded QA of the classroom-only successor distribution.

These checks execute local packaging controls and actual unchanged classroom
starters. They do not qualify Actions, native Windows/macOS, Microsoft Word,
Moodle, human workload or successful student project completion.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import posixpath
import re
import stat
import subprocess
import sys
import tempfile
import unittest
import warnings
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
sys.path.insert(0, str(REPO / '00_TOOLS/qa'))
import release_contract as rc
import student_release as student
import build_classroom_collection as builder

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
OBSERVATIONS = {}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {'href', 'src'} and value:
                self.urls.append((tag, key, value))


def html_targets(payload, names):
    """Resolve actual local HTML attributes, including Vite's served root."""
    checked = []
    external = []
    for name in names:
        parser = References()
        parser.feed(payload[name].decode('utf-8'))
        for tag, attribute, url in parser.urls:
            parts = urlsplit(url)
            if parts.scheme or parts.netloc:
                external.append({'source': name, 'url': url})
                continue
            if not parts.path:
                continue
            path = unquote(parts.path)
            if '\\' in path or '\x00' in path:
                raise ValueError('Unsafe HTML reference: ' + name + ' -> ' + url)
            if path.startswith('/'):
                if '/CLASSROOM_RC6/REACT/' in name:
                    base = name.split('/CLASSROOM_RC6/REACT/', 1)[0] + '/CLASSROOM_RC6/REACT'
                elif posixpath.dirname(name) + '/package.json' in payload:
                    # Authentic course Vite examples use root-relative module
                    # URLs when this example directory is the served root.
                    base = posixpath.dirname(name)
                    package = rc.strict_json(payload[base + '/package.json'])
                    if not any('vite' in value for value in package.get('scripts', {}).values()):
                        raise ValueError('Undeclared served-root HTML reference: ' + name + ' -> ' + url)
                else:
                    raise ValueError('Undeclared served-root HTML reference: ' + name + ' -> ' + url)
                target = posixpath.normpath(base + '/' + path.lstrip('/'))
            else:
                target = posixpath.normpath(posixpath.join(posixpath.dirname(name), path))
            rc.safe_name(target)
            if target not in payload:
                raise ValueError('Missing HTML target: ' + name + ' -> ' + url)
            checked.append({'source': name, 'attribute': attribute, 'target': target})
    return {'checked': checked, 'external_handoffs_not_executed': external}


class ClassroomCollection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        version = subprocess.run([NODE, '--version'], capture_output=True, text=True, timeout=10, check=True)
        if version.stdout.strip() != 'v24.21.0':
            raise ValueError('Exact reference Node v24.21.0 required; observed ' + version.stdout.strip())
        cls.payload = builder.build_payload(check_source=False)
        cls.registry = student.read_registry()
        cls.source = {o['object_id']: (o, student.verify_object(o)) for o in cls.registry['objects']}
        cls.classroots = {}
        for name, value in cls.payload.items():
            if name.endswith('/CLASSROOM_RC6/CLASSROOM_SCOPE.json'):
                data = rc.strict_json(value)
                ident = data['seminar']
                if ident in cls.classroots:
                    raise ValueError('Duplicate classroom scope: ' + ident)
                cls.classroots[ident] = name[:-len('CLASSROOM_RC6/CLASSROOM_SCOPE.json')]
        cls.temp = tempfile.TemporaryDirectory(prefix='webtech-rc7-independent-qa-')
        cls.root = Path(cls.temp.name) / 'extracted classroom collection with spaces'
        rc.write_tree(cls.root, cls.payload)
        cls.editable = sorted({cls.classroots[ident] + project['editable_path']
                               for ident in cls.classroots
                               for project in rc.strict_json(cls.payload[cls.classroots[ident] + 'CLASSROOM_RC6/CLASSROOM_SCOPE.json'])['projects']})
        OBSERVATIONS['reference_runtime'] = {'version': version.stdout.strip(), 'platform': sys.platform,
                                             'native_qualification': False}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def verifier(self, *arguments):
        result = subprocess.run([NODE, str(self.root / 'VERIFY_COLLECTION.mjs'), *arguments],
                                cwd=self.root, capture_output=True, text=True, timeout=30)
        return result

    def assert_refused(self, result, label):
        self.assertNotEqual(result.returncode, 0, label + '\n' + result.stdout + result.stderr)
        OBSERVATIONS.setdefault('runtime_adversarial_cases', []).append({
            'case': label, 'status': 'EXPECTED_REFUSAL', 'exit_code': result.returncode,
            'stdout_sha256': rc.sha(result.stdout.encode()), 'stderr_sha256': rc.sha(result.stderr.encode())})

    def mutation(self, name, value, arguments=(), label='mutation', rebind_manifest_identity=False):
        path = self.root / name
        before = path.read_bytes() if path.exists() else None
        original_id = (self.root / 'PACKAGE_ID.txt').read_bytes()
        try:
            if value is None:
                path.unlink()
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(value)
            if rebind_manifest_identity:
                self.assertEqual(name, 'SHA256SUMS.txt')
                (self.root / 'PACKAGE_ID.txt').write_bytes((rc.sha(value) + '\n').encode())
            self.assert_refused(self.verifier(*arguments), label)
        finally:
            if before is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(before)
            if rebind_manifest_identity:
                (self.root / 'PACKAGE_ID.txt').write_bytes(original_id)

    def test_01_exact_source_preservation_and_explicit_filtering(self):
        self.assertEqual(set(self.classroots), {f'S{n:02d}' for n in range(1, 15)})
        classroom_count = 0
        course_setup_count = 0
        retained_docx = 0
        omitted_seminar_docx = 0
        provenance = []
        for ident, (obj, files) in self.source.items():
            if ident in self.classroots:
                prefix = self.classroots[ident]
                kept = {name: value for name, value in files.items() if name.startswith('CLASSROOM_RC6/')}
                actual = {name[len(prefix):]: value for name, value in self.payload.items()
                          if name.startswith(prefix + 'CLASSROOM_RC6/')}
                self.assertEqual(actual, kept, ident)
                classroom_count += len(kept)
                omitted_seminar_docx += sum(name.lower().endswith('.docx') for name in files if name not in kept)
                self.assertFalse(any(name.lower().endswith('.docx') for name in self.payload if name.startswith(prefix)))
                scope = rc.strict_json(kept['CLASSROOM_RC6/CLASSROOM_SCOPE.json'])
                for legacy in (scope['legacy_guide'], scope['legacy_form']):
                    self.assertTrue(prefix + legacy in self.payload, ident + ' missing compatibility handoff: ' + legacy)
                    self.assertNotEqual(self.payload[prefix + legacy], files[legacy], ident + ' legacy replacement must be explicit')
                for required in ('SOURCE_PROVENANCE.json', 'SHA256SUMS.txt', 'PACKAGE_ID.txt'):
                    self.assertTrue(prefix + required in self.payload, ident + ' missing generated control: ' + required)
                self.assertNotEqual(self.payload[prefix + 'PACKAGE_ID.txt'].strip().decode(), obj['package_id'])
                provenance.append({'object_id': ident, 'classroom_source_files_unchanged': len(kept),
                                   'original_carrier_package_id': obj['package_id']})
            else:
                # Match an authentic identity file, independently of generated
                # collection metadata and without assuming a folder name.
                identity_bytes = files[obj['package_id_path']]
                suffix = obj['package_id_path']
                candidates = [name[:-len(suffix)] for name, value in self.payload.items()
                              if name.endswith('/' + suffix) and value == identity_bytes]
                self.assertEqual(len(candidates), 1, ident)
                prefix = candidates[0]
                actual = {name[len(prefix):]: value for name, value in self.payload.items() if name.startswith(prefix)}
                self.assertEqual(actual, files, ident + ' complete original carrier must remain byte-identical')
                course_setup_count += len(files)
                retained_docx += sum(name.lower().endswith('.docx') for name in files)
        self.assertEqual(classroom_count, 266)
        self.assertEqual(course_setup_count, 890)
        self.assertEqual(retained_docx, 30)
        self.assertEqual(omitted_seminar_docx, 39)
        self.assertEqual(len(self.editable), 38)
        self.assertEqual(sum(len(rc.strict_json(self.payload[p + 'CLASSROOM_RC6/CLASSROOM_SCOPE.json'])['projects'])
                             for p in self.classroots.values()), 40)
        OBSERVATIONS['source_preservation'] = {'classroom_files_unchanged': classroom_count,
            'complete_course_setup_files_unchanged': course_setup_count,
            'original_course_setup_package_ids_unchanged': 16, 'retained_optional_docx': retained_docx,
            'omitted_seminar_docx': omitted_seminar_docx, 'distinct_editable_files': len(self.editable),
            'projects': 40, 'seminars': provenance}

    def test_02_complete_manifest_and_container_roundtrip(self):
        manifest = self.payload['SHA256SUMS.txt']
        rows = rc.parse_manifest(manifest)
        self.assertEqual(set(rows), set(self.payload) - {'SHA256SUMS.txt', 'PACKAGE_ID.txt'})
        self.assertEqual(rows, {name: rc.sha(value) for name, value in self.payload.items()
                                if name not in {'SHA256SUMS.txt', 'PACKAGE_ID.txt'}})
        self.assertEqual(self.payload['PACKAGE_ID.txt'], (rc.sha(manifest) + '\n').encode())
        archive = rc.zip_bytes(self.payload, builder.COLLECTION_ROOT)
        members = rc.zip_members(archive, normalized_modes=True)
        prefix = builder.COLLECTION_ROOT
        self.assertEqual({name[len(prefix):]: value for name, value in members.items()}, self.payload)
        self.assertEqual(archive, rc.zip_bytes(self.payload, builder.COLLECTION_ROOT))
        OBSERVATIONS['deterministic_archive'] = {'members': len(members), 'bytes': len(archive),
                                                'sha256': rc.sha(archive), 'normalized_modes': True}

    def test_03_untouched_verifier_and_truthful_pending_status(self):
        result = self.verifier()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        metadata = rc.strict_json(self.payload['CLASSROOM_COLLECTION.json'])
        self.assertEqual(metadata['schema'], 'webtech-classroom-collection/v1')
        self.assertEqual(metadata['qualificationVerdict'], 'NOT_FINAL')
        self.assertEqual(set(metadata['qualificationGates']), set(rc.GATES))
        self.assertTrue(all(value == 'pending' for value in metadata['qualificationGates'].values()))
        self.assertEqual(sorted(metadata['editable_files']), self.editable)
        OBSERVATIONS['untouched_collection_verifier'] = {'exit_code': result.returncode,
                                                         'stdout': result.stdout.strip()}

    def test_04_expected_refusal_missing_added_changed_protected_and_bad_arguments(self):
        protected = self.classroots['S01'] + 'CLASSROOM_RC6/EVIDENCE_FORM.html'
        self.mutation(protected, None, label='missing protected form')
        self.mutation('unexpected_private_answer.txt', b'Unexpected extra member\n', label='additional root file')
        self.mutation(protected, self.payload[protected] + b'\n<!-- tampered -->', label='changed protected form')
        self.mutation(protected, self.payload[protected] + b'\n<!-- tampered -->',
                      arguments=('--allow-student-edits',), label='protected form changed under allowed-edit mode')
        self.mutation('PACKAGE_ID.txt', b'0' * 64 + b'\n', label='wrong collection package identity')
        self.mutation('SHA256SUMS.txt', self.payload['SHA256SUMS.txt'] + self.payload['SHA256SUMS.txt'].splitlines()[0] + b'\n',
                      label='duplicate manifest path with matching outer identity', rebind_manifest_identity=True)
        self.mutation('SHA256SUMS.txt', b'0' * 64 + b'  ../outside\n',
                      label='unsafe manifest traversal with matching outer identity', rebind_manifest_identity=True)
        self.assert_refused(self.verifier('--unknown'), 'unknown verifier argument')
        self.assert_refused(self.verifier('--allow-student-edits', '--allow-student-edits'), 'duplicate edit-mode argument')

    def test_05_only_declared_student_paths_may_change(self):
        name = self.editable[0]
        path = self.root / name
        before = path.read_bytes()
        try:
            path.write_bytes(before + b'\n// Independent QA edit, not a project solution.\n')
            self.assert_refused(self.verifier(), 'declared target edited in initial mode')
            result = self.verifier('--allow-student-edits')
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            OBSERVATIONS['allowed_student_edit'] = {'path': name, 'exit_code': result.returncode,
                                                    'project_completion_asserted': False}
        finally:
            path.write_bytes(before)
        self.mutation(name, None, arguments=('--allow-student-edits',), label='declared target missing under edit mode')
        self.mutation('README.md', self.payload['README.md'] + b'\nChanged outside learner scope\n',
                      arguments=('--allow-student-edits',), label='unauthorised root documentation edit')
        metadata = rc.strict_json(self.payload['CLASSROOM_COLLECTION.json'])
        metadata['editable_files'].append('README.md')
        self.mutation('CLASSROOM_COLLECTION.json', (json.dumps(metadata, indent=2) + '\n').encode(),
                      arguments=('--allow-student-edits',), label='changed editable-path policy')

    def test_06_symlink_and_case_collision_refused(self):
        name = self.editable[0]
        path = self.root / name
        before = path.read_bytes()
        outside = Path(self.temp.name) / 'outside-target.mjs'
        outside.write_bytes(before)
        try:
            path.unlink()
            path.symlink_to(outside)
            self.assert_refused(self.verifier('--allow-student-edits'), 'editable target replaced by same-byte symlink')
        finally:
            path.unlink(missing_ok=True)
            path.write_bytes(before)
        collision = self.root / 'Index.html'
        try:
            collision.write_bytes(self.payload['index.html'])
            self.assert_refused(self.verifier(), 'case-folding collision at collection root')
        finally:
            collision.unlink(missing_ok=True)

    def test_07_active_html_and_relative_module_import_closure(self):
        active = [name for name in self.payload if name.lower().endswith('.html')]
        links = html_targets(self.payload, active)
        imports = []
        excluded_routes = []
        import_pattern = re.compile(r'(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)[\"\'](\.[^\"\']+)[\"\']')
        for name, value in self.payload.items():
            if '/CLASSROOM_RC6/' not in name or not name.endswith(('.mjs', '.js', '.jsx')):
                continue
            for path in import_pattern.findall(value.decode('utf-8')):
                target = posixpath.normpath(posixpath.join(posixpath.dirname(name), urlsplit(path).path))
                rc.safe_name(target)
                if target not in self.payload:
                    ident = next((key for key, prefix in self.classroots.items() if name.startswith(prefix)), None)
                    self.assertTrue(ident in {'S03', 'S06'} and name.endswith('/CLASSROOM_RC6/kit.mjs')
                                    and path == './server.mjs', 'Unexpected missing module: ' + name + ' -> ' + path)
                    self.assertIn("if(action==='serve')", value.decode('utf-8'))
                    self.assertIn('do not invoke', self.payload['ENTRY/' + ident + '.html'].decode('utf-8'))
                    self.assertNotIn('kit.mjs serve', self.payload[self.classroots[ident] + 'CLASSROOM_RC6/GUIDE.html'].decode('utf-8'))
                    result = subprocess.run([NODE, str(self.root / name), 'serve'], cwd=self.root,
                                            capture_output=True, text=True, timeout=10)
                    self.assert_refused(result, ident + ' inherited unsupported optional serve branch')
                    excluded_routes.append({'seminar': ident, 'command': 'node CLASSROOM_RC6/kit.mjs serve',
                                            'missing_import': path, 'status': 'KNOWN_EXCLUDED_ROUTE_EXPECTED_REFUSAL'})
                    continue
                imports.append({'source': name, 'target': target})
        self.assertEqual({item['seminar'] for item in excluded_routes}, {'S03', 'S06'})
        OBSERVATIONS['active_navigation_and_import_closure'] = {
            'html_files': len(active), 'local_attribute_targets': len(links['checked']),
            'relative_module_imports': len(imports),
            'excluded_optional_routes': excluded_routes,
            'external_handoffs_not_executed': links['external_handoffs_not_executed'],
            'served_root_urls': 'Vite example roots resolved to shipped source files only; HTTP route execution is unqualified.',
            'retained_course_setup_internals': 'Byte-identical source; their HTML file targets are checked, not their browser behaviour.'}

    def test_08_fourteen_real_boundaries_and_fourteen_initial_starters(self):
        cases = []
        for ident in sorted(self.classroots):
            classdir = self.root / self.classroots[ident] / 'CLASSROOM_RC6'
            before = {name: rc.sha(path.read_bytes()) for name, path in rc.tree_files(classdir).items()}
            boundary = subprocess.run([NODE, str(classdir / 'verify.mjs'), 'initial'], cwd=classdir,
                                      capture_output=True, text=True, timeout=30)
            self.assertEqual(boundary.returncode, 0, ident + '\n' + boundary.stdout + boundary.stderr)
            if (classdir / 'kit.mjs').is_file():
                command = [NODE, str(classdir / 'kit.mjs'), 'initial', 'all']
            else:
                command = [NODE, str(classdir / 'check.mjs'), 'initial']
            starter = subprocess.run(command, cwd=classdir, capture_output=True, text=True, timeout=30)
            self.assertEqual(starter.returncode, 0, ident + '\n' + starter.stdout + starter.stderr)
            after = {name: rc.sha(path.read_bytes()) for name, path in rc.tree_files(classdir).items()}
            self.assertEqual(after, before, ident + ' source bytes changed during initial execution')
            cases.append({'seminar': ident, 'boundary_exit': boundary.returncode,
                          'starter_exit': starter.returncode, 'source_files_unchanged': len(before),
                          'starter_stdout_sha256': rc.sha(starter.stdout.encode()),
                          'initial_expected_failures_are_successful_student_completion': False})
        OBSERVATIONS['real_initial_classroom_execution'] = {'boundary_commands': 14, 'starter_commands': 14,
            'cases': cases, 'student_project_completion_asserted': False, 'native_platform_qualification': False}

    def test_09_generated_directories_require_explicit_edit_mode(self):
        metadata = rc.strict_json(self.payload['CLASSROOM_COLLECTION.json'])
        generated = metadata['generated_directories']
        self.assertIn('STUDENT_EVIDENCE', generated)
        dependency = next(name for name in generated if name.endswith('/node_modules'))
        for name in ('STUDENT_EVIDENCE', dependency):
            directory = self.root / name
            self.assertFalse(directory.exists())
            try:
                directory.mkdir(parents=True)
                (directory / 'QA_GENERATED_UNVERIFIED.txt').write_bytes(b'Generated directory, not a protected source file\n')
                self.assert_refused(self.verifier(), 'generated directory present in initial mode: ' + name)
                result = self.verifier('--allow-student-edits')
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            finally:
                (directory / 'QA_GENERATED_UNVERIFIED.txt').unlink(missing_ok=True)
                directory.rmdir()
        directory = self.root / dependency
        outside = Path(self.temp.name) / 'outside-dependencies'
        outside.mkdir()
        try:
            directory.symlink_to(outside, target_is_directory=True)
            self.assert_refused(self.verifier('--allow-student-edits'), 'generated dependency root is a symlink')
        finally:
            directory.unlink(missing_ok=True)
        OBSERVATIONS['generated_directory_policy'] = {
            'initial_mode_refuses_evidence_and_dependency_directories': True,
            'edit_mode_excludes_declared_generated_directories': True,
            'generated_root_symlink_refused': True,
            'contents_inside_generated_directories_authenticated': False}

    def test_10_policy_drift_cannot_shrink_scope_or_claim_final_acceptance(self):
        authentic = builder.read_policy()
        cases = [{'final_acceptance': True}, {'expected_classroom_source_files': 265},
                 {'expected_editable_files': 39}, {'seminar_policy': 'TRUST_UNCHECKED_CONTENT'},
                 {'source_material_sha256': '0' * 64}, {'object_ids': authentic['object_ids'][:-1]},
                 {'extra_override': True}]
        policy_root = Path(self.temp.name) / 'isolated policy fixture'
        policy = policy_root / builder.POLICY
        policy.parent.mkdir(parents=True)
        for change in cases:
            with self.subTest(change=change):
                modified = dict(authentic, **change)
                policy.write_bytes((json.dumps(modified, indent=2) + '\n').encode())
                with patch.object(builder, 'ROOT', policy_root), self.assertRaises(ValueError):
                    builder.read_policy()
        OBSERVATIONS['builder_policy_drift_cases'] = [{'change': change, 'status': 'EXPECTED_REFUSAL'} for change in cases]

    def test_11_builder_delivery_replays_exact_bytes_and_preserves_conflicting_outputs(self):
        output = Path(self.temp.name) / 'delivery outputs with spaces'
        archive = output / 'classroom candidate.zip'
        site = output / 'extracted site'

        def cli(*arguments):
            # Packaging orchestration uses the actual payload checked above.
            # Whole-source sealing is separately exercised after public edits.
            with patch.object(builder, 'build_payload', lambda check_source=True: dict(self.payload)), \
                    patch.object(sys, 'argv', ['build_classroom_collection.py', *arguments]), \
                    patch('sys.stdout', io.StringIO()):
                builder.main()

        cli('--zip', str(archive))
        original_archive = archive.read_bytes()
        original_inode = archive.stat().st_ino
        cli('--zip', str(archive))
        self.assertEqual(archive.stat().st_ino, original_inode)
        self.assertEqual(archive.read_bytes(), original_archive)
        archive.write_bytes(b'Existing different private file must remain unchanged.\n')
        with self.assertRaisesRegex(ValueError, 'Existing different output'):
            cli('--zip', str(archive))
        self.assertEqual(archive.read_bytes(), b'Existing different private file must remain unchanged.\n')
        cli('--site', str(site))
        before = {name: (rc.sha(path.read_bytes()), path.stat().st_ino)
                  for name, path in rc.tree_files(site).items()}
        cli('--site', str(site))
        self.assertEqual({name: (rc.sha(path.read_bytes()), path.stat().st_ino)
                          for name, path in rc.tree_files(site).items()}, before)
        (site / 'README.md').write_bytes(b'Existing changed learner folder must remain unchanged.\n')
        with self.assertRaisesRegex(ValueError, 'Existing different output directory'):
            cli('--site', str(site))
        self.assertEqual((site / 'README.md').read_bytes(), b'Existing changed learner folder must remain unchanged.\n')
        with self.assertRaisesRegex(ValueError, 'Overlapping output paths'):
            cli('--zip', str(output / 'nested output'), '--site', str(output / 'nested output/inside'))
        OBSERVATIONS['builder_delivery_orchestration'] = {
            'actual_checked_payload_used': True, 'source_seal_bypassed_in_this_orchestration_fixture': True,
            'identical_zip_and_tree_replays_preserve_inodes': True,
            'conflicting_zip_and_changed_tree_refused_without_overwrite': True,
            'overlapping_outputs_refused': True}

    def test_12_every_authentic_vite_root_has_bounded_generated_output_exclusions(self):
        metadata = rc.strict_json(self.payload['CLASSROOM_COLLECTION.json'])
        generated = set(metadata['generated_directories'])
        vite_roots = {}
        for ident, (obj, files) in self.source.items():
            if ident in self.classroots:
                prefix = self.classroots[ident]
                files = {name: value for name, value in files.items() if name.startswith('CLASSROOM_RC6/')}
            else:
                identity_bytes = files[obj['package_id_path']]
                suffix = obj['package_id_path']
                candidates = [name[:-len(suffix)] for name, value in self.payload.items()
                              if name.endswith('/' + suffix) and value == identity_bytes]
                self.assertEqual(len(candidates), 1, ident)
                prefix = candidates[0]
            for name, value in files.items():
                if not name.endswith('/package.json') and name != 'package.json':
                    continue
                package = rc.strict_json(value)
                # Match the actual Vite command token. A script name or a
                # dependency named Vitest is insufficient to grant exclusions.
                if any(re.search(r'(?:^|\s)vite(?:\s|$)', command)
                       for command in package.get('scripts', {}).values()):
                    vite_roots[posixpath.dirname(prefix + name)] = ident
        self.assertEqual(len(vite_roots), 16)
        counts = {ident: sum(owner == ident for owner in vite_roots.values())
                  for ident in ('C08', 'C09', 'C10', 'S08', 'S09', 'S10')}
        self.assertEqual(counts, {'C08': 5, 'C09': 3, 'C10': 5, 'S08': 1, 'S09': 1, 'S10': 1})
        expected = {root + '/' + leaf for root in vite_roots for leaf in ('dist', '.vite')}
        actual = {name for name in generated if name.endswith(('/dist', '/.vite'))}
        self.assertEqual(actual, expected)
        representative = []
        for ident in ('C08', 'C09', 'C10'):
            root_name = next(name for name, owner in sorted(vite_roots.items()) if owner == ident)
            directories = [self.root / root_name / leaf for leaf in ('dist', '.vite')]
            try:
                for directory in directories:
                    self.assertFalse(directory.exists())
                    directory.mkdir()
                    (directory / 'QA_GENERATED_UNVERIFIED.txt').write_bytes(b'Synthetic generated output; no actual Vite build qualification.\n')
                self.assert_refused(self.verifier(), ident + ' generated Vite outputs present in initial mode')
                result = self.verifier('--allow-student-edits')
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIs(rc.strict_json(result.stdout)['studentProjectsQualified'], False)
                protected_source = root_name + '/src/main.jsx'
                self.assertTrue(protected_source in self.payload, ident + ' missing preserved source main.jsx')
                self.mutation(protected_source, self.payload[protected_source] + b'\n// Unauthorised course source edit.\n',
                              arguments=('--allow-student-edits',),
                              label=ident + ' protected course source changed alongside generated Vite outputs')
                representative.append({'object_id': ident, 'root': root_name,
                                       'generated_outputs': ['dist', '.vite'],
                                       'initial_mode_refused': True, 'protected_files_mode_admitted': True,
                                       'protected_course_source_change_refused': True})
            finally:
                for directory in directories:
                    (directory / 'QA_GENERATED_UNVERIFIED.txt').unlink(missing_ok=True)
                    directory.rmdir()
        OBSERVATIONS['vite_generated_output_regression'] = {
            'roots_derived_independently_from_authentic_package_scripts': len(vite_roots),
            'roots_by_object': counts, 'declared_dist_and_vite_directories': len(expected),
            'representative_course_output_policy_executions': representative,
            'actual_vite_builds_executed_or_qualified_by_this_case': False,
            'generated_output_contents_authenticated': False}


class HostileArchivePrimitives(unittest.TestCase):
    @staticmethod
    def archive(entries):
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w') as container:
            for name, value, mode in entries:
                item = zipfile.ZipInfo(name)
                item.create_system = 3
                item.external_attr = mode << 16
                with warnings.catch_warnings():
                    warnings.filterwarnings('ignore', message="Duplicate name:.*", category=UserWarning)
                    container.writestr(item, value)
        return out.getvalue()

    def test_path_namespace_type_and_duplicate_guards(self):
        regular = stat.S_IFREG | 0o644
        hostile = [
            ('parent traversal', [('../outside', b'x', regular)]),
            ('absolute path', [('/outside', b'x', regular)]),
            ('Windows drive', [('C:/outside', b'x', regular)]),
            ('backslash path', [('inside\\outside', b'x', regular)]),
            ('Windows reserved name', [('NUL.txt', b'x', regular)]),
            ('trailing dot', [('unsafe./file', b'x', regular)]),
            ('duplicate member', [('same.txt', b'a', regular), ('same.txt', b'b', regular)]),
            ('case collision', [('Same.txt', b'a', regular), ('same.txt', b'b', regular)]),
            ('Unicode normalisation collision', [('caf\u00e9.txt', b'a', regular), ('cafe\u0301.txt', b'b', regular)]),
            ('file-directory collision', [('a', b'a', regular), ('a/file', b'b', regular)]),
            ('symlink member', [('link', b'outside', stat.S_IFLNK | 0o777)]),
            ('special member', [('pipe', b'', stat.S_IFIFO | 0o644)]),
            ('directory carrying bytes', [('dir/', b'bad', stat.S_IFDIR | 0o755)]),
        ]
        tested = []
        for label, entries in hostile:
            with self.subTest(case=label), self.assertRaises(ValueError):
                rc.zip_members(self.archive(entries))
            tested.append({'case': label, 'status': 'EXPECTED_REFUSAL'})
        OBSERVATIONS['archive_adversarial_cases'] = tested

    def test_manifest_duplicate_unsafe_and_nonfinite_metadata_guards(self):
        for data in (b'0' * 64 + b'  safe\n' + b'1' * 64 + b'  safe\n',
                     b'0' * 64 + b'  ../outside\n', b'not-a-manifest\n'):
            with self.subTest(manifest=data), self.assertRaises(ValueError):
                rc.parse_manifest(data)
        for data in (b'{"schema":"x","schema":"y"}', b'{"value":NaN}', b'{"value":1e999}'):
            with self.subTest(metadata=data), self.assertRaises(ValueError):
                rc.strict_json(data)


def main():
    global NODE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', default=NODE, help='Exact Node v24.21.0 executable')
    parser.add_argument('--report', type=Path)
    arguments = parser.parse_args()
    NODE = arguments.node
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'schema': 'webtech-classroom-collection-independent-qa/v1',
              'status': 'PASS_SCOPED_LOCAL_QA' if result.wasSuccessful() else 'FAIL_SCOPED_LOCAL_QA',
              'tests_run': result.testsRun, 'errors': len(result.errors), 'failures': len(result.failures),
              'actions_dispatched': 0, 'qualificationVerdict': 'NOT_FINAL',
              'qualificationGates': {gate: 'pending' for gate in rc.GATES},
              'source_seal_checked_by_this_suite': False,
              'limitations': 'Local packaging, finite adversarial guards, unchanged classroom source and initial starter contracts only. Source seal is separately checked after edits. No Actions, native Windows/macOS, browser rendering, Word, Moodle, human pilot or successful student completion qualification.',
              'observations': OBSERVATIONS}
    if arguments.report:
        rc.atomic_write(rc.output_path(arguments.report), (json.dumps(report, indent=2) + '\n').encode())
    print(json.dumps({'status': report['status'], 'tests_run': result.testsRun,
                      'errors': len(result.errors), 'failures': len(result.failures),
                      'qualificationVerdict': 'NOT_FINAL', 'actions_dispatched': 0}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
