#!/usr/bin/env python3
"""Finite execution of untouched LOCAL3 starters on the actual reference Node.

This reports infrastructure and expected starter assertions separately. It does
not supply learner answers, qualify completed projects or bypass source guards.
The caller must first authenticate the complete published archive and extraction.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import http.client
import json
import os
from pathlib import Path
import re
import selectors
import shutil
import signal
import socket
import subprocess
import time
from typing import Any

REFERENCE = "v24.21.0"
CLEARED_ENV = ("NODE_OPTIONS", "NODE_PATH", "WEBTECH_RC6_ALLOW_COMPATIBILITY")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inventory(root: Path) -> dict[str, str]:
    result = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError("SOURCE_SYMLINK: " + str(path))
        if path.is_file():
            result[path.relative_to(root).as_posix()] = sha(path)
        elif not path.is_dir():
            raise ValueError("NON_REGULAR_SOURCE: " + str(path))
    return result


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def clean_env() -> dict[str, str]:
    env = dict(os.environ)
    for key in CLEARED_ENV:
        env.pop(key, None)
    return env


def parsed(row: dict) -> Any:
    try:
        return json.loads(row["stdout"])
    except (ValueError, TypeError):
        return None


def ordinary(row: dict) -> bool:
    return not row.get("timed_out") and not row.get("spawn_error") and row.get("returncode", -1) >= 0


def kit_classification(row: dict, cfg: dict, expected_cases: list[str], action: str,
                       project: str = "all") -> tuple[bool, dict]:
    """Do not accept missing cases, execution faults or a generic nonzero exit."""
    receipt = parsed(row)
    failure_ids = sorted(x for x in cfg["initialAssertionFailures"]
                         if project == "all" or x.startswith(project + "."))
    case_ids = sorted(x for x in expected_cases if project == "all" or x.startswith(project + "."))
    detail = {"expected_case_ids": case_ids, "expected_assertion_failures": failure_ids,
              "classification": "UNEXPECTED_INFRASTRUCTURE_OR_STARTER_STATE", "learner_completion": False}
    if not ordinary(row) or not isinstance(receipt, dict):
        return False, detail
    cases = receipt.get("cases")
    if not isinstance(cases, list) or any(not isinstance(x, dict) for x in cases):
        return False, detail
    actual_ids = [x.get("case") for x in cases]
    actual_fails = sorted(x.get("case", "") for x in cases if x.get("status") == "ASSERTION_FAIL")
    if any(not isinstance(x, str) for x in actual_ids):
        return False, detail
    status = "PASS_ORIGINAL_STARTER_ASSERTIONS" if action == "initial" else (
        "FAIL_CLASSROOM_CHECKS" if failure_ids else "PASS_BOUNDED_CLASSROOM_CHECKS")
    code = 0 if action == "initial" or not failure_ids else 1
    good = (receipt.get("referenceNode") is True and receipt.get("observedNode") == REFERENCE
            and receipt.get("seminar") == cfg["seminar"] and receipt.get("action") == action
            and receipt.get("project") == project and receipt.get("status") == status
            and row["returncode"] == code and sorted(actual_ids) == case_ids
            and len(actual_ids) == len(set(actual_ids)) and actual_fails == failure_ids
            and all(x.get("status") in ("PASS", "ASSERTION_FAIL") for x in cases)
            and receipt.get("fail") == len(failure_ids)
            and receipt.get("pass") == len(case_ids) - len(failure_ids))
    if action == "initial":
        good = good and sorted(receipt.get("actualInitialFailures", [])) == failure_ids
        good = good and sorted(receipt.get("expectedInitialFailures", [])) == failure_ids
    detail.update(actual_status=receipt.get("status"), actual_assertion_failures=actual_fails,
                  classification="EXPECTED_UNTOUCHED_STARTER_ASSERTIONS" if good else detail["classification"])
    return bool(good), detail


def tap_suites(stdout: str) -> list[dict]:
    """Each worker prints its own TAP summary; never merge or omit a suite."""
    suites = []
    for block in stdout.split("TAP version 13\n")[1:]:
        counts = {}
        for key in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
            matches = re.findall(r"(?m)^# " + key + r" (\d+)\s*$", block)
            counts[key] = int(matches[0]) if len(matches) == 1 else None
        counts["assertion_errors"] = len(re.findall(r"code: 'ERR_ASSERTION'", block))
        counts["failed_names"] = re.findall(r"(?m)^not ok \d+ - ([^\n]+)$", block)
        suites.append(counts)
    return suites


def later_classification(row: dict, case_projects: list[str], action: str) -> tuple[bool, dict]:
    expected_names = sorted(p + ": classroom contract and input immutability" for p in case_projects)
    suites = tap_suites(row.get("stdout", ""))
    baseline = {"tests": 2, "pass": 2, "fail": 0, "cancelled": 0, "skipped": 0, "todo": 0,
                "assertion_errors": 0, "failed_names": []}
    objective = {"tests": len(case_projects), "pass": 0, "fail": len(case_projects),
                 "cancelled": 0, "skipped": 0, "todo": 0, "assertion_errors": len(case_projects),
                 "failed_names": expected_names}
    if len(suites) == 2:
        suites[1]["failed_names"].sort()
    good = ordinary(row) and suites == [baseline, objective]
    if action == "initial":
        good = good and row["returncode"] == 0
        try:
            receipt = json.loads(row["stdout"].splitlines()[-1])
        except (ValueError, IndexError):
            receipt = {}
        good = good and receipt.get("status") == "PASS_UNTOUCHED_CLASSROOM_STARTER"
        good = good and receipt.get("native_browser_qualified") is False
        good = good and receipt.get("full_original_project_qualified") is False
    else:
        # The outer published work command refuses untouched learner targets.
        # Its refusal is expected only when both exact TAP suites prove that
        # every failed objective is an assertion, with no missing/cancelled case.
        good = good and row["returncode"] == 1
        good = good and "REFUSE_CLASSROOM_CONTRACT: unexpected result, crash, timeout or error signature" in row["stderr"]
    return bool(good), {"classification": "EXPECTED_UNTOUCHED_STARTER_ASSERTIONS" if good else
                       "UNEXPECTED_INFRASTRUCTURE_OR_STARTER_STATE", "suites": suites,
                       "expected_objective_failures": expected_names, "learner_completion": False}


class Audit:
    def __init__(self, input_root: Path, output: Path):
        self.input = input_root
        self.out = output
        self.copy = output / "working_copy" / "WEBTECH_LOCAL3"
        self.env = clean_env()
        self.node = shutil.which("node", path=self.env.get("PATH"))
        self.actual = None
        self.cases: list[dict] = []
        self.commands: list[dict] = []
        self.http: list[dict] = []
        self.lifecycle: list[dict] = []
        self.repeats: list[dict] = []
        self.servers: list[Server] = []
        self.units = {}
        self.before_input = {}
        self.before_copy = {}
        self.targets = {}
        self.out.mkdir(parents=True, exist_ok=False)

    def check(self, name: str, good: bool, detail: Any = None):
        self.cases.append({"name": name, "status": "PASS" if good else "FAIL", "detail": detail})

    def command(self, label: str, args: list[str], cwd: Path, timeout: int = 25) -> dict:
        cmdid = len(self.commands) + 1
        logbase = self.out / "commands" / f"{cmdid:03}_{label}"
        logbase.parent.mkdir(exist_ok=True)
        start = time.monotonic()
        row = {"id": cmdid, "label": label, "argv": args, "cwd": str(cwd), "timeout_seconds": timeout,
               "cleared_environment_names": list(CLEARED_ENV), "timed_out": False,
               "forced_owned_cleanup": False, "spawn_error": None, "stdout": "", "stderr": "",
               "returncode": None}
        try:
            proc = subprocess.Popen(args, cwd=cwd, env=self.env, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE, start_new_session=True)
            row["pid"] = proc.pid
            try:
                out, err = proc.communicate(timeout=timeout)
            except subprocess.TimeoutExpired:
                row.update(timed_out=True, forced_owned_cleanup=True)
                try:
                    os.killpg(proc.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                out, err = proc.communicate(timeout=3)
            row.update(stdout=out.decode(errors="replace"), stderr=err.decode(errors="replace"),
                       returncode=proc.returncode)
        except OSError as exc:
            row["spawn_error"] = type(exc).__name__ + ": " + str(exc)
        row["elapsed_seconds"] = time.monotonic() - start
        row["stdout_log"] = str(logbase.with_suffix(".stdout.log").relative_to(self.out))
        row["stderr_log"] = str(logbase.with_suffix(".stderr.log").relative_to(self.out))
        logbase.with_suffix(".stdout.log").write_text(row["stdout"], encoding="utf-8")
        logbase.with_suffix(".stderr.log").write_text(row["stderr"], encoding="utf-8")
        write_json(logbase.with_suffix(".json"), row)
        self.commands.append(row)
        return row

    def kit_check(self, unit: str, action: str, project: str, cfg: dict, ids: list[str]):
        cwd = self.units[unit]
        args = [self.node, "CLASSROOM_RC6/kit.mjs", action]
        if action != "initial":
            args.append(project)
        row = self.command(f"{unit}_{action}_{project}_FIRST", args, cwd.parent)
        good, detail = kit_classification(row, cfg, ids, action, project)
        self.check(f"{unit}_{action}_{project}_first_attempt", good, {"command_id": row["id"], **detail})
        if unit == "S03" and not good and action == "check" and project != "all":
            for repeat in range(1, 3):
                again = self.command(f"{unit}_{action}_{project}_DIAGNOSTIC_REPEAT_{repeat}", args, cwd.parent)
                repeat_good, repeat_detail = kit_classification(again, cfg, ids, action, project)
                self.repeats.append({"first_command_id": row["id"], "repeat": repeat,
                                     "command_id": again["id"], "matches_expected_state": repeat_good,
                                     "detail": repeat_detail, "replaces_first_attempt_status": False})

    def run(self):
        if self.node is None:
            self.check("actual_reference_runtime", False, "node is absent from PATH")
            return
        row = self.command("actual_node_version", [self.node, "--version"], self.out)
        self.actual = row["stdout"].strip()
        self.check("actual_reference_runtime", ordinary(row) and row["returncode"] == 0 and self.actual == REFERENCE,
                   {"expected": REFERENCE, "observed": self.actual, "node_path": self.node,
                    "process_version_overridden": False, "command_id": row["id"]})
        if self.actual != REFERENCE or not ordinary(row) or row["returncode"] != 0:
            return
        self.before_input = inventory(self.input)
        write_json(self.out / "inventory.input.before.json", self.before_input)
        shutil.copytree(self.input, self.copy, symlinks=False)
        self.before_copy = inventory(self.copy)
        write_json(self.out / "inventory.copy.before.json", self.before_copy)
        self.check("full_working_copy_matches_input", self.before_input == self.before_copy,
                   {"file_count": len(self.before_copy)})
        for i in range(1, 15):
            unit = f"S{i:02}"
            dirs = list((self.copy / "PACKAGES" / unit).glob("*/CLASSROOM_RC6"))
            if len(dirs) != 1:
                raise ValueError("AMBIGUOUS_CLASSROOM_ROOT: " + unit)
            self.units[unit] = cwd = dirs[0]
            boundary = json.loads((cwd / "CLASSROOM_BOUNDARY.json").read_text(encoding="utf-8"))
            for path, expected_hash in boundary["mutable"].items():
                self.targets[(cwd / path).relative_to(self.copy).as_posix()] = sha(cwd / path)
                self.check(unit + "_initial_target_" + path.replace("/", "_"), sha(cwd / path) == expected_hash)
        self.check("all_38_distinct_learner_targets", len(self.targets) == 38, {"count": len(self.targets)})
        write_json(self.out / "learner_targets.before.json", self.targets)
        projects = 0
        for unit, cwd in self.units.items():
            scope = json.loads((cwd / "CLASSROOM_SCOPE.json").read_text(encoding="utf-8"))
            projects += len(scope["projects"])
            row = self.command(unit + "_verify_initial", [self.node, "CLASSROOM_RC6/verify.mjs", "initial"], cwd.parent)
            receipt = parsed(row)
            good = ordinary(row) and row["returncode"] == 0 and isinstance(receipt, dict)
            good = good and receipt.get("status") == "PASS_INITIAL_CLASSROOM_SOURCE" and receipt.get("referenceNode") == REFERENCE
            self.check(unit + "_native_reference_boundary_initial", good, {"command_id": row["id"]})
            if (cwd / "kit.mjs").exists():
                cfg = json.loads((cwd / "contract.json").read_text(encoding="utf-8"))
                ids = re.findall(r"\{id:'(P\d\d[^']+)',project:'P\d\d'", (cwd / "experiments.mjs").read_text(encoding="utf-8"))
                if not ids or len(ids) != len(set(ids)):
                    raise ValueError("CASE_METADATA_CLOSURE: " + unit)
                self.kit_check(unit, "initial", "all", cfg, ids)
                self.kit_check(unit, "check", "all", cfg, ids)
                for project in [p["id"] for p in cfg["projects"]]:
                    self.kit_check(unit, "check", project, cfg, ids)
                    args = [self.node, "CLASSROOM_RC6/kit.mjs", "observe", project]
                    row = self.command(unit + "_observe_" + project + "_FIRST", args, cwd.parent)
                    receipt = parsed(row)
                    good = (ordinary(row) and row["returncode"] == 0 and isinstance(receipt, dict)
                            and receipt.get("status") == "PERSONAL_EXECUTION_OBSERVATION"
                            and receipt.get("referenceNode") is True and receipt.get("observedNode") == REFERENCE)
                    self.check(unit + "_observation_" + project + "_first_attempt", good,
                               {"command_id": row["id"], "learner_completion": False})
                    if unit == "S03" and not good:
                        for repeat in range(1, 3):
                            again = self.command(unit + "_observe_" + project + f"_DIAGNOSTIC_REPEAT_{repeat}", args, cwd.parent)
                            self.repeats.append({"first_command_id": row["id"], "command_id": again["id"], "repeat": repeat,
                                                 "replaces_first_attempt_status": False})
                if not (cwd / "server.mjs").exists():
                    row = self.command(unit + "_unsupported_serve", [self.node, "CLASSROOM_RC6/kit.mjs", "serve"], cwd.parent)
                    self.check(unit + "_module_serve_explicit_refusal", ordinary(row) and row["returncode"] == 2
                               and "STOP_UNSUPPORTED_CLASSROOM_COMMAND" in row["stderr"], {"command_id": row["id"]})
            else:
                fixture = json.loads((cwd / "support/cases.json").read_text(encoding="utf-8"))
                case_projects = [x["project_id"] for x in fixture]
                for action in ("initial", "work"):
                    row = self.command(unit + "_outer_check_" + action, [self.node, "CLASSROOM_RC6/check.mjs", action], cwd.parent)
                    good, detail = later_classification(row, case_projects, action)
                    self.check(unit + "_outer_" + action + "_expected_untouched_state", good, {"command_id": row["id"], **detail})
        self.check("all_40_declared_individual_projects_remain_required", projects == 40,
                   {"count": projects, "completed_by_audit": False})
        self.http_checks()

    def http_checks(self):
        normal = {"S01": ("/assets/detective.css", 200), "S02": ("/targets/styles.css", 200),
                  "S04": ("/browser.mjs", 200), "S05": ("/created", 200),
                  "S07": ("/api/sessions/2/registrations/3", 405)}
        for unit, (route, status) in normal.items():
            server = None
            try:
                server = Server(self, unit)
                self.check(unit + "_server_ready", True, {"pid": server.proc.pid, "port": server.port})
                row = server.request("actual_starter_route", route)
                self.check(unit + "_starter_HTTP", row["status"] == status and row["error"] is None and row["listener_alive"], row)
                query = server.request("query_same_route", route + "?audit=synthetic")
                self.check(unit + "_query_same_route", query["status"] == row["status"] and query["body_sha256"] == row["body_sha256"], query)
                if unit in ("S01", "S02", "S04", "S07"):
                    missing = server.request("unknown_route", "/not-a-classroom-route")
                    self.check(unit + "_unknown_404", missing["status"] == 404 and missing["listener_alive"], missing)
                if unit == "S01":
                    bad = server.request("invalid_JSON", "/api/verdicts", "POST", "{")
                    self.check(unit + "_invalid_JSON_400", bad["status"] == 400 and bad["body_text"] == '{"error":"invalid_json"}', bad)
                    large = server.request("oversize_JSON", "/api/verdicts", "POST", "x" * 4097)
                    self.check(unit + "_oversize_JSON_413", large["status"] == 413 and large["listener_alive"], large)
                if unit == "S04":
                    bad_method = server.request("unsupported_method", "/", "POST", "{}")
                    self.check(unit + "_method_405", bad_method["status"] == 405 and bad_method["listener_alive"], bad_method)
                if unit in ("S02", "S04"):
                    path = server.cwd / ("targets/styles.css" if unit == "S02" else "browser.mjs")
                    held = path.with_name(path.name + ".held_audit_only")
                    path.rename(held)
                    try:
                        absent = server.request("temporary_missing_static_file_in_working_copy", route)
                    finally:
                        held.rename(path)
                    restored = server.request("same_listener_after_restore", route)
                    self.check(unit + "_static_failure_500_and_recovery", absent["status"] == 500 and absent["error"] is None
                               and absent["listener_alive"] and restored["status"] == 200
                               and restored["body_sha256"] == row["body_sha256"], {"absent": absent, "restored": restored,
                                                                                  "input_collection_changed": False})
                with socket.create_connection(("127.0.0.1", server.port), timeout=2) as client:
                    client.sendall(b"GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Held: partial")
                    time.sleep(.04)
                    started = time.monotonic()
                    server.proc.send_signal(signal.SIGTERM)
                    time.sleep(.04)
                    if server.proc.poll() is None:
                        server.proc.send_signal(signal.SIGINT)
                    life = server.stop(already_signalled=True)
                    elapsed = time.monotonic() - started
                self.check(unit + "_held_socket_repeated_signals_bounded_stop", life["returncode"] == 0
                           and not life["forced_owned_cleanup"] and life["stdout"].count("STOPPED_OWNED_LISTENER") == 1
                           and .80 <= elapsed < 3, {"lifecycle_id": life["id"], "elapsed_seconds": elapsed})
                self.check(unit + "_owned_port_closed", port_closed(server.port), {"port": server.port})
            except Exception as exc:
                self.check(unit + "_server_lifecycle", False, type(exc).__name__ + ": " + str(exc))
            finally:
                if server is not None:
                    server.stop()
        self.parallel_checks()
        self.receive_deadline()

    def parallel_checks(self):
        peers = []
        with socket.socket() as sentinel:
            sentinel.bind(("127.0.0.1", 0))
            sentinel.listen(1)
            sentinel_port = sentinel.getsockname()[1]
            try:
                for unit in ("S01", "S01", "S04"):
                    peers.append(Server(self, unit))
                self.check("parallel_owned_distinct_ephemeral_ports", len(set([x.port for x in peers] + [sentinel_port])) == 4)
                peers[0].stop()
                survivor = peers[1].request("other_instance_survives", "/assets/detective.css")
                other = peers[2].request("other_unit_survives", "/browser.mjs")
                self.check("one_owned_stop_preserves_peer_servers", survivor["status"] == other["status"] == 200
                           and survivor["listener_alive"] and other["listener_alive"])
                self.check("unrelated_owned_sentinel_socket_preserved", sentinel.fileno() >= 0
                           and sentinel.getsockname()[1] == sentinel_port)
            except Exception as exc:
                self.check("parallel_server_lifecycle", False, type(exc).__name__ + ": " + str(exc))
            finally:
                for server in peers:
                    server.stop()

    def receive_deadline(self):
        server = None
        clients = []
        try:
            server = Server(self, "S01")
            clients = [socket.create_connection(("127.0.0.1", server.port), timeout=2) for _ in range(2)]
            clients[0].sendall(b"POST /api/verdicts HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 100\r\n\r\n{")
            clients[1].sendall(b"GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Held: partial")
            started = time.monotonic()
            results = []
            for name, client in zip(("incomplete_body", "incomplete_header"), clients):
                client.settimeout(max(.1, 13 - (time.monotonic() - started)))
                response = client.recv(4096)
                results.append({"case": name, "raw_response": response.decode(errors="replace"),
                                "elapsed_seconds": time.monotonic() - started})
            write_json(self.out / "parser_receive_deadline.json", results)
            self.check("parser_body_and_header_receive_deadlines", all(x["raw_response"].startswith("HTTP/1.1 408")
                       and 9 <= x["elapsed_seconds"] < 13 for x in results), results)
            row = server.request("listener_after_receive_timeout", "/assets/detective.css")
            self.check("parser_timeout_preserves_listener", row["status"] == 200 and row["listener_alive"], row)
        except Exception as exc:
            self.check("parser_receive_deadline_execution", False, type(exc).__name__ + ": " + str(exc))
        finally:
            for client in clients:
                client.close()
            if server is not None:
                life = server.stop()
                self.check("parser_deadline_owned_cleanup", life["returncode"] == 0 and not life["forced_owned_cleanup"])

    def finish(self, exception: BaseException | None = None) -> int:
        for server in self.servers:
            server.stop()
        if self.lifecycle:
            self.check("all_started_owned_listeners_stopped_without_force", all(
                row["returncode"] == 0 and not row["forced_owned_cleanup"] and row.get("cleanup_error") is None
                and (row["port"] is None or port_closed(row["port"])) for row in self.lifecycle),
                {"listener_count": len(self.lifecycle)})
        if exception is not None:
            self.check("harness_exception", False, type(exception).__name__ + ": " + str(exception))
        if self.before_input:
            try:
                after = inventory(self.input)
                write_json(self.out / "inventory.input.after.json", after)
                self.check("original_input_collection_unchanged", after == self.before_input, {"files": len(after)})
            except Exception as exc:
                self.check("original_input_inventory_after", False, str(exc))
        if self.before_copy:
            try:
                after = inventory(self.copy)
                write_json(self.out / "inventory.copy.after.json", after)
                self.check("full_working_copy_restored_byte_for_byte", after == self.before_copy, {"files": len(after)})
                after_targets = {name: sha(self.copy / name) for name in self.targets}
                write_json(self.out / "learner_targets.after.json", after_targets)
                self.check("all_38_learner_targets_unchanged", after_targets == self.targets and len(after_targets) == 38)
            except Exception as exc:
                self.check("working_copy_inventory_after", False, str(exc))
        failures = sum(x["status"] == "FAIL" for x in self.cases)
        report = {"schema": "webtech-local3-reference-runtime-evidence/v1", "recorded_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
                  "status": "PASS_FINITE_REFERENCE_RUNTIME_CHECKS" if failures == 0 else "FAIL_FINITE_REFERENCE_RUNTIME_CHECKS",
                  "scope": "Actual reference Node on the CI operating system: untouched starter assertions, source guards, loopback HTTP and owned process lifecycle.",
                  "general_qualification": "NOT_FINAL", "all_ten_general_gates": "pending",
                  "qualificationVerdict": "NOT_FINAL", "qualificationGatesUpdated": False,
                  "runtime": {"expected": REFERENCE, "actual": self.actual, "node_binary": self.node,
                              "cleared_environment_names": list(CLEARED_ENV), "compatibility_enabled": False,
                              "process_version_overridden": False, "reference_guards_modified": False},
                  "input_root": str(self.input), "working_copy": str(self.copy),
                  "tests_passed": len(self.cases) - failures, "tests_failed": failures,
                  "commands": self.commands, "cases": self.cases, "HTTP_requests": self.http,
                  "server_lifecycle": self.lifecycle, "diagnostic_repeats": self.repeats,
                  "retry_policy": "S03 per-project failures permit two recorded diagnostic repeats. The first failure stays failed.",
                  "limitations": ["No completed learner implementation was tested or generated.",
                                  "Finite expected assertion checks are not proof of every input or retained original full project.",
                                  "No React dependency installation or native Windows/macOS acceptance in this harness.",
                                  "Browser and PDF evidence are separate; no human assessment or teaching pilot is inferred."]}
        write_json(self.out / "runtime_report.json", report)
        print(json.dumps({"status": report["status"], "passed": report["tests_passed"], "failed": failures,
                          "report": str(self.out / "runtime_report.json")}))
        return 1 if failures else 0


def port_closed(port: int) -> bool:
    with socket.socket() as probe:
        probe.settimeout(.3)
        return probe.connect_ex(("127.0.0.1", port)) != 0


class Server:
    def __init__(self, audit: Audit, unit: str):
        self.audit, self.unit, self.cwd = audit, unit, audit.units[unit]
        self.started = time.monotonic()
        self.port = None
        self.life = None
        self.initial = b""
        self.initial_stderr = b""
        self.argv = [audit.node, "CLASSROOM_RC6/kit.mjs", "serve"]
        self.proc = subprocess.Popen(self.argv, cwd=self.cwd.parent, env=audit.env, stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE, start_new_session=True)
        audit.servers.append(self)
        selector = selectors.DefaultSelector()
        selector.register(self.proc.stdout, selectors.EVENT_READ)
        selector.register(self.proc.stderr, selectors.EVENT_READ)
        try:
            while time.monotonic() - self.started < 5:
                if self.proc.poll() is not None:
                    raise RuntimeError("EXIT_BEFORE_READY")
                for key, _ in selector.select(.05):
                    chunk = os.read(key.fileobj.fileno(), 8192)
                    if not chunk:
                        selector.unregister(key.fileobj)
                        continue
                    if key.fileobj is self.proc.stderr:
                        self.initial_stderr += chunk
                        continue
                    self.initial += chunk
                    match = re.search(rb"READY http://127\.0\.0\.1:(\d+)\r?\n", self.initial)
                    if match:
                        self.port = int(match.group(1))
                        return
            raise RuntimeError("READY_TIMEOUT")
        except Exception:
            self.stop()
            raise
        finally:
            selector.close()

    def request(self, case: str, target: str, method: str = "GET", body: str | None = None) -> dict:
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=3)
        row = {"unit": self.unit, "pid": self.proc.pid, "port": self.port, "case": case, "target": target,
               "method": method, "status": None, "body_sha256": None, "error": None}
        try:
            conn.request(method, target, body=body, headers={"Connection": "close"})
            response = conn.getresponse()
            raw = response.read()
            row.update(status=response.status, headers={k.lower(): v for k, v in response.getheaders()},
                       body_bytes=len(raw), body_sha256=hashlib.sha256(raw).hexdigest(),
                       body_text=raw.decode(errors="replace")[:2200])
        except Exception as exc:
            row["error"] = type(exc).__name__ + ": " + str(exc)
        finally:
            conn.close()
        row["listener_alive"] = self.proc.poll() is None
        self.audit.http.append(row)
        return row

    def stop(self, already_signalled: bool = False) -> dict:
        if self.life is not None:
            return self.life
        if self.proc.poll() is None and not already_signalled:
            try:
                self.proc.send_signal(signal.SIGTERM)
            except ProcessLookupError:
                pass
        forced = False
        cleanup_error = None
        try:
            out, err = self.proc.communicate(timeout=4)
        except subprocess.TimeoutExpired:
            forced = True
            try:
                os.killpg(self.proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            try:
                out, err = self.proc.communicate(timeout=3)
            except (subprocess.TimeoutExpired, OSError) as exc:
                cleanup_error = type(exc).__name__ + ": " + str(exc)
                out, err = b"", b""
        except OSError as exc:
            cleanup_error = type(exc).__name__ + ": " + str(exc)
            out, err = b"", b""
        self.life = {"id": len(self.audit.lifecycle) + 1, "unit": self.unit, "pid": self.proc.pid,
                     "argv": self.argv, "cwd": str(self.cwd.parent), "port": self.port,
                     "elapsed_seconds": time.monotonic() - self.started, "returncode": self.proc.returncode,
                     "forced_owned_cleanup": forced, "compatibility_enabled": False, "cleanup_error": cleanup_error,
                     "stdout": (self.initial + out).decode(errors="replace"),
                     "stderr": (self.initial_stderr + err).decode(errors="replace")}
        self.audit.lifecycle.append(self.life)
        write_json(self.audit.out / "servers" / f"{self.life['id']:02}_{self.unit}_lifecycle.json", self.life)
        return self.life


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-root", required=True, type=Path, help="Authenticated extracted WEBTECH_LOCAL3 root")
    parser.add_argument("--output", required=True, type=Path, help="New report directory outside the input and checkout")
    args = parser.parse_args(argv)
    input_root, output = args.input_root.resolve(), args.output.resolve()
    checkout = Path(__file__).resolve().parents[3]
    if not args.input_root.is_absolute() or not args.output.is_absolute():
        parser.error("--input-root and --output must be absolute paths")
    if not input_root.is_dir() or not (input_root / "PACKAGES").is_dir():
        parser.error("--input-root must contain the authenticated extracted PACKAGES directory")
    if output == input_root or input_root in output.parents or output in input_root.parents:
        parser.error("Report directory and original input must not overlap")
    if output == checkout or checkout in output.parents:
        parser.error("Report and working copy must be outside the repository checkout")
    if output.exists():
        parser.error("--output must be a new directory; prior evidence is never overwritten")
    audit = Audit(input_root, output)
    failure = None
    previous_sigterm = signal.getsignal(signal.SIGTERM)
    def terminate(signum, frame):
        raise RuntimeError("HARNESS_TERMINATION_SIGNAL: " + str(signum))
    signal.signal(signal.SIGTERM, terminate)
    try:
        audit.run()
    except BaseException as exc:
        failure = exc
    finally:
        signal.signal(signal.SIGTERM, previous_sigterm)
        return audit.finish(failure)


if __name__ == "__main__":
    raise SystemExit(main())
