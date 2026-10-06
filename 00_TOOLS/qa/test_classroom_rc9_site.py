#!/usr/bin/env python3
"""Finite RC9 static-site composition, integrity and output-refusal tests.

Unit fixtures explicitly bypass only the separately checked whole-source seal.
Production builder and validator continue to require that seal by default.
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
import build_classroom_rc9 as classroom
import build_classroom_rc9_site as builder
import release_contract as rc
import validate_classroom_rc9_site as validator

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
OBSERVATIONS = {}
EXPECTED_RELEASE = 'https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9'
EXPECTED_DOWNLOAD_BASE = 'https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.9/'
EXPECTED_SOURCE_COMMIT = '60d8f8b86eec812a79db92860dd6d13f16d91f5f'
EXPECTED_PUBLISHED_PACKAGE = 'c8be1c0dfaa3dfb56ca8c7868d961654859f1e87ebb35b8511e0ea4773e77dd7'
# Independent public identities: do not read these expected values from builder.
EXPECTED_ASSETS = {
    'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip': {
        'id': 614813352, 'bytes': 3933082,
        'sha256': 'fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee'},
    'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256': {
        'id': 614813358, 'bytes': 110,
        'sha256': '96a8d22b0b7ce897ff1fa319aa356a06200b8f89e56fc1bec684ad1c240194cb'},
    'SHA256SUMS.txt': {
        'id': 614813355, 'bytes': 227,
        'sha256': '738c1dd6f45657182e3ffe2c6da461b6838c463e2d0ae93413df2e441cf4c040'},
}
EXPECTED_OBJECTS = {f'{kind}{number:02}' for kind in 'CS' for number in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
EXPECTED_CHANGED = {'index.html', 'START_HERE.html', 'QUALIFICATION.html',
                    'COURSE_PLAN.html', 'ASSESSMENT.html', 'README.md',
                    'ENTRY/SETUP_MACOS_LINUX.html', 'SHA256SUMS.txt', 'PACKAGE_ID.txt'}


class ClassroomRC9Site(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.node = shutil.which(NODE) or NODE
        version = subprocess.run([cls.node, '--version'], capture_output=True,
                                 text=True, check=True, timeout=10).stdout.strip()
        if version != 'v24.21.0':
            raise ValueError('Exact Node v24.21.0 required; observed ' + version)
        cls.core = classroom.build_payload(check_source=False)
        cls.site = builder.build_payload(check_source=False)
        cls.meta = rc.strict_json(cls.core['CLASSROOM_COLLECTION.json'])
        OBSERVATIONS['scope'] = {'node': version, 'platform': sys.platform,
            'unit_fixture_source_seal_checked': False,
            'production_default_source_seal_required': True,
            'actions_dispatched': 0, 'native_acceptance': False}

    def fresh(self):
        return tempfile.TemporaryDirectory(prefix='rc9 static reading with spaces ')

    def test_01_composition_preserves_units_and_declares_one_entry_derivative(self):
        self.assertEqual(set(self.site) - set(self.core), {'.nojekyll', 'SITE_SCOPE.json', 'DOWNLOAD_RC9.html'})
        self.assertEqual(set(self.core) - set(self.site), set())
        changed = {name for name in self.core if self.core[name] != self.site[name]}
        self.assertEqual(changed, EXPECTED_CHANGED)
        self.assertEqual(len(self.meta['objects']), 30)
        self.assertEqual({item['object_id'] for item in self.meta['objects']}, EXPECTED_OBJECTS)
        count = 0
        for item in self.meta['objects']:
            prefix = item['payload_root'].rstrip('/') + '/'
            names = {name for name in self.core if name.startswith(prefix)}
            self.assertTrue(names)
            for name in names:
                self.assertEqual(self.site[name], self.core[name], name)
                count += 1
            if item['entry'] != 'ENTRY/SETUP_MACOS_LINUX.html':
                self.assertEqual(self.site[item['entry']], self.core[item['entry']])
        self.assertEqual(count, 1284)
        tutorials = [name for name in self.core if name.startswith('TUTORIALS/')]
        self.assertEqual(len(tutorials), 14)
        for name in tutorials:
            self.assertEqual(self.site[name], self.core[name], name)
        before = self.core['ENTRY/SETUP_MACOS_LINUX.html']
        after = self.site['ENTRY/SETUP_MACOS_LINUX.html']
        self.assertEqual(after, before.replace(b'</style>', b'h1{overflow-wrap:anywhere}</style>', 1))
        self.assertEqual(after.replace(b'h1{overflow-wrap:anywhere}</style>', b'</style>', 1), before)
        self.assertEqual(builder.build_payload(check_source=False), self.site)
        OBSERVATIONS['composition'] = {'unit_count': 30,
            'unit_file_comparisons': count, 'entry_pages_unchanged': 29,
            'tutorials_unchanged': 14, 'entry_css_only_derivatives': 1,
            'entry_derivative_reversible_exactly': True,
            'added_files': ['.nojekyll', 'SITE_SCOPE.json', 'DOWNLOAD_RC9.html'],
            'changed_core_files': sorted(changed),
            'teaching_unit_bytes_unchanged': True}

    def test_02_nojekyll_and_static_profile_are_sealed_and_honest(self):
        self.assertEqual(self.site['.nojekyll'], b'')
        manifest = self.site['SHA256SUMS.txt']
        self.assertEqual(manifest, rc.manifest(self.site, ('SHA256SUMS.txt', 'PACKAGE_ID.txt')))
        rows = rc.parse_manifest(manifest)
        self.assertEqual(rows['.nojekyll'], rc.sha(b''))
        self.assertEqual(rows['SITE_SCOPE.json'], rc.sha(self.site['SITE_SCOPE.json']))
        self.assertEqual(self.site['PACKAGE_ID.txt'], (rc.sha(manifest) + '\n').encode())
        scope = rc.strict_json(self.site['SITE_SCOPE.json'])
        self.assertEqual(scope['profile'], builder.PROFILE)
        self.assertEqual(scope['current_core_collection_package_id'], self.core['PACKAGE_ID.txt'].decode().strip())
        self.assertEqual(scope['published_classroom_package_id'], EXPECTED_PUBLISHED_PACKAGE)
        self.assertEqual(scope['published_source_commit'], EXPECTED_SOURCE_COMMIT)
        self.assertEqual(scope['source_publication_status'], 'PUBLISHED_PRERELEASE')
        self.assertEqual(set(scope['objects']), EXPECTED_OBJECTS)
        self.assertEqual(len(scope['objects']), 30)
        self.assertNotEqual(scope['current_core_collection_package_id'], scope['published_classroom_package_id'])
        self.assertNotEqual(self.site['PACKAGE_ID.txt'].decode().strip(), scope['published_classroom_package_id'])
        self.assertIs(scope['site_is_a_release_asset'], False)
        self.assertIs(scope['node_execution_provided'], False)
        self.assertIs(scope['native_acceptance'], False)
        self.assertIs(scope['pages_deployment_observed'], False)
        self.assertEqual(scope['qualificationVerdict'], 'NOT_FINAL')
        homepage = self.site['index.html'].decode()
        self.assertEqual(homepage.count('data-site-profile="rc9-static-reading"'), 1)
        self.assertIn('not a Node execution environment', homepage)
        self.assertIn(EXPECTED_RELEASE, homepage)
        self.assertNotIn('the RC8 prerelease', homepage)
        self.assertNotIn('PREPARED_NOT_PUBLISHED', homepage)
        self.assertNotIn('RC9 release preparation and publication remain separate owner operations', homepage)
        assets = scope['published_assets']
        self.assertEqual(len(assets), 3)
        self.assertEqual({row['name'] for row in assets}, set(EXPECTED_ASSETS))
        guide = self.site['DOWNLOAD_RC9.html'].decode()
        for row in assets:
            expected = EXPECTED_ASSETS[row['name']]
            self.assertEqual(row, {'name': row['name'], **expected,
                                  'download_url': EXPECTED_DOWNLOAD_BASE + row['name']})
            self.assertIn(EXPECTED_DOWNLOAD_BASE + row['name'], guide)
            self.assertIn(expected['sha256'], guide)
        self.assertIn(EXPECTED_SOURCE_COMMIT, guide)
        self.assertEqual(scope['recorded_workflow_tests'],
                         {'defined': 40, 'passed': 39, 'skipped': 1, 'failures': 0, 'errors': 0})
        self.assertEqual(set(scope['qualification_gates']), set(rc.GATES))
        self.assertTrue(all(value == 'pending' for value in scope['qualification_gates'].values()))
        OBSERVATIONS['publication'] = {
            'release_url': EXPECTED_RELEASE, 'published_source_commit': EXPECTED_SOURCE_COMMIT,
            'published_classroom_package_id': EXPECTED_PUBLISHED_PACKAGE,
            'published_assets_independently_pinned': 3,
            'recorded_hosted_tests': scope['recorded_workflow_tests'],
            'all_ten_qualification_gates_pending': True,
            'site_is_not_the_published_archive': True,
            'live_downloads_or_hosted_runs_performed': False}

    def test_03_real_outer_verifier_accepts_physical_site_without_execution(self):
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
            OBSERVATIONS['outer_verifier'] = report

    def test_04_exact_validator_checks_inventory_bytes_modes_and_links(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            rc.write_tree(site, self.site)
            result = validator.run(site, check_source=False)
            self.assertEqual(result['status'], 'PASS_RC9_STATIC_SITE_ONLY')
            self.assertFalse(result['source_seal_checked'])
            self.assertGreater(result['local_links'], 1000)
            self.assertFalse(result['node_execution_provided'])
            (site / 'unexpected.txt').write_text('unknown file')
            with self.assertRaisesRegex(ValueError, 'inventory mismatch'):
                validator.run(site, check_source=False)
            (site / 'unexpected.txt').unlink()
            original = (site / 'index.html').read_bytes()
            (site / 'index.html').write_bytes(original + b'changed')
            with self.assertRaisesRegex(ValueError, 'bytes mismatch'):
                validator.run(site, check_source=False)
            (site / 'index.html').write_bytes(original)
            (site / 'SITE_SCOPE.json').chmod(0o755)
            with self.assertRaisesRegex(ValueError, 'modes mismatch'):
                validator.run(site, check_source=False)
            OBSERVATIONS['static_validation'] = result

    def test_05_builder_refuses_existing_unknown_file_before_report_mutation(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            report = Path(temporary) / 'report.json'
            rc.write_tree(site, self.site)
            marker = site / 'unexpected.txt'
            marker.write_text('preserve this conflicting output')
            with self.assertRaisesRegex(ValueError, 'different static site'):
                builder.build_site(site, report, check_source=False)
            self.assertEqual(marker.read_text(), 'preserve this conflicting output')
            self.assertFalse(report.exists())

    def test_06_conflicting_report_and_overlapping_outputs_preflight_no_site_creation(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            report = Path(temporary) / 'report.json'
            report.write_text('existing conflicting report')
            with self.assertRaisesRegex(ValueError, 'Existing different output'):
                builder.build_site(site, report, check_source=False)
            self.assertFalse(site.exists())
            self.assertEqual(report.read_text(), 'existing conflicting report')
            with self.assertRaisesRegex(ValueError, 'Overlapping'):
                builder.build_site(site, site / 'report.json', check_source=False)
            self.assertFalse(site.exists())
            blocked = Path(temporary) / 'parent-file'
            blocked.write_text('not a directory')
            with self.assertRaisesRegex(ValueError, 'parent is not a directory'):
                builder.build_site(site, blocked / 'report.json', check_source=False)
            self.assertFalse(site.exists())

    def test_07_builder_and_validator_identical_replay_and_report_location(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            build_report = Path(temporary) / 'build.json'
            validation_report = Path(temporary) / 'validation.json'
            first = builder.build_site(site, build_report, check_source=False)
            second = builder.build_site(site, build_report, check_source=False)
            self.assertEqual(first, second)
            result = validator.validate_site(site, validation_report, check_source=False)
            self.assertEqual(rc.strict_json(validation_report.read_bytes()), result)
            with self.assertRaisesRegex(ValueError, 'Overlapping'):
                validator.validate_site(site, site / 'bad-report.json', check_source=False)
            self.assertFalse((site / 'bad-report.json').exists())

    def test_08_production_default_refuses_failed_source_seal_and_source_outputs(self):
        with self.fresh() as temporary:
            site = Path(temporary) / 'site'
            report = Path(temporary) / 'report.json'
            with patch.object(rc, 'source_identity', side_effect=ValueError('source seal refused')):
                with self.assertRaisesRegex(ValueError, 'source seal refused'):
                    builder.build_site(site, report)
            self.assertFalse(site.exists())
            self.assertFalse(report.exists())
            rc.write_tree(site, self.site)
            before = {name: path.read_bytes() for name, path in rc.tree_files(site).items()}
            with patch.object(rc, 'source_identity', side_effect=ValueError('source seal refused')):
                with self.assertRaisesRegex(ValueError, 'source seal refused'):
                    validator.validate_site(site, report)
            self.assertFalse(report.exists())
            self.assertEqual({name: path.read_bytes() for name, path in rc.tree_files(site).items()}, before)
        with self.assertRaisesRegex(ValueError, 'outside source tree'):
            builder.build_site(ROOT / 'forbidden-site', check_source=False)

    def test_09_publication_mismatches_refused_before_core_or_output_creation(self):
        receipt = rc.strict_json((ROOT / '90_RELEASES/CLASSROOM_RC9_PUBLICATION.json').read_bytes())
        plan = (ROOT / '90_RELEASES/CLASSROOM_RC9_RELEASE_PLAN.json').read_bytes()
        changes = [
            (('status',), 'PREPARED_NOT_PUBLISHED'),
            (('release_url',), EXPECTED_RELEASE.replace('rc.9', 'rc.8')),
            (('source_commit',), '0' * 40),
            (('package_id',), '0' * 64),
            (('draft',), True),
            (('prerelease',), False),
            (('release_id',), True),
            (('assets', 0, 'download_url'), 'https://example.invalid/archive.zip'),
            (('assets', 0, 'sha256'), '0' * 64),
            (('assets', 0, 'id'), '614813352'),
            (('assets', 0, 'bytes'), 3933082.0),
            (('qualification_gates', 'human_pilot'), 'passed'),
            (('workflow', 'tests', 'passed'), 40),
            (('workflow', 'tests', 'skipped'), 0),
            (('assets',), receipt['assets'][:2]),
            (('assets',), receipt['assets'] + [copy.deepcopy(receipt['assets'][0])]),
        ]
        refused = 0
        with self.fresh() as temporary:
            root = Path(temporary) / 'publication input'
            release_directory = root / '90_RELEASES'
            release_directory.mkdir(parents=True)
            (release_directory / 'CLASSROOM_RC9_RELEASE_PLAN.json').write_bytes(plan)
            receipt_path = release_directory / 'CLASSROOM_RC9_PUBLICATION.json'
            for route, value in changes:
                forged = copy.deepcopy(receipt)
                target = forged
                for component in route[:-1]:
                    target = target[component]
                target[route[-1]] = value
                receipt_path.write_bytes(classroom.encoded(forged))
                site, report = Path(temporary) / 'site', Path(temporary) / 'report.json'
                with self.subTest(route=route), patch.object(builder, 'ROOT', root), \
                        patch.object(classroom, 'build_payload') as core_build:
                    with self.assertRaises(ValueError):
                        builder.build_site(site, report, check_source=False)
                    core_build.assert_not_called()
                    self.assertFalse(site.exists())
                    self.assertFalse(report.exists())
                refused += 1
            # These exercise the real strict parser rather than a pre-parsed mock.
            missing = copy.deepcopy(receipt)
            del missing['status']
            raw_cases = [classroom.encoded(missing),
                         classroom.encoded(receipt).replace(b'{', b'{"status":"PUBLISHED_PRERELEASE",', 1)]
            for data in raw_cases:
                receipt_path.write_bytes(data)
                with self.subTest(raw_receipt=data[:80]), patch.object(builder, 'ROOT', root), \
                        patch.object(classroom, 'build_payload') as core_build:
                    with self.assertRaises(ValueError):
                        builder.build_site(site, report, check_source=False)
                    core_build.assert_not_called()
                    self.assertFalse(site.exists())
                    self.assertFalse(report.exists())
                refused += 1
        OBSERVATIONS['publication_refusals'] = {'mutations_refused': refused,
            'real_receipt_validation_used': True, 'core_builds_or_outputs_on_refusal': 0,
            'fixture_source_seal_bypass_does_not_bypass_publication_checks': True}

    def test_10_self_resealed_tampering_is_not_exact_site_admission(self):
        item = next(row for row in self.meta['objects'] if row['object_id'] == 'S01')
        prefix = item['payload_root'].rstrip('/') + '/'
        unit_path = next(name for name in sorted(self.site)
                         if name.startswith(prefix) and name.endswith('.md'))
        refused = 0
        for name in ('index.html', 'SITE_SCOPE.json', unit_path):
            forged = dict(self.site)
            if name == 'SITE_SCOPE.json':
                scope = rc.strict_json(forged[name])
                scope['published_classroom_package_id'] = '0' * 64
                forged[name] = classroom.encoded(scope)
            else:
                forged[name] += b'\n<!-- externally changed, self-resealed content -->\n'
            forged['SHA256SUMS.txt'] = rc.manifest(forged, ('SHA256SUMS.txt', 'PACKAGE_ID.txt'))
            forged['PACKAGE_ID.txt'] = (rc.sha(forged['SHA256SUMS.txt']) + '\n').encode()
            with self.subTest(path=name), self.fresh() as temporary:
                site, report_path = Path(temporary) / 'site', Path(temporary) / 'validation.json'
                rc.write_tree(site, forged)
                local = subprocess.run([self.node, 'VERIFY_COLLECTION.mjs'], cwd=site,
                                       capture_output=True, text=True, timeout=30)
                self.assertEqual(local.returncode, 0, local.stdout + local.stderr)
                self.assertEqual(rc.strict_json(local.stdout.encode())['status'], 'PASS_INITIAL_BYTES_ONLY')
                with self.assertRaisesRegex(ValueError, 'bytes mismatch'):
                    validator.validate_site(site, report_path, check_source=False)
                self.assertFalse(report_path.exists())
                self.assertEqual((site / name).read_bytes(), forged[name])
            refused += 1
        OBSERVATIONS['self_resealed_tampering'] = {'exact_refusals': refused,
            'local_self_consistency_does_not_authenticate_site': True,
            'validation_reports_created_for_forgery': 0}

    def test_11_symlink_outputs_and_site_files_refused_without_mutation(self):
        with self.fresh() as temporary:
            root = Path(temporary)
            actual_site = root / 'actual-site'
            rc.write_tree(actual_site, self.site)
            linked_site = root / 'linked-site'
            linked_site.symlink_to(actual_site, target_is_directory=True)
            report = root / 'report.json'
            for operation in (builder.build_site, validator.validate_site):
                with self.subTest(operation=operation.__name__), self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(linked_site, report, check_source=False)
                self.assertFalse(report.exists())
            external = root / 'external-index.html'
            external.write_bytes(self.site['index.html'])
            index = actual_site / 'index.html'
            index.unlink()
            index.symlink_to(external)
            for operation in (builder.build_site, validator.validate_site):
                with self.subTest(file_operation=operation.__name__), self.assertRaisesRegex(ValueError, 'Non-regular'):
                    operation(actual_site, report, check_source=False)
                self.assertFalse(report.exists())
                self.assertTrue(index.is_symlink())
                self.assertEqual(external.read_bytes(), self.site['index.html'])
            index.unlink()
            index.write_bytes(self.site['index.html'])
            report_target = root / 'protected-report.txt'
            report_target.write_text('preserve report target')
            report.symlink_to(report_target)
            for operation in (builder.build_site, validator.validate_site):
                with self.subTest(report_operation=operation.__name__), self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(actual_site, report, check_source=False)
                self.assertEqual(report_target.read_text(), 'preserve report target')
            report.unlink()
            actual_reports = root / 'actual-reports'
            actual_reports.mkdir()
            linked_reports = root / 'linked-reports'
            linked_reports.symlink_to(actual_reports, target_is_directory=True)
            for operation in (builder.build_site, validator.validate_site):
                with self.subTest(parent_operation=operation.__name__), self.assertRaisesRegex(ValueError, 'symlink'):
                    operation(actual_site, linked_reports / 'report.json', check_source=False)
                self.assertFalse((actual_reports / 'report.json').exists())
            self.assertEqual({name: path.read_bytes() for name, path in rc.tree_files(actual_site).items()}, self.site)
        OBSERVATIONS['symlink_refusals'] = {'root_file_report_and_report_parent_refused': True,
                                         'protected_target_bytes_preserved': True}

    def test_12_independent_semantics_refuse_false_publication_and_broken_anchors(self):
        cases = []
        for key, value in (('source_publication_status', 'PREPARED_NOT_PUBLISHED'),
                           ('published_classroom_package_id', '0' * 64),
                           ('published_source_commit', '0' * 40)):
            forged = dict(self.site)
            scope = rc.strict_json(forged['SITE_SCOPE.json'])
            scope[key] = value
            forged['SITE_SCOPE.json'] = classroom.encoded(scope)
            cases.append((key, forged))
        forged = dict(self.site)
        forged['index.html'] = forged['index.html'].replace(
            b'</main>', b'<p>The last published classroom download is the RC8 prerelease.</p></main>', 1)
        self.assertNotEqual(forged['index.html'], self.site['index.html'])
        cases.append(('stale_publication_banner', forged))
        forged = dict(self.site)
        forged['DOWNLOAD_RC9.html'] += b'<a href="START_HERE.html#missing-independent-test-anchor">Setup</a>'
        cases.append(('missing_local_anchor', forged))
        for name, forged in cases:
            with self.subTest(name=name), self.assertRaises(ValueError):
                validator.validate_profile(forged)
        OBSERVATIONS['independent_semantic_refusals'] = {
            'mutations_refused': len(cases), 'builder_reproduction_not_used_as_semantic_authority': True}

    def test_13_independent_entry_derivative_admission_refuses_false_scope_and_bytes(self):
        cases = []
        for key, value in (('entry_policy', 'ALL_THIRTY_ENTRY_BYTES_EXACT_CORE_CLASSROOM_COPY'),
                           ('entry_derivatives', [])):
            forged = dict(self.site)
            scope = rc.strict_json(forged['SITE_SCOPE.json'])
            scope[key] = value
            forged['SITE_SCOPE.json'] = classroom.encoded(scope)
            cases.append((key, forged))
        path = 'ENTRY/SETUP_MACOS_LINUX.html'
        for label, data in (
            ('missing_css', self.core[path]),
            ('different_css', self.site[path].replace(b'overflow-wrap:anywhere}', b'overflow-wrap:normal}', 1)),
            ('changed_link', self.site[path].replace(b'../index.html', b'../START_HERE.html', 1)),
            ('changed_text', self.site[path].replace(b'macOS/Linux setup</h1>', b'Changed setup</h1>', 1)),
        ):
            self.assertNotEqual(data, self.site[path])
            forged = dict(self.site)
            forged[path] = data
            cases.append((label, forged))
        for label, forged in cases:
            with self.subTest(label=label), self.assertRaises(ValueError):
                validator.validate_profile(forged)
        with self.assertRaises(ValueError):
            builder.wrap_setup_entry(self.core[path] + b'changed')
        OBSERVATIONS['entry_derivative_admission'] = {
            'independent_mutations_refused': len(cases),
            'builder_changed_source_refused': True,
            'text_link_and_css_tampering_refused': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report')
    args = parser.parse_args()
    report_path = rc.output_path(args.report) if args.report else None
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ClassroomRC9Site))
    report = {'schema': 'webtech-classroom-rc9-static-site-tests/v1',
              'tests': result.testsRun, 'failures': len(result.failures),
              'errors': len(result.errors), 'skipped': len(result.skipped),
              'status': 'PASS_BOUNDED_STATIC_SITE_TESTS' if result.wasSuccessful() else 'FAIL',
              'observations': OBSERVATIONS, 'actions_dispatched': 0}
    if report_path:
        rc.atomic_write(report_path, classroom.encoded(report))
    print(json.dumps({k: report[k] for k in ['status', 'tests', 'failures', 'errors', 'skipped', 'actions_dispatched']}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
