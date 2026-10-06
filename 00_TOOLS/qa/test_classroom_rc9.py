#!/usr/bin/env python3
"""Finite RC9 composition, integrity and local release-preparation regressions.

Runs with exact Node v24.21.0. Does not install dependencies, execute completed
student solutions, dispatch Actions or publish anything. Authentic sealed input
objects remain read-only. Resolver fixtures mock ONLY the unfinished whole-source
seal, while the real builder, plan, scope and exact asset comparisons remain live.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from contextlib import contextmanager
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
import build_classroom_rc9 as builder
import build_classroom_successor as predecessor
import c07_registry_derivative as c07
import release_contract as rc
import resolve_classroom_rc9 as resolver

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
OBSERVATIONS = {}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def sealed(payload):
    result = dict(payload)
    result['SHA256SUMS.txt'] = rc.manifest(result, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    result['PACKAGE_ID.txt'] = (rc.sha(result['SHA256SUMS.txt']) + '\n').encode()
    return result


class ClassroomRC9(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.node = shutil.which(NODE) or NODE
        version = subprocess.run([cls.node, '--version'], capture_output=True,
                                 text=True, check=True, timeout=10).stdout.strip()
        if version != 'v24.21.0':
            raise ValueError('Exact Node v24.21.0 required before tests; observed ' + version)
        cls.baseline = predecessor.build_payload(check_source=False)
        cls.payload = builder.build_payload(check_source=False)
        cls.meta = rc.strict_json(cls.payload['CLASSROOM_COLLECTION.json'])
        cls.items = {item['object_id']: item for item in cls.meta['objects']}
        cls.old_meta = rc.strict_json(cls.baseline['CLASSROOM_COLLECTION.json'])
        cls.temp = tempfile.TemporaryDirectory(prefix='webtech-rc9-composition-')
        cls.temporary = Path(cls.temp.name)
        OBSERVATIONS['runtime'] = {'executable': cls.node, 'node': version,
            'exact_reference': True, 'platform': sys.platform}
        OBSERVATIONS['source_seal_fixture'] = {
            'whole_repository_seal_checked': False,
            'builder_check_source_false_in_unit_setup': True,
            'resolver_only_source_identity_is_mocked': True,
            'production_source_seal_check_removed': False}

    @classmethod
    def tearDownClass(cls):
        root = cls.temporary
        cls.temp.cleanup()
        if root.exists():
            raise AssertionError('Suite-owned temporary directory was not removed')

    @contextmanager
    def fresh(self, payload=None):
        """A new owned directory for each case; assert removal even after refusal."""
        temporary = tempfile.TemporaryDirectory(prefix='fresh case with spaces ',
                                                 dir=self.temporary)
        root = Path(temporary.name)
        try:
            if payload is not None:
                tree = root / 'collection with spaces'
                rc.write_tree(tree, payload)
                yield tree
            else:
                yield root
        finally:
            temporary.cleanup()
            self.assertFalse(root.exists(), 'Fresh test directory leaked')

    @contextmanager
    def scoped_source_seal(self):
        # This is deliberately confined to the unit fixture. The real resolver
        # rebuilds, validates, packages and compares every expected asset byte.
        with patch.object(rc, 'source_identity', return_value=self.meta['repository_package_id']):
            yield

    def command(self, root, arguments, label):
        environment = dict(os.environ)
        for name in ('NODE_OPTIONS', 'NODE_PATH', 'NODE_TEST_CONTEXT'):
            environment.pop(name, None)
        result = subprocess.run([self.node, *arguments], cwd=root, env=environment,
                                capture_output=True, text=True, timeout=35)
        OBSERVATIONS.setdefault('commands', []).append({'case': label,
            'arguments': arguments, 'exit_code': result.returncode,
            'stdout': result.stdout, 'stderr': result.stderr})
        return result

    def verify_collection(self, root, edited=False, label='collection verification'):
        return self.command(root, ['VERIFY_COLLECTION.mjs'] +
                            (['--allow-student-edits'] if edited else []), label)

    def c07_boundary(self, root, example='01', label='C07 source guard'):
        module = (root / 'tools/examples.mjs').as_uri()
        script = 'const m=await import(' + json.dumps(module) + ');console.log(JSON.stringify(m.sourceBoundary(' + json.dumps(example) + ')));'
        result = self.command(root, ['--input-type=module', '-e', script], label)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        answer = rc.strict_json(result.stdout.encode())
        self.assertEqual(set(answer), {'files', 'errors'})
        self.assertIs(type(answer['files']), int)
        self.assertIsInstance(answer['errors'], list)
        return answer

    def tree_bytes(self, root):
        return {name: path.read_bytes() for name, path in rc.tree_files(root).items()}

    def expected_assets(self):
        with self.scoped_source_seal():
            assets, source, count, links = resolver.expected_collection(resolver.read_plan())
        self.assertEqual(source, self.meta['repository_package_id'])
        self.assertEqual(count, len(self.payload))
        return assets

    def test_01_fixed_inventory_and_exact_student_targets_remain_incomplete(self):
        self.assertEqual(set(self.items), rc.OBJECTS)
        self.assertEqual(len(self.items), 30)
        self.assertEqual(self.meta['required_microprojects'], 40)
        self.assertEqual(self.meta['tutorials'], 14)
        self.assertEqual(len(self.meta['editable_files']), 38)
        self.assertEqual(len(set(self.meta['editable_files'])), 38)
        self.assertEqual(sum(len(item['projects']) for ident, item in self.items.items()
                             if ident.startswith('S') and ident[1:].isdigit()), 40)
        self.assertEqual({name for name in self.payload if name.startswith('TUTORIALS/') and name.endswith('.html')},
                         {f'TUTORIALS/S{number:02}.html' for number in range(1, 15)})
        for name in self.meta['editable_files']:
            self.assertEqual(self.payload[name], self.baseline[name], name)
        self.assertEqual(self.meta['editable_files'], self.old_meta['editable_files'])
        for ident, item in self.items.items():
            if ident.startswith('S') and ident[1:].isdigit():
                expected_ids = ['P01', 'P02'] if ident == 'S01' else ['P01', 'P03'] if ident == 'S14' else ['P01', 'P02', 'P03']
                self.assertEqual([project['id'] for project in item['projects']], expected_ids)
                self.assertIn(item['tutorial'], self.payload)
                self.assertIn(f'TW2026_{ident}_GROUP_Surname_Firstname.pdf'.encode(), self.payload[item['tutorial']])
        resolver.validate_scope(self.payload)
        OBSERVATIONS['fixed_inventory'] = {'objects': 30, 'microprojects': 40,
            'editable_files': 38, 'tutorials': 14, 'all_student_target_bytes_unchanged': True}

    def test_02_derivative_manifests_and_provenance_bind_actual_unit_bytes(self):
        expected_derivatives = {'C07', 'C08', 'C09', 'C10', 'C14'} | {f'S{i:02}' for i in range(1, 15)}
        actual = {ident for ident, item in self.items.items() if item.get('derivation')}
        self.assertEqual(actual, expected_derivatives)
        old_items = {item['object_id']: item for item in self.old_meta['objects']}
        for ident in actual:
            item = self.items[ident]
            prefix = item['payload_root']
            unit = {name[len(prefix):]: data for name, data in self.payload.items() if name.startswith(prefix)}
            self.assertEqual(unit['SHA256SUMS.txt'], rc.manifest(unit, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
            self.assertEqual(unit['PACKAGE_ID.txt'], (rc.sha(unit['SHA256SUMS.txt']) + '\n').encode())
            descriptor = rc.strict_json(self.payload[item['derivation']])
            self.assertEqual(descriptor['object_id'], ident)
            self.assertIs(descriptor['student_answers_supplied'], False)
            self.assertIs(descriptor['final_acceptance'], False)
            self.assertEqual(descriptor['predecessor_package_id'], old_items[ident]['package_id'])
            self.assertNotEqual(item['package_id'], old_items[ident]['package_id'])
            for row in descriptor['changed_files_before_package_controls']:
                name = prefix + row['path']
                self.assertEqual(row['before_sha256'], rc.sha(self.baseline[name]) if name in self.baseline else None)
                self.assertEqual(row['after_sha256'], rc.sha(self.payload[name]) if name in self.payload else None)
        canonical_rebinds = {}
        for ident in ('C08', 'C09', 'C10', 'C14'):
            prefix = self.items[ident]['payload_root']
            index = rc.strict_json(self.payload[prefix + 'CANONICAL_SOURCES.json'])
            previous = rc.strict_json(self.baseline[prefix + 'CANONICAL_SOURCES.json'])
            key = 'public_path' if ident == 'C14' else 'path'
            rows = {row[key]: row for row in index['files']}
            old_rows = {row[key]: row for row in previous['files']}
            self.assertEqual(len(rows), len(index['files']), ident + ' canonical duplicates')
            self.assertEqual(set(rows), set(old_rows), ident + ' canonical inventory')
            changed_paths = []
            for name, row in rows.items():
                data = self.payload[prefix + name]
                old_data = self.baseline[prefix + name]
                self.assertIs(type(row['bytes']), int, ident + '/' + name)
                self.assertEqual(row['sha256'], rc.sha(data), ident + '/' + name)
                self.assertEqual(row['bytes'], len(data), ident + '/' + name)
                if data != old_data:
                    changed_paths.append(name)
                    self.assertEqual(row['predecessor_sha256'], old_rows[name]['sha256'])
                    self.assertIs(type(row['predecessor_bytes']), int)
                    self.assertEqual(row['predecessor_bytes'], old_rows[name]['bytes'])
                    self.assertEqual(row['mode'], 'EXPLICIT_RC9_DERIVATIVE')
                    if 'mode' in old_rows[name]:
                        self.assertEqual(row['predecessor_mode'], old_rows[name]['mode'])
                    for field in ('source', 'source_path'):
                        if field in old_rows[name]:
                            self.assertEqual(row[field], old_rows[name][field])
                else:
                    self.assertEqual(row, old_rows[name], ident + '/' + name)
            self.assertTrue(changed_paths, ident + ' must bind its changed canonical documentation')
            self.assertEqual(index['distribution_version'], builder.VERSION)
            canonical_rebinds[ident] = {'rows': len(rows), 'changed_paths': changed_paths,
                'all_current_hashes_and_integer_byte_counts_match': True,
                'changed_rows_retain_exact_predecessor_identity': True}
        OBSERVATIONS['canonical_course_rebinding'] = canonical_rebinds
        records = rc.strict_json(self.payload['PRESERVED_SOURCE_FILES.json'])['files']
        self.assertEqual(len({row['path'] for row in records}), len(records))
        for row in records:
            self.assertIs(type(row['bytes']), int)
            self.assertEqual(self.payload[row['path']], self.baseline[row['path']])
        self.assertEqual(self.meta['source_files_preserved'], len(records))
        self.assertEqual(self.meta['classroom_source_files_preserved'], sum('/CLASSROOM_RC6/' in row['path'] for row in records))

    def test_03_deterministic_archive_manifest_and_package_id_closure(self):
        replay = builder.build_payload(check_source=False)
        self.assertEqual(replay, self.payload)
        first = rc.zip_bytes(self.payload, builder.COLLECTION_ROOT)
        second = rc.zip_bytes(replay, builder.COLLECTION_ROOT)
        self.assertEqual(first, second)
        self.assertEqual(rc.zip_members(first, normalized_modes=True),
                         {builder.COLLECTION_ROOT + name: data for name, data in self.payload.items()})
        manifest = self.payload['SHA256SUMS.txt']
        self.assertEqual(manifest, rc.manifest(self.payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
        self.assertEqual(self.payload['PACKAGE_ID.txt'], (rc.sha(manifest) + '\n').encode())
        self.assertEqual(set(rc.parse_manifest(manifest)), set(self.payload) - {'SHA256SUMS.txt', 'PACKAGE_ID.txt'})
        OBSERVATIONS['deterministic_archive'] = {'files': len(self.payload),
            'bytes': len(first), 'sha256': rc.sha(first), 'replay_identical': True,
            'current_package_id': self.payload['PACKAGE_ID.txt'].decode().strip()}

    def test_04_all_fourteen_resealed_classroom_boundaries_and_initial_checks(self):
        for ident in [f'S{i:02}' for i in range(1, 15)]:
            with self.subTest(seminar=ident), self.fresh(self.payload) as root:
                item = self.items[ident]
                package = root / item['payload_root']
                for mode, status in [('initial', 'PASS_INITIAL_CLASSROOM_SOURCE'),
                                     ('work', 'PASS_MUTABLE_CLASSROOM_BOUNDARY')]:
                    result = self.command(package, ['CLASSROOM_RC6/verify.mjs', mode], ident + ' resealed ' + mode)
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertEqual(rc.strict_json(result.stdout.encode())['status'], status)
                runner = 'kit.mjs' if int(ident[1:]) <= 7 else 'check.mjs'
                initial = self.command(package, ['CLASSROOM_RC6/' + runner, 'initial'], ident + ' untouched objective expectations')
                self.assertEqual(initial.returncode, 0, initial.stdout + initial.stderr)
                expected_status = 'PASS_ORIGINAL_STARTER_ASSERTIONS' if runner == 'kit.mjs' else 'PASS_UNTOUCHED_CLASSROOM_STARTER'
                # kit emits multiline JSON; check emits TAP before one JSON line.
                status_output = initial.stdout if runner == 'kit.mjs' else initial.stdout.strip().splitlines()[-1]
                self.assertEqual(rc.strict_json(status_output.encode())['status'], expected_status)
                form = package / 'CLASSROOM_RC6/EVIDENCE_FORM.html'
                original = form.read_bytes()
                form.write_bytes(original + b'\n<!-- finite protected-form mutation -->\n')
                refused = self.command(package, ['CLASSROOM_RC6/verify.mjs', 'work'], ident + ' form mutation refused')
                self.assertEqual(refused.returncode, 2, refused.stdout + refused.stderr)
        OBSERVATIONS['classroom_boundary_checks'] = {'seminars': 14,
            'initial_and_work_boundary_modes_passed': True,
            'intended_initial_assertions_recognised': True,
            'protected_form_tamper_refused_for_every_seminar': True,
            'completed_student_work_claimed': False}

    def test_05_current_c07_actual_guard_all_examples_without_dependencies(self):
        item = self.items['C07']
        prefix = item['payload_root']
        unit = {name[len(prefix):]: data for name, data in self.payload.items() if name.startswith(prefix)}
        rows = rc.strict_json(unit['CANONICAL_SOURCES.json'])
        self.assertEqual({row['path'] for row in rows}, c07.EXPECTED_PATHS)
        for row in rows:
            self.assertEqual(row['sha256'], rc.sha(unit[row['path']]))
        with self.fresh(unit) as root:
            for example in ('01', '02', '03', '04', '05'):
                self.assertEqual(self.c07_boundary(root, example), {'files': 4, 'errors': []})
            result = self.command(root, ['tools/examples.mjs', 'preflight', '01'], 'C07 missing dependencies are not readiness')
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = rc.strict_json(result.stdout.encode())
            self.assertEqual(report['source'], {'files': 4, 'errors': []})
            self.assertIs(report['ready'], False)
        OBSERVATIONS['c07_actual_guard'] = {'five_source_guards_clear': True,
            'zero_preflight_exit_without_dependencies_is_ready': False,
            'database_or_framework_execution_claimed': False}

    def test_06_c07_guard_refuses_each_source_kind_and_malformed_registry(self):
        prefix = self.items['C07']['payload_root']
        unit = {name[len(prefix):]: data for name, data in self.payload.items() if name.startswith(prefix)}
        directory = 'canonical/01-relationship-shapes/'
        for leaf in ('example.js', 'README.md', 'package.json', 'package-lock.json'):
            changed = dict(unit)
            changed[directory + leaf] += b'\nQA changed source\n'
            with self.subTest(source=leaf), self.fresh(changed) as root:
                self.assertTrue(self.c07_boundary(root)['errors'])
        rows = rc.strict_json(unit['CANONICAL_SOURCES.json'])
        duplicate = copy.deepcopy(rows); duplicate[1] = copy.deepcopy(duplicate[0])
        unsafe = copy.deepcopy(rows); unsafe[0]['path'] = '../outside/example.js'
        for label, data in [('malformed', b'{'), ('duplicate', encoded(duplicate)), ('unsafe path', encoded(unsafe))]:
            changed = dict(unit); changed['CANONICAL_SOURCES.json'] = data
            with self.subTest(case=label), self.fresh(changed) as root:
                self.assertTrue(self.c07_boundary(root)['errors'])

    def test_07_collection_initial_and_allowed_edits_remain_distinct(self):
        with self.fresh(self.payload) as root:
            initial = self.verify_collection(root)
            protected = self.verify_collection(root, True)
            self.assertEqual(initial.returncode, 0, initial.stdout + initial.stderr)
            self.assertEqual(protected.returncode, 0, protected.stdout + protected.stderr)
            self.assertEqual(rc.strict_json(initial.stdout.encode())['status'], 'PASS_INITIAL_BYTES_ONLY')
            target = self.meta['editable_files'][0]
            (root / target).write_bytes(self.payload[target] + b'\n// finite permitted learner edit\n')
            self.assertEqual(self.verify_collection(root).returncode, 2)
            accepted = self.verify_collection(root, True)
            self.assertEqual(accepted.returncode, 0, accepted.stdout + accepted.stderr)
            self.assertEqual(rc.strict_json(accepted.stdout.encode())['allowedStudentChanges'], [target])
            self.assertIs(rc.strict_json(accepted.stdout.encode())['studentProjectsQualified'], False)

    def test_08_collection_rejects_protected_tamper_and_unexpected_files(self):
        protected = [self.items['S01']['form'], 'TUTORIALS/S01.html', 'course-map.json']
        for name in protected:
            with self.subTest(path=name), self.fresh(self.payload) as root:
                (root / name).write_bytes(self.payload[name] + b'\nQA protected mutation\n')
                for edited in (False, True):
                    self.assertEqual(self.verify_collection(root, edited).returncode, 2)
        with self.fresh(self.payload) as root:
            (root / 'undeclared.txt').write_bytes(b'Preserve the existing fixture.\n')
            for edited in (False, True):
                self.assertEqual(self.verify_collection(root, edited).returncode, 2)

    def test_09_collection_rejects_same_byte_file_and_directory_symlinks(self):
        for directory in (False, True):
            with self.subTest(directory=directory), self.fresh(self.payload) as root:
                if directory:
                    source = root / 'TUTORIALS'
                    outside = root.parent / 'same byte tutorial directory'
                    source.rename(outside); source.symlink_to(outside, target_is_directory=True)
                else:
                    source = root / 'TUTORIALS/S01.html'
                    outside = root.parent / 'same byte tutorial.html'
                    outside.write_bytes(source.read_bytes()); source.unlink(); source.symlink_to(outside)
                for edited in (False, True):
                    self.assertEqual(self.verify_collection(root, edited).returncode, 2)

    def test_10_resolver_preview_and_build_require_true_boolean_arguments(self):
        cases = [(False, True), ('true', True), (1, True), (True, 'true'), (True, 1), (None, False)]
        for preview, build in cases:
            with self.subTest(preview=preview, build=build), self.fresh() as root:
                out = root / 'assets'
                with self.assertRaises(ValueError):
                    resolver.resolve(out, preview=preview, build=build)
                self.assertFalse(out.exists(), 'Refused flags wrote an output directory')

    def test_11_release_plan_flags_are_actual_booleans_not_equal_integers(self):
        for key in ('draft', 'prerelease'):
            with self.subTest(flag=key), self.fresh() as root:
                for rel in (resolver.PLAN, resolver.POLICY, resolver.NOTES):
                    destination = root / rel; destination.parent.mkdir(parents=True, exist_ok=True)
                    destination.write_bytes((REPO / rel).read_bytes())
                plan = rc.strict_json((root / resolver.PLAN).read_bytes()); plan[key] = 1
                (root / resolver.PLAN).write_bytes(encoded(plan))
                with patch.object(resolver, 'ROOT', root), self.assertRaises(ValueError):
                    resolver.read_plan()

    def test_12_self_consistent_false_scope_metadata_is_refused(self):
        cases = [('FINAL', 'qualificationVerdict', 'FINAL'),
                 ('wrong project count', 'required_microprojects', 39),
                 ('wrong tutorial count', 'tutorials', 13),
                 ('boolean project count', 'required_microprojects', True),
                 ('boolean tutorial count', 'tutorials', True),
                 ('boolean optional reference count', 'optional_docx_references', True),
                 ('integer masquerading as native False', 'native_acceptance', 0),
                 ('integer masquerading as publication False', 'publication_qualified', 0)]
        for label, key, value in cases:
            forged = dict(self.payload); meta = copy.deepcopy(self.meta); meta[key] = value
            forged['CLASSROOM_COLLECTION.json'] = encoded(meta); forged = sealed(forged)
            with self.subTest(case=label), self.assertRaises(ValueError):
                resolver.validate_scope(forged)

    def test_13_resolver_exact_three_assets_and_idempotent_replay(self):
        with self.fresh() as root, self.scoped_source_seal():
            out = root / 'assets with spaces'
            fields, report = resolver.resolve(out, preview=True, build=True)
            before = self.tree_bytes(out)
            self.assertEqual(set(before), {resolver.ARCHIVE, resolver.ARCHIVE + '.sha256', 'SHA256SUMS.txt'})
            stats = {name: (out / name).stat().st_mtime_ns for name in before}
            again_fields, again_report = resolver.resolve(out, preview=True, build=True)
            self.assertEqual(again_fields, fields); self.assertEqual(again_report, report)
            self.assertEqual(self.tree_bytes(out), before)
            self.assertEqual({name: (out / name).stat().st_mtime_ns for name in before}, stats)
            read_fields, read_report = resolver.resolve(out, preview=True, build=False)
            self.assertEqual((read_fields, read_report), (fields, report))
            self.assertEqual(fields['draft'], 'true'); self.assertEqual(fields['prerelease'], 'true')
            self.assertIs(report['publication_qualified'], False)
            self.assertIs(report['release_created'], False); self.assertIs(report['tag_created'], False)
            self.assertEqual(report['actions_dispatched'], 0)
        OBSERVATIONS['local_resolver'] = {'three_exact_assets': True,
            'real_builder_and_asset_comparison': True, 'idempotent_identical_byte_replay': True,
            'actions_dispatched': 0, 'remote_release_created': False}

    def test_14_resolver_conflicts_refuse_before_any_write_and_preserve_all_existing_bytes(self):
        assets = self.expected_assets()
        for name in sorted(assets):
            with self.subTest(conflict=name), self.fresh() as root, self.scoped_source_seal():
                out = root / 'assets'; out.mkdir()
                (out / name).write_bytes(b'Existing conflicting bytes must be preserved.\n')
                before = self.tree_bytes(out)
                with self.assertRaises(ValueError):
                    resolver.resolve(out, preview=True, build=True)
                self.assertEqual(self.tree_bytes(out), before)
        with self.fresh() as root, self.scoped_source_seal():
            out = root / 'assets'; out.mkdir(); (out / 'undeclared.txt').write_bytes(b'Existing private note.\n')
            before = self.tree_bytes(out)
            with self.assertRaisesRegex(ValueError, 'undeclared'):
                resolver.resolve(out, preview=True, build=True)
            self.assertEqual(self.tree_bytes(out), before)

    def test_15_resolver_no_build_missing_assets_and_symlinks_do_not_mutate(self):
        with self.fresh() as root, self.scoped_source_seal():
            out = root / 'missing assets'
            with self.assertRaises(ValueError):
                resolver.resolve(out, preview=True, build=False)
            self.assertFalse(out.exists())
        assets = self.expected_assets()
        for link_root in (False, True):
            with self.subTest(root_link=link_root), self.fresh() as root, self.scoped_source_seal():
                out = root / 'assets'; actual = root / 'actual target'; actual.mkdir()
                if link_root:
                    out.symlink_to(actual, target_is_directory=True)
                else:
                    out.mkdir(); target = actual / 'same byte.zip'; target.write_bytes(assets[resolver.ARCHIVE])
                    (out / resolver.ARCHIVE).symlink_to(target)
                actual_before = self.tree_bytes(actual)
                with self.assertRaises(ValueError):
                    resolver.resolve(out, preview=True, build=True)
                self.assertEqual(self.tree_bytes(actual), actual_before)

    def test_16_self_resealed_tutorial_is_local_consistency_but_not_a_declared_release_asset(self):
        forged = dict(self.payload)
        forged['TUTORIALS/S01.html'] += b'\n<!-- externally changed self-resealed tutorial -->\n'
        forged = sealed(forged)
        # A self-created hash set cannot prove author identity. Demonstrate that
        # honestly, rather than falsely expecting hashes to authenticate origin.
        with self.fresh(forged) as root:
            local = self.verify_collection(root)
            self.assertEqual(local.returncode, 0, local.stdout + local.stderr)
            self.assertIs(rc.strict_json(local.stdout.encode())['studentProjectsQualified'], False)
        archive = rc.zip_bytes(forged, builder.COLLECTION_ROOT)
        fake_assets = {resolver.ARCHIVE: archive,
                       resolver.ARCHIVE + '.sha256': (rc.sha(archive) + '  ' + resolver.ARCHIVE + '\n').encode()}
        fake_assets['SHA256SUMS.txt'] = rc.manifest(fake_assets)
        with self.fresh() as root, self.scoped_source_seal():
            out = root / 'self consistent forged assets'; out.mkdir()
            for name, data in fake_assets.items():
                (out / name).write_bytes(data)
            before = self.tree_bytes(out)
            with self.assertRaises(ValueError):
                resolver.resolve(out, preview=True, build=True)
            self.assertEqual(self.tree_bytes(out), before)
        OBSERVATIONS['forged_asset_boundary'] = {'self_resealed_hashes_prove_authorship': False,
            'local_byte_consistency_can_pass_for_self_resealed_tutorial': True,
            'resolver_compares_actual_assets_to_real_expected_builder_bytes': True,
            'forged_existing_assets_not_overwritten': True}

    def test_17_cli_output_receipt_overlap_refuses_before_build_without_writes(self):
        for workflow in (False, True):
            for relation in ('inside', 'same path', 'ancestor'):
                with self.subTest(workflow=workflow, relation=relation), self.fresh() as root:
                    (root / 'existing note.txt').write_bytes(b'Existing unrelated bytes stay intact.\n')
                    asset_dir = root / 'release assets'
                    receipt = asset_dir / 'receipt.txt'
                    if relation == 'same path':
                        receipt = asset_dir
                    elif relation == 'ancestor':
                        receipt = root / 'receipt parent'
                        asset_dir = receipt / 'release assets'
                    before = self.tree_bytes(root)
                    arguments = ['resolve_classroom_rc9.py', '--asset-dir', str(asset_dir),
                                 '--github-output', str(receipt), '--allow-preview', '--build']
                    if workflow:
                        arguments.append('--workflow-output')
                    with patch.object(sys, 'argv', arguments), self.scoped_source_seal():
                        with self.assertRaisesRegex(ValueError, 'Output receipt must be separate'):
                            resolver.main()
                    self.assertEqual(self.tree_bytes(root), before)
                    self.assertFalse(asset_dir.exists(), 'CLI refusal created an asset directory')
                    self.assertFalse(receipt.exists(), 'CLI refusal created a receipt path')
        OBSERVATIONS['cli_receipt_boundary'] = {
            'actual_argument_parser_and_main_exercised': True,
            'normal_and_workflow_output_modes_checked': True,
            'inside_same_and_ancestor_receipts_refused_before_build': True,
            'all_existing_bytes_preserved': True, 'new_paths_created': False}


def main():
    global NODE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', default=NODE, help='Exact Node v24.21.0 executable')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    NODE = args.node
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'schema': 'webtech-classroom-rc9-finite-qa/v1',
        'status': 'PASS_SCOPED_LOCAL_QA' if result.wasSuccessful() else 'FAIL_SCOPED_LOCAL_QA',
        'tests_run': result.testsRun, 'errors': len(result.errors), 'failures': len(result.failures),
        'actions_dispatched': 0, 'qualificationVerdict': 'NOT_FINAL',
        'source_seal_checked_by_this_suite': False,
        'qualificationGates': {gate: 'pending' for gate in rc.GATES},
        'limitations': 'Finite RC9 composition, runtime integrity guards and local publication preparation. Source seal mocked only inside scoped resolver fixtures. No dependency installation, completed student solutions, native Windows/macOS, manual browser/PDF/Word, live Moodle, student pilot or owner acceptance qualification.',
        'observations': OBSERVATIONS}
    if args.report:
        rc.atomic_write(rc.output_path(args.report), encoded(report))
    print(json.dumps({key: report[key] for key in ('status', 'tests_run', 'errors', 'failures', 'qualificationVerdict', 'actions_dispatched')}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
