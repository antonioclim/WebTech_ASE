#!/usr/bin/env python3
"""Finite publication-identity and navigation refusal regressions.

Uses the recorded publication receipt and compact, suite-owned local fixtures.
No requests to GitHub, release changes, Actions dispatches or application tests.
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
import current_navigation as navigation
import publication_controls as publication

ROOT = Path(__file__).resolve().parents[2]
OBSERVATIONS = {"refused_mutations": []}


class PublicationControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.receipt = publication.rc.strict_json((ROOT / publication.RECEIPT).read_bytes())
        cls.plan = publication.rc.strict_json((ROOT / publication.PLAN).read_bytes())

    def refuse(self, path, value, fixture="receipt"):
        receipt, plan = copy.deepcopy(self.receipt), copy.deepcopy(self.plan)
        subject = receipt if fixture == "receipt" else plan
        for key in path[:-1]:
            subject = subject[key]
        subject[path[-1]] = value
        with self.assertRaises(ValueError, msg=str(path) + " should refuse " + repr(value)):
            publication.validate_receipt(receipt, plan)
        OBSERVATIONS["refused_mutations"].append({"fixture": fixture,
                                               "path": list(path), "mutation": value})

    def test_01_actual_receipt_retains_observed_skip_and_pending_qualification(self):
        result = publication.validate_receipt(self.receipt, self.plan)
        self.assertEqual(result["qualification"], "NOT_FINAL")
        self.assertEqual(result["pending_qualification_gates"], list(publication.rc.GATES))
        self.assertEqual(result["recorded_workflow_tests"], {
            "defined": 40, "passed": 39, "skipped": 1, "failures": 0, "errors": 0})
        self.assertIs(result["live_network_used"], False)
        self.assertEqual(result["actions_dispatched"], 0)

    def test_02_other_source_release_tag_date_and_package_are_refused(self):
        mutations = [("source_commit", "0" * 40), ("release_id", 404427361),
                     ("version", "3.0.0-rc.8"), ("tag", "classroom-en-gb-v3.0.0-rc.8"),
                     ("published_at", "2026-10-06T07:29:25Z"),
                     ("package_id", "0" * 64), ("status", "PREPARED_NOT_PUBLISHED"),
                     ("release_url", publication.RELEASE_URL + "?redirect=elsewhere")]
        for name, value in mutations:
            with self.subTest(field=name):
                self.refuse((name,), value)
        self.refuse(("immutable_distribution", "source_commit"), "0" * 40)
        self.refuse(("immutable_distribution", "tag"), "classroom-en-gb-v3.0.0-rc.8")

    def test_03_boolean_integer_and_float_type_confusion_is_refused(self):
        cases = [(("draft",), 0), (("prerelease",), 1),
                 (("release_id",), float(publication.RELEASE_ID)),
                 (("assets", 0, "bytes"), float(self.receipt["assets"][0]["bytes"])),
                 (("assets", 0, "id"), str(self.receipt["assets"][0]["id"])),
                 (("workflow", "id"), float(publication.WORKFLOW_ID)),
                 (("workflow", "tests", "skipped"), True),
                 (("workflow", "tests", "failures"), False),
                 (("verification", "assets_byte_identity"), 1),
                 (("verification", "zip_crc"), 1),
                 (("verification", "file_count"), 1344.0)]
        for path, value in cases:
            with self.subTest(path=path):
                self.refuse(path, value)
        self.refuse(("draft",), 1, fixture="plan")
        self.refuse(("prerelease",), 1, fixture="plan")

    def test_04_asset_tampering_wrong_url_duplicate_and_extra_assets_are_refused(self):
        for index in range(3):
            for key, value in (("sha256", "0" * 64), ("bytes", 1), ("id", 1),
                               ("download_url", "https://example.invalid/" + self.receipt["assets"][index]["name"])):
                with self.subTest(index=index, key=key):
                    self.refuse(("assets", index, key), value)
        self.refuse(("assets",), self.receipt["assets"] + [copy.deepcopy(self.receipt["assets"][0])])
        self.refuse(("assets",), self.receipt["assets"][:2])
        duplicate = copy.deepcopy(self.receipt["assets"])
        duplicate[1] = duplicate[0]
        self.refuse(("assets",), duplicate)
        self.refuse(("assets", 0, "name"), "WEBTECH_ASE_ADVANCED_RC9.zip")

    def test_05_unknown_missing_and_duplicate_json_controls_are_refused(self):
        for path in ((), ("workflow",), ("workflow", "tests"), ("verification",),
                     ("immutable_distribution",), ("assets", 0)):
            receipt = copy.deepcopy(self.receipt)
            subject = receipt
            for key in path:
                subject = subject[key]
            subject["unknown_control"] = True
            with self.subTest(path=path), self.assertRaises(ValueError):
                publication.validate_receipt(receipt, self.plan)
        missing = copy.deepcopy(self.receipt)
        del missing["draft"]
        with self.assertRaises(ValueError):
            publication.validate_receipt(missing, self.plan)
        with self.assertRaises(ValueError):
            publication.rc.strict_json(b'{"draft":false,"draft":true}')
        self.refuse(("verification", "observation_context"), " ")
        self.refuse(("immutable_distribution", "reproduction_note"), "")

    def test_06_publication_and_successful_workflow_do_not_promote_acceptance(self):
        self.refuse(("qualificationVerdict",), "FINAL")
        for gate in publication.rc.GATES:
            with self.subTest(gate=gate):
                self.refuse(("qualification_gates", gate), "PASS")
                self.refuse(("gates", gate, "status"), "PASS", fixture="plan")
        self.refuse(("qualification_gates",), {})
        self.refuse(("required_gates",), list(publication.rc.GATES)[:-1], fixture="plan")

    def test_07_omission_or_inflation_of_hosted_checks_is_refused(self):
        for path, value in [(("workflow", "tests", "passed"), 40),
                            (("workflow", "tests", "skipped"), 0),
                            (("workflow", "tests", "errors"), 1),
                            (("workflow", "skip_reason"), "No tests were skipped"),
                            (("workflow", "conclusion"), "failure"),
                            (("workflow", "url"), publication.RELEASE_URL),
                            (("verification", "collection_verifier"), "PASS_FINAL")]:
            self.refuse(path, value)

    def test_08_local_run_checks_exact_receipt_and_rejects_symlink(self):
        with tempfile.TemporaryDirectory(prefix="webtech-publication-controls-") as temporary:
            root = Path(temporary)
            for path, value in ((publication.RECEIPT, self.receipt), (publication.PLAN, self.plan)):
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(json.dumps(value), encoding="utf-8")
            result = publication.run(root)
            self.assertEqual(result["release_id"], publication.RELEASE_ID)
            receipt_path = root / publication.RECEIPT
            stored = root / "stored.json"
            receipt_path.rename(stored)
            receipt_path.symlink_to(stored)
            with self.assertRaises(ValueError):
                publication.run(root)
        self.assertFalse(root.exists())


class PublishedNavigation(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="webtech-published-navigation-")
        self.root = Path(self.temporary.name)
        for name in (navigation.ACTIVE_PORTAL, navigation.ACTIVE_NOTES, navigation.ACTIVE_PROCEDURE):
            self.write(name, "fixture\n")
        self.citation = {"version": navigation.ACTIVE_VERSION, "date-released": "2026-10-06",
                         "message": "PUBLISHED_PRERELEASE; general qualification NOT_FINAL",
                         "url": navigation.ACTIVE_RELEASE_URL}
        self.repository = {"repository": {"version": navigation.ACTIVE_VERSION,
                            "status": "PUBLISHED_PRERELEASE", "general_qualification": "NOT_FINAL",
                            "last_published_classroom_version": navigation.ACTIVE_VERSION,
                            "student_portal": navigation.ACTIVE_PORTAL,
                            "publication_receipt": navigation.ACTIVE_RECEIPT,
                            "published_at": navigation.PUBLISHED_AT,
                            "classroom_release_url": navigation.ACTIVE_RELEASE_URL}}
        self.course = {"repository_version": navigation.ACTIVE_VERSION,
                       "publication_status": "PUBLISHED_PRERELEASE",
                       "last_published_classroom_version": navigation.ACTIVE_VERSION,
                       "student_portal": navigation.ACTIVE_PORTAL,
                       "publication_receipt": navigation.ACTIVE_RECEIPT,
                       "published_at": navigation.PUBLISHED_AT,
                       "general_qualification": "NOT_FINAL",
                       "weeks": [{"week": number, "active_distribution_version": navigation.ACTIVE_VERSION,
                                  "status": "PUBLISHED_RC10_PRERELEASE",
                                  "active_distribution_languages": ["EN_GB"]}
                                 for number in range(1, 15)]}
        self.code = {"version": navigation.ACTIVE_VERSION, "developmentStatus": "PUBLISHED_PRERELEASE",
                     "datePublished": "2026-10-06", "description": "General qualification NOT_FINAL",
                     "url": navigation.ACTIVE_RELEASE_URL}
        self.store_metadata()

    def tearDown(self):
        self.temporary.cleanup()
        self.assertFalse(self.root.exists())

    def write(self, name, text):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    def store_metadata(self):
        # JSON objects are YAML-compatible; the genuine unique-YAML parser runs.
        for name, value in (("CITATION.cff", self.citation),
                            ("metadata/repository-metadata.yml", self.repository),
                            ("metadata/course-map.json", self.course), ("codemeta.json", self.code)):
            self.write(name, json.dumps(value))

    def prefix(self):
        return ("Published 3.0.0-rc.10 PUBLISHED_PRERELEASE NOT_FINAL. The last published classroom "
                "prerelease is RC10. Retain historical RC6 source with stale canonical registry hashes.\n"
                + "\n".join("[Current](" + name + ")" for name in
                              (navigation.ACTIVE_PORTAL, navigation.ACTIVE_NOTES, navigation.ACTIVE_PROCEDURE))
                + '\n<details data-historical-source="rc6"><summary>Historical source, advanced, optional</summary>\n'
                + "Prepared RC9 PREPARED_NOT_PUBLISHED and last published classroom prerelease is RC8.\n</details>\n")

    def test_09_published_metadata_and_current_route_accept_retained_history(self):
        self.assertEqual(navigation.active_metadata(self.root)["qualification"], "NOT_FINAL")
        route = navigation.active_route(self.root, "README.md", self.prefix())
        self.assertEqual(route["published_version"], navigation.ACTIVE_VERSION)
        self.assertIs(route["historical_source_collapsed"], True)
        public_prefix = self.prefix().replace("Published 3.0.0-rc.10", "[Published RC10](" + navigation.ACTIVE_RELEASE_URL + ") 3.0.0-rc.10")
        navigation.active_route(self.root, "README.md", public_prefix)

    def test_10_stale_active_state_missing_portal_and_historical_payload_are_refused(self):
        variants = [self.prefix().replace("PUBLISHED_PRERELEASE", "PREPARED_NOT_PUBLISHED", 1),
                    self.prefix().replace("prerelease is RC10", "prerelease is RC9", 1),
                    self.prefix().replace("NOT_FINAL", "FINAL", 1),
                    self.prefix().replace("[Current](" + navigation.ACTIVE_PORTAL + ")", ""),
                    "[Old RC9](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9)\n" + self.prefix()]
        self.write("old.zip", "zip fixture")
        variants.append("[Old payload](old.zip)\n" + self.prefix())
        for index, variant in enumerate(variants):
            with self.subTest(index=index), self.assertRaises(ValueError):
                navigation.active_route(self.root, "README.md", variant)
        (self.root / navigation.ACTIVE_PORTAL).unlink()
        with self.assertRaises(ValueError):
            navigation.active_route(self.root, "README.md", self.prefix())

    def test_11_published_metadata_rejects_wrong_date_last_release_and_final_claim(self):
        fixtures = [(self.citation, "date-released", "2026-10-05"),
                    (self.repository["repository"], "last_published_classroom_version", "3.0.0-rc.9"),
                    (self.repository["repository"], "publication_receipt", "90_RELEASES/CLASSROOM_RC9_PUBLICATION.json"),
                    (self.repository["repository"], "published_at", "2026-10-06T07:29:24Z"),
                    (self.repository["repository"], "classroom_release_url", "https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9"),
                    (self.citation, "url", "https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9"),
                    (self.code, "url", "https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9"),
                    (self.repository["repository"], "general_qualification", "FINAL"),
                    (self.course, "publication_status", "PREPARED_NOT_PUBLISHED"),
                    (self.course, "publication_receipt", "90_RELEASES/CLASSROOM_RC9_PUBLICATION.json"),
                    (self.course, "published_at", "2026-10-06T07:29:24Z"),
                    (self.course, "general_qualification", "FINAL"),
                    (self.code, "datePublished", "2026-10-05"),
                    (self.code, "description", "Fully qualified FINAL"),
                    (self.course["weeks"][0], "status", "PREPARED_RC9_NOT_PUBLISHED"),
                    (self.course["weeks"][0], "week", True)]
        for subject, field, value in fixtures:
            with self.subTest(field=field, value=value):
                original = subject[field]
                subject[field] = value
                self.store_metadata()
                with self.assertRaises(ValueError):
                    navigation.active_metadata(self.root)
                subject[field] = original
                self.store_metadata()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    suite = unittest.TestSuite([unittest.defaultTestLoader.loadTestsFromTestCase(PublicationControls),
                               unittest.defaultTestLoader.loadTestsFromTestCase(PublishedNavigation)])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {"schema": "webtech-publication-controls-regression/v1",
              "status": "PASS_FINITE_PUBLICATION_REFUSALS" if result.wasSuccessful() else "FAIL",
              "tests": result.testsRun, "failures": len(result.failures),
              "errors": len(result.errors), "skipped": len(result.skipped),
              "observations": OBSERVATIONS, "actions_dispatched": 0,
              "limitations": "Receipt and static navigation consistency only; no live GitHub, application execution or acceptance qualification."}
    encoded = (json.dumps(report, indent=2) + "\n").encode()
    if args.report:
        publication.rc.atomic_write(publication.rc.output_path(args.report), encoded)
    print(encoded.decode(), end="")
    raise SystemExit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
