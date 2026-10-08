"""Regression tests for evidence classification, not student qualification."""
import copy
import json
import os
from pathlib import Path
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

import runtime_checks as runtime


def row(stdout, code=0, stderr=""):
    return {"stdout": stdout, "stderr": stderr, "returncode": code,
            "timed_out": False, "spawn_error": None}


def kit_receipt(action="check"):
    receipt = {"status": "FAIL_CLASSROOM_CHECKS" if action == "check" else "PASS_ORIGINAL_STARTER_ASSERTIONS",
               "seminar": "S03", "action": action, "project": "P01", "referenceNode": True,
               "observedNode": runtime.REFERENCE, "fail": 1, "pass": 1,
               "cases": [{"case": "P01.expected", "project": "P01", "status": "ASSERTION_FAIL"},
                         {"case": "P01.identity", "project": "P01", "status": "PASS"}]}
    if action == "initial":
        receipt.update(actualInitialFailures=["P01.expected"], expectedInitialFailures=["P01.expected"])
    return receipt


def tap(names, failures=False):
    lines = ["TAP version 13"]
    for i, name in enumerate(names, 1):
        lines.append(("not ok" if failures else "ok") + f" {i} - {name}")
        if failures:
            lines += ["  ---", "  code: 'ERR_ASSERTION'", "  ..."]
    lines += [f"1..{len(names)}", f"# tests {len(names)}", f"# pass {0 if failures else len(names)}",
              f"# fail {len(names) if failures else 0}", "# cancelled 0", "# skipped 0", "# todo 0"]
    return "\n".join(lines) + "\n"


class KitClassification(unittest.TestCase):
    def classify(self, receipt=None, code=1, action="check", **changes):
        value = row(json.dumps(receipt if receipt is not None else kit_receipt(action)), code)
        value.update(changes)
        return runtime.kit_classification(value, {"seminar": "S03", "initialAssertionFailures": ["P01.expected"]},
                                          ["P01.expected", "P01.identity"], action, "P01")[0]

    def test_exact_expected_learner_assertions_are_scoped_success(self):
        self.assertTrue(self.classify())

    def test_exact_original_initial_assertions(self):
        self.assertTrue(self.classify(action="initial", code=0))

    def test_timeout_is_not_an_expected_learner_failure(self):
        self.assertFalse(self.classify(timed_out=True))

    def test_unparseable_worker_is_not_expected(self):
        self.assertFalse(self.classify(stdout="", stderr="UNPARSEABLE_WORKER_OUTPUT"))

    def test_execution_fault_rejects_identical_failure_count(self):
        receipt = kit_receipt()
        receipt["cases"][0]["status"] = "EXECUTION_FAULT"
        self.assertFalse(self.classify(receipt))

    def test_missing_pass_case_rejects_same_expected_assertions(self):
        receipt = kit_receipt()
        receipt["cases"].pop()
        receipt["pass"] = 0
        self.assertFalse(self.classify(receipt))

    def test_duplicate_case_is_not_coverage(self):
        receipt = kit_receipt()
        receipt["cases"].append(copy.deepcopy(receipt["cases"][1]))
        receipt["pass"] = 2
        self.assertFalse(self.classify(receipt))

    def test_compatibility_receipt_does_not_count_as_reference(self):
        receipt = kit_receipt()
        receipt["referenceNode"] = False
        receipt["observedNode"] = "v24.19.0"
        self.assertFalse(self.classify(receipt))

    def test_exit_zero_does_not_hide_unfinished_objectives(self):
        self.assertFalse(self.classify(code=0))

    def test_additional_assertion_failure_is_unexpected(self):
        receipt = kit_receipt()
        receipt["cases"][1]["status"] = "ASSERTION_FAIL"
        receipt.update(pass_=0, fail=2)
        self.assertFalse(self.classify(receipt))


