#!/usr/bin/env python3
"""Execute finite RC8 regressions against authenticated RC6 inputs.

The suite independently checks the C07 defect and correction, attacks the actual
JavaScript guard, and checks source preservation and publication preparation.
No dependencies are installed, no database is executed and no Actions run.
The whole-repository source seal is checked separately after edits are finished.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import subprocess
import sys
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
sys.path.insert(0, str(REPO / '00_TOOLS/qa'))
import release_contract as rc
import student_release as student
import c07_registry_derivative as c07
import build_classroom_collection as predecessor
import build_classroom_successor as builder
import resolve_classroom_successor as resolver

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
ALLOW_NONREFERENCE = False
OBSERVATIONS = {}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


@contextmanager
def replacement(path, data):
    original = path.read_bytes()
    try:
        path.write_bytes(data)
        yield
    finally:
        path.write_bytes(original)


class ClassroomSuccessor(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        runtime = subprocess.run([NODE, '--version'], capture_output=True, text=True,
                                 timeout=10, check=True).stdout.strip()
        if runtime != 'v24.21.0' and not ALLOW_NONREFERENCE:
            raise ValueError('Reference Node v24.21.0 required; observed ' + runtime)
        cls.registry = student.read_registry()
        cls.source = {item['object_id']: (item, student.verify_object(item))
                      for item in cls.registry['objects']}
        cls.source_object, cls.c07_source = cls.source['C07']
        cls.c07_derived = c07.derive(cls.c07_source, cls.source_object)
        cls.baseline = predecessor.build_payload(check_source=False)
        cls.payload = builder.build_payload(check_source=False)
        cls.metadata = rc.strict_json(cls.payload['CLASSROOM_COLLECTION.json'])
        cls.temp = tempfile.TemporaryDirectory(prefix='webtech-rc8-finite-qa-')
        cls.temporary = Path(cls.temp.name)
        cls.old_root = cls.temporary / 'authentic predecessor C07'
        cls.new_root = cls.temporary / 'derived C07 with spaces'
        cls.collection_root = cls.temporary / 'RC8 collection with spaces'
        rc.write_tree(cls.old_root, cls.c07_source)
        rc.write_tree(cls.new_root, cls.c07_derived)
        rc.write_tree(cls.collection_root, cls.payload)
        cls.examples = {f'{number:02d}': name
                        for number, name in enumerate(c07.EXAMPLE_NAMES, 1)}
        OBSERVATIONS['runtime'] = {'executable': NODE, 'node': runtime,
            'reference_node_match': runtime == 'v24.21.0', 'platform': sys.platform,
            'native_platform_qualification': False}
        OBSERVATIONS['inputs'] = {'authenticated_objects': len(cls.source),
            'source_c07_archive_sha256': cls.source_object['archive_sha256'],
            'source_c07_package_id': cls.source_object['package_id']}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def command(self, arguments, cwd, label):
        result = subprocess.run([NODE, *arguments], cwd=cwd, capture_output=True,
                                text=True, timeout=35)
        OBSERVATIONS.setdefault('commands', []).append({'case': label,
            'arguments': arguments, 'cwd': str(cwd), 'exit_code': result.returncode,
            'stdout': result.stdout, 'stderr': result.stderr})
        return result

    def boundary(self, root, label, example='01'):
        script = ('const module=await import(' + json.dumps((root / 'tools/examples.mjs').as_uri())
                  + ');console.log(JSON.stringify(module.sourceBoundary('
                  + json.dumps(example) + ')));')
        result = self.command(['--input-type=module', '-e', script], root, label)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        answer = rc.strict_json(result.stdout.encode())
        self.assertEqual(set(answer), {'files', 'errors'})
        self.assertIsInstance(answer['errors'], list)
        self.assertIs(type(answer['files']), int)
        return answer

    def collection_verifier(self, label, *arguments):
        return self.command([str(self.collection_root / 'VERIFY_COLLECTION.mjs'), *arguments],
                            self.collection_root, label)

    def test_01_ten_hashes_reconciled_with_exact_historical_provenance(self):
        old_rows = {row['path']: row for row in rc.strict_json(self.c07_source['CANONICAL_SOURCES.json'])}
        current_rows = {row['path']: row for row in rc.strict_json(self.c07_derived['CANONICAL_SOURCES.json'])}
        self.assertEqual(len(old_rows), 21)
        self.assertEqual(set(current_rows), c07.EXPECTED_PATHS)
        previous_descriptor = rc.strict_json(self.c07_source['DERIVED_CARRIER.json'])
        changes = {item['path']: item for item in previous_descriptor['content_changes_before_sealing']}
        corrected = []
        for name in sorted(old_rows):
            before, after = old_rows[name], current_rows[name]
            self.assertEqual(after['sha256'], rc.sha(self.c07_source[name]), name)
            if name in c07.CORRECTED_PATHS:
                self.assertNotEqual(before['sha256'], after['sha256'], name)
                self.assertEqual(before['sha256'], changes[name]['before_sha256'])
                self.assertEqual(after['sha256'], changes[name]['after_sha256'])
                self.assertEqual(after['previous_carrier_sha256'], before['sha256'])
                self.assertEqual({key: value for key, value in after.items()
                                  if key not in {'sha256', 'previous_carrier_sha256'}},
                                 {key: value for key, value in before.items() if key != 'sha256'})
                corrected.append(name)
            else:
                self.assertEqual(after, before, name)
        self.assertEqual(len(corrected), 10)
        descriptor = rc.strict_json(self.c07_derived[c07.DESCRIPTOR_PATH])
        self.assertEqual({row['path'] for row in descriptor['corrected_registry_rows']}, set(corrected))
        self.assertEqual(descriptor['source_package_id'], self.source_object['package_id'])
        self.assertFalse(descriptor['canonical_payload_bytes_changed'])
        self.assertFalse(descriptor['original_carrier_overwritten'])
        self.assertEqual(self.c07_derived['DERIVED_CARRIER.json'], self.c07_source['DERIVED_CARRIER.json'])
        for name, data in self.c07_source.items():
            if name not in c07.DISPLACED:
                self.assertEqual(self.c07_derived[name], data, name)
        for name in c07.DISPLACED:
            self.assertEqual(self.c07_derived['PREDECESSOR_RC6/' + name], self.c07_source[name])
        canonical = [name for name in self.c07_source if name.startswith('canonical/')]
        self.assertEqual(len(canonical), 21)
        for name in canonical:
            self.assertEqual(self.c07_derived[name], self.c07_source[name])
        self.assertEqual(self.c07_derived['SHA256SUMS.txt'],
                         rc.manifest(self.c07_derived, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
        self.assertEqual(self.c07_derived['PACKAGE_ID.txt'],
                         (rc.sha(self.c07_derived['SHA256SUMS.txt']) + '\n').encode())
        self.assertNotEqual(self.c07_derived['PACKAGE_ID.txt'], self.c07_source['PACKAGE_ID.txt'])
        self.assertEqual(c07.derive(self.c07_source, self.source_object), self.c07_derived)
        OBSERVATIONS['c07_derivation'] = {'source_files': len(self.c07_source),
            'derived_files': len(self.c07_derived), 'canonical_files_unchanged': len(canonical),
            'registry_entries': 21, 'reconciled_rows': corrected,
            'historical_files_preserved_exactly': list(c07.DISPLACED),
            'current_package_id': self.c07_derived['PACKAGE_ID.txt'].decode().strip()}

    def test_02_actual_old_and_current_boundary_for_all_five_examples(self):
        for ident in self.examples:
            with self.subTest(example=ident):
                old = self.boundary(self.old_root, 'old C07 known failure ' + ident, ident)
                self.assertEqual(old['files'], 4)
                self.assertEqual(len(old['errors']), 2)
                self.assertTrue(all('Hash mismatch' in error for error in old['errors']))
                current = self.boundary(self.new_root, 'corrected C07 source boundary ' + ident, ident)
                self.assertEqual(current, {'files': 4, 'errors': []})
        OBSERVATIONS['actual_source_boundaries'] = {'old_examples_blocked': 5,
            'old_hash_errors_per_example': 2, 'current_examples_source_clear': 5,
            'dependency_or_database_execution_asserted': False}

    def test_03_each_canonical_file_kind_detects_changed_bytes(self):
        relative = 'canonical/' + self.examples['01'] + '/'
        for leaf in ('example.js', 'package.json', 'package-lock.json', 'README.md'):
            path = self.new_root / (relative + leaf)
            with self.subTest(file=leaf), replacement(path, path.read_bytes() + b'\nQA changed byte\n'):
                answer = self.boundary(self.new_root, 'canonical byte mutation ' + leaf)
                self.assertTrue(answer['errors'])
                self.assertTrue(any(relative + leaf in error and 'Hash mismatch' in error
                                    for error in answer['errors']))
        self.assertEqual(self.boundary(self.new_root, 'restored current C07'), {'files': 4, 'errors': []})

    def test_04_malformed_duplicate_and_unsafe_registry_are_controlled_refusals(self):
        rows = rc.strict_json(self.c07_derived['CANONICAL_SOURCES.json'])
        cases = {'malformed JSON': b'{"unterminated":',
                 'object instead of registry array': b'{"files":[]}',
                 'missing canonical row': encoded(rows[:-1])}
        duplicate = copy.deepcopy(rows)
        duplicate[1] = copy.deepcopy(duplicate[0])
        cases['duplicate row displacing required source'] = encoded(duplicate)
        traversal = copy.deepcopy(rows)
        traversal[0]['path'] = '../outside/README.md'
        cases['parent traversal row'] = encoded(traversal)
        malformed = copy.deepcopy(rows)
        malformed[0]['sha256'] = 'not-a-sha'
        cases['invalid hash field'] = encoded(malformed)
        unexpected = copy.deepcopy(rows)
        unexpected[0]['path'] = 'canonical/unlisted/README.md'
        cases['unexpected canonical path'] = encoded(unexpected)
        for label, data in cases.items():
            with self.subTest(case=label), replacement(self.new_root / 'CANONICAL_SOURCES.json', data):
                answer = self.boundary(self.new_root, 'registry controlled refusal: ' + label)
                self.assertTrue(answer['errors'], label + ' must not silently pass')
        OBSERVATIONS['registry_controlled_refusals'] = list(cases)

    def test_05_same_byte_file_and_parent_directory_symlinks_refused(self):
        registry = self.new_root / 'CANONICAL_SOURCES.json'
        registry_bytes = registry.read_bytes()
        outside_registry = self.temporary / 'outside registry same bytes.json'
        outside_registry.write_bytes(registry_bytes)
        try:
            registry.unlink()
            registry.symlink_to(outside_registry)
            answer = self.boundary(self.new_root, 'same-byte registry symlink')
            self.assertTrue(answer['errors'])
            self.assertTrue(any('not a regular file' in error for error in answer['errors']))
        finally:
            registry.unlink(missing_ok=True)
            registry.write_bytes(registry_bytes)
        relative = 'canonical/' + self.examples['01']
        path = self.new_root / relative / 'example.js'
        original = path.read_bytes()
        outside_file = self.temporary / 'outside source same bytes.js'
        outside_file.write_bytes(original)
        try:
            path.unlink()
            path.symlink_to(outside_file)
            answer = self.boundary(self.new_root, 'same-byte canonical file symlink')
            self.assertTrue(answer['errors'])
            self.assertTrue(any('symbolic link' in error for error in answer['errors']))
        finally:
            path.unlink(missing_ok=True)
            path.write_bytes(original)
        directory = self.new_root / relative
        outside_directory = self.temporary / 'outside source directory same bytes'
        directory.rename(outside_directory)
        try:
            directory.symlink_to(outside_directory, target_is_directory=True)
            answer = self.boundary(self.new_root, 'same-byte canonical parent directory symlink')
            self.assertTrue(answer['errors'])
            self.assertTrue(any('symbolic link' in error for error in answer['errors']))
        finally:
            directory.unlink(missing_ok=True)
            outside_directory.rename(directory)
        self.assertEqual(self.boundary(self.new_root, 'symlink fixtures restored'), {'files': 4, 'errors': []})

    def test_06_preflight_zero_exit_does_not_mean_dependency_readiness(self):
        cases = []
        for ident in self.examples:
            result = self.command([str(self.new_root / 'tools/examples.mjs'), 'preflight', ident],
                                  self.new_root, 'current preflight dependencies unprovisioned ' + ident)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            answer = rc.strict_json(result.stdout.encode())
            self.assertEqual(answer['source'], {'files': 4, 'errors': []})
            self.assertFalse(answer['ready'])
            self.assertTrue(any(dependency['error'] for dependency in answer['dependencies']))
            cases.append({'example': ident, 'exit_code': 0, 'source_clear': True,
                          'ready': False, 'unprovisioned_dependencies': True})
        result = self.command([str(self.new_root / 'tools/examples.mjs'), 'run', '01',
                               '--allow-memory-fixture', '--compatibility'],
                              self.new_root, 'unready canonical execution refused')
        self.assertEqual(result.returncode, 2)
        self.assertIn('PREREQUISITE_BLOCK', result.stderr)
        OBSERVATIONS['preflight_scope'] = {'cases': cases, 'actual_sequelize_execution': False,
            'full_dependency_graph_or_native_driver_acceptance': False}

    def test_07_untrusted_source_and_false_provenance_refused_before_derivation(self):
        modified = dict(self.c07_source)
        name = 'canonical/' + self.examples['01'] + '/example.js'
        modified[name] += b'\n// altered untrusted input\n'
        with self.assertRaisesRegex(ValueError, 'authenticate every payload byte'):
            c07.derive(modified, self.source_object)
        changed_object = dict(self.source_object, archive_sha256='0' * 64)
        with self.assertRaisesRegex(ValueError, 'frozen C07 identity'):
            c07.derive(self.c07_source, changed_object)
        modified = dict(self.c07_source, **{'PREDECESSOR_RC6/extra.txt': b'x'})
        with self.assertRaises(ValueError):
            c07.derive(modified, self.source_object)

    def test_08_deterministic_collection_exact_preservation_and_remapped_controls(self):
        replay = builder.build_payload(check_source=False)
        self.assertEqual(replay, self.payload)
        first = rc.zip_bytes(self.payload, builder.COLLECTION_ROOT)
        self.assertEqual(first, rc.zip_bytes(replay, builder.COLLECTION_ROOT))
        self.assertEqual(rc.zip_members(first, normalized_modes=True),
                         {builder.COLLECTION_ROOT + name: data for name, data in self.payload.items()})
        records = rc.strict_json(self.payload['PRESERVED_SOURCE_FILES.json'])['files']
        self.assertEqual(len(records), 1156)
        self.assertEqual(len({row['path'] for row in records}), 1156)
        expected = rc.strict_json(self.baseline['PRESERVED_SOURCE_FILES.json'])['files']
        for before in expected:
            target = builder.map_source_path(before['path'])
            actual = next(row for row in records if row['path'] == target)
            self.assertEqual(self.payload[target], self.baseline[before['path']])
            self.assertEqual(actual['sha256'], before['sha256'])
            self.assertEqual(actual['bytes'], before['bytes'])
            if before['path'].startswith(c07.OLD_PREFIX):
                self.assertEqual(actual['source_path'], before['path'])
        for ident, (item, files) in self.source.items():
            if ident == 'C07':
                continue
            prefix = item['collection_payload_root']
            old = {name: data for name, data in self.baseline.items() if name.startswith(prefix)}
            new = {name: data for name, data in self.payload.items() if name.startswith(prefix)}
            self.assertEqual(old, new, ident + ' payload must be byte-identical to RC7 recipe')
            if ident.startswith('S'):
                classroom = {name: data for name, data in files.items() if name.startswith('CLASSROOM_RC6/')}
                self.assertEqual({name[len(prefix):]: data for name, data in new.items()
                                  if name.startswith(prefix + 'CLASSROOM_RC6/')}, classroom)
            else:
                self.assertEqual({name[len(prefix):]: data for name, data in new.items()}, files)
        self.assertFalse(any(name.startswith(c07.OLD_PREFIX) for name in self.payload))
        actual_c07 = {name[len(c07.NEW_PREFIX):]: data for name, data in self.payload.items()
                      if name.startswith(c07.NEW_PREFIX)}
        self.assertEqual(actual_c07, self.c07_derived)
        metadata = self.metadata
        self.assertEqual(len(metadata['objects']), 30)
        self.assertEqual(metadata['required_microprojects'], 40)
        self.assertEqual(metadata['classroom_source_files_preserved'], 266)
        self.assertEqual(len(metadata['editable_files']), 38)
        self.assertEqual(metadata['qualificationVerdict'], 'NOT_FINAL')
        self.assertTrue(all(value == 'pending' for value in metadata['qualificationGates'].values()))
        self.assertEqual(len(metadata['generated_directories']), 83)
        old_metadata = rc.strict_json(self.baseline['CLASSROOM_COLLECTION.json'])
        expected_dirs = sorted(c07.NEW_PREFIX + name[len(c07.OLD_PREFIX):]
                               if name.startswith(c07.OLD_PREFIX) else name
                               for name in old_metadata['generated_directories'])
        self.assertEqual(metadata['generated_directories'], expected_dirs)
        self.assertEqual(self.payload['SHA256SUMS.txt'],
                         rc.manifest(self.payload, {'SHA256SUMS.txt', 'PACKAGE_ID.txt'}))
        self.assertEqual(self.payload['PACKAGE_ID.txt'],
                         (rc.sha(self.payload['SHA256SUMS.txt']) + '\n').encode())
        OBSERVATIONS['collection'] = {'payload_files': len(self.payload), 'archive_bytes': len(first),
            'archive_sha256': rc.sha(first), 'deterministic_replay': True,
            'authenticated_original_files_preserved': 1156, 'classroom_files_unchanged': 266,
            'unchanged_other_object_payloads': 29, 'required_microprojects': 40,
            'editable_files': 38, 'generated_directories': 83}

    def test_09_actual_collection_initial_and_protected_verification(self):
        for arguments in ((), ('--allow-student-edits',)):
            result = self.collection_verifier('pristine RC8 verifier ' + str(arguments), *arguments)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        target = self.collection_root / self.metadata['editable_files'][0]
        with replacement(target, target.read_bytes() + b'\n// Bounded QA learner edit\n'):
            initial = self.collection_verifier('learner edit initial refusal')
            self.assertEqual(initial.returncode, 2, initial.stdout + initial.stderr)
            protected = self.collection_verifier('learner edit protected-mode acceptance', '--allow-student-edits')
            self.assertEqual(protected.returncode, 0, protected.stdout + protected.stderr)
        protected_name = c07.NEW_PREFIX + 'canonical/' + self.examples['01'] + '/package.json'
        path = self.collection_root / protected_name
        with replacement(path, path.read_bytes() + b'\n '):
            result = self.collection_verifier('protected C07 package mutation refused', '--allow-student-edits')
            self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        historical = self.collection_root / (c07.NEW_PREFIX + 'PREDECESSOR_RC6/PACKAGE_ID.txt')
        with replacement(historical, b'0' * 64 + b'\n'):
            result = self.collection_verifier('historical identity mutation refused', '--allow-student-edits')
            self.assertEqual(result.returncode, 2, result.stdout + result.stderr)

    @contextmanager
    def prepared_payload_fixture(self, payload=None):
        """Exercise resolver orchestration with actual built bytes, without source resealing.

        The final workflow separately checks the whole repository source seal.
        Every resolver scope, derivation, manifest and plan check remains live.
        """
        current = dict(self.payload if payload is None else payload)
        with patch.object(rc, 'source_identity', return_value=self.metadata['repository_package_id']), \
                patch.object(builder, 'build_payload', return_value=current):
            yield

    def test_10_publication_requires_preview_and_exact_three_assets_without_overwrites(self):
        output = self.temporary / 'publication assets with spaces'
        with self.prepared_payload_fixture():
            with self.assertRaisesRegex(ValueError, 'Explicit classroom preview'):
                resolver.resolve(output, preview=False, build=True)
            for preview, build in (('true', True), (True, 'true')):
                with self.subTest(preview=preview, build=build), self.assertRaises(ValueError):
                    resolver.resolve(output, preview=preview, build=build)
            fields, report = resolver.resolve(output, preview=True, build=True)
            self.assertEqual(set(rc.tree_files(output)),
                             {resolver.ARCHIVE, resolver.ARCHIVE + '.sha256', 'SHA256SUMS.txt'})
            original = {name: path.read_bytes() for name, path in rc.tree_files(output).items()}
            replay_fields, replay_report = resolver.resolve(output, preview=True, build=False)
            self.assertEqual(replay_fields, fields)
            self.assertEqual(replay_report, report)
            self.assertEqual(fields['draft'], 'true')
            self.assertEqual(fields['prerelease'], 'true')
            self.assertFalse(report['publication_qualified'])
            self.assertFalse(report['release_created'])
            self.assertEqual(report['actions_dispatched'], 0)
            extra = output / 'undeclared_owner_notes.txt'
            extra.write_bytes(b'Preserve this private file.\n')
            try:
                with self.assertRaisesRegex(ValueError, 'undeclared files'):
                    resolver.resolve(output, preview=True, build=True)
                self.assertEqual(extra.read_bytes(), b'Preserve this private file.\n')
            finally:
                extra.unlink()
            path = output / resolver.ARCHIVE
            with replacement(path, b'Existing conflicting archive must not be overwritten.\n'):
                with self.assertRaises(ValueError):
                    resolver.resolve(output, preview=True, build=True)
                self.assertEqual(path.read_bytes(), b'Existing conflicting archive must not be overwritten.\n')
            side = output / (resolver.ARCHIVE + '.sha256')
            with replacement(side, b'0' * 64 + b'  false.zip\n'):
                with self.assertRaises(ValueError):
                    resolver.resolve(output, preview=True, build=False)
            self.assertEqual({name: path.read_bytes() for name, path in rc.tree_files(output).items()}, original)
        OBSERVATIONS['publication_orchestration'] = {'exact_assets': sorted(original),
            'actual_payload_and_scope_validation': True, 'whole_repository_source_seal_mocked_in_fixture': True,
            'explicit_preview_required': True, 'draft_only': True, 'conflicting_outputs_preserved': True,
            'actions_dispatched': 0, 'release_created': False}

    def test_11_self_consistent_forged_payload_cannot_rebind_source_or_claim_final(self):
        cases = []
        for label, mutate in (
                ('false final verdict', lambda data, payload: data.update(qualificationVerdict='FINAL')),
                ('gate promoted without qualification', lambda data, payload: data['qualificationGates'].update(native_windows='pass')),
                ('incorrect microproject inventory', lambda data, payload: data.update(required_microprojects=39)),
                ('missing C07 derivation binding', lambda data, payload: data.update(derived_objects=[])),
                ('self-consistent changed canonical source',
                 lambda data, payload: payload.update({c07.NEW_PREFIX + 'canonical/' + self.examples['01'] + '/example.js': b'// forged\n'}))):
            forged = dict(self.payload)
            metadata = copy.deepcopy(self.metadata)
            mutate(metadata, forged)
            forged['CLASSROOM_COLLECTION.json'] = encoded(metadata)
            # A valid local manifest must not authenticate publisher provenance.
            forged['SHA256SUMS.txt'] = rc.manifest(forged, {'SHA256SUMS.txt', 'PACKAGE_ID.txt'})
            forged['PACKAGE_ID.txt'] = (rc.sha(forged['SHA256SUMS.txt']) + '\n').encode()
            with self.subTest(case=label), self.prepared_payload_fixture(forged), self.assertRaises(ValueError):
                resolver.expected_collection(resolver.read_plan())
            cases.append(label)
        OBSERVATIONS['publication_payload_refusals'] = cases


def main():
    global NODE, ALLOW_NONREFERENCE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', default=NODE, help='Reference Node v24.21.0 executable')
    parser.add_argument('--allow-nonreference', action='store_true',
                        help='Explicit development run only; records nonreference runtime truthfully')
    parser.add_argument('--report', type=Path)
    arguments = parser.parse_args()
    NODE, ALLOW_NONREFERENCE = arguments.node, arguments.allow_nonreference
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'schema': 'webtech-classroom-successor-finite-qa/v1',
        'status': 'PASS_SCOPED_LOCAL_QA' if result.wasSuccessful() else 'FAIL_SCOPED_LOCAL_QA',
        'tests_run': result.testsRun, 'errors': len(result.errors), 'failures': len(result.failures),
        'actions_dispatched': 0, 'qualificationVerdict': 'NOT_FINAL',
        'qualificationGates': {gate: 'pending' for gate in rc.GATES},
        'source_seal_checked_by_this_suite': False,
        'limitations': 'Authenticated source inputs, finite runtime guards, source preservation and local publication preparation only. No dependencies installed, database executed, Actions, native Windows/macOS, interactive browser, Word, Moodle, cohort pilot or owner acceptance qualification.',
        'observations': OBSERVATIONS}
    if arguments.report:
        rc.atomic_write(rc.output_path(arguments.report), encoded(report))
    print(json.dumps({key: report[key] for key in ('status', 'tests_run', 'errors', 'failures',
                                                  'qualificationVerdict', 'actions_dispatched')}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
