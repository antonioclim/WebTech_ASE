#!/usr/bin/env python3
"""Bounded RC10 static-site composition, admission and refusal tests.

Reconstruct one shared fixture core. Only the separately required production
source-seal check is bypassed in that fixture; real publication controls, finite
link/fragment checks and the actual Node outer verifier remain exercised.
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
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '00_TOOLS/publishing'))
import build_classroom_rc10 as classroom
import build_classroom_rc10_site as builder
import release_contract as rc
import validate_classroom_rc10_site as validator

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
OBSERVATIONS = {}
EXPECTED_RELEASE = 'https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10'
EXPECTED_DOWNLOAD_BASE = 'https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.10/'
EXPECTED_SOURCE_COMMIT = 'b2bbe3edba9e4d9a1955c0b5edd5cf2247576416'
EXPECTED_PUBLISHED_PACKAGE = '1ae203d4bba59319b00406852fd36d283b17baea76bb905dbc7d7ae050a31156'
EXPECTED_ASSETS = {
    'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip': {
        'id': 616617532, 'bytes': 4357345,
        'sha256': 'a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9'},
    'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256': {
        'id': 616617533, 'bytes': 111,
        'sha256': '79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a'},
    'SHA256SUMS.txt': {
        'id': 616617534, 'bytes': 229,
        'sha256': '6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2'},
}
EXPECTED_OBJECTS = {f'{kind}{number:02}' for kind in 'CS' for number in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
EXPECTED_ADDED = {'.nojekyll', 'SITE_SCOPE.json', 'DOWNLOAD_RC10.html',
                  'PUBLICATION/CLASSROOM_RC10_PUBLICATION.json', 'PUBLICATION/RC10_PUBLICATION.md'}
EXPECTED_CHANGED = {'index.html', 'START_HERE.html', 'QUALIFICATION.html',
                    'COURSE_PLAN.html', 'ASSESSMENT.html', 'README.md',
                    'ENTRY/SETUP_WINDOWS.html', 'ENTRY/SETUP_MACOS_LINUX.html',
                    'SHA256SUMS.txt', 'PACKAGE_ID.txt'}
EXPECTED_ENTRY_IDENTITIES = {
    'ENTRY/SETUP_WINDOWS.html': (
        'bb194285927917df69fed1d60437e283dc1f27c96eb7250048386e9e4f438c77',
        '5314647cf782c16a744e7f11875c34be7d8994e2e472a55e3d598b56f77f5f05'),
    'ENTRY/SETUP_MACOS_LINUX.html': (
        '25d5073f3267c0bc3a253afc07c79c4a183bceb41b088b6cb1e0b43427499698',
        '5e2d6c0a39bda26aeb7babd9bd13966b352750431d7efb09e70430f756d8ef34'),
}


def reseal(payload):
    payload['SHA256SUMS.txt'] = rc.manifest(payload, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
    payload['PACKAGE_ID.txt'] = (rc.sha(payload['SHA256SUMS.txt']) + '\n').encode()
    return payload


class ClassroomRC10Site(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.node = shutil.which(NODE) or NODE
        version = subprocess.run([cls.node, '--version'], capture_output=True,
                                 text=True, check=True, timeout=10).stdout.strip()
        if version != 'v24.21.0':
            raise ValueError('Exact Node v24.21.0 required; observed ' + version)
        cls.core = classroom.build_payload(check_source=False)
        cls.receipt = builder.read_publication()
        cls.site = builder.compose_payload(cls.core, cls.receipt)
        cls.meta = rc.strict_json(cls.core['CLASSROOM_COLLECTION.json'])
        OBSERVATIONS['scope'] = {'node': version, 'platform': sys.platform,
            'shared_core_reconstructions': 1, 'unit_fixture_source_seal_checked': False,
            'production_default_source_seal_required': True, 'actions_dispatched': 0,
            'native_acceptance': False, 'hosted_runs_or_release_downloads_performed': False}

    def setUp(self):
        # Subsequent tests exercise actual composition/admission/output paths,
        # sharing only the expensive deterministic frozen core reconstruction.
        self.core_patch = patch.object(classroom, 'build_payload', return_value=dict(self.core))
        self.core_patch.start()
        self.addCleanup(self.core_patch.stop)

    def fresh(self):
        return tempfile.TemporaryDirectory(prefix='rc10 static reading with spaces ')

    def test_01_composition_preserves_units_tutorials_and_declares_two_reversible_entries(self):
        self.assertEqual(len(self.core), 1452)
        self.assertEqual(set(self.site) - set(self.core), EXPECTED_ADDED)
        self.assertEqual(set(self.core) - set(self.site), set())
        changed = {n for n in self.core if self.core[n] != self.site[n]}
        self.assertEqual(changed, EXPECTED_CHANGED)
        self.assertEqual({i['object_id'] for i in self.meta['objects']}, EXPECTED_OBJECTS)
        unit_files = set()
        for item in self.meta['objects']:
            prefix = item['payload_root'].rstrip('/') + '/'
            names = {n for n in self.core if n.startswith(prefix)}
            self.assertTrue(names)
            unit_files.update(names)
            for name in names:
                self.assertEqual(self.site[name], self.core[name], name)
            name = item['entry']
            if name in EXPECTED_ENTRY_IDENTITIES:
                self.assertEqual(self.site[name], self.core[name].replace(
                    b'</style>', b'h1{overflow-wrap:anywhere}</style>', 1))
                self.assertEqual(self.site[name].replace(b'h1{overflow-wrap:anywhere}</style>',
                                                       b'</style>', 1), self.core[name])
                self.assertEqual(rc.sha(self.core[name]), EXPECTED_ENTRY_IDENTITIES[name][0])
                self.assertEqual(rc.sha(self.site[name]), EXPECTED_ENTRY_IDENTITIES[name][1])
            else:
                self.assertEqual(self.site[name], self.core[name])
        tutorials = [n for n in self.core if n.startswith('TUTORIALS/')]
        self.assertEqual(len(tutorials), 14)
        for name in tutorials:
            self.assertEqual(self.site[name], self.core[name])
        self.assertEqual(builder.build_payload(check_source=False), self.site)
        OBSERVATIONS['composition'] = {'unit_count': 30, 'unit_files_compared': len(unit_files),
            'entry_pages_unchanged': 28, 'tutorials_unchanged': 14, 'entry_css_only_derivatives': 2,
            'entry_derivatives_reversible_exactly': True, 'global_table_css_derivatives': 2,
            'added_files': sorted(EXPECTED_ADDED), 'changed_core_files': sorted(changed)}

    def test_02_publication_is_independently_pinned_and_outer_controls_are_honest(self):
        scope = rc.strict_json(self.site['SITE_SCOPE.json'])
        self.assertEqual(scope['published_classroom_package_id'], EXPECTED_PUBLISHED_PACKAGE)
        self.assertEqual(scope['published_source_commit'], EXPECTED_SOURCE_COMMIT)
        self.assertEqual(scope['release_id'], 405127973)
        self.assertEqual(scope['published_at'], '2026-10-06T21:27:43Z')
        self.assertEqual(scope['source_publication_status'], 'PUBLISHED_PRERELEASE')
        self.assertEqual(scope['entry_policy'],
                         'TWENTY_EIGHT_EXACT_CORE_ENTRY_COPIES_AND_TWO_DECLARED_CSS_ONLY_DERIVATIVES')
        self.assertEqual(len(scope['entry_derivatives']), 2)
        for row in scope['entry_derivatives']:
            self.assertEqual((row['source_sha256'], row['site_sha256']), EXPECTED_ENTRY_IDENTITIES[row['path']])
            self.assertEqual(row['css'], 'h1{overflow-wrap:anywhere}')
            self.assertEqual(row['bytes_added'], 26)
            self.assertIs(row['text_links_and_scripts_unchanged'], True)
        self.assertEqual({row['path'] for row in scope['global_css_derivatives']},
                         {'index.html', 'COURSE_PLAN.html'})
        for row in scope['global_css_derivatives']:
            self.assertEqual(row['css'], 'table{table-layout:fixed;overflow-wrap:anywhere}')
            self.assertEqual(row['bytes_added'], 48)
            self.assertIs(row['text_links_and_scripts_unchanged_by_css'], True)
        self.assertEqual(scope['publication_record_policy'],
                         'FINITE_EXACT_RECEIPT_AND_BOUNDED_NOTE_LINK_DERIVATIVE')
        note_source = (ROOT / '90_RELEASES/RC10_PUBLICATION.md').read_bytes()
        note = self.site['PUBLICATION/RC10_PUBLICATION.md']
        self.assertNotEqual(note, note_source)
        self.assertEqual(len(scope['publication_note_derivative']['url_replacements']), 3)
        self.assertEqual(scope['publication_note_derivative']['source_sha256'], rc.sha(note_source))
        self.assertEqual(scope['publication_note_derivative']['site_sha256'], rc.sha(note))
        self.assertEqual(scope['publication_note_derivative']['external_procedure_url_policy'],
                         'EVOLVING_MAIN_GUIDE_NOT_PINNED_RELEASE_SOURCE')
        self.assertEqual(self.site['PUBLICATION/CLASSROOM_RC10_PUBLICATION.json'],
                         (ROOT / '90_RELEASES/CLASSROOM_RC10_PUBLICATION.json').read_bytes())
        self.assertGreater(validator.finite_markdown_links(self.site), 0)
        self.assertEqual(set(scope['objects']), EXPECTED_OBJECTS)
        for row in scope['published_assets']:
            expected = EXPECTED_ASSETS[row['name']]
            self.assertEqual(row, {'name': row['name'], **expected,
                                  'state': 'uploaded',
                                  'download_url': EXPECTED_DOWNLOAD_BASE + row['name']})
            self.assertIn(expected['sha256'], self.site['DOWNLOAD_RC10.html'].decode())
        self.assertEqual(len(scope['published_assets']), 3)
        self.assertEqual(scope['recorded_workflow']['tests'], {
            'focused_rc10': {'defined': 15, 'passed': 15, 'skipped': 0, 'failures': 0, 'errors': 0, 'seconds': 133.18},
            'day0_static': {'defined': 2, 'passed': 2, 'skipped': 0, 'failures': 0, 'errors': 0, 'seconds': 0.009}})
        self.assertEqual(set(scope['qualification_gates']), set(rc.GATES))
        self.assertTrue(all(v == 'pending' for v in scope['qualification_gates'].values()))
        for name in ('site_is_a_release_asset', 'published_asset_bytes_reverified_by_site_build',
                     'node_execution_provided', 'moodle_submission_provided',
                     'native_acceptance', 'pages_deployment_observed'):
            self.assertIs(scope[name], False)
        self.assertEqual(scope['qualificationVerdict'], 'NOT_FINAL')
        self.assertEqual(self.site['.nojekyll'], b'')
        manifest = rc.manifest(self.site, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
        self.assertEqual(self.site['SHA256SUMS.txt'], manifest)
        self.assertEqual(self.site['PACKAGE_ID.txt'], (rc.sha(manifest) + '\n').encode())
        self.assertIn('.nojekyll', rc.parse_manifest(manifest))
        ids = {scope['published_classroom_package_id'], scope['current_core_collection_package_id'],
               self.site['PACKAGE_ID.txt'].decode().strip()}
        self.assertEqual(len(ids), 3)
        OBSERVATIONS['publication'] = {'published_assets_independently_pinned': 3,
            'published_source_commit': EXPECTED_SOURCE_COMMIT, 'published_collection_package_id': EXPECTED_PUBLISHED_PACKAGE,
            'recorded_hosted_suites': scope['recorded_workflow']['tests'],
            'all_ten_gates_pending': True, 'three_distinct_identities': True}

    def test_03_real_node_outer_verifier_accepts_site_and_does_not_qualify_tasks(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            rc.write_tree(site, self.site)
            result = subprocess.run([self.node, 'VERIFY_COLLECTION.mjs'], cwd=site,
                                    capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = rc.strict_json(result.stdout.encode())
            self.assertEqual(report['status'], 'PASS_INITIAL_BYTES_ONLY')
            self.assertIs(report['studentProjectsQualified'], False)
            self.assertEqual(report['qualificationVerdict'], 'NOT_FINAL')
            OBSERVATIONS['real_outer_verifier'] = report

    def test_04_exact_validator_refuses_inventory_byte_and_mode_changes(self):
        with self.fresh() as temporary:
            site, report = Path(temporary) / 'site', Path(temporary) / 'validation.json'
            rc.write_tree(site, self.site)
            result = validator.validate_site(site, report, check_source=False)
            self.assertEqual(result['status'], 'PASS_RC10_STATIC_SITE_ONLY')
            self.assertFalse(result['source_seal_checked'])
            self.assertGreater(result['local_links'], 1000)
            self.assertGreater(result['local_fragment_checks'], 0)
            self.assertEqual(result['entry_pages_compared'], 30)
            self.assertEqual(result['entry_pages_byte_exact'], 28)
            self.assertEqual(result['entry_css_only_derivatives'], 2)
            self.assertEqual(rc.strict_json(report.read_bytes()), result)
            (site / 'unknown.txt').write_text('unknown')
            with self.assertRaisesRegex(ValueError, 'inventory mismatch'):
                validator.run(site, check_source=False)
            (site / 'unknown.txt').unlink()
            (site / 'index.html').write_bytes(self.site['index.html'] + b'changed')
            with self.assertRaisesRegex(ValueError, 'bytes mismatch'):
                validator.run(site, check_source=False)
            (site / 'index.html').write_bytes(self.site['index.html'])
            (site / 'SITE_SCOPE.json').chmod(0o755)
            with self.assertRaisesRegex(ValueError, 'modes mismatch'):
                validator.run(site, check_source=False)
            OBSERVATIONS['static_validation'] = result

    def test_05_conflicting_outputs_and_overlaps_refuse_before_mutation(self):
        with self.fresh() as temporary:
            site, report = Path(temporary) / 'site', Path(temporary) / 'report.json'
            report.write_text('preserve conflicting report')
            with self.assertRaisesRegex(ValueError, 'Existing different output'):
                builder.build_site(site, report, check_source=False)
            self.assertFalse(site.exists())
            self.assertEqual(report.read_text(), 'preserve conflicting report')
            report.unlink()
            with self.assertRaisesRegex(ValueError, 'Overlapping'):
                builder.build_site(site, site / 'report.json', check_source=False)
            self.assertFalse(site.exists())
            blocked = Path(temporary) / 'parent-file'
            blocked.write_text('not a directory')
            with self.assertRaisesRegex(ValueError, 'parent is not a directory'):
                builder.build_site(site, blocked / 'report.json', check_source=False)
            self.assertFalse(site.exists())
            rc.write_tree(site, self.site)
            (site / 'unknown.txt').write_text('preserve unknown file')
            with self.assertRaisesRegex(ValueError, 'different static site'):
                builder.build_site(site, report, check_source=False)
            self.assertFalse(report.exists())
            self.assertEqual((site / 'unknown.txt').read_text(), 'preserve unknown file')
        OBSERVATIONS['conflicting_output_refusals'] = 4

    def test_06_identical_replay_and_separate_reports_are_admitted(self):
        with self.fresh() as temporary:
            site, report = Path(temporary) / 'site', Path(temporary) / 'build.json'
            first = builder.build_site(site, report, check_source=False)
            self.assertEqual(first, builder.build_site(site, report, check_source=False))
            with self.assertRaisesRegex(ValueError, 'Overlapping'):
                validator.validate_site(site, site / 'validation.json', check_source=False)
            self.assertFalse((site / 'validation.json').exists())

    def test_07_production_source_seal_and_source_output_refusals(self):
        with self.fresh() as temporary:
            site, report = Path(temporary) / 'site', Path(temporary) / 'report.json'
            with patch.object(rc, 'source_identity', side_effect=ValueError('source seal refused')):
                with self.assertRaisesRegex(ValueError, 'source seal refused'):
                    builder.build_site(site, report)
                self.assertFalse(site.exists())
                rc.write_tree(site, self.site)
                with self.assertRaisesRegex(ValueError, 'source seal refused'):
                    validator.validate_site(site, report)
                self.assertFalse(report.exists())
            changing_site = Path(temporary) / 'changed-source-site'
            current_source = self.meta['repository_package_id']
            with patch.object(rc, 'source_identity', side_effect=[current_source, '0' * 64]):
                with self.assertRaisesRegex(ValueError, 'Source changed during'):
                    builder.build_site(changing_site, report)
                self.assertFalse(changing_site.exists())
                self.assertFalse(report.exists())
            with patch.object(rc, 'source_identity', side_effect=[current_source, '0' * 64]):
                with self.assertRaisesRegex(ValueError, 'Source changed during'):
                    validator.validate_site(site, report)
                self.assertFalse(report.exists())
                self.assertEqual((site / 'index.html').read_bytes(), self.site['index.html'])
            with self.assertRaisesRegex(ValueError, 'outside source tree'):
                builder.build_site(ROOT / 'forbidden-site', check_source=False)
        OBSERVATIONS['production_source_guards'] = {'failed_seal_refused_without_output': True,
                                                   'late_source_change_refused_without_output': True,
                                                   'source_tree_destination_refused': True}

    def test_08_publication_refusals_precede_core_reconstruction_and_output_creation(self):
        changes = [
            (('status',), 'PREPARED_NOT_PUBLISHED'), (('draft',), True), (('prerelease',), False),
            (('release_id',), True), (('source_commit',), '0' * 40), (('package_id',), '0' * 64),
            (('assets', 0, 'sha256'), '0' * 64), (('assets', 0, 'bytes'), 4357345.0),
            (('qualification_gates', 'human_pilot'), 'passed'),
            (('workflow', 'tests', 'focused_rc10', 'passed'), 16),
            (('workflow', 'tests', 'day0_static', 'skipped'), 1),
            (('assets',), self.receipt['assets'][:2]),
        ]
        with self.fresh() as temporary:
            root = Path(temporary) / 'publication input'
            (root / '90_RELEASES').mkdir(parents=True)
            (root / builder.publication.PLAN).write_bytes((ROOT / builder.publication.PLAN).read_bytes())
            receipt_path = root / builder.publication.RECEIPT
            site, report = Path(temporary) / 'site', Path(temporary) / 'report.json'
            for route, value in changes:
                forged = copy.deepcopy(self.receipt)
                target = forged
                for component in route[:-1]:
                    target = target[component]
                target[route[-1]] = value
                receipt_path.write_bytes(classroom.encoded(forged))
                with self.subTest(route=route), patch.object(builder, 'ROOT', root), \
                        patch.object(classroom, 'build_payload') as core:
                    with self.assertRaises(ValueError):
                        builder.build_site(site, report, check_source=False)
                    core.assert_not_called()
                    self.assertFalse(site.exists())
                    self.assertFalse(report.exists())
            receipt_path.write_bytes(classroom.encoded(self.receipt).replace(
                b'{', b'{"status":"PUBLISHED_PRERELEASE",', 1))
            with patch.object(builder, 'ROOT', root), patch.object(classroom, 'build_payload') as core:
                with self.assertRaises(ValueError):
                    builder.build_site(site, report, check_source=False)
                core.assert_not_called()
        OBSERVATIONS['publication_refusals'] = {'mutations_refused': len(changes) + 1,
            'core_builds_on_refusal': 0, 'source_fixture_bypass_does_not_bypass_receipt': True}

    def test_09_self_resealed_tampering_passes_local_consistency_but_not_exact_admission(self):
        item = next(i for i in self.meta['objects'] if i['object_id'] == 'S01')
        unit_path = next(n for n in sorted(self.site)
                         if n.startswith(item['payload_root']) and n.endswith('.md'))
        for name in ('index.html', unit_path):
            forged = dict(self.site)
            forged[name] += b'\n<!-- self-resealed external edit -->\n'
            reseal(forged)
            with self.subTest(path=name), self.fresh() as temporary:
                site, report = Path(temporary) / 'site', Path(temporary) / 'validation.json'
                rc.write_tree(site, forged)
                local = subprocess.run([self.node, 'VERIFY_COLLECTION.mjs'], cwd=site,
                                       capture_output=True, text=True, timeout=30)
                self.assertEqual(local.returncode, 0, local.stdout + local.stderr)
                self.assertEqual(rc.strict_json(local.stdout.encode())['status'], 'PASS_INITIAL_BYTES_ONLY')
                with self.assertRaisesRegex(ValueError, 'bytes mismatch'):
                    validator.validate_site(site, report, check_source=False)
                self.assertFalse(report.exists())
                self.assertEqual((site / name).read_bytes(), forged[name])
        OBSERVATIONS['self_resealed_tampering'] = {'exact_refusals': 2,
            'local_self_consistency_is_not_authentication': True}

    def test_10_symlink_roots_files_reports_and_parents_refused_without_mutation(self):
        with self.fresh() as temporary:
            root = Path(temporary)
            site, report = root / 'site', root / 'report.json'
            rc.write_tree(site, self.site)
            linked_site = root / 'linked-site'
            linked_site.symlink_to(site, target_is_directory=True)
            for operation in (builder.build_site, validator.validate_site):
                with self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(linked_site, report, check_source=False)
            external = root / 'protected-index.html'
            external.write_bytes(self.site['index.html'])
            (site / 'index.html').unlink()
            (site / 'index.html').symlink_to(external)
            for operation in (builder.build_site, validator.validate_site):
                with self.assertRaisesRegex(ValueError, 'Non-regular'):
                    operation(site, report, check_source=False)
            self.assertEqual(external.read_bytes(), self.site['index.html'])
            (site / 'index.html').unlink()
            (site / 'index.html').write_bytes(self.site['index.html'])
            protected_report = root / 'protected-report.txt'
            protected_report.write_text('preserve')
            report.symlink_to(protected_report)
            for operation in (builder.build_site, validator.validate_site):
                with self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(site, report, check_source=False)
            self.assertEqual(protected_report.read_text(), 'preserve')
            report.unlink()
            real_parent, linked_parent = root / 'real-reports', root / 'linked-reports'
            real_parent.mkdir()
            linked_parent.symlink_to(real_parent, target_is_directory=True)
            for operation in (builder.build_site, validator.validate_site):
                with self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(site, linked_parent / 'report.json', check_source=False)
            self.assertFalse((real_parent / 'report.json').exists())
        OBSERVATIONS['symlink_refusals'] = {'root_file_report_parent_refused': True,
                                          'protected_bytes_preserved': True}

    def test_11_independent_semantics_reject_false_scope_preservation_and_fragments(self):
        cases = []
        for key, value in (('published_source_commit', '0' * 40),
                           ('published_classroom_package_id', '0' * 64),
                           ('pages_deployment_observed', True),
                           ('entry_policy', 'ONE_DECLARED_ENTRY_DERIVATIVE')):
            forged = dict(self.site)
            scope = rc.strict_json(forged['SITE_SCOPE.json'])
            scope[key] = value
            forged['SITE_SCOPE.json'] = classroom.encoded(scope)
            cases.append((key, reseal(forged)))
        forged = dict(self.site)
        forged['ENTRY/SETUP_MACOS_LINUX.html'] += b'changed'
        cases.append(('changed_css_derivative_setup_entry', reseal(forged)))
        for name in EXPECTED_ENTRY_IDENTITIES:
            forged = dict(self.site)
            forged[name] = self.core[name]
            cases.append(('missing_wrapping_css_' + name, reseal(forged)))
            forged = dict(self.site)
            forged[name] = forged[name].replace(b'h1{overflow-wrap:anywhere}',
                                                b'h1{overflow-wrap:normal}', 1)
            cases.append(('different_wrapping_css_' + name, reseal(forged)))
            forged = dict(self.site)
            forged[name] = forged[name].replace(b'../index.html', b'../START_HERE.html', 1)
            cases.append(('changed_entry_link_' + name, reseal(forged)))
        forged = dict(self.site)
        forged['index.html'] = forged['index.html'].replace(
            b'table{table-layout:fixed;overflow-wrap:anywhere}', b'table{table-layout:auto}', 1)
        cases.append(('different_global_table_css', reseal(forged)))
        forged = dict(self.site)
        scope = rc.strict_json(forged['SITE_SCOPE.json'])
        scope['entry_derivatives'] = []
        forged['SITE_SCOPE.json'] = classroom.encoded(scope)
        cases.append(('missing_entry_css_declaration', reseal(forged)))
        forged = dict(self.site)
        forged['DOWNLOAD_RC10.html'] += b'<a href="START_HERE.html#missing-test-anchor">Setup</a>'
        cases.append(('missing_local_fragment', reseal(forged)))
        forged = dict(self.site)
        forged['DOWNLOAD_RC10.html'] += b'<p>The current published classroom download is RC9.</p>'
        cases.append(('stale_publication', reseal(forged)))
        forged = dict(self.site)
        forged['PUBLICATION/RC10_PUBLICATION.md'] = (ROOT / '90_RELEASES/RC10_PUBLICATION.md').read_bytes()
        cases.append(('unrewritten_source_note_links', reseal(forged)))
        forged = dict(self.site)
        forged['README.md'] += b'\n[Missing finite target](missing-site-guidance.md)\n'
        cases.append(('missing_markdown_target', reseal(forged)))
        forged = dict(self.site)
        scope = rc.strict_json(forged['SITE_SCOPE.json'])
        scope['recorded_workflow']['tests']['day0_static']['skipped'] = False
        forged['SITE_SCOPE.json'] = classroom.encoded(scope)
        cases.append(('false_is_not_zero_in_nested_suite', reseal(forged)))
        forged = dict(self.site)
        scope = rc.strict_json(forged['SITE_SCOPE.json'])
        scope['publication_note_derivative']['url_replacements'].pop()
        forged['SITE_SCOPE.json'] = classroom.encoded(scope)
        cases.append(('incomplete_note_derivative_declaration', reseal(forged)))
        for label, forged in cases:
            with self.subTest(label=label), self.assertRaises(ValueError):
                validator.validate_profile(forged, self.core)
        malformed = dict(self.core)
        malformed['START_HERE.html'] = malformed['START_HERE.html'].replace(
            b'prepared and not published', b'different preparation claim')
        with self.assertRaisesRegex(ValueError, 'wording anchor differs'):
            builder.compose_payload(malformed, self.receipt)
        with self.assertRaisesRegex(ValueError, 'setup entry source differs'):
            builder.wrap_setup_entry(self.core['ENTRY/SETUP_WINDOWS.html'] + b'changed',
                                     'ENTRY/SETUP_WINDOWS.html')
        with self.assertRaisesRegex(ValueError, 'CSS presentation insertion anchor differs'):
            builder.insert_css(self.core['index.html'] + b'</style>',
                               b'table{table-layout:fixed;overflow-wrap:anywhere}', 'index.html')
        with self.fresh() as temporary:
            root = Path(temporary)
            note_path = root / '90_RELEASES/RC10_PUBLICATION.md'
            note_path.parent.mkdir()
            note_path.write_bytes((ROOT / '90_RELEASES/RC10_PUBLICATION.md').read_bytes().replace(
                b'../00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md', b'../missing-original-procedure.md', 1))
            with patch.object(builder, 'ROOT', root), self.assertRaisesRegex(ValueError, 'note link anchor differs'):
                builder.publication_note()
        OBSERVATIONS['independent_semantic_refusals'] = {'mutations_refused': len(cases),
            'changed_publication_wording_anchor_refused': True,
            'changed_note_source_url_anchor_refused': True,
            'changed_entry_source_and_css_anchor_refused': True,
            'exact_builder_reproduction_not_used_as_semantic_authority': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report')
    args = parser.parse_args()
    report_path = rc.output_path(args.report) if args.report else None
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ClassroomRC10Site))
    report = {'schema': 'webtech-classroom-rc10-static-site-tests/v1',
              'tests': result.testsRun, 'failures': len(result.failures), 'errors': len(result.errors),
              'skipped': len(result.skipped),
              'status': 'PASS_BOUNDED_STATIC_SITE_TESTS' if result.wasSuccessful() else 'FAIL',
              'observations': OBSERVATIONS, 'actions_dispatched': 0}
    if report_path:
        rc.atomic_write(report_path, classroom.encoded(report))
    print(json.dumps({k: report[k] for k in ('status', 'tests', 'failures', 'errors', 'skipped', 'actions_dispatched')}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
