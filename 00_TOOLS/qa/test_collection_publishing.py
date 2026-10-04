#!/usr/bin/env python3
"""Bounded candidate-publishing checks, including isolated local shell replay.

The small sealed fixture is synthetic and only tests packaging/orchestration.
It is not an owner receipt, native qualification or a successful Actions run.
All GitHub CLI and Git commands in shell replay are local recording stubs.
"""
from __future__ import annotations

import copy
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
import release_contract as rc
import resolve_collection_release as publisher
import build_student_collection as collection_builder
import build_week_bundle as week_builder
import resolve_release as week_resolver


class CandidatePublishing(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='webtech-collection-fixture-')
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / 'source'
        self.out = self.base / 'publish directory with spaces'
        self.root.mkdir()
        objects = []
        records = []
        for ident in sorted(rc.OBJECTS):
            item = {
                'object_id': ident, 'archive_sha256': rc.sha(ident.encode()),
                'package_id': rc.sha((ident + '-fixture').encode()),
                'collection_payload_root': 'PACKAGES/' + ident + '/',
                'carrier_version': 'synthetic-fixture', 'archive_files': 1
            }
            objects.append(item)
            records.append({
                'object_id': ident, 'archive_sha256': item['archive_sha256'],
                'package_id': item['package_id'],
                'payload_root': item['collection_payload_root'],
                'carrier_version': item['carrier_version'], 'payload_files': 1
            })
        self.registry = {
            'schema': 'webtech-student-selection/v2',
            'distribution_version': publisher.VERSION, 'source_commit': 'a' * 40,
            'qualified_release': False, 'objects': objects
        }
        self.actual_read_registry = publisher.student.read_registry
        self.registry_path = self.root / 'metadata/student-selection.json'
        self.write(self.registry_path, self.json(self.registry))
        self.plan = {
            'schema': 'webtech-collection-release-plan/v1',
            'distribution_version': publisher.VERSION,
            'source_commit': self.registry['source_commit'],
            'registry': 'metadata/student-selection.json',
            'registry_sha256': rc.sha(self.registry_path.read_bytes()),
            'status': 'candidate', 'draft': True, 'prerelease': True,
            'required_gates': list(rc.GATES),
            'gates': {gate: {'status': 'pending', 'scope': 'Synthetic full-scope fixture; no observed qualification.'} for gate in rc.GATES},
            'collection_root': publisher.COLLECTION_ROOT, 'tag': publisher.TAG,
            'notes': publisher.NOTES, 'object_ids': sorted(rc.OBJECTS),
            'archive': publisher.ARCHIVE
        }
        self.write(self.root / publisher.PLAN, self.json(self.plan))
        self.write(self.root / publisher.NOTES, b'# Synthetic candidate notes\n\nNo owner or native acceptance.\n')
        embedded = {
            'schema': 'webtech-student-collection/v2',
            'status': collection_builder.CANDIDATE_STATUS,
            'distribution_version': publisher.VERSION,
            'selection_registry_sha256': self.plan['registry_sha256'],
            'objects': records, 'native_acceptance': False,
            'publication_qualified': False
        }
        self.payload = {'index.html': b'<html lang="en-GB"><body>Fixture only</body></html>',
                        'COLLECTION.json': self.json(embedded)}
        for item in objects:
            self.payload[item['collection_payload_root'] + 'sample.sh'] = b'#!/bin/sh\nexit 0\n'
        self.payload['SHA256SUMS.txt'] = rc.manifest(self.payload)
        self.seal()
        patches = [patch.object(publisher, 'ROOT', self.root),
                   patch.object(publisher.student, 'REGISTRY', self.registry_path),
                   patch.object(publisher.student, 'read_registry', lambda: copy.deepcopy(self.registry)),
                   patch.object(publisher.collection_builder, 'build_payload', lambda check_source=True: copy.deepcopy(self.payload))]
        for item in patches:
            item.start()
            self.addCleanup(item.stop)

    @staticmethod
    def json(data):
        return (json.dumps(data, indent=2) + '\n').encode()

    @staticmethod
    def write(path, data):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def seal(self):
        controls = {'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt',
                    'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'}
        payload = {name: path.read_bytes() for name, path in rc.tree_files(self.root).items() if name not in controls}
        manifest = rc.manifest(payload)
        self.write(self.root / 'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt', manifest)
        self.write(self.root / 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt', (rc.sha(manifest) + '\n').encode())

    def update_plan(self, changes):
        modified = copy.deepcopy(self.plan)
        modified.update(changes)
        self.write(self.root / publisher.PLAN, self.json(modified))
        self.seal()

    def prepare(self):
        return publisher.resolve(self.out, preview=True, build=True)

    def test_complete_build_and_identical_replay(self):
        fields, report = self.prepare()
        self.assertEqual(report['object_count'], 30)
        self.assertEqual(report['actions_dispatched'], 0)
        self.assertFalse(report['publication_qualified'])
        self.assertEqual(fields['draft'], 'true')
        self.assertEqual(fields['prerelease'], 'true')
        self.assertEqual(len(rc.tree_files(self.out)), 3)
        original = {name: (path.read_bytes(), path.stat().st_ino) for name, path in rc.tree_files(self.out).items()}
        self.prepare()
        replay = {name: (path.read_bytes(), path.stat().st_ino) for name, path in rc.tree_files(self.out).items()}
        self.assertEqual(original, replay)
        raw = rc.zip_members(Path(fields['archive']).read_bytes(), normalized_modes=True)
        self.assertEqual(len(raw), len(self.payload))

    def test_no_implicit_preview_or_final_mode(self):
        for value in (False, 'true', 1, None):
            with self.subTest(preview=value), self.assertRaises(ValueError):
                publisher.resolve(self.out, preview=value, build=True)
        with self.assertRaises(ValueError):
            publisher.resolve(self.out, preview=True, build='true')
        self.assertFalse(self.out.exists())

    def test_candidate_plan_cannot_claim_acceptance_or_shrink_scope(self):
        changes = [
            {'draft': False}, {'draft': 'true'}, {'prerelease': False},
            {'status': 'FINAL'}, {'object_ids': sorted(rc.OBJECTS)[:-1]},
            {'required_gates': list(rc.GATES)[:-1]},
            {'gates': {gate: {'status': 'PASS', 'scope': 'Unobserved assertion'} for gate in rc.GATES}},
            {'source_commit': 'HEAD'}, {'registry_sha256': '0' * 64},
            {'archive': '../escape.zip'}, {'notes': '../outside.md'},
            {'unknown_override': True}
        ]
        for change in changes:
            with self.subTest(change=change):
                self.update_plan(change)
                with self.assertRaises(ValueError):
                    self.prepare()
                self.assertFalse(self.out.exists())

    def test_alternate_plan_refused(self):
        with self.assertRaises(ValueError):
            publisher.resolve(self.out, preview=True, build=True, plan_path='90_RELEASES/RELEASE_PLAN.json')

    def test_active_registry_rejects_the_superseded_edition(self):
        self.assertEqual(self.actual_read_registry()['distribution_version'], '3.0.0-rc.6')
        self.registry['distribution_version'] = '3.0.0-rc.5'
        self.registry_path.write_bytes(self.json(self.registry))
        with self.assertRaisesRegex(ValueError, 'Unsupported current registry'):
            self.actual_read_registry()

    def test_collection_builder_uses_successor_templates_and_truthful_notes(self):
        template = self.root / '00_START_HERE/STUDENT_COLLECTION_RC6'
        self.write(template / 'index.html', b'<html lang="en-GB"><body>Current RC6 fixture</body></html>')
        self.write(self.root / '00_START_HERE/STUDENT_COLLECTION/index.html', b'Historical RC5 fixture')
        for item in self.registry['objects']:
            item.update(student_start='sample.sh', student_guide='sample.sh', student_form=None,
                        package_id_path='PACKAGE_ID.txt', recovery_provenance={'scope': 'synthetic'})
        self.registry_path.write_bytes(self.json(self.registry))
        self.seal()
        original_builder = collection_builder.build_payload
        # The outer setUp patch replaces this global function. Load its checked-in
        # module under a separate name so this test exercises the actual builder.
        import importlib.util
        specification = importlib.util.spec_from_file_location('fixture_actual_collection_builder', REPO / '00_TOOLS/publishing/build_student_collection.py')
        actual_builder = importlib.util.module_from_spec(specification)
        specification.loader.exec_module(actual_builder)
        with patch.object(actual_builder, 'ROOT', self.root), patch.object(publisher.student, 'verify_object', lambda item: {'sample.sh': b'#!/bin/sh\nexit 0\n'}):
            built = actual_builder.build_payload()
        self.assertIn(b'Current RC6 fixture', built['index.html'])
        self.assertNotIn(b'Historical RC5 fixture', built['index.html'])
        notes = built['RECOVERY_NOTES.md'].decode()
        self.assertIn('fifteen new carriers', notes)
        self.assertIn('other fifteen', notes)
        self.assertIn('does not demonstrate completion', notes)
        self.assertIn('All ten qualification gates remain pending', notes)
        self.assertEqual(rc.strict_json(built['COLLECTION.json'])['distribution_version'], '3.0.0-rc.6')
        self.assertEqual(built['SHA256SUMS.txt'], rc.manifest(built, {'SHA256SUMS.txt'}))
        self.assertIs(collection_builder.build_payload, original_builder)

    def test_weekly_successor_metadata_container_and_resolver(self):
        members = {'index.html': b'<html lang="en-GB"><body>Bounded weekly fixture</body></html>',
                   'CLASSROOM_RC6/verify.mjs': b'// Synthetic fixture, not a classroom verifier.\n',
                   'VERIFY_PACKAGE.cmd': b'@echo Historical verifier fixture\r\n'}
        for item in self.registry['objects']:
            item.update(archive='objects/' + item['object_id'] + '.zip', archive_root_prefix='',
                        student_start='index.html', student_guide='index.html', student_form=None)
            if item['object_id'] in {'C01', 'S01'}:
                data = rc.zip_bytes(members)
                self.write(self.root / item['archive'], data)
                item['archive_sha256'] = rc.sha(data)
        self.registry_path.write_bytes(self.json(self.registry))
        selected = {item['object_id']: item for item in self.registry['objects']}
        plan = {
            'schema': 'webtech-full-collection-plan/v2', 'distribution_version': '3.0.0-rc.6',
            'source_commit': 'a' * 40, 'registry': 'metadata/student-selection.json',
            'registry_sha256': rc.sha(self.registry_path.read_bytes()),
            'status': 'candidate', 'draft': True, 'prerelease': True,
            'required_gates': list(rc.GATES), 'weeks': {}
        }
        for number in range(1, 15):
            week = f'{number:02}'
            notes = '90_RELEASES/NOTES_WEEK_' + week + '_RC6.md'
            self.write(self.root / notes, b'# Isolated weekly candidate fixture\n')
            plan['weeks'][week] = {
                'bundle': '90_RELEASES/assets/WebTech_ASE_WEEK_' + week + '_EN_GB_v3.0.0-rc.6.zip',
                'notes': notes, 'objects': {ident: {'archive': selected[ident]['archive'], 'sha256': selected[ident]['archive_sha256']} for ident in ('C' + week, 'S' + week)}
            }
        self.write(self.root / week_builder.PLAN, self.json(plan))
        with patch.object(week_builder, 'ROOT', self.root), patch.object(week_resolver, 'ROOT', self.root), patch.object(publisher.student, 'verify_object', lambda item: members):
            checked = week_builder.read_plan()
            item = checked['weeks']['01']
            data = week_builder.expected_bytes('01', item)
            archive = week_builder.bundle_path('01', item)
            self.write(archive, data)
            self.write(Path(str(archive) + '.sha256'), (rc.sha(data) + '  ' + archive.name + '\n').encode())
            self.seal()
            self.assertEqual(week_builder.verify('01', item)['status'], 'PASS_COMPLETE_CONTAINER_IDENTITY')
            files = rc.zip_members(data)
            self.assertEqual(len(files), 7)
            self.assertEqual(rc.strict_json(files['RELEASE.json'])['distribution_version'], '3.0.0-rc.6')
            self.assertIn(b'Completing a bounded contract does not demonstrate completion', files['README.md'])
            self.assertIn(b'node CLASSROOM_RC6/verify.mjs initial', files['README.md'])
            self.assertIn(b'node CLASSROOM_RC6/verify.mjs work', files['README.md'])
            self.assertIn(b'The original VERIFY_PACKAGE tools and advanced-project checks remain historical material', files['README.md'])
            fields = week_resolver.resolve('01', preview=True)
            self.assertEqual(fields['tag'], 'week-01-en-gb-v3.0.0-rc.6')
            self.assertEqual(fields['draft'], 'true')
            self.assertEqual(fields['prerelease'], 'true')
            with self.assertRaisesRegex(ValueError, 'ten observed qualification gates'):
                week_resolver.resolve('01', preview=False)
            plan['distribution_version'] = '3.0.0-rc.5'
            self.write(self.root / week_builder.PLAN, self.json(plan))
            with self.assertRaisesRegex(ValueError, 'Invalid full plan'):
                week_builder.read_plan()

    def test_source_drift_refused_before_output(self):
        (self.root / publisher.NOTES).write_bytes(b'# Changed after sealing\n')
        with self.assertRaisesRegex(ValueError, 'Whole-source bytes changed'):
            self.prepare()
        self.assertFalse(self.out.exists())

    def test_source_change_during_build_refused_before_output(self):
        def change_source(check_source=True):
            (self.root / publisher.NOTES).write_bytes(b'# Source changed during preparation\n')
            return copy.deepcopy(self.payload)
        with patch.object(publisher.collection_builder, 'build_payload', change_source):
            with self.assertRaisesRegex(ValueError, 'Whole-source bytes changed'):
                self.prepare()
        self.assertFalse(self.out.exists())

    def test_every_destination_is_checked_before_any_asset_write(self):
        self.out.mkdir()
        side = self.out / (publisher.ARCHIVE + '.sha256')
        side.write_bytes(b'An existing different sidecar must remain untouched.\n')
        original = side.read_bytes()
        with self.assertRaisesRegex(ValueError, 'Existing different output'):
            self.prepare()
        self.assertEqual(side.read_bytes(), original)
        self.assertEqual(set(rc.tree_files(self.out)), {side.name})

    def test_missing_or_incorrect_collection_manifest(self):
        self.payload['SHA256SUMS.txt'] = b''
        with self.assertRaisesRegex(ValueError, 'manifest'):
            self.prepare()
        self.assertFalse(self.out.exists())

    def test_embedded_scope_and_acceptance_refused(self):
        original = copy.deepcopy(self.payload)
        for change in ({'objects': []}, {'publication_qualified': True},
                       {'native_acceptance': True}, {'selection_registry_sha256': '0' * 64}):
            with self.subTest(change=change):
                self.payload = copy.deepcopy(original)
                embedded = rc.strict_json(self.payload['COLLECTION.json'])
                embedded.update(change)
                self.payload['COLLECTION.json'] = self.json(embedded)
                self.payload['SHA256SUMS.txt'] = rc.manifest(self.payload, {'SHA256SUMS.txt'})
                with self.assertRaises(ValueError):
                    self.prepare()

    def test_repacked_container_with_resealed_sidecars_refused(self):
        self.prepare()
        archive = self.out / publisher.ARCHIVE
        members = rc.zip_members(archive.read_bytes())
        output = io.BytesIO()
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_STORED) as container:
            for name, data in members.items():
                container.writestr(name, data)
        replacement = output.getvalue()
        self.assertEqual(rc.zip_members(replacement), members)
        archive.write_bytes(replacement)
        side = self.out / (publisher.ARCHIVE + '.sha256')
        side.write_bytes((rc.sha(replacement) + '  ' + archive.name + '\n').encode())
        (self.out / 'SHA256SUMS.txt').write_bytes(rc.manifest({archive.name: replacement, side.name: side.read_bytes()}))
        with self.assertRaisesRegex(ValueError, 'Existing different output'):
            publisher.resolve(self.out, preview=True)

    def test_sidecar_missing_or_wrong_basename_refused(self):
        self.prepare()
        side = self.out / (publisher.ARCHIVE + '.sha256')
        exact = side.read_bytes()
        side.unlink()
        with self.assertRaises(ValueError):
            publisher.resolve(self.out, preview=True)
        side.write_bytes(exact.replace(publisher.ARCHIVE.encode(), b'wrong.zip'))
        with self.assertRaises(ValueError):
            publisher.resolve(self.out, preview=True)

    def test_extra_file_and_output_symlink_refused_before_build(self):
        self.out.mkdir()
        (self.out / 'private-solution.txt').write_bytes(b'Never an asset\n')
        with self.assertRaises(ValueError):
            self.prepare()
        self.assertEqual(set(rc.tree_files(self.out)), {'private-solution.txt'})
        (self.out / 'private-solution.txt').unlink()
        destination = self.base / 'real'
        destination.mkdir()
        self.out.rmdir()
        self.out.symlink_to(destination, target_is_directory=True)
        with self.assertRaises(ValueError):
            self.prepare()

    def test_cli_exact_output_and_no_release_created(self):
        output = self.base / 'local-output.txt'
        arguments = ['resolve_collection_release.py', '--asset-dir', str(self.out),
                     '--allow-preview', '--build', '--github-output', str(output)]
        with patch.object(sys, 'argv', arguments), patch('sys.stdout', io.StringIO()) as captured:
            publisher.main()
        result = rc.strict_json(captured.getvalue())
        self.assertFalse(result['release_created'])
        self.assertFalse(result['tag_created'])
        self.assertIn('draft=true\n', output.read_text())
        self.assertIn('prerelease=true\n', output.read_text())
        self.assertEqual(output.read_text().count('tag='), 1)


