#!/usr/bin/env python3
"""Validate the recorded RC9 publication identity without making network calls.

This is a consistency check of a human-reviewed publication receipt. It neither
authenticates GitHub nor re-downloads assets, reruns hosted jobs or promotes any
pending acceptance gate. Reproduce the archive from the published source commit.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "00_TOOLS/publishing"))
import release_contract as rc

RECEIPT = "90_RELEASES/CLASSROOM_RC9_PUBLICATION.json"
PLAN = "90_RELEASES/CLASSROOM_RC9_RELEASE_PLAN.json"
VERSION = "3.0.0-rc.9"
STATUS = "PUBLISHED_PRERELEASE"
TAG = "classroom-en-gb-v3.0.0-rc.9"
SOURCE_COMMIT = "60d8f8b86eec812a79db92860dd6d13f16d91f5f"
PACKAGE_ID = "c8be1c0dfaa3dfb56ca8c7868d961654859f1e87ebb35b8511e0ea4773e77dd7"
REPOSITORY_URL = "https://github.com/antonioclim/WebTech_ASE"
RELEASE_URL = REPOSITORY_URL + "/releases/tag/" + TAG
DOWNLOAD_BASE = REPOSITORY_URL + "/releases/download/" + TAG + "/"
PUBLISHED_AT = "2026-10-06T07:29:24Z"
RELEASE_ID = 404427362
WORKFLOW_ID = 37428880875
SKIP_REASON = ("Set WEBTECH_RC9_EXPRESS_NODE_MODULES to existing exact Express "
               "5.1.0 dependencies; no installation performed")
ASSETS = {
    "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip": {
        "id": 614813352, "bytes": 3933082,
        "sha256": "fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee"},
    "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256": {
        "id": 614813358, "bytes": 110,
        "sha256": "96a8d22b0b7ce897ff1fa319aa356a06200b8f89e56fc1bec684ad1c240194cb"},
    "SHA256SUMS.txt": {
        "id": 614813355, "bytes": 227,
        "sha256": "738c1dd6f45657182e3ffe2c6da461b6838c463e2d0ae93413df2e441cf4c040"},
}
FIELDS = {"schema", "version", "status", "qualificationVerdict",
          "source_commit", "release_id", "tag", "release_url", "published_at",
          "draft", "prerelease", "package_id", "assets", "workflow",
          "qualification_gates", "verification", "immutable_distribution"}


def exact_fields(value, names, label):
    if type(value) is not dict or set(value) != set(names):
        raise ValueError("Publication " + label + " field scope differs")


def exact(value, expected, label):
    # Python's True == 1 and 1.0 == 1 must not admit mistyped JSON controls.
    if type(value) is not type(expected) or value != expected:
        raise ValueError("Publication " + label + " identity/type differs")


def text(value, label):
    if type(value) is not str or not value.strip():
        raise ValueError("Publication " + label + " must be a non-empty string")


def validate_receipt(receipt, plan):
    """Check recorded observations against the exact owner-published RC9."""
    exact_fields(receipt, FIELDS, "receipt")
    expected = {
        "schema": "webtech-classroom-publication/v1", "version": VERSION,
        "status": STATUS, "qualificationVerdict": "NOT_FINAL",
        "source_commit": SOURCE_COMMIT, "release_id": RELEASE_ID, "tag": TAG,
        "release_url": RELEASE_URL, "published_at": PUBLISHED_AT,
        "draft": False, "prerelease": True, "package_id": PACKAGE_ID,
    }
    for name, value in expected.items():
        exact(receipt[name], value, name)
    assets = receipt["assets"]
    if type(assets) is not list or len(assets) != len(ASSETS):
        raise ValueError("Publication requires exactly three core assets")
    seen = set()
    for row in assets:
        exact_fields(row, {"id", "name", "bytes", "sha256", "download_url"}, "asset")
        name = row["name"]
        if type(name) is not str or name not in ASSETS or name in seen:
            raise ValueError("Publication core asset name is unknown or duplicated")
        seen.add(name)
        for key, value in ASSETS[name].items():
            exact(row[key], value, name + " " + key)
        exact(row["download_url"], DOWNLOAD_BASE + name, name + " download_url")
    if seen != set(ASSETS):
        raise ValueError("Publication core asset inventory differs")

    if type(plan) is not dict:
        raise ValueError("Frozen release plan must be an object")
    for name, value in {"distribution_version": VERSION, "tag": TAG,
                        "status": "candidate", "draft": True, "prerelease": True}.items():
        exact(plan.get(name), value, "frozen plan " + name)
    exact(plan.get("required_gates"), list(rc.GATES), "frozen plan required_gates")
    exact_fields(plan.get("gates"), rc.GATES, "frozen plan gates")
    for name in rc.GATES:
        row = plan["gates"][name]
        if type(row) is not dict or row.get("status") != "pending":
            raise ValueError("Frozen plan qualification gate is not pending: " + name)
    exact_fields(receipt["qualification_gates"], rc.GATES, "qualification_gates")
    for name, value in receipt["qualification_gates"].items():
        exact(value, "pending", "qualification gate " + name)

    workflow = receipt["workflow"]
    exact_fields(workflow, {"id", "url", "conclusion", "tests", "skip_reason"}, "workflow")
    exact(workflow["id"], WORKFLOW_ID, "workflow id")
    exact(workflow["url"], REPOSITORY_URL + "/actions/runs/" + str(WORKFLOW_ID), "workflow URL")
    exact(workflow["conclusion"], "success", "workflow conclusion")
    exact(workflow["skip_reason"], SKIP_REASON, "workflow skip reason")
    counts = {"defined": 40, "passed": 39, "skipped": 1, "failures": 0, "errors": 0}
    exact_fields(workflow["tests"], counts, "workflow tests")
    for name, value in counts.items():
        exact(workflow["tests"][name], value, "workflow test count " + name)

    verification = receipt["verification"]
    exact_fields(verification, {"observation_context", "assets_byte_identity", "zip_crc",
                              "file_count", "collection_verifier"}, "verification")
    text(verification["observation_context"], "observation context")
    for name, value in {"assets_byte_identity": True, "zip_crc": True,
                        "file_count": 1344, "collection_verifier": "PASS_INITIAL_BYTES_ONLY"}.items():
        exact(verification[name], value, "verification " + name)
    immutable = receipt["immutable_distribution"]
    exact_fields(immutable, {"source_commit", "tag", "reproduction_note"}, "immutable_distribution")
    exact(immutable["source_commit"], SOURCE_COMMIT, "immutable distribution source commit")
    exact(immutable["tag"], TAG, "immutable distribution tag")
    text(immutable["reproduction_note"], "reproduction note")
    return {"schema": "webtech-publication-controls/v1",
            "status": "PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY",
            "publication_receipt": RECEIPT, "published_version": VERSION,
            "publication_status": STATUS, "release_id": RELEASE_ID,
            "release_url": RELEASE_URL, "published_at": PUBLISHED_AT,
            "immutable_source_commit": SOURCE_COMMIT, "package_id": PACKAGE_ID,
            "core_assets": len(ASSETS), "recorded_workflow_tests": counts,
            "qualification": "NOT_FINAL", "pending_qualification_gates": list(rc.GATES),
            "live_network_used": False, "actions_dispatched": 0,
            "limitations": ("Static consistency of previously reviewed publication observations only. "
                "This run does not authenticate GitHub, download release assets, execute hosted "
                "tests or qualify native platforms, manual browser work, Word, Moodle or teaching.")}


def run(root=ROOT):
    receipt = rc.strict_json(rc.checked_path(root, RECEIPT).read_bytes())
    plan = rc.strict_json(rc.checked_path(root, PLAN).read_bytes())
    return validate_receipt(receipt, plan)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    result = run()
    encoded = (json.dumps(result, indent=2) + "\n").encode()
    if args.report:
        rc.atomic_write(rc.output_path(args.report), encoded)
    print(encoded.decode(), end="")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit("STOP: " + str(error))
