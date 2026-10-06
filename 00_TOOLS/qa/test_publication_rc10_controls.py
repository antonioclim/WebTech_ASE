#!/usr/bin/env python3
"""Finite RC10 publication refusal checks using suite-owned local fixtures.

These checks exercise the boundary between a published asset identity and a
qualification claim. They make no network calls and dispatch no Actions.
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
import publication_rc10_controls as publication

ROOT = Path(__file__).resolve().parents[2]
OBSERVATIONS = {"refused_mutations": []}


class PublicationRC10Controls(unittest.TestCase):
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

    def test_01_observed_publication_keeps_finite_suites_and_pending_gates(self):
        result = publication.validate_receipt(self.receipt, self.plan)
        self.assertEqual(result["qualification"], "NOT_FINAL")
        self.assertEqual(result["pending_qualification_gates"], list(publication.rc.GATES))
        self.assertEqual(result["recorded_workflow_tests"]["focused_rc10"]["passed"], 15)
        self.assertEqual(result["recorded_workflow_tests"]["day0_static"]["passed"], 2)
        self.assertIs(result["live_network_used"], False)
        self.assertEqual(result["actions_dispatched"], 0)

    def test_02_different_release_source_tag_date_and_asset_inventory_are_refused(self):
        for name, value in (("source_commit", "0" * 40), ("source_package_id", "0" * 64),
                            ("release_id", 404427362), ("version", "3.0.0-rc.9"),
                            ("tag", "classroom-en-gb-v3.0.0-rc.9"),
                            ("published_at", "2026-10-06T21:27:44Z"),
                            ("package_id", "0" * 64), ("draft", True),
                            ("prerelease", False), ("release_url", publication.RELEASE_URL + "?other=1")):
            with self.subTest(field=name):
                self.refuse((name,), value)
        for index in range(3):
            for key, value in (("sha256", "0" * 64), ("bytes", 1), ("id", 1),
                               ("state", "new"), ("download_url", "https://example.invalid/other.zip")):
                with self.subTest(index=index, field=key):
                    self.refuse(("assets", index, key), value)
        self.refuse(("assets",), self.receipt["assets"][:2])
        self.refuse(("assets",), self.receipt["assets"] + [copy.deepcopy(self.receipt["assets"][0])])
        duplicate = copy.deepcopy(self.receipt["assets"])
        duplicate[1] = duplicate[0]
        self.refuse(("assets",), duplicate)
        self.refuse(("assets", 0, "name"), "other.zip")

    def test_03_publication_must_not_upgrade_qualification_or_observation_method(self):
        self.refuse(("qualificationVerdict",), "FINAL")
        for gate in publication.rc.GATES:
            with self.subTest(gate=gate):
                self.refuse(("qualification_gates", gate), "PASS")
                self.refuse(("gates", gate, "status"), "PASS", fixture="plan")
        for name in ("public_remote_binary_downloaded", "public_remote_zip_crc_rechecked",
                     "local_firefox_semantic_tests_repeated_in_workflow", "pages_deployment_observed"):
            self.refuse(("verification", name), True)
        self.refuse(("verification", "asset_identity_method"), "PUBLIC_DOWNLOAD_BYTES_CHECKED")
        self.refuse(("verification", "file_count"), 1344)
        self.refuse(("verification", "hosted_resolver"), "PASS_FINAL")
        self.refuse(("qualification_gates",), {})

    def test_04_hosted_suite_omission_inflation_or_local_browser_reclassification_is_refused(self):
        for suite in publication.TEST_SUITES:
            for field, value in (("passed", 52), ("skipped", 1), ("failures", 1),
                                 ("errors", 1), ("seconds", 1.0)):
                with self.subTest(suite=suite, field=field):
                    self.refuse(("workflow", "tests", suite, field), value)
        self.refuse(("workflow", "tests"), {"focused_rc10": self.receipt["workflow"]["tests"]["focused_rc10"]})
        inflated = copy.deepcopy(self.receipt["workflow"]["tests"])
        inflated["firefox_semantic"] = {"passed": 52}
        self.refuse(("workflow", "tests"), inflated)
        self.refuse(("workflow", "conclusion"), "failure")
        self.refuse(("workflow", "source_commit"), "0" * 40)
        self.refuse(("workflow", "run_attempt"), 2)

    def test_05_json_type_confusion_unknown_missing_and_duplicate_controls_are_refused(self):
        for path, value in ((("draft",), 0), (("prerelease",), 1),
                            (("release_id",), float(publication.RELEASE_ID)),
                            (("assets", 0, "bytes"), float(self.receipt["assets"][0]["bytes"])),
                            (("workflow", "run_attempt"), True),
                            (("workflow", "tests", "focused_rc10", "passed"), 15.0),
                            (("workflow", "tests", "day0_static", "failures"), False),
                            (("verification", "public_remote_binary_downloaded"), 0),
                            (("notes", "lf_to_crlf_count"), 35.0)):
            self.refuse(path, value)
        for path in ((), ("workflow",), ("workflow", "tests", "focused_rc10"),
                     ("verification",), ("notes",), ("preserved_predecessor",),
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

    def test_06_altered_notes_predecessor_or_reproduction_source_are_refused(self):
        for path, value in ((("notes", "published_body_sha256"), "0" * 64),
                            (("notes", "lf_normalised_sha256"), "0" * 64),
                            (("notes", "lf_to_crlf_count"), 34),
                            (("notes", "preparation_wording_retained"), False),
                            (("preserved_predecessor", "tag_body_and_asset_identities_preserved"), False),
                            (("preserved_predecessor", "source_commit"), "0" * 40),
                            (("immutable_distribution", "source_commit"), "main"),
                            (("immutable_distribution", "reproduction_method"), "CURRENT_MAIN")):
            self.refuse(path, value)

    def test_07_frozen_plan_cannot_be_rewritten_as_the_publication_event(self):
        for name, value in (("status", "published"), ("draft", False), ("prerelease", 1),
                            ("tag", "classroom-en-gb-v3.0.0-rc.9"),
                            ("collection_root", "WEBTECH_ASE_EN_GB_CLASSROOM_RC9/")):
            self.refuse((name,), value, fixture="plan")
        self.refuse(("required_gates",), list(publication.rc.GATES)[:-1], fixture="plan")
        self.refuse(("gates", "native_windows", "scope"), " ", fixture="plan")

    def test_08_file_loading_uses_safe_local_paths_and_refuses_symlink_receipt(self):
        with tempfile.TemporaryDirectory(prefix="webtech-rc10-publication-") as temporary:
            root = Path(temporary)
            for name, value in ((publication.RECEIPT, self.receipt), (publication.PLAN, self.plan)):
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(json.dumps(value), encoding="utf-8")
            self.assertEqual(publication.run(root)["release_id"], publication.RELEASE_ID)
            receipt_path = root / publication.RECEIPT
            stored = root / "stored.json"
            receipt_path.rename(stored)
            receipt_path.symlink_to(stored)
            with self.assertRaises(ValueError):
                publication.run(root)
        self.assertFalse(root.exists())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(PublicationRC10Controls)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {"schema": "webtech-rc10-publication-refusals/v1",
              "status": "PASS_FINITE_PUBLICATION_REFUSALS" if result.wasSuccessful() else "FAIL",
              "tests": result.testsRun, "failures": len(result.failures),
              "errors": len(result.errors), "skipped": len(result.skipped),
              "observations": OBSERVATIONS, "actions_dispatched": 0,
              "limitations": "Recorded receipt and local fixture consistency only; no live GitHub, public asset download, application execution, Pages deployment or acceptance qualification."}
    encoded = (json.dumps(report, indent=2) + "\n").encode()
    if args.report:
        publication.rc.atomic_write(publication.rc.output_path(args.report), encoded)
    print(encoded.decode(), end="")
    raise SystemExit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
