#!/usr/bin/env python3
"""Finite RC9 code corrections against authenticated predecessor packages.

No installation, network publication, Actions or database execution. HTTP tests
use only owned loopback listeners and synthetic, nonsensitive local fixtures.
Optional Express tests use an explicitly supplied existing dependency directory.
"""
from __future__ import annotations

import argparse
import hashlib
import http.client
import json
import os
from pathlib import Path
import queue
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
sys.path.insert(0, str(REPO / '00_TOOLS/qa'))
import c07_registry_derivative
import build_advanced_rc9 as advanced_builder
import rc9_code as code
import student_release

NODE = os.environ.get('WEBTECH_QA_NODE', 'node')
ALLOW_NONREFERENCE = False
OBSERVATIONS = {}


def write_tree(root, files):
    for name, data in files.items():
        destination = root / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)


class CodeCorrections(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.node = shutil.which(NODE) or NODE
        version = subprocess.run([cls.node, '--version'], capture_output=True,
                                 text=True, check=True, timeout=10).stdout.strip()
        if version != 'v24.21.0' and not ALLOW_NONREFERENCE:
            raise ValueError('Reference Node v24.21.0 required; observed ' + version)
        registry = student_release.read_registry()
        wanted = {'C07', 'C09', 'C14', 'S03', 'S06', 'S07', 'S09', 'S13'}
        cls.objects = {row['object_id']: row for row in registry['objects'] if row['object_id'] in wanted}
        cls.source = {name: student_release.verify_object(row) for name, row in cls.objects.items()}
        cls.c07_predecessor = c07_registry_derivative.derive(cls.source['C07'], cls.objects['C07'])
        cls.courses = {name: code.derive_course(name, cls.c07_predecessor if name == 'C07' else cls.source[name])
                       for name in ('C07', 'C09', 'C14')}
        cls.seminars = {name: code.derive_seminar(name, cls.source[name]) for name in ('S03', 'S06')}
        cls.advanced = {name: code.derive_advanced_seminar(name, cls.source[name])
                        for name in ('S03', 'S06', 'S07', 'S09', 'S13')}
        cls.temp = tempfile.TemporaryDirectory(prefix='webtech-rc9-code-')
        cls.work = Path(cls.temp.name)
        OBSERVATIONS['runtime'] = {'executable': cls.node, 'node': version,
            'reference_node_match': version == 'v24.21.0', 'platform': sys.platform}
        OBSERVATIONS['authenticated_inputs'] = {name: {'archive_sha256': row['archive_sha256'],
            'package_id': row['package_id'], 'payload_files': len(cls.source[name])}
            for name, row in cls.objects.items()}
        OBSERVATIONS['derived_paths'] = {}
        for family, mapping in [('course', cls.courses), ('seminar', cls.seminars), ('advanced', cls.advanced)]:
            for name, derivative in mapping.items():
                original = cls.c07_predecessor if family == 'course' and name == 'C07' else cls.source[name]
                OBSERVATIONS['derived_paths'][family + ':' + name] = [path for path in derivative
                                                                    if derivative[path] != original[path]]

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def command(self, args, cwd, label, env=None):
        environment = dict(os.environ) if env is None else dict(env)
        for name in ('NODE_OPTIONS', 'NODE_PATH', 'NODE_TEST_CONTEXT'):
            environment.pop(name, None)
        result = subprocess.run([self.node, *args], cwd=cwd, env=environment,
                                capture_output=True, text=True, timeout=25)
        OBSERVATIONS.setdefault('commands', []).append({'case': label, 'arguments': args,
            'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr})
        return result

    def assert_command(self, result, expected=0):
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)

    def tree(self, label, files):
        root = self.work / label
        root.mkdir()
        write_tree(root, files)
        return root

    def start_server(self, script, cwd, label, port=0):
        environment = dict(os.environ, PORT=str(port))
        for name in ('NODE_OPTIONS', 'NODE_PATH', 'NODE_TEST_CONTEXT'):
            environment.pop(name, None)
        process = subprocess.Popen([self.node, str(script)], cwd=cwd, env=environment,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        messages = queue.Queue()
        threading.Thread(target=lambda: messages.put(process.stdout.readline()), daemon=True).start()
        try:
            line = messages.get(timeout=10)
            if not line:
                raise AssertionError('Listener exited without announcing readiness')
            match = re.search(r'http://(?:localhost|127\.0\.0\.1):(\d+)', line)
            self.assertIsNotNone(match, line)
            return process, int(match.group(1)), line
        except BaseException:
            self.stop_server(process, label + ' readiness failure')
            raise

    def stop_server(self, process, label):
        if process.poll() is None:
            process.terminate()
        try:
            stdout, stderr = process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            stdout, stderr = process.communicate(timeout=5)
            self.fail('Owned listener did not stop within five seconds: ' + label)
        OBSERVATIONS.setdefault('listeners', []).append({'case': label,
            'exit_code': process.returncode, 'stdout_after_ready': stdout, 'stderr': stderr})
        return process.returncode

    def request(self, port, target, method='GET'):
        connection = http.client.HTTPConnection('127.0.0.1', port, timeout=5)
        try:
            connection.request(method, target)
            response = connection.getresponse()
            status, headers, body = response.status, dict(response.getheaders()), response.read()
        finally:
            connection.close()
        OBSERVATIONS.setdefault('http_cases', []).append({'method': method, 'target': target,
            'status': status, 'bytes': len(body)})
        return status, headers, body

    def test_01_unknown_objects_and_unsafe_mappings_refuse(self):
        for derive, object_id in [(code.derive_course, 'C00'), (code.derive_course, 'S03'),
                                  (code.derive_seminar, 'S15'), (code.derive_advanced_seminar, 'C07')]:
            with self.subTest(object_id=object_id), self.assertRaises(ValueError):
                derive(object_id, {'ok.txt': b'ok'})
        for files in ({}, {'../outside': b'x'}, {'/absolute': b'x'}, {'a//b': b'x'},
                      {'a/./b': b'x'}, {'a\\b': b'x'}, {'a\x00b': b'x'}, {'ok': 'not bytes'}):
            with self.subTest(files=files), self.assertRaises(ValueError):
                code.derive_course('C01', files)
        for derive, object_id in [(code.derive_course, 'C09'), (code.derive_course, 'C14'),
                                  (code.derive_seminar, 'S03'), (code.derive_advanced_seminar, 'S13')]:
            with self.subTest(object_id=object_id), self.assertRaises(ValueError):
                derive(object_id, {'unreviewed.txt': b'x'})

    def test_02_pure_deterministic_idempotent_and_no_path_changes(self):
        for derive, mapping in [(code.derive_course, self.courses), (code.derive_seminar, self.seminars),
                                (code.derive_advanced_seminar, self.advanced)]:
            for name, expected in mapping.items():
                original = self.c07_predecessor if derive is code.derive_course and name == 'C07' else self.source[name]
                preserved = dict(original)
                with self.subTest(object_id=name, family=derive.__name__):
                    self.assertEqual(derive(name, original), expected)
                    self.assertEqual(original, preserved)
                    self.assertIsNot(original, expected)
                    self.assertEqual(set(original), set(expected))
                    self.assertEqual(derive(name, expected), expected)
        for name in ('C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C08', 'C10', 'C11', 'C12', 'C13'):
            self.assertEqual(code.derive_course(name, {'source.txt': b'exact'}), {'source.txt': b'exact'})
        self.assertEqual(code.derive_seminar('S01', {'source.txt': b'exact'}), {'source.txt': b'exact'})

    def test_03_c07_registry_matches_all_current_source_bytes_and_guard(self):
        derived = self.courses['C07']
        rows = json.loads(derived['CANONICAL_SOURCES.json'])
        self.assertEqual({row['path'] for row in rows}, code.C07_CANONICAL)
        for row in rows:
            self.assertEqual(row['sha256'], hashlib.sha256(derived[row['path']]).hexdigest())
        for path, data in self.c07_predecessor.items():
            if path.startswith('canonical/') and not path.endswith('README.md'):
                self.assertEqual(derived[path], data, path)
            if path.startswith('PREDECESSOR_'):
                self.assertEqual(derived[path], data, path)
        root = self.tree('C07 registry with spaces é', derived)
        script = ('const m=await import(' + json.dumps((root / 'tools/examples.mjs').as_uri()) + ');'
                  'console.log(JSON.stringify(Object.keys(m.EXAMPLES).map(id=>({id,...m.sourceBoundary(id)}))));')
        result = self.command(['--input-type=module', '-e', script], root, 'C07 five exact source boundaries')
        self.assert_command(result)
        answers = json.loads(result.stdout)
        self.assertEqual(len(answers), 5)
        for answer in answers:
            self.assertEqual(answer['files'], 4)
            self.assertEqual(answer['errors'], [])
        result = self.command(['tools/examples.mjs', 'preflight', '01'], root, 'C07 missing prerequisites remain blocked')
        self.assert_command(result)
        answer = json.loads(result.stdout)
        self.assertIs(answer['ready'], False)
        self.assertEqual(answer['source']['errors'], [])
        self.assertTrue(any(row['error'] for row in answer['dependencies']))

    def test_04_c07_docs_follow_fixture_and_registry_mutations_refuse(self):
        derived = self.courses['C07']
        one = derived['canonical/01-relationship-shapes/README.md'].decode()
        three = derived['canonical/03-resource-contract/README.md'].decode()
        self.assertIn('one conference, one session, one attendee and one registration', one)
        self.assertIn('asserts status codes 201, 200, 204 and 204', three)
        self.assertIn('does not implement pagination, a closed query parser', three)
        for example in code.C07_EXAMPLES:
            text = derived['canonical/' + example + '/README.md'].decode()
            self.assertIn('npm ci', text)
            self.assertIn('preflight ' + example[:2], text)
            self.assertIn('prerequisite block', text)
            self.assertNotIn('npm install\n', text)
        rows = json.loads(self.c07_predecessor['CANONICAL_SOURCES.json'])
        cases = [('missing row', rows[:-1]), ('duplicate row', rows[:-1] + [rows[0]]),
                 ('extra row', rows + [rows[0]]), ('wrong path', [dict(row, path='unexpected.txt') if i == 0 else row for i, row in enumerate(rows)]),
                 ('bad digest', [dict(row, sha256='not a hash') if i == 0 else row for i, row in enumerate(rows)])]
        for label, value in cases:
            altered = dict(self.c07_predecessor, CANONICAL_SOURCES=json.dumps(value).encode())
            altered['CANONICAL_SOURCES.json'] = altered.pop('CANONICAL_SOURCES')
            with self.subTest(case=label), self.assertRaises(ValueError):
                code.derive_course('C07', altered)
        altered = dict(self.c07_predecessor)
        altered.pop('canonical/01-relationship-shapes/README.md')
        with self.assertRaises(ValueError):
            code.derive_course('C07', altered)
        altered = dict(self.c07_predecessor)
        altered['CANONICAL_SOURCES.json'] = b'[{"path":"a","path":"b"}]'
        with self.assertRaises(ValueError):
            code.derive_course('C07', altered)

    def test_05_c14_spaces_non_ascii_and_current_node_child(self):
        root = self.tree('C14 native paths with spaces é', self.courses['C14'])
        example = root / 'canonical/05-evidence-tristate-gate'
        fake = self.work / 'fake executable directory'
        fake.mkdir()
        fake_node = fake / 'node'
        fake_node.write_text('#!/bin/sh\nexit 73\n')
        fake_node.chmod(0o755)
        environment = dict(os.environ, PATH=str(fake) + os.pathsep + os.environ.get('PATH', ''))
        result = self.command(['--test', 'review.test.mjs'], example, 'C14 exact runtime child ignores wrong node on PATH', environment)
        self.assert_command(result)
        self.assertIn('tests 1', result.stdout)
        self.assertIn('pass 1', result.stdout)
        result = self.command(['review.mjs'], example, 'C14 actual CLI spaces and non-ASCII', environment)
        self.assert_command(result)
        self.assertIn('syntax', result.stdout)
        self.assertIn('dependency-audit', result.stdout)
        self.assertIn('unknown', result.stdout)
        for name in ('canonical/01-test-boundary-selector/system.mjs', 'canonical/03-tail-latency-trace/probe.mjs',
                     'canonical/04-safe-log-projection/server.mjs', 'canonical/05-evidence-tristate-gate/review.mjs'):
            self.assertIn(b'rc9Resolve(process.argv[1])===rc9FileURLToPath(import.meta.url)', self.courses['C14'][name])
            self.assertNotIn(b'file://${process.argv[1]}', self.courses['C14'][name])

    def test_06_c09_real_cli_http_spaces_and_encoded_identity(self):
        dependencies = os.environ.get('WEBTECH_RC9_EXPRESS_NODE_MODULES')
        if not dependencies:
            self.skipTest('Set WEBTECH_RC9_EXPRESS_NODE_MODULES to existing exact Express 5.1.0 dependencies; no installation performed')
        module_root = Path(dependencies).resolve()
        self.assertEqual(json.loads((module_root / 'express/package.json').read_text())['version'], '5.1.0')
        root = self.tree('C09 native paths with spaces é', self.courses['C09'])
        example = root / 'canonical/04-http-adapter-contract'
        (example / 'node_modules').symlink_to(module_root, target_is_directory=True)
        process, port, ready = self.start_server(example / 'server.js', root, 'C09 actual CLI', port=3001)
        try:
            self.assertEqual(port, 3001)
            status, _, body = self.request(port, '/api/notes')
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)['data'][0]['id'], 'a/b')
            status, _, body = self.request(port, '/api/notes/a%2Fb')
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)['data']['id'], 'a/b')
            self.assertEqual(self.request(port, '/api/notes/absent')[0], 404)
        finally:
            # C09 has no declared graceful shutdown hook; terminate only our child.
            self.stop_server(process, 'C09 actual CLI ' + ready.strip())

    def test_07_s03_s06_unsupported_serve_is_specific_and_not_advertised(self):
        for name, files in self.seminars.items():
            root = self.tree(name + ' filtered classroom with spaces é', files)
            result = self.command(['CLASSROOM_RC6/kit.mjs', 'serve'], root, name + ' rejected absent-server route')
            self.assert_command(result, 2)
            answer = json.loads(result.stderr)
            self.assertEqual(answer['status'], 'STOP_UNSUPPORTED_CLASSROOM_COMMAND')
            self.assertEqual(answer['seminar'], name)
            self.assertEqual(answer['command'], 'serve')
            self.assertNotIn('Cannot find module', result.stderr)
            result = self.command(['CLASSROOM_RC6/kit.mjs'], root, name + ' truthful command usage')
            self.assert_command(result, 2)
            self.assertIn('initial | check', result.stderr)
            self.assertNotIn('| serve', result.stderr)
            self.assertNotIn(b"await import('./server.mjs')", files['CLASSROOM_RC6/kit.mjs'])

    def test_08_advanced_native_guards_replace_only_confirmed_occurrences(self):
        counts = {'S03': 4, 'S06': 3, 'S07': 3, 'S09': 2}
        for name, expected in counts.items():
            changed = [path for path, data in self.advanced[name].items() if self.source[name][path] != data]
            self.assertEqual(len(changed), expected, (name, changed))
            for path in changed:
                text = self.advanced[name][path].decode()
                self.assertIn('fileURLToPath as rc9FileURLToPath', text)
                self.assertNotRegex(text, code.ENTRY_PATTERN)
                self.assertNotRegex(text, code.ROOT_PATTERN)
            for path, data in self.source[name].items():
                if path not in changed:
                    self.assertEqual(self.advanced[name][path], data)

    def test_09_s03_actual_cli_executes_from_space_non_ascii_path(self):
        root = self.tree('S03 advanced CLI with spaces é', self.advanced['S03'])
        project = root / '02_PROJECTS/P01/student'
        result = self.command(['src/cli.js', '--help'], project, 'S03 actual advanced CLI help')
        self.assert_command(result)
        self.assertIn('Usage: npm run transform', result.stdout)
        result = self.command(['src/cli.js'], project, 'S03 actual advanced CLI disposable input')
        self.assert_command(result)
        self.assertTrue(result.stdout.strip())
        json.loads(result.stdout)

    def test_10_s13_owned_assets_methods_traversal_and_symlinks(self):
        fixture = self.work / 'S13 browser fixture with spaces é'
        fixture.mkdir()
        assets = {'index.html': b'<!doctype html><title>Owned synthetic fixture</title>',
                  'main.js': b'export const main = true;\n', 'styles.css': b'body { color: black; }\n',
                  'src/worker-client.js': b'export const workerClient = true;\n',
                  'src/analysis.js': b'export const analysis = true;\n',
                  'src/analysis-worker.js': b'export const analysisWorker = true;\n'}
        write_tree(fixture, dict(assets, **{'server.mjs': self.advanced['S13']['projects/p01/student/server.mjs'],
                                          'package.json': b'{"synthetic":"unlisted"}', 'tests/unlisted.txt': b'owned synthetic test'}))
        sibling = self.work / 'S13 browser fixture with spaces é-sibling'
        sibling.mkdir()
        (sibling / 'owned.txt').write_bytes(b'Owned nonsensitive sibling marker')
        elsewhere = self.work / 'different working directory'
        elsewhere.mkdir()
        (elsewhere / 'index.html').write_bytes(b'This wrong cwd must never supply an asset')
        process, port, ready = self.start_server(fixture / 'server.mjs', elsewhere, 'S13 fixed synthetic server')
        try:
            for name, data in assets.items():
                with self.subTest(asset=name):
                    status, headers, body = self.request(port, '/' + name)
                    self.assertEqual(status, 200)
                    self.assertEqual(body, data)
                    self.assertEqual(int(headers['content-length']), len(data))
                    self.assertEqual(headers['cache-control'], 'no-store')
                    self.assertIn('charset=utf-8', headers['content-type'])
            self.assertEqual(self.request(port, '/')[2], assets['index.html'])
            status, headers, body = self.request(port, '/main.js', 'HEAD')
            self.assertEqual((status, body), (200, b''))
            self.assertEqual(int(headers['content-length']), len(assets['main.js']))
            self.assertEqual(self.request(port, '/main.js?cache=fixture')[2], assets['main.js'])
            denied = ['/package.json', '/server.mjs', '/tests/unlisted.txt', '/absent', '/%00', '/%zz',
                      '/%2e%2e%2fS13%20browser%20fixture%20with%20spaces%20%C3%A9-sibling%2fowned.txt',
                      '/src%2f..%2f..%2fS13%20browser%20fixture%20with%20spaces%20%C3%A9-sibling%2fowned.txt',
                      '/src/%2e%2e/%2e%2e/owned.txt', '/src\\..\\owned.txt', '//package.json']
            for target in denied:
                with self.subTest(target=target):
                    status, _, body = self.request(port, target)
                    self.assertEqual(status, 404)
                    self.assertNotIn(b'Owned nonsensitive sibling marker', body)
            status, headers, body = self.request(port, '/main.js', 'POST')
            self.assertEqual(status, 405)
            self.assertEqual(headers['Allow'], 'GET, HEAD')
            (fixture / 'main.js').unlink()
            (fixture / 'main.js').symlink_to(sibling / 'owned.txt')
            self.assertEqual(self.request(port, '/main.js')[0], 404)
            (fixture / 'src/analysis.js').unlink()
            (fixture / 'src/analysis.js').symlink_to(fixture / 'index.html')
            self.assertEqual(self.request(port, '/src/analysis.js')[0], 404)
            shutil.rmtree(fixture / 'src')
            (fixture / 'src').symlink_to(sibling, target_is_directory=True)
            (sibling / 'worker-client.js').write_bytes(b'Owned nonsensitive symlink directory marker')
            self.assertEqual(self.request(port, '/src/worker-client.js')[0], 404)
            (fixture / 'styles.css').write_bytes(b'x' * (2 * 1024 * 1024 + 1))
            self.assertEqual(self.request(port, '/styles.css')[0], 404)
            (fixture / 'styles.css').unlink()
            (fixture / 'styles.css').mkdir()
            self.assertEqual(self.request(port, '/styles.css')[0], 404)
        finally:
            self.assertEqual(self.stop_server(process, 'S13 fixed synthetic server ' + ready.strip()), 0)

    def test_11_all_changed_javascript_parses_in_reference_node(self):
        count = 0
        for family, mapping in [('course', self.courses), ('seminar', self.seminars), ('advanced', self.advanced)]:
            for name, files in mapping.items():
                original = self.c07_predecessor if family == 'course' and name == 'C07' else self.source[name]
                changed = {path: data for path, data in files.items()
                           if data != original[path] and path.endswith(('.js', '.mjs', '.cjs'))}
                root = self.tree('syntax-' + family + '-' + name, changed)
                for path in changed:
                    result = self.command(['--check', str(root / path)], root, family + ':' + name + ':' + path)
                    self.assert_command(result)
                    count += 1
        self.assertEqual(count, 20)
        OBSERVATIONS['changed_javascript_syntax_cases'] = count

    def test_12_advanced_recipe_authenticates_five_objects_and_reseals_fixed_identities(self):
        payload = advanced_builder.build_payload(check_source=False)
        repeated = advanced_builder.build_payload(check_source=False)
        self.assertEqual(payload, repeated)
        metadata = json.loads(payload['ADVANCED_COLLECTION.json'])
        self.assertEqual([row['object_id'] for row in metadata['objects']], list(advanced_builder.OBJECTS))
        self.assertIs(metadata['qualified_release'], False)
        self.assertIs(metadata['classroom_core_inclusion'], False)
        for row in metadata['objects']:
            ident, prefix = row['object_id'], row['root']
            files = {path[len(prefix):]: data for path, data in payload.items() if path.startswith(prefix)}
            self.assertEqual(student_release.verify_identity(ident, files), row['package_id'])
            self.assertEqual(set(files), set(self.source[ident]))
            for path in advanced_builder.POLICIES[ident]['mutable_paths']:
                self.assertEqual(files[path], self.source[ident][path], (ident, path))
            actual_changes = {path for path in files if files[path] != self.source[ident][path]}
            self.assertEqual({record['path'] for record in row['changes']}, actual_changes)
            for change in row['changes']:
                self.assertEqual(change['before_sha256'], hashlib.sha256(self.source[ident][change['path']]).hexdigest())
                self.assertEqual(change['after_sha256'], hashlib.sha256(files[change['path']]).hexdigest())
        archive = advanced_builder.rc.zip_bytes(payload, advanced_builder.COLLECTION_ROOT)
        self.assertEqual(archive, advanced_builder.rc.zip_bytes(repeated, advanced_builder.COLLECTION_ROOT))
        OBSERVATIONS['advanced_build'] = {'files': len(payload), 'zip_bytes': len(archive),
            'zip_sha256': hashlib.sha256(archive).hexdigest(), 'source_seal_skipped_in_isolated_fixture': True,
            'per_object_identity_verified': list(advanced_builder.OBJECTS),
            'unchanged_assessed_edit_paths': True, 'deterministic_zip': True}
        self.advanced_payload = payload
        CodeCorrections.advanced_payload = payload

    def test_13_advanced_actual_project_boundaries_and_native_compatibility(self):
        payload = getattr(CodeCorrections, 'advanced_payload', None) or advanced_builder.build_payload(check_source=False)
        root = self.tree('Advanced clean source with spaces é', payload)
        for ident, module, expression in [
                ('S03', '02_PROJECTS/tools/gate.mjs',
                 'Object.values(m.plans).map(p=>m.inspectTree(root+"/02_PROJECTS/"+p.path,p,"initial"))'),
                ('S06', 'tools/integrity.mjs', 'await Promise.all(["p01","p02","p03"].map(id=>m.boundary(id)))'),
                ('S07', 'tools/project.mjs', 'await Promise.all(["p01","p02","p03"].map(id=>m.boundary(id)))')]:
            package = root / 'PACKAGES' / ident
            script = ('const root=' + json.dumps(str(package)) + ';const m=await import('
                      + json.dumps((package / module).as_uri()) + ');console.log(JSON.stringify(' + expression + '));')
            result = self.command(['--input-type=module', '-e', script], package, ident + ' actual rebound full-source boundaries')
            self.assert_command(result)
            reports = json.loads(result.stdout)
            self.assertEqual(len(reports), 3)
            for report in reports:
                self.assertIs(report['ok'], True, report)
        package = root / 'PACKAGES/S03'
        result = self.command(['90_AUDIT/tools/package-integrity.mjs'], package,
                              'S03 native whole-package guard native default path')
        self.assert_command(result)
        self.assertEqual(json.loads(result.stdout)['verdict'], 'PASS_PACKAGE_INTEGRITY_EXACT_SET')
        package = root / 'PACKAGES/S09'
        for project in ('p01', 'p02', 'p03'):
            result = self.command(['tools/S09_VERIFY_INITIAL_STATE_v1_2_0.mjs', '--check-source', project],
                                  package, 'S09 genuine pinned rebound ' + project + ' source check')
            self.assert_command(result)
            self.assertEqual(json.loads(result.stdout)['status'], 'EXACT_STARTER_BYTES')
        package = root / 'PACKAGES/S13'
        script = ('import fs from "node:fs";const root=' + json.dumps(str(package)) + ';const m=await import('
                  + json.dumps((package / 'TOOLS/boundary-guard.mjs').as_uri())
                  + ');const a=JSON.parse(fs.readFileSync(root+"/TOOLS/PROTECTION_AUTHORITY.json"));'
                    'console.log(JSON.stringify(m.verifyBoundary(root,a,{initial:true})));')
        result = self.command(['--input-type=module', '-e', script], package,
                              'S13 actual full authority initial source boundary without environment qualification')
        self.assert_command(result)
        self.assertIs(json.loads(result.stdout)['initial'], True)
        result = self.command(['SOURCE_HISTORICAL_TOOLS/verify-p01-boundary.mjs'], package,
                              'S13 genuine rebound P01 source baseline')
        self.assert_command(result)
        self.assertEqual(json.loads(result.stdout)['status'], 'PASS_BOUNDARY')
        # Record known predecessor incompatibilities exactly; these are not
        # runtime/example failures introduced by the patch or promoted PASSes.
        commands = [('S06', ['tools/cli.mjs', 'package']),
                    ('S09', ['tools/S09_VERIFY_PACKAGE_v1_2_0.mjs', '--verify-package']),
                    ('S13', ['TOOLS/entry.mjs', 'package'])]
        compatibility = []
        for ident, args in commands:
            package = root / 'PACKAGES' / ident
            result = self.command(args, package, ident + ' disclosed native RC6 whole-package incompatibility')
            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            if ident == 'S13':
                self.assertIn('BLOCKED_PACKAGE_EXACT_SET', result.stderr)
                self.assertNotIn('BLOCKED_VERIFIER_AUTHORITY', result.stderr)
                self.assertNotIn('BLOCKED_PROTECTED_IDENTITY', result.stderr)
            compatibility.append({'object_id': ident, 'exit_code': result.returncode,
                                  'promoted_to_acceptance': False})
        OBSERVATIONS['historical_native_package_incompatibilities'] = compatibility
        OBSERVATIONS['advanced_project_boundaries'] = {'S03': 3, 'S06': 3, 'S07': 3, 'S09': 3, 'S13': 2,
            'database_opened': False, 'runtime_prerequisites_bypassed': False}

    def test_14_advanced_outer_verifier_refuses_modified_added_missing_and_symlink_files(self):
        payload = getattr(CodeCorrections, 'advanced_payload', None) or advanced_builder.build_payload(check_source=False)
        root = self.tree('Advanced negative integrity with spaces é', payload)
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced exact clean bytes')
        self.assert_command(result)
        self.assertEqual(json.loads(result.stdout)['status'], 'PASS_OPTIONAL_ADVANCED_CLEAN_BYTES_ONLY')
        target = root / 'PACKAGES/S03/02_PROJECTS/P01/student/src/cli.js'
        original = target.read_bytes()
        target.write_bytes(original + b'\n// owned synthetic mutation\n')
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced changed protected CLI refuses')
        self.assert_command(result, 2)
        self.assertIn('CHANGED', result.stderr)
        target.write_bytes(original)
        extra = root / 'owned-unlisted.txt'
        extra.write_bytes(b'Owned nonsensitive extra marker')
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced added file refuses')
        self.assert_command(result, 2)
        self.assertIn('EXACT_FILE_SET', result.stderr)
        extra.unlink()
        target.unlink()
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced missing file refuses')
        self.assert_command(result, 2)
        self.assertIn('EXACT_FILE_SET', result.stderr)
        target.symlink_to(root / 'README.md')
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced symlink refuses')
        self.assert_command(result, 2)
        self.assertIn('NON_REGULAR_OR_HARDLINK', result.stderr)
        target.unlink()
        target.write_bytes(original)
        result = self.command(['VERIFY_ADVANCED.mjs'], root, 'advanced restoration clean bytes')
        self.assert_command(result)

    def test_15_advanced_output_preflight_prevents_partial_writes_and_source_escape(self):
        work = self.work / 'advanced CLI output preflight'
        work.mkdir()
        minimal = {'README.md': b'Owned deterministic output fixture\n'}
        minimal['SHA256SUMS.txt'] = advanced_builder.rc.manifest(minimal)
        minimal['PACKAGE_ID.txt'] = (hashlib.sha256(minimal['SHA256SUMS.txt']).hexdigest() + '\n').encode()
        cases = [
            ('site contains zip', ['--site', str(work / 'overlap'), '--zip', str(work / 'overlap/candidate.zip')]),
            ('zip equals report', ['--zip', str(work / 'same.zip'), '--report', str(work / 'same.zip')]),
            ('sidecar equals report', ['--zip', str(work / 'side.zip'), '--report', str(work / 'side.zip.sha256')]),
            ('source checkout refuses', ['--zip', str(REPO / 'owned-forbidden-advanced.zip')])]
        for label, arguments in cases:
            with self.subTest(case=label), patch.object(sys, 'argv', ['build_advanced_rc9.py', *arguments]), \
                    patch.object(advanced_builder, 'build_payload', return_value=minimal) as build:
                with self.assertRaises(ValueError):
                    advanced_builder.main()
                build.assert_not_called()
                self.assertEqual(list(work.iterdir()), [])
        for label in ('conflicting sidecar', 'conflicting report', 'conflicting site'):
            case_root = work / label
            case_root.mkdir()
            archive, sidecar = case_root / 'candidate.zip', case_root / 'candidate.zip.sha256'
            report, site = case_root / 'report.json', case_root / 'site'
            if label == 'conflicting sidecar':
                sidecar.write_bytes(b'Owned conflicting sidecar\n')
            elif label == 'conflicting report':
                report.write_bytes(b'Owned conflicting report\n')
            else:
                site.mkdir()
                (site / 'unlisted.txt').write_bytes(b'Owned conflicting tree\n')
            before = {str(path.relative_to(case_root)): path.read_bytes() for path in case_root.rglob('*') if path.is_file()}
            arguments = ['build_advanced_rc9.py', '--zip', str(archive), '--site', str(site), '--report', str(report)]
            with self.subTest(case=label), patch.object(sys, 'argv', arguments), \
                    patch.object(advanced_builder, 'build_payload', return_value=minimal):
                with self.assertRaises(ValueError):
                    advanced_builder.main()
            after = {str(path.relative_to(case_root)): path.read_bytes() for path in case_root.rglob('*') if path.is_file()}
            self.assertEqual(before, after)
            self.assertFalse(archive.exists())
            if label != 'conflicting site':
                self.assertFalse(site.exists())
            if label != 'conflicting report':
                self.assertFalse(report.exists())
        OBSERVATIONS['advanced_output_preflight'] = {'case_count': 7, 'automatic_sidecar_checked': True,
            'conflicts_preserved': True, 'no_partial_output_written': True, 'builder_mocked_with_owned_minimal_fixture': True}


def main():
    global NODE, ALLOW_NONREFERENCE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', default=NODE)
    parser.add_argument('--allow-nonreference', action='store_true', help='Explicit development-only runtime')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    NODE, ALLOW_NONREFERENCE = args.node, args.allow_nonreference
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__]))
    report = {'schema': 'webtech-rc9-code-finite-qa/v1',
              'status': 'PASS_SCOPED_LOCAL_QA' if result.wasSuccessful() else 'FAIL_SCOPED_LOCAL_QA',
              'tests_run': result.testsRun, 'errors': len(result.errors), 'failures': len(result.failures),
              'skipped': len(result.skipped), 'qualificationVerdict': 'NOT_FINAL', 'actions_dispatched': 0,
              'source_seal_checked_by_this_suite': False,
              'limitations': 'Authenticated fixed inputs, finite code transformation and owned loopback fixture tests only. No dependency installation, database/native-addon execution, browser/PDF, native Windows/macOS, Word, Moodle, cohort pilot, owner acceptance or release publication.',
              'observations': OBSERVATIONS}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('status', 'tests_run', 'errors', 'failures', 'skipped', 'actions_dispatched')}, indent=2))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
