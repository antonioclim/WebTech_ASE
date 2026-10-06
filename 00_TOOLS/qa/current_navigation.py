#!/usr/bin/env python3
"""Check the published RC10 portal and retained RC6 source navigation wrappers.

This is a static route and preservation check. It does not run applications,
render browsers, qualify native platforms or certify the teaching workload.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "00_TOOLS/publishing"))
import release_contract as rc

ARCHIVE = "90_ARCHIVE/MAIN_4eea8de_NAVIGATION"
BASELINE = "4eea8de416cb03cf4f718fb802f868a391abb192"
ACTIVE_VERSION = "3.0.0-rc.10"
ACTIVE_STATUS = "PUBLISHED_PRERELEASE"
ACTIVE_PORTAL = "00_START_HERE/STUDENT_CLASSROOM_PUBLISHED_RC10/README.md"
ACTIVE_NOTES = "90_RELEASES/RC10_PUBLICATION.md"
ACTIVE_PROCEDURE = "00_TOOLS/maintainer/CLASSROOM_RC10_PUBLISHED.md"
PUBLICATION_DATE = "2026-10-06"  # UTC date of the published release
ACTIVE_RELEASE_URL = "https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10"
ACTIVE_RECEIPT = "90_RELEASES/CLASSROOM_RC10_PUBLICATION.json"
PUBLISHED_AT = "2026-10-06T21:27:43Z"
GLOBAL_PATHS = {
    "90_RELEASES/README.md", "90_RELEASES/HISTORICAL_OBJECTS.md",
    "00_START_HERE/README.md", "00_START_HERE/WEEKS_01_14_DOWNLOADS.md",
    "00_START_HERE/STUDENT_QUICK_START.md", "00_START_HERE/DOWNLOAD_A_WEEK.md",
    "00_TOOLS/maintainer/PREVIEW_DOWNLOAD_POLICY.md",
    "00_SETUP/README.md", "00_SETUP/WINDOWS/README.md", "00_SETUP/MACOS_LINUX/README.md",
}


def objbase(ident):
    return f"01_WEEKS/WEEK_{ident[1:]}/{ident}_{'COURSE' if ident[0] == 'C' else 'SEMINAR'}"


def fixed_scope():
    result = ["01_WEEKS/README.md", *GLOBAL_PATHS]
    for number in range(1, 15):
        week = f"01_WEEKS/WEEK_{number:02d}"
        result.append(week + "/README.md")
        if number >= 8:
            result.append(week + "/index.html")
        for kind in ("C", "S"):
            base = objbase(f"{kind}{number:02d}")
            result.extend([base + "/README.md", base + "/EN_GB/README.md"])
            if number >= 8:
                result.extend([base + "/index.html", base + "/EN_GB/index.html"])
    return sorted(result)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.langs = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "a" and "href" in values:
            self.urls.append(values["href"])
        if tag == "html":
            self.langs.append(values.get("lang"))


def urls(name, text):
    if name.endswith(".html"):
        parser = Links()
        parser.feed(text)
        if parser.langs != ["en-GB"]:
            raise ValueError("Navigation document language differs: " + name)
        return parser.urls
    return re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", text)


def targets(root, name, text, allow_external=False):
    result = []
    for url in urls(name, text):
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc:
            if allow_external and parsed.scheme == "https":
                continue
            raise ValueError("Unexpected external current-navigation URL: " + name)
        if not parsed.path:
            continue
        path = unquote(parsed.path)
        if path.startswith("/") or "\\" in path or "\x00" in path:
            raise ValueError("Unsafe current-navigation URL: " + name)
        target = posixpath.normpath(posixpath.join(posixpath.dirname(name), path))
        file = rc.checked_path(root, target)
        if not file.is_file():
            raise ValueError("Missing current-navigation target: " + name + " -> " + url)
        result.append(target)
    return result


def active_route(root, name, text):
    """Require the new route before collapsed, explicitly historical source."""
    marker = '<details data-historical-source="rc6">'
    if marker not in text or text.count(marker) != 1:
        raise ValueError("One collapsed historical source section is required: " + name)
    prefix, retained = text.split(marker, 1)
    if ACTIVE_VERSION not in prefix or ACTIVE_STATUS not in prefix:
        raise ValueError("Published RC10 status must precede retained source: " + name)
    if ("historical RC6 source" not in prefix
            or "stale canonical registry hashes" not in prefix
            or "last published classroom prerelease is RC10" not in prefix
            or "NOT_FINAL" not in prefix):
        raise ValueError("Current/historical/published distinction missing: " + name)
    if "advanced, optional" not in retained.split("</summary>", 1)[0]:
        raise ValueError("Historical source summary must be explicit: " + name)
    # Markdown and HTML frontdoors must put the real portal and source status
    # before any retained source ZIP, original full application or old guide.
    current = set(targets(root, name, prefix, allow_external=True))
    if not {ACTIVE_PORTAL, ACTIVE_NOTES, ACTIVE_PROCEDURE} <= current:
        raise ValueError("Published RC10 portal or reviewed documentation absent: " + name)
    if any(n.endswith(".zip") or n.endswith(".zip.sha256")
           or "/SOURCE_EXACT/" in n or "/PACKAGE_EXACT/" in n for n in current):
        raise ValueError("Historical payload offered before active portal: " + name)
    if ("PREPARED_NOT_PUBLISHED" in prefix
            or re.search(r"https://[^\s\"'<>)]*/releases/(?:tag|download)/classroom-en-gb-v3\.0\.0-rc\.[1-9](?:[^0-9]|$)", prefix)):
        raise ValueError("Active RC10 frontdoor recommends an obsolete publication: " + name)
    return {"path": name, "published_version": ACTIVE_VERSION,
            "publication_status": ACTIVE_STATUS, "portal": ACTIVE_PORTAL,
            "historical_source_collapsed": True, "active_local_links": len(current)}


def active_metadata(root):
    """Bind published metadata to RC10 without claiming final qualification."""
    citation = rc.unique_yaml((root / "CITATION.cff").read_text(encoding="utf-8"))
    metadata = rc.unique_yaml((root / "metadata/repository-metadata.yml").read_text(encoding="utf-8"))
    course = rc.strict_json((root / "metadata/course-map.json").read_bytes())
    code = rc.strict_json((root / "codemeta.json").read_bytes())
    if (citation.get("version") != ACTIVE_VERSION
            or citation.get("date-released") != PUBLICATION_DATE
            or ACTIVE_STATUS not in citation.get("message", "")
            or "NOT_FINAL" not in citation.get("message", "")
            or citation.get("url") != ACTIVE_RELEASE_URL):
        raise ValueError("Published citation identity, date or qualification differ")
    repository = metadata.get("repository", {})
    if (repository.get("version") != ACTIVE_VERSION
            or repository.get("status") != ACTIVE_STATUS
            or repository.get("last_published_classroom_version") != ACTIVE_VERSION
            or repository.get("general_qualification") != "NOT_FINAL"
            or repository.get("student_portal") != ACTIVE_PORTAL
            or repository.get("publication_receipt") != ACTIVE_RECEIPT
            or repository.get("published_at") != PUBLISHED_AT
            or repository.get("classroom_release_url") != ACTIVE_RELEASE_URL):
        raise ValueError("Current repository metadata identity/status differ")
    if (course.get("repository_version") != ACTIVE_VERSION
            or course.get("publication_status") != ACTIVE_STATUS
            or course.get("last_published_classroom_version") != ACTIVE_VERSION
            or course.get("student_portal") != ACTIVE_PORTAL
            or course.get("publication_receipt") != ACTIVE_RECEIPT
            or course.get("published_at") != PUBLISHED_AT
            or course.get("general_qualification") != "NOT_FINAL"):
        raise ValueError("Current course-map identity/status differ")
    if (code.get("version") != ACTIVE_VERSION or code.get("developmentStatus") != ACTIVE_STATUS
            or code.get("datePublished") != PUBLICATION_DATE
            or "NOT_FINAL" not in code.get("description", "")
            or code.get("url") != ACTIVE_RELEASE_URL):
        raise ValueError("Published CodeMeta identity, date or qualification differ")
    weeks = course.get("weeks")
    if (not isinstance(weeks, list) or len(weeks) != 14
            or any(not isinstance(w, dict) or type(w.get("week")) is not int for w in weeks)
            or {w.get("week") for w in weeks} != set(range(1, 15))
            or any(w.get("active_distribution_version") != ACTIVE_VERSION
                   or w.get("status") != "PUBLISHED_RC10_PRERELEASE"
                   or w.get("active_distribution_languages") != ["EN_GB"]
                   for w in weeks)):
        raise ValueError("Current fourteen-week course map differs")
    return {"published_version": ACTIVE_VERSION, "publication_status": ACTIVE_STATUS,
            "last_published_classroom_version": ACTIVE_VERSION,
            "publication_date": PUBLICATION_DATE, "qualification": "NOT_FINAL"}


def object_targets(obj):
    required = {
        obj["archive"],
        obj["archive"] + ".sha256",
        obj["projection"] + "/" + obj["student_start"],
        obj["projection"] + "/" + obj["student_guide"],
        obj["projection"] + "/" + obj["package_id_path"],
    }
    if obj.get("student_form"):
        required.add(obj["projection"] + "/" + obj["student_form"])
    return required


def run(root=ROOT):
    metadata = active_metadata(root)
    registry = rc.strict_json((root / "metadata/student-selection.json").read_bytes())
    plan = rc.strict_json((root / "90_RELEASES/FULL_COLLECTION_PLAN.json").read_bytes())
    objects = {o["object_id"]: o for o in registry["objects"]}
    if set(objects) != rc.OBJECTS or len(registry["objects"]) != 30:
        raise ValueError("Full fixed selection required by navigation")
    version = registry["distribution_version"]
    if registry.get("qualified_release") is not False or plan.get("status") != "candidate":
        raise ValueError("Navigation is for a candidate collection")
    if plan["distribution_version"] != version or set(plan["weeks"]) != {f"{i:02d}" for i in range(1, 15)}:
        raise ValueError("Navigation week plan differs from current selection")
    if plan["registry_sha256"] != hashlib.sha256((root / "metadata/student-selection.json").read_bytes()).hexdigest():
        raise ValueError("Navigation plan registry pin differs")
    archive = rc.strict_json((root / ARCHIVE / "ARCHIVE_MANIFEST.json").read_bytes())
    scope = fixed_scope()
    if archive.get("schema") != "webtech-navigation-archive/v1" or archive.get("source_commit") != BASELINE or set(archive.get("files", {})) != set(scope):
        raise ValueError("Navigation predecessor archive scope differs")
    for name, record in archive["files"].items():
        if record.get("archive") != ARCHIVE + "/" + name or record.get("mode") not in ("100644", "100755"):
            raise ValueError("Navigation predecessor location/mode differs")
        preserved = rc.checked_path(root, record["archive"])
        if rc.sha(preserved.read_bytes()) != record["sha256"] or bool(preserved.stat().st_mode & 0o111) != (record["mode"] == "100755"):
            raise ValueError("Navigation predecessor bytes/mode differ: " + name)
    allowed_zip = {o["archive"] for o in objects.values()} | {w["bundle"] for w in plan["weeks"].values()}
    allowed_sidecar = {n + ".sha256" for n in allowed_zip}
    total_links = 0
    zip_links = 0
    records = []
    active_records = []
    for name in scope:
        file = rc.checked_path(root, name)
        text = file.read_text(encoding="utf-8")
        active_records.append(active_route(root, name, text))
        if version not in text or "Qualification and classroom acceptance remain pending." not in text:
            raise ValueError("Current edition/status missing from navigation: " + name)
        actual_list = targets(root, name, text)
        actual = set(actual_list)
        total_links += len(actual_list)
        zips = {n for n in actual if n.endswith(".zip")}
        sidecars = {n for n in actual if n.endswith(".zip.sha256")}
        if not zips <= allowed_zip:
            raise ValueError("Unselected ZIP recommended by navigation: " + name + " " + repr(sorted(zips - allowed_zip)))
        if not sidecars <= allowed_sidecar:
            raise ValueError("Unselected ZIP sidecar recommended by navigation: " + name)
        zip_links += sum(n.endswith(".zip") for n in actual_list)
        if "metadata/student-selection.json" not in actual or ARCHIVE + "/README.md" not in actual:
            raise ValueError("Current registry/history distinction missing: " + name)
        parts = name.split("/")
        if name in GLOBAL_PATHS:
            required = {"90_RELEASES/FULL_COLLECTION_PLAN.json", "90_RELEASES/COLLECTION_RELEASE_PLAN.json", "01_WEEKS/README.md"}
            if name == "90_RELEASES/README.md":
                expected_zips = {w["bundle"] for w in plan["weeks"].values()}
                required.update(expected_zips)
                required.update(n + ".sha256" for n in expected_zips)
                required.update(objbase(kind + f"{number:02d}") + "/EN_GB/README.md" for number in range(1, 15) for kind in ("C", "S"))
                if zips != expected_zips:
                    raise ValueError("Release catalogue omits/adds weekly ZIP selection")
            elif name == "00_SETUP/README.md":
                expected_zips = {objects[ident]["archive"] for ident in ("SETUP_WINDOWS", "SETUP_MACOS_LINUX")}
                required.update(expected_zips)
                required.update(n + ".sha256" for n in expected_zips)
                for ident, target in (("SETUP_WINDOWS", "00_SETUP/WINDOWS/README.md"), ("SETUP_MACOS_LINUX", "00_SETUP/MACOS_LINUX/README.md")):
                    obj = objects[ident]
                    required.update({target, obj["projection"] + "/" + obj["student_guide"], obj["projection"] + "/" + obj["student_form"]})
                if zips != expected_zips:
                    raise ValueError("Setup hub omits/adds platform ZIP selection")
            elif name in {"00_SETUP/WINDOWS/README.md", "00_SETUP/MACOS_LINUX/README.md"}:
                obj = objects["SETUP_WINDOWS" if "WINDOWS" in name else "SETUP_MACOS_LINUX"]
                required.update(object_targets(obj))
                if zips != {obj["archive"]} or sidecars != {obj["archive"] + ".sha256"}:
                    raise ValueError("Setup platform selection/sidecar differs: " + name)
                if obj["carrier_version"] not in text:
                    raise ValueError("Selected setup edition missing: " + name)
            elif zips or sidecars:
                raise ValueError("Global guidance unexpectedly recommends a ZIP: " + name)
        elif name == "01_WEEKS/README.md":
            required = {f"01_WEEKS/WEEK_{i:02d}/README.md" for i in range(1, 15)}
            if zips:
                raise ValueError("Top-level weeks route unexpectedly recommends a ZIP")
        elif len(parts) == 3:
            week = parts[1][-2:]
            required = {plan["weeks"][week]["bundle"], plan["weeks"][week]["bundle"] + ".sha256"}
            expected_zips = {plan["weeks"][week]["bundle"]}
            for kind in ("C", "S"):
                ident = kind + week
                obj = objects[ident]
                expected_zips.add(obj["archive"])
                required.update({objbase(ident) + "/EN_GB/README.md", obj["archive"],
                                 obj["projection"] + "/" + obj["student_start"], obj["projection"] + "/" + obj["student_guide"]})
                if obj.get("student_form"):
                    required.add(obj["projection"] + "/" + obj["student_form"])
            if zips != expected_zips or not sidecars <= {n + ".sha256" for n in expected_zips}:
                raise ValueError("Week navigation recommends another week's ZIP: " + name)
        else:
            ident = parts[2][:3]
            obj = objects[ident]
            required = object_targets(obj)
            if zips != {obj["archive"]}:
                raise ValueError("Object navigation recommends another object's ZIP: " + name)
            if sidecars != {obj["archive"] + ".sha256"}:
                raise ValueError("Object navigation sidecar scope differs: " + name)
            if obj["carrier_version"] not in text:
                raise ValueError("Selected object edition missing: " + name)
            if len(parts) == 4:
                required.add(objbase(ident) + "/EN_GB/README.md")
        if not required <= actual:
            raise ValueError("Required current resource missing from navigation: " + name + " " + repr(sorted(required - actual)))
        records.append({"path": name, "local_links": len(actual_list), "zip_links": len(zips), "sha256": rc.sha(file.read_bytes())})
    frontdoors = ["README.md", "index.html", "current-outline.md"]
    frontdoors.extend(p.relative_to(root).as_posix() for p in sorted((root / "ENTRY").glob("*.html")))
    for name in frontdoors:
        text = rc.checked_path(root, name).read_text(encoding="utf-8")
        active_records.append(active_route(root, name, text))
        targets(root, name, text, allow_external=True)
    return {"schema": "webtech-current-navigation-qa/v3", "status": "PASS_CURRENT_NAVIGATION_STATIC_ONLY",
            "distribution_version": ACTIVE_VERSION, "publication_status": ACTIVE_STATUS,
            "source_selection_version": version, "current_portal": ACTIVE_PORTAL,
            "metadata": metadata,
            "active_frontdoors": len(active_records), "active_records": active_records,
            "scope_files": len(scope), "week_readmes": 14, "object_en_readmes": 28,
            "parent_object_readmes": 28, "week_html_wrappers": 7, "parent_html_wrappers": 14, "object_en_html_wrappers": 14,
            "all_weeks_readme": 1, "additional_global_frontdoors": len(GLOBAL_PATHS), "preserved_predecessors": len(archive["files"]), "local_links": total_links,
            "selected_zip_link_occurrences": zip_links, "unselected_recommended_zip_links": 0, "records": records,
            "limitations": "Static targets and exact predecessor preservation only. Historical bytes are retained separately and their relative URLs are not reinterpreted. No runtime/native/browser/Word/Moodle/classroom qualification.",
            "actions_dispatched": 0}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    result = run()
    text = json.dumps(result, indent=2) + "\n"
    if args.report:
        rc.atomic_write(rc.output_path(args.report), text.encode())
    print(text, end="")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit("STOP: " + str(error))
