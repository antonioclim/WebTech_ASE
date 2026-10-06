#!/usr/bin/env python3
"""Validate the recorded RC10 publication without making network calls.

The receipt records a reviewed GitHub observation and earlier finite checks.
This consistency check does not download public assets, repeat hosted tests,
observe deployment or promote any pending qualification gate.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "00_TOOLS/publishing"))
import release_contract as rc

RECEIPT = "90_RELEASES/CLASSROOM_RC10_PUBLICATION.json"
PLAN = "90_RELEASES/CLASSROOM_RC10_RELEASE_PLAN.json"
VERSION = "3.0.0-rc.10"
STATUS = "PUBLISHED_PRERELEASE"
TAG = "classroom-en-gb-v3.0.0-rc.10"
SOURCE_COMMIT = "b2bbe3edba9e4d9a1955c0b5edd5cf2247576416"
SOURCE_PACKAGE_ID = "9e26cc2c51616e4c2064ac8a317372e5f4e45c45903d1752bb829dd1c1124825"
PACKAGE_ID = "1ae203d4bba59319b00406852fd36d283b17baea76bb905dbc7d7ae050a31156"
REPOSITORY_URL = "https://github.com/antonioclim/WebTech_ASE"
RELEASE_URL = REPOSITORY_URL + "/releases/tag/" + TAG
DOWNLOAD_BASE = REPOSITORY_URL + "/releases/download/" + TAG + "/"
PUBLISHED_AT = "2026-10-06T21:27:43Z"
RELEASE_ID = 405127973
WORKFLOW_ID = 37528444879
ASSETS = {
    "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip": {
        "id": 616617532, "bytes": 4357345,
        "sha256": "a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9"},
    "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256": {
        "id": 616617533, "bytes": 111,
        "sha256": "79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a"},
    "SHA256SUMS.txt": {
        "id": 616617534, "bytes": 229,
        "sha256": "6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2"},
}
TEST_SUITES = {
    "focused_rc10": {"defined": 15, "passed": 15, "skipped": 0,
                     "failures": 0, "errors": 0, "seconds": 133.180},
    "day0_static": {"defined": 2, "passed": 2, "skipped": 0,
                    "failures": 0, "errors": 0, "seconds": 0.009},
}
VERIFICATION = {
    "asset_identity_method": "GITHUB_UPLOAD_DIGEST_AND_SIZE_MATCH_LOCAL_VERIFIED_ASSETS",
    "assets_metadata_match_local": True,
    "public_remote_binary_downloaded": False,
    "public_remote_zip_crc_rechecked": False,
    "local_zip_verified_before_upload": True,
    "file_count": 1452,
    "hosted_resolver": "PASS",
    "local_firefox_semantic_tests": 52,
    "local_firefox_semantic_tests_repeated_in_workflow": False,
    "pages_deployment_observed": False,
}
NOTES = {
    "path": "90_RELEASES/NOTES_CLASSROOM_RC10.md",
    "source_url": REPOSITORY_URL + "/blob/" + SOURCE_COMMIT + "/90_RELEASES/NOTES_CLASSROOM_RC10.md",
    "published_body_sha256": "6ec7778b66c0fc2ba00a45c12a950e43b00cc68af74dc0bf9beb688db3f6e291",
    "lf_normalised_sha256": "8f1c82fad5a4a3b31573c0ce920727f177ba03af565cdca29d459c368984d796",
    "lf_to_crlf_count": 35,
    "content_equal_after_line_ending_normalisation": True,
    "preparation_wording_retained": True,
}
PREDECESSOR = {
    "release_id": 404427362,
    "tag": "classroom-en-gb-v3.0.0-rc.9",
    "source_commit": "60d8f8b86eec812a79db92860dd6d13f16d91f5f",
    "tag_body_and_asset_identities_preserved": True,
}
FIELDS = {"schema", "version", "status", "qualificationVerdict", "source_commit",
          "source_package_id", "release_id", "tag", "release_url", "published_at",
          "draft", "prerelease", "package_id", "assets", "workflow",
          "qualification_gates", "verification", "notes", "preserved_predecessor",
          "immutable_distribution"}


def exact_fields(value, names, label):
    if type(value) is not dict or set(value) != set(names):
        raise ValueError("Publication " + label + " field scope differs")


def exact(value, expected, label):
    # True == 1 and 1.0 == 1 must not admit mistyped JSON controls.
    if type(value) is not type(expected) or value != expected:
        raise ValueError("Publication " + label + " identity/type differs")


def text(value, label):
    if type(value) is not str or not value.strip():
        raise ValueError("Publication " + label + " must be a non-empty string")


def exact_object(value, expected, label):
    exact_fields(value, expected, label)
    for name, item in expected.items():
        exact(value[name], item, label + " " + name)


def validate_receipt(receipt, plan):
    """Check the recorded owner-published RC10 and its unchanged candidate plan."""
    exact_fields(receipt, FIELDS, "receipt")
    identity = {
        "schema": "webtech-classroom-rc10-publication/v1", "version": VERSION,
        "status": STATUS, "qualificationVerdict": "NOT_FINAL",
        "source_commit": SOURCE_COMMIT, "source_package_id": SOURCE_PACKAGE_ID,
        "release_id": RELEASE_ID, "tag": TAG, "release_url": RELEASE_URL,
        "published_at": PUBLISHED_AT, "draft": False, "prerelease": True,
        "package_id": PACKAGE_ID,
    }
    for name, value in identity.items():
        exact(receipt[name], value, name)
    assets = receipt["assets"]
    if type(assets) is not list or len(assets) != len(ASSETS):
        raise ValueError("Publication requires exactly three core assets")
    seen = set()
    for row in assets:
        exact_fields(row, {"id", "name", "bytes", "sha256", "state", "download_url"}, "asset")
        name = row["name"]
        if type(name) is not str or name not in ASSETS or name in seen:
            raise ValueError("Publication core asset name is unknown or duplicated")
        seen.add(name)
        for key, value in ASSETS[name].items():
            exact(row[key], value, name + " " + key)
        exact(row["state"], "uploaded", name + " state")
        exact(row["download_url"], DOWNLOAD_BASE + name, name + " download_url")
    if seen != set(ASSETS):
        raise ValueError("Publication core asset inventory differs")

    if type(plan) is not dict:
        raise ValueError("Frozen release plan must be an object")
    for name, value in {"distribution_version": VERSION, "tag": TAG,
                        "status": "candidate", "draft": True, "prerelease": True,
                        "collection_root": "WEBTECH_ASE_EN_GB_CLASSROOM_RC10/",
                        "archive": "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip"}.items():
        exact(plan.get(name), value, "frozen plan " + name)
    exact(plan.get("required_gates"), list(rc.GATES), "frozen plan required_gates")
    exact_fields(plan.get("gates"), rc.GATES, "frozen plan gates")
    for name in rc.GATES:
        row = plan["gates"][name]
        exact_fields(row, {"status", "scope"}, "frozen plan gate " + name)
        exact(row["status"], "pending", "frozen plan gate " + name)
        text(row["scope"], "frozen plan gate scope " + name)
    exact_fields(receipt["qualification_gates"], rc.GATES, "qualification_gates")
    for name, value in receipt["qualification_gates"].items():
        exact(value, "pending", "qualification gate " + name)

    workflow = receipt["workflow"]
    exact_fields(workflow, {"id", "url", "conclusion", "run_attempt", "source_commit", "tests"}, "workflow")
    for name, value in {"id": WORKFLOW_ID,
                        "url": REPOSITORY_URL + "/actions/runs/" + str(WORKFLOW_ID),
                        "conclusion": "success", "run_attempt": 1,
                        "source_commit": SOURCE_COMMIT}.items():
        exact(workflow[name], value, "workflow " + name)
    exact_fields(workflow["tests"], TEST_SUITES, "workflow test suites")
    for name, suite in TEST_SUITES.items():
        exact_object(workflow["tests"][name], suite, "workflow tests " + name)

    verification = receipt["verification"]
    exact_fields(verification, set(VERIFICATION) | {"observation_context"}, "verification")
    text(verification["observation_context"], "observation context")
    for name, value in VERIFICATION.items():
        exact(verification[name], value, "verification " + name)
    exact_object(receipt["notes"], NOTES, "notes")
    exact_object(receipt["preserved_predecessor"], PREDECESSOR, "preserved predecessor")
    immutable = receipt["immutable_distribution"]
    exact_fields(immutable, {"source_commit", "tag", "reproduction_method", "reproduction_note"}, "immutable_distribution")
    exact(immutable["source_commit"], SOURCE_COMMIT, "immutable source commit")
    exact(immutable["tag"], TAG, "immutable tag")
    exact(immutable["reproduction_method"], "EXACT_PUBLISHED_COMMIT", "reproduction method")
    text(immutable["reproduction_note"], "reproduction note")
    return {"schema": "webtech-rc10-publication-controls/v1",
            "status": "PASS_RECORDED_PUBLICATION_CONSISTENCY_ONLY",
            "publication_receipt": RECEIPT, "published_version": VERSION,
            "publication_status": STATUS, "release_id": RELEASE_ID,
            "release_url": RELEASE_URL, "published_at": PUBLISHED_AT,
            "immutable_source_commit": SOURCE_COMMIT,
            "source_package_id": SOURCE_PACKAGE_ID, "package_id": PACKAGE_ID,
            "core_assets": len(ASSETS), "recorded_workflow_tests": workflow["tests"],
            "recorded_asset_identity_method": VERIFICATION["asset_identity_method"],
            "qualification": "NOT_FINAL", "pending_qualification_gates": list(rc.GATES),
            "live_network_used": False, "actions_dispatched": 0,
            "limitations": ("Consistency of previously reviewed publication observations only. "
                "This run does not authenticate GitHub, download public assets, repeat hosted or "
                "local Firefox tests, observe Pages deployment or qualify native platforms, "
                "manual browser work, Word, Moodle or teaching.")}


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
