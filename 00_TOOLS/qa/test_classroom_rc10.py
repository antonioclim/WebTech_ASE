#!/usr/bin/env python3
"""Focused RC10 documentary, provenance and local packaging refusal checks.

No completed learner solution, historical runtime suite, network request,
installation, hosted workflow or publication is performed. Composition fixtures
use check_source=False while production retains its whole-source guard. Resolver
output fixtures mock the expected collection, plan and source identity explicitly;
whole-source integration must be run separately on the sealed reviewed checkout.
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
import build_classroom_rc10 as builder
import release_contract as rc
import resolve_classroom_rc10 as resolver

OBSERVATIONS = {}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def outer_seal(payload):
    result = dict(payload)
    result['SHA256SUMS.txt'] = rc.manifest(result, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    result['PACKAGE_ID.txt'] = (rc.sha(result['SHA256SUMS.txt']) + '\n').encode()
    return result


def nested_seal(payload):
    """Reseal unit and outer controls so a simple stale checksum is insufficient."""
    result = dict(payload)
    meta = rc.strict_json(result['CLASSROOM_COLLECTION.json'])
    for item in meta['objects']:
        prefix = item['payload_root']
        files = {name[len(prefix):]: data for name, data in result.items() if name.startswith(prefix)}
        for control, keys in (
                ('CLASSROOM_RC6/CLASSROOM_BOUNDARY.json', ('protected', 'mutable')),
                ('CLASSROOM_RC6/SOURCE_MANIFEST.json', ('protected', 'targets'))):
            if control not in files:
                continue
            value = rc.strict_json(files[control])
            for key in keys:
                if isinstance(value.get(key), dict):
                    for name in value[key]:
                        if 'CLASSROOM_RC6/' + name in files:
                            value[key][name] = rc.sha(files['CLASSROOM_RC6/' + name])
            files[control] = encoded(value)
        if 'SHA256SUMS.txt' in files and 'PACKAGE_ID.txt' in files:
            files = outer_seal(files)
            item['package_id'] = files['PACKAGE_ID.txt'].decode().strip()
        for name, data in files.items():
            result[prefix + name] = data
    result['CLASSROOM_COLLECTION.json'] = encoded(meta)
    if 'PRESERVED_SOURCE_FILES.json' in result:
        preserved = rc.strict_json(result['PRESERVED_SOURCE_FILES.json'])
        for row in preserved.get('files', []):
            if row['path'] in result:
                row['sha256'] = rc.sha(result[row['path']])
                row['bytes'] = len(result[row['path']])
        result['PRESERVED_SOURCE_FILES.json'] = encoded(preserved)
    return outer_seal(result)


class ClassroomRC10(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline = builder.authenticated_predecessor(check_source=False)
        cls.payload = builder.build_payload(check_source=False)
        cls.meta = rc.strict_json(cls.payload['CLASSROOM_COLLECTION.json'])
        cls.items = {item['object_id']: item for item in cls.meta['objects']}
        cls.old_meta = rc.strict_json(cls.baseline['CLASSROOM_COLLECTION.json'])
        cls.temp = tempfile.TemporaryDirectory(prefix='webtech-rc10-documentary-')
        cls.temporary = Path(cls.temp.name)
        OBSERVATIONS['fixtures'] = {
            'composition_check_source_false': True,
            'production_source_guard_removed': False,
            'resolver_output_fixture_expected_collection_plan_and_source_identity_mocked': True,
            'network_requests': 0, 'actions_dispatched': 0,
            'runtime_applications_executed': 0,
            'native_browser_or_pdf_rendering_claimed': False}

    @classmethod
    def tearDownClass(cls):
        root = cls.temporary
        cls.temp.cleanup()
        if root.exists():
            raise AssertionError('Suite-owned temporary output was not removed')

    def test_01_authenticated_published_predecessor_is_exact(self):
        archive = rc.zip_bytes(self.baseline, 'WEBTECH_ASE_EN_GB_CLASSROOM_RC9/')
        self.assertEqual(rc.sha(archive), 'fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee')
        self.assertEqual(self.baseline['PACKAGE_ID.txt'], b'c8be1c0dfaa3dfb56ca8c7868d961654859f1e87ebb35b8511e0ea4773e77dd7\n')
        self.assertEqual(self.old_meta['repository_package_id'], 'bf310e6a6f9ed9750d1cb0dac987fbd5a08401cc4751cbe956cc9e7eb32163a7')
        OBSERVATIONS['predecessor'] = {'zip_sha256': rc.sha(archive), 'zip_bytes': len(archive),
            'collection_package_id': self.baseline['PACKAGE_ID.txt'].decode().strip(),
            'authenticated_published_bytes': True}

    def test_02_resealed_predecessor_tamper_is_refused(self):
        altered = dict(self.baseline)
        old = self.old_meta['editable_files'][0]
        altered[old] += b'\n// malicious predecessor alteration\n'
        altered = outer_seal(altered)
        with patch.object(builder.predecessor, 'build_payload', return_value=altered):
            with self.assertRaises(ValueError):
                builder.authenticated_predecessor(check_source=False)

    def test_03_exact_inventory_and_incomplete_learner_targets_preserved(self):
        self.assertEqual(set(self.items), rc.OBJECTS)
        self.assertEqual(len(self.items), 30)
        for key, count in [('required_microprojects', 40), ('tutorials', 14), ('optional_docx_references', 30)]:
            self.assertIs(type(self.meta[key]), int)
            self.assertEqual(self.meta[key], count)
        self.assertEqual(self.meta['editable_files'], self.old_meta['editable_files'])
        self.assertEqual(len(self.meta['editable_files']), 38)
        self.assertEqual(len(set(self.meta['editable_files'])), 38)
        for name in self.meta['editable_files']:
            self.assertEqual(self.payload[name], self.baseline[name], name)
        self.assertEqual(sum(len(item['projects']) for ident, item in self.items.items()
                             if ident.startswith('S') and ident[1:].isdigit()), 40)
        self.assertEqual({name for name in self.payload if name.startswith('TUTORIALS/') and name.endswith('.html')},
                         {f'TUTORIALS/S{number:02}.html' for number in range(1, 15)})
        for item in self.items.values():
            for key in ('entry', 'start', 'guide', 'package_id_path'):
                self.assertIn(item[key], self.payload)
        builder.validate_scope(self.payload)
        OBSERVATIONS['inventory'] = {'objects': 30, 'required_microprojects': 40,
            'editable_files': 38, 'tutorials': 14, 'optional_docx_references': 30,
            'learner_target_bytes_unchanged': True}

    def test_04_runtime_bytes_preserved_and_collection_version_guard_rebound_once(self):
        suffixes = ('.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx', '.css')
        protected = {name for name in self.baseline
                     if name.endswith(suffixes) or Path(name).name in ('package.json', 'package-lock.json')}
        self.assertTrue(protected)
        self.assertTrue(any(name.endswith('.mjs') for name in protected))
        self.assertTrue(any(Path(name).name == 'package-lock.json' for name in protected))
        control = 'VERIFY_COLLECTION.mjs'
        self.assertIn(control, protected)
        self.assertEqual(self.baseline[control].count(b'3.0.0-rc.9'), 1)
        self.assertEqual(self.payload[control],
                         self.baseline[control].replace(b'3.0.0-rc.9', b'3.0.0-rc.10', 1))
        for name in protected - {control}:
            self.assertIn(name, self.payload)
            self.assertEqual(self.payload[name], self.baseline[name], name)
        OBSERVATIONS['runtime_preservation'] = {'original_files': len(protected),
            'byte_identical_code_tests_css_and_dependency_pin_files': len(protected) - 1,
            'classroom_and_course_runtime_bytes_unchanged': True,
            'collection_metadata_control': {'path': control, 'changed_literals': 1,
                'before_literal': '3.0.0-rc.9', 'after_literal': '3.0.0-rc.10',
                'all_other_bytes_and_guard_logic_preserved': True},
            'runtime_execution_not_claimed': True}

    def test_05_docx_paths_and_all_non_document_xml_members_preserved(self):
        old_names = {name for name in self.baseline if name.endswith('.docx')}
        new_names = {name for name in self.payload if name.endswith('.docx')}
        self.assertEqual(len(old_names), 30)
        self.assertEqual(old_names, new_names)
        changed = []
        for name in sorted(old_names):
            before = rc.zip_members(self.baseline[name])
            after = rc.zip_members(self.payload[name])
            self.assertEqual(set(before), set(after), name)
            self.assertIn('word/document.xml', after, name)
            ET.fromstring(after['word/document.xml'])
            for member in before:
                if member != 'word/document.xml':
                    self.assertEqual(before[member], after[member], name + '/' + member)
            if self.payload[name] != self.baseline[name]:
                changed.append(name)
                self.assertNotEqual(before['word/document.xml'], after['word/document.xml'], name)
        self.assertTrue(changed, 'Documentary successor must admit actual Word text corrections')
        OBSERVATIONS['docx'] = {'paths': 30, 'changed_document_xml_paths': changed,
            'all_non_document_xml_bytes_preserved': True, 'word_rendering_not_claimed': True}

    def test_06_candidate_replay_and_zip_closure_are_deterministic(self):
        replay = builder.build_payload(check_source=False)
        self.assertEqual(replay, self.payload)
        first = rc.zip_bytes(self.payload, builder.COLLECTION_ROOT)
        second = rc.zip_bytes(replay, builder.COLLECTION_ROOT)
        self.assertEqual(first, second)
        self.assertEqual(rc.zip_members(first, normalized_modes=True),
                         {builder.COLLECTION_ROOT + name: data for name, data in self.payload.items()})
        self.assertEqual(self.payload['SHA256SUMS.txt'], rc.manifest(self.payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
        self.assertEqual(self.payload['PACKAGE_ID.txt'], (rc.sha(self.payload['SHA256SUMS.txt']) + '\n').encode())
        OBSERVATIONS['candidate_determinism'] = {'files': len(self.payload),
            'archive_bytes': len(first), 'archive_sha256': rc.sha(first), 'two_builds_identical': True,
            'collection_package_id': self.payload['PACKAGE_ID.txt'].decode().strip()}

    def test_07_resealed_false_scope_types_and_qualification_are_refused(self):
        mutations = [('distribution_version', '3.0.0-rc.9'), ('required_microprojects', 41),
            ('required_microprojects', True), ('native_acceptance', True),
            ('publication_qualified', True), ('qualificationVerdict', 'FINAL'),
            ('repository_package_id', '0' * 64),
            ('source_files_preserved', float(self.meta['source_files_preserved'])),
            ('classroom_source_files_preserved', 999999),
            ('classroom_source_files_preserved', float(self.meta['classroom_source_files_preserved']))]
        for key, value in mutations:
            with self.subTest(field=key, value=value):
                altered = dict(self.payload)
                meta = copy.deepcopy(self.meta)
                meta[key] = value
                altered['CLASSROOM_COLLECTION.json'] = encoded(meta)
                with self.assertRaises(ValueError):
                    builder.validate_scope(outer_seal(altered))
        altered = dict(self.payload)
        meta = copy.deepcopy(self.meta)
        meta['qualificationGates']['owner_acceptance'] = 'PASS'
        altered['CLASSROOM_COLLECTION.json'] = encoded(meta)
        with self.assertRaises(ValueError):
            builder.validate_scope(outer_seal(altered))
        for value in (999999, float(self.meta['objects'][0]['source_files_preserved'])):
            with self.subTest(object_preservation_count=value):
                altered = dict(self.payload)
                meta = copy.deepcopy(self.meta)
                meta['objects'][0]['source_files_preserved'] = value
                altered['CLASSROOM_COLLECTION.json'] = encoded(meta)
                with self.assertRaises(ValueError):
                    builder.validate_scope(outer_seal(altered))

    def test_08_resealed_existing_but_wrong_course_route_is_refused(self):
        altered = dict(self.payload)
        meta = copy.deepcopy(self.meta)
        courses = {item['object_id']: item for item in meta['objects']}
        courses['C01']['guide'] = courses['C02']['guide']
        self.assertIn(courses['C01']['guide'], altered)
        altered['CLASSROOM_COLLECTION.json'] = encoded(meta)
        with self.assertRaises(ValueError):
            builder.validate_scope(outer_seal(altered))
        altered = dict(self.payload)
        meta = copy.deepcopy(self.meta)
        objects = {item['object_id']: item for item in meta['objects']}
        objects['C01']['package_id_path'] = objects['C02']['package_id_path']
        objects['C01']['package_id'] = objects['C02']['package_id']
        altered['CLASSROOM_COLLECTION.json'] = encoded(meta)
        with self.assertRaises(ValueError):
            builder.validate_scope(outer_seal(altered))

    def test_09_nested_resealed_runtime_and_learner_answer_tamper_are_refused(self):
        targets = [self.meta['editable_files'][0]]
        targets += [name for name in self.payload if name.endswith('/CLASSROOM_RC6/verify.mjs')][:1]
        self.assertEqual(len(targets), 2)
        for name in targets:
            with self.subTest(path=name):
                altered = dict(self.payload)
                altered[name] += b'\n// forged runtime or supplied learner answer\n'
                forged = nested_seal(altered)
                self.assertEqual(forged['SHA256SUMS.txt'], rc.manifest(forged, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
                with self.assertRaises(ValueError):
                    builder.validate_scope(forged)
        for name in ('new-runtime.mjs', 'VERIFY_COLLECTION.mjs'):
            with self.subTest(root_runtime=name):
                altered = dict(self.payload)
                altered[name] = altered.get(name, b'') + b'\n// undeclared collection runtime alteration\n'
                with self.assertRaises(ValueError):
                    builder.validate_scope(outer_seal(altered))

    def test_10_resealed_provenance_tamper_is_refused(self):
        names = [name for name in self.payload if 'RC10' in Path(name).name
                 and name.endswith('.json') and name != 'CLASSROOM_COLLECTION.json']
        self.assertTrue(names, 'Candidate requires an explicit documentary provenance record')
        selected = names[:2] + ['RC10_COLLECTION_DERIVATION.json']
        self.assertIn('RC10_COLLECTION_DERIVATION.json', self.payload)
        for name in selected:
            with self.subTest(path=name):
                altered = dict(self.payload)
                record = rc.strict_json(altered[name])
                self.assertIsInstance(record, dict)
                record['forged_provenance'] = 'Undeclared mutation after resealing'
                altered[name] = encoded(record)
                with self.assertRaises(ValueError):
                    builder.validate_scope(nested_seal(altered))
        for key, value in [('predecessor_zip_sha256', '0' * 64),
                           ('predecessor_package_id', '0' * 64), ('schema', 'forged/v1')]:
            with self.subTest(global_provenance=key):
                altered = dict(self.payload)
                record = rc.strict_json(altered['RC10_DERIVATIONS.json'])
                record[key] = value
                altered['RC10_DERIVATIONS.json'] = encoded(record)
                with self.assertRaises(ValueError):
                    builder.validate_scope(outer_seal(altered))
        altered = dict(self.payload)
        record = rc.strict_json(altered['PRESERVED_RC9_FILES.json'])
        self.assertTrue(record['files'])
        record['files'].pop()
        altered['PRESERVED_RC9_FILES.json'] = encoded(record)
        with self.assertRaises(ValueError):
            builder.validate_scope(outer_seal(altered))

    def test_11_authoritative_plan_and_policy_bindings_are_exact(self):
        policy = builder.read_policy()
        plan = resolver.read_plan()
        self.assertEqual(plan['policy_sha256'], rc.sha((REPO / builder.POLICY).read_bytes()))
        self.assertEqual(plan['distribution_version'], '3.0.0-rc.10')
        self.assertIs(plan['draft'], True)
        self.assertIs(plan['prerelease'], True)
        self.assertIs(policy['final_acceptance'], False)
        self.assertEqual(set(plan['gates']), set(rc.GATES))
        self.assertTrue(all(gate['status'] == 'pending' for gate in plan['gates'].values()))

    def test_12_resolver_exact_three_assets_and_identical_replay(self):
        assets = {resolver.ARCHIVE: b'exact archive bytes', resolver.ARCHIVE + '.sha256': b'exact sidecar bytes',
                  'SHA256SUMS.txt': b'exact manifest bytes'}
        source = '1' * 64
        plan = {'gates': {name: {'status': 'pending', 'scope': 'Synthetic output fixture only'} for name in rc.GATES}}
        out = self.temporary / 'exact output with spaces'
        with patch.object(resolver, 'read_plan', return_value=plan), \
                patch.object(resolver, 'expected_collection', return_value=(assets, source, 3, {'files': 3})), \
                patch.object(rc, 'source_identity', return_value=source):
            fields, report = resolver.resolve(out, preview=True, build=True)
            first = {name: path.read_bytes() for name, path in rc.tree_files(out).items()}
            resolver.resolve(out, preview=True, build=True)
            self.assertEqual(first, assets)
            self.assertEqual({name: path.read_bytes() for name, path in rc.tree_files(out).items()}, assets)
            self.assertEqual(fields['draft'], 'true')
            self.assertEqual(fields['prerelease'], 'true')
            self.assertIs(report['publication_qualified'], False)
        OBSERVATIONS['resolver_fixture'] = {'three_assets_exact': True, 'identical_replay_allowed': True,
            'expected_collection_plan_and_source_identity_mocked': True,
            'production_build_integration_not_claimed': True}

    def test_13_resolver_refuses_corrupt_or_extra_output_without_overwrite(self):
        assets = {resolver.ARCHIVE: b'exact archive bytes', resolver.ARCHIVE + '.sha256': b'exact sidecar bytes',
                  'SHA256SUMS.txt': b'exact manifest bytes'}
        source = '1' * 64
        plan = {'gates': {name: {'status': 'pending', 'scope': 'Synthetic output fixture only'} for name in rc.GATES}}
        for scenario in ('corrupt', 'extra'):
            with self.subTest(scenario=scenario):
                out = self.temporary / scenario
                out.mkdir()
                for name, data in assets.items():
                    (out / name).write_bytes(data)
                if scenario == 'corrupt':
                    (out / (resolver.ARCHIVE + '.sha256')).write_bytes(b'preserve corrupt evidence')
                else:
                    (out / 'undeclared-private.txt').write_bytes(b'preserve private evidence')
                before = {name: path.read_bytes() for name, path in rc.tree_files(out).items()}
                with patch.object(resolver, 'read_plan', return_value=plan), \
                        patch.object(resolver, 'expected_collection', return_value=(assets, source, 3, {})), \
                        patch.object(rc, 'source_identity', return_value=source):
                    with self.assertRaises(ValueError):
                        resolver.resolve(out, preview=True, build=True)
                self.assertEqual(before, {name: path.read_bytes() for name, path in rc.tree_files(out).items()})

    def test_14_preview_boolean_and_source_output_guards_refuse_unsafe_calls(self):
        for preview, build in [(False, False), ('true', True), (True, 1), (1, True)]:
            with self.subTest(preview=preview, build=build):
                with self.assertRaises(ValueError):
                    resolver.resolve(self.temporary / 'unsafe booleans', preview=preview, build=build)
        with patch.object(resolver, 'read_plan', return_value={}):
            with self.assertRaises(ValueError):
                resolver.resolve(REPO / 'forbidden-new-output', preview=True, build=True)
        self.assertFalse((REPO / 'forbidden-new-output').exists())

    def test_15_source_change_during_construction_or_output_is_refused(self):
        plan = {'gates': {name: {'status': 'pending', 'scope': 'Synthetic guard fixture only'} for name in rc.GATES}}
        source = self.meta['repository_package_id']
        with patch.object(rc, 'source_identity', side_effect=[source, '0' * 64]), \
                patch.object(builder, 'build_payload', return_value=self.payload), \
                patch.object(builder, 'validate_scope', return_value={}):
            with self.assertRaisesRegex(ValueError, 'Source or plan changed'):
                resolver.expected_collection(plan)
        assets = {resolver.ARCHIVE: b'exact archive bytes', resolver.ARCHIVE + '.sha256': b'exact sidecar bytes',
                  'SHA256SUMS.txt': b'exact manifest bytes'}
        out = self.temporary / 'changed source output'
        with patch.object(resolver, 'read_plan', return_value=plan), \
                patch.object(resolver, 'expected_collection', return_value=(assets, source, 3, {})), \
                patch.object(rc, 'source_identity', return_value='0' * 64):
            with self.assertRaisesRegex(ValueError, 'Source or plan changed'):
                resolver.resolve(out, preview=True, build=True)
        self.assertEqual({name: path.read_bytes() for name, path in rc.tree_files(out).items()}, assets)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report')
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(ClassroomRC10)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'schema': 'webtech-classroom-rc10-focused-checks/v1',
        'status': 'PASS_SCOPED_DOCUMENTARY_AND_PACKAGING_CHECKS' if result.wasSuccessful() else 'FAIL',
        'tests': result.testsRun, 'failures': len(result.failures), 'errors': len(result.errors),
        'skipped': len(result.skipped), 'observations': OBSERVATIONS,
        'qualificationVerdict': 'NOT_FINAL', 'actions_dispatched': 0,
        'remote_tags_created': 0, 'remote_releases_created': 0,
        'historical_runtime_suites_repeated': False}
    if args.report:
        rc.atomic_write(rc.output_path(args.report, REPO), encoded(report))
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if result.wasSuccessful() else 1)


if __name__ == '__main__':
    main()