class ManualWorkflowShell(unittest.TestCase):
    """Execute only checked-in shell strings against local command stubs."""
    @classmethod
    def setUpClass(cls):
        cls.workflow = rc.unique_yaml((REPO / '.github/workflows/release-collection.yml').read_text())
        cls.steps = cls.workflow['jobs']['publish-collection']['steps']

    def test_manual_event_and_pinned_actions(self):
        self.assertEqual(set(self.workflow['on']), {'workflow_dispatch'})
        self.assertEqual(self.workflow['on']['workflow_dispatch']['inputs']['preview']['default'], 'false')
        lock = rc.strict_json((REPO / 'metadata/github-actions-lock.json').read_bytes())['actions']
        for step in self.steps:
            if 'uses' in step:
                name, commit = step['uses'].split('@')
                self.assertEqual(commit, lock[name]['sha'])
        node = next(step for step in self.steps if step['name'] == 'Set up exact Node runtime')
        self.assertEqual(node['with']['node-version'], '24.21.0')

    def run_shell(self, step_name, mode='absent', flags=None):
        with tempfile.TemporaryDirectory(prefix='webtech-workflow-local-stubs-') as temp:
            root = Path(temp)
            binary = root / 'bin'
            binary.mkdir()
            log = root / 'commands.jsonl'
            stub = '''#!/usr/bin/env python3
import json,os,sys
from pathlib import Path
name=Path(sys.argv[0]).name
args=sys.argv[1:]
with open(os.environ['STUB_LOG'],'a') as f:f.write(json.dumps([name,*args])+'\\n')
mode=os.environ['STUB_MODE']
if name=='git':
    if args==['rev-parse','HEAD']:print('b'*40 if mode=='wrong_head' else os.environ['GITHUB_SHA']);sys.exit(0)
    if mode=='tag_present':print('a'*40+'\\trefs/tags/'+os.environ['TAG'])
    if mode=='git_error':sys.exit(128)
elif name=='gh' and args[0]=='api' and '--method' not in args:
    if mode=='release_present':print('HTTP/2.0 200 OK');sys.exit(0)
    print('HTTP/2.0 '+('500 Error' if mode=='api_error' else '404 Not Found'))
    sys.exit(1)
elif name=='gh' and args[0]=='api' and '--method' in args:
    if mode=='tag_race':sys.exit(1)
sys.exit(0)
'''
            for name in ('git', 'gh', 'python'):
                path = binary / name
                path.write_text(stub)
                path.chmod(0o755)
            environment = dict(os.environ, PATH=str(binary) + os.pathsep + os.environ['PATH'],
                               STUB_LOG=str(log), STUB_MODE=mode, RUNNER_TEMP=str(root),
                               TAG=publisher.TAG, GITHUB_REPOSITORY='fixture/example',
                               GITHUB_SHA='a' * 40, TITLE='Fixture candidate',
                               NOTES=publisher.NOTES, ARCHIVE=str(root / 'archive with spaces.zip'),
                               SIDECAR=str(root / 'archive with spaces.zip.sha256'),
                               CHECKSUMS=str(root / 'SHA256SUMS.txt'), DRAFT='true',
                               PRERELEASE='true', PREVIEW='true', GITHUB_OUTPUT=str(root / 'output'))
            environment.update(flags or {})
            step = next(item for item in self.steps if item['name'] == step_name)
            result = subprocess.run(['bash', '-c', step['run']], env=environment, capture_output=True, text=True)
            commands = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
            return result, commands

    def test_prepare_command_shape_and_false_preview(self):
        step = 'Prepare and verify the complete filtered candidate'
        result, commands = self.run_shell(step)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(commands), 2)
        self.assertEqual(commands[0], ['git', 'rev-parse', 'HEAD'])
        self.assertIn('--build', commands[1])
        self.assertIn('--workflow-output', commands[1])
        result, commands = self.run_shell(step, flags={'PREVIEW': 'false'})
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(commands, [])
        result, commands = self.run_shell(step, 'wrong_head')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(commands, [['git', 'rev-parse', 'HEAD']])

    def test_lookup_absence_and_fail_closed_errors(self):
        step = 'Refuse existing tags and releases, including lookup errors'
        result, commands = self.run_shell(step)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual([item[0] for item in commands], ['git', 'gh'])
        for mode in ('tag_present', 'release_present', 'git_error', 'api_error'):
            with self.subTest(mode=mode):
                result, commands = self.run_shell(step, mode)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(any(command[:3] == ['gh', 'release', 'create'] for command in commands))

    def test_atomic_new_tag_then_fixed_candidate_release(self):
        step = 'Create the new tag atomically and the draft candidate release'
        result, commands = self.run_shell(step)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(commands), 2)
        self.assertEqual(commands[0][:4], ['gh', 'api', '--method', 'POST'])
        self.assertEqual(commands[1][:3], ['gh', 'release', 'create'])
        self.assertIn('--verify-tag', commands[1])
        self.assertIn('--draft', commands[1])
        self.assertIn('--prerelease', commands[1])
        self.assertTrue(any('archive with spaces.zip' in argument for argument in commands[1]))
        result, commands = self.run_shell(step, 'tag_race')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(commands), 1)
        result, commands = self.run_shell(step, flags={'DRAFT': 'false'})
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(commands, [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
