#!/usr/bin/env python3
"""Finite RC9 static-site composition, integrity and output-refusal tests.

Unit fixtures explicitly bypass only the unfinished whole-repository seal.
Production builder and validator continue to require that seal by default.
"""
from __future__ import annotations

import argparse
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

    def test_01_composition_preserves_thirty_unit_and_entry_bytes(self):
        self.assertEqual(set(self.site) - set(self.core), {'.nojekyll', 'SITE_SCOPE.json'})
        self.assertEqual(set(self.core) - set(self.site), set())
        changed = {name for name in self.core if self.core[name] != self.site[name]}
        self.assertEqual(changed, {'index.html', 'SHA256SUMS.txt', 'PACKAGE_ID.txt'})
        self.assertEqual(len(self.meta['objects']), 30)
        count = 0
        for item in self.meta['objects']:
            prefix = item['payload_root']
            names = {name for name in self.core if name.startswith(prefix)}
            self.assertTrue(names)
            for name in names:
                self.assertEqual(self.site[name], self.core[name], name)
                count += 1
            self.assertEqual(self.site[item['entry']], self.core[item['entry']])
        self.assertEqual(builder.build_payload(check_source=False), self.site)
        OBSERVATIONS['composition'] = {'unit_count': 30,
            'unit_file_comparisons': count, 'entry_pages_unchanged': 30,
            'added_files': ['.nojekyll', 'SITE_SCOPE.json'],
            'changed_outer_controls_and_homepage_only': True}

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
        self.assertEqual(scope['core_collection_package_id'], self.core['PACKAGE_ID.txt'].decode().strip())
        self.assertIs(scope['site_is_a_release_asset'], False)
        self.assertIs(scope['node_execution_provided'], False)
        self.assertIs(scope['native_acceptance'], False)
        self.assertIs(scope['pages_deployment_observed'], False)
        self.assertEqual(scope['qualificationVerdict'], 'NOT_FINAL')
        homepage = self.site['index.html'].decode()
        self.assertEqual(homepage.count('data-site-profile="rc9-static-reading"'), 1)
        self.assertIn('not a Node execution environment', homepage)
        self.assertNotIn('/releases/download/classroom-en-gb-v3.0.0-rc.9', homepage)
        self.assertNotIn('/releases/tag/classroom-en-gb-v3.0.0-rc.9', homepage)

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
        with self.assertRaisesRegex(ValueError, 'outside source tree'):
            builder.build_site(ROOT / 'forbidden-site', check_source=False)


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