class LaterClassification(unittest.TestCase):
    def setUp(self):
        self.stdout = tap(["baseline one", "baseline two"]) + tap(
            ["P01: classroom contract and input immutability", "P03: classroom contract and input immutability"], True)
        self.stderr = "REFUSE_CLASSROOM_CONTRACT: unexpected result, crash, timeout or error signature\n"

    def check(self, stdout=None, code=1, stderr=None, action="work", **changes):
        value = row(self.stdout if stdout is None else stdout, code, self.stderr if stderr is None else stderr)
        value.update(changes)
        return runtime.later_classification(value, ["P01", "P03"], action)[0]

    def test_exact_objective_assertions_and_outer_work_refusal(self):
        self.assertTrue(self.check())

    def test_exact_outer_initial_pass(self):
        receipt = {"status": "PASS_UNTOUCHED_CLASSROOM_STARTER", "native_browser_qualified": False,
                   "full_original_project_qualified": False}
        self.assertTrue(self.check(stdout=self.stdout + json.dumps(receipt) + "\n", code=0, stderr="", action="initial"))

    def test_worker_exception_is_not_assertion(self):
        self.assertFalse(self.check(stdout=self.stdout.replace("ERR_ASSERTION", "ERR_TEST_FAILURE", 1)))

    def test_missing_baseline_is_not_coverage(self):
        self.assertFalse(self.check(stdout=self.stdout.split("TAP version 13\n", 2)[-1]))

    def test_skipped_test_rejects_same_counts(self):
        self.assertFalse(self.check(stdout=self.stdout.replace("# skipped 0", "# skipped 1", 1)))

    def test_wrong_objective_names_reject_same_counts(self):
        self.assertFalse(self.check(stdout=self.stdout.replace("P03:", "P02:")))

    def test_outer_timeout_remains_failure(self):
        self.assertFalse(self.check(timed_out=True))

    def test_generic_refusal_without_tap_is_infrastructure_failure(self):
        self.assertFalse(self.check(stdout=""))

    def test_three_suites_is_not_exact_two_suite_contract(self):
        self.assertFalse(self.check(stdout=self.stdout + tap(["extra"])))


class EnvironmentAndOwnership(unittest.TestCase):
    def test_successful_diagnostic_repeats_do_not_replace_first_failure(self):
        with tempfile.TemporaryDirectory(prefix="runtime-harness-fixture-") as tmp:
            root = Path(tmp)
            input_root = root / "input"
            input_root.mkdir()
            classroom = root / "fixture" / "CLASSROOM_RC6"
            classroom.mkdir(parents=True)
            audit = runtime.Audit(input_root, root / "evidence")
            audit.node = "unused-mocked-command"
            audit.units["S03"] = classroom
            first = row("", 2, "UNPARSEABLE_WORKER_OUTPUT")
            first["id"] = 1
            second = row(json.dumps(kit_receipt()), 1)
            second["id"] = 2
            third = copy.deepcopy(second)
            third["id"] = 3
            with patch.object(audit, "command", side_effect=[first, second, third]):
                audit.kit_check("S03", "check", "P01", {"seminar": "S03", "initialAssertionFailures": ["P01.expected"]},
                                ["P01.expected", "P01.identity"])
            self.assertEqual(audit.cases[0]["status"], "FAIL")
            self.assertEqual(len(audit.repeats), 2)
            self.assertTrue(all(x["matches_expected_state"] and not x["replaces_first_attempt_status"] for x in audit.repeats))
            self.assertEqual(audit.finish(), 1)
            report = json.loads((audit.out / "runtime_report.json").read_text())
            self.assertEqual(report["status"], "FAIL_FINITE_REFERENCE_RUNTIME_CHECKS")
            self.assertEqual(report["tests_failed"], 1)

    def test_every_bypass_environment_name_is_cleared(self):
        with patch.dict(os.environ, {key: "untrusted" for key in runtime.CLEARED_ENV}):
            env = runtime.clean_env()
        self.assertTrue(all(key not in env for key in runtime.CLEARED_ENV))

    @unittest.skipUnless(os.name == "posix", "The evidence workflow uses a POSIX runner")
    def test_partial_line_cannot_block_ready_deadline(self):
        with tempfile.TemporaryDirectory(prefix="runtime-harness-fixture-") as tmp:
            root = Path(tmp)
            input_root = root / "input"
            input_root.mkdir()
            classroom = root / "fixture" / "CLASSROOM_RC6"
            classroom.mkdir(parents=True)
            # This is an isolated Python process fixture, not student material
            # or a replacement/spoof of the reference Node executable.
            (classroom / "kit.mjs").write_text(
                "import sys,time\nsys.stdout.write('READY http://127.0.0.1:12345')\nsys.stdout.flush()\ntime.sleep(20)\n")
            audit = runtime.Audit(input_root, root / "evidence")
            audit.node = sys.executable
            audit.units["S01"] = classroom
            start = time.monotonic()
            with self.assertRaisesRegex(RuntimeError, "READY_TIMEOUT"):
                runtime.Server(audit, "S01")
            self.assertGreaterEqual(time.monotonic() - start, 4.9)
            self.assertLess(time.monotonic() - start, 7)
            self.assertIsNotNone(audit.servers[0].proc.poll())
            self.assertIn("READY http://127.0.0.1:12345", audit.lifecycle[0]["stdout"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
