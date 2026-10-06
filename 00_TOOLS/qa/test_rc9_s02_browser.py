#!/usr/bin/env python3
"""Fail-closed S02 companion derivation tests, without browser claims.

Real browser observations are recorded separately. No installs or networking.
Run: python -m unittest discover -s 00_TOOLS/qa -p test_rc9_s02_browser.py -v
"""
from __future__ import annotations

from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
PUBLISHING = Path(__file__).resolve().parents[1] / 'publishing'
sys.path.insert(0, str(PUBLISHING))
import rc9_s02_browser as browser
import student_release


class S02BrowserDerivation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        registry = student_release.read_registry()
        row = next(row for row in registry['objects'] if row['object_id'] == 'S02')
        cls.source = student_release.verify_object(row)

    def test_pure_deterministic_derivation_preserves_all_other_bytes(self):
        original = dict(self.source)
        first = browser.derive(self.source)
        self.assertEqual(self.source, original)
        self.assertEqual(first, browser.derive(self.source))
        self.assertEqual(set(first) - set(original), {'CLASSROOM_RC6/BROWSER_CHECKS.html'})
        changed = [name for name in original if first[name] != original[name]]
        self.assertEqual(changed, ['CLASSROOM_RC6/server.mjs'])
        self.assertEqual(first['CLASSROOM_RC6/targets/styles.css'], original['CLASSROOM_RC6/targets/styles.css'])
        self.assertEqual(first['CLASSROOM_RC6/contract.json'], original['CLASSROOM_RC6/contract.json'])
        self.assertEqual(first['CLASSROOM_RC6/CLASSROOM_SCOPE.json'], original['CLASSROOM_RC6/CLASSROOM_SCOPE.json'])

    def test_every_changed_reviewed_input_and_repeated_derivation_refuse(self):
        for name in browser._REVIEWED:
            with self.subTest(path=name):
                changed = dict(self.source)
                changed[name] += b'\n'
                with self.assertRaises(ValueError):
                    browser.derive(changed)
                absent = dict(self.source)
                del absent[name]
                with self.assertRaises(ValueError):
                    browser.derive(absent)
        with self.assertRaises(ValueError):
            browser.derive(browser.derive(self.source))

    def test_nonbytes_or_unsafe_relative_paths_refuse_without_mutation(self):
        for path, data in [('/absolute', b'x'), ('../outside', b'x'), ('a//b', b'x'),
                           ('a\\b', b'x'), ('a\x00b', b'x'), ('other', 'text')]:
            with self.subTest(path=path):
                changed = dict(self.source)
                changed[path] = data
                before = dict(changed)
                with self.assertRaises(ValueError):
                    browser.derive(changed)
                self.assertEqual(changed, before)

    @unittest.skipUnless(shutil.which('node'), 'Node needed for script syntax check')
    def test_script_parses_and_route_keeps_owned_server(self):
        derived = browser.derive(self.source)
        server = derived['CLASSROOM_RC6/server.mjs'].decode()
        self.assertEqual(server.count("'/browser-checks.html':['BROWSER_CHECKS.html','text/html; charset=utf-8']"), 1)
        self.assertIn('await runOwned', server)
        self.assertIn("req.method!=='GET'||!route", server)
        html = derived['CLASSROOM_RC6/BROWSER_CHECKS.html'].decode()
        script = html.split('<script>', 1)[1].split('</script>', 1)[0]
        with tempfile.TemporaryDirectory(prefix='rc9-s02-browser-syntax-') as temporary:
            path = Path(temporary) / 'browser-script.js'
            path.write_text(script, encoding='utf-8')
            result = subprocess.run([shutil.which('node'), '--check', str(path)],
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
