#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import re
import stat
import struct
import subprocess
import sys
import tempfile
import tarfile
import unicodedata
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "publishing"))
from release_contract import repo_path, safe_relative, zip_files, read_plan, selection, validate_week, state, VERSION_RE


ROOT = Path(__file__).resolve().parents[2]
VERSION = "2.0.1"
DEVELOPMENT_STATE_PATH = ROOT / "metadata/development-state.json"
ROMANIAN_ALLOWED_PREFIXES = (
    "01_WEEKS/WEEK_01/C01_COURSE/RO/",
    "01_WEEKS/WEEK_01/S01_SEMINAR/RO/",
    "01_WEEKS/WEEK_02/C02_COURSE/RO/",
    "01_WEEKS/WEEK_02/S02_SEMINAR/RO/",
)
TEXT_SUFFIXES = {".md", ".txt", ".html", ".csv", ".yml", ".yaml", ".json", ".cff"}
ROMANIAN_MARKERS = re.compile(
    r"[ăâîșțĂÂÎȘȚşţŞŢ]|\b(?:şi|sau|pentru|fişier|formular|încărcare|studentului|profesorului|cursul|seminarul|săptămâna)\b",
    re.I,
)
STRONG_SECRET_PATTERNS = {
    "GitHub token": re.compile(r"\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
}
FORBIDDEN_PUBLIC_PATHS = re.compile(
    r"(^|/)(?:TEACHER_KITS|MOODLE_ADMIN|INTERNAL_QA|PRIVATE_STAGING|TEACHER_GUIDE|GHID_PROFESOR|TEACHER_CONSOLE|CONSOLE_PROFESOR|ANSWER_KEY|CHEIE_RASPUNSURI|COMPLETE_CANONICAL_REFERENCE|REFERINTA_CANONICA_COMPLETA)(?:/|$)",
    re.I,
)
STUDENT_LEAK = re.compile(
    r"(?:^|/)(?:TEACHER_GUIDE|GHID_PROFESOR|TEACHER_CONSOLE|CONSOLE_PROFESOR|ANSWER_KEY|CHEIE_RASPUNSURI|TEACHER_CONTROL_SHEET|FISA_CONTROL_PROFESOR|COMPLETE_CANONICAL_REFERENCE|REFERINTA_CANONICA_COMPLETA)(?:/|$)",
    re.I,
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_path(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def normal_key(name: str) -> str:
    return unicodedata.normalize("NFC", name).casefold()


def repository_files() -> list[Path]:
    """Return public worktree files while excluding local Git metadata."""
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts and rel.parts[0] == ".git":
            continue
        files.append(path)
    return files


def parse_hash_manifest(data: str) -> dict[str, str]:
    rows: dict[str, str] = {}
    seen: set[str] = set()
    spellings: dict[str, str] = {}
    for number, line in enumerate(data.splitlines(), 1):
        if not line.strip():
            continue
        if "  " not in line:
            raise ValueError(f"line {number} does not use two spaces")
        digest, rel = line.split("  ", 1)
        if not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ValueError(f"line {number} has an invalid SHA-256")
        safe_relative(rel)
        key = normal_key(rel)
        if key in seen:
            raise ValueError(f"duplicate or case/Unicode-colliding manifest path: {rel}")
        seen.add(key)
        components = rel.split('/')
        for count in range(1, len(components) + 1):
            prefix = '/'.join(components[:count])
            prefix_key = normal_key(prefix)
            if prefix_key in spellings and spellings[prefix_key] != prefix:
                raise ValueError(f"case/Unicode-colliding manifest path components: {rel}")
            spellings[prefix_key] = prefix
        rows[rel] = digest
    return rows


class HTMLLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        d = dict(attrs)
        for key in ("href", "src", "action"):
            value = d.get(key)
            if value:
                self.links.append(value)


class Audit:
    def __init__(self, strict: bool, weeks: str | None = None, language: str | None = None) -> None:
        self.strict = strict
        self.weeks = weeks
        self.language = language
        self.selected_weeks = {v.strip().zfill(2) for v in weeks.split(",")} if weeks else None
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.counts: dict[str, int] = {}
        self.registry = None
        registry_path = ROOT / "90_RELEASES/CURRENT_OBJECTS.json"
        if registry_path.is_file():
            try:
                self.registry = json.loads(registry_path.read_text(encoding="utf-8"))
            except (ValueError, OSError) as exc:
                self.fail(f"current-object registry: {exc}")
        try:
            self.development_state = json.loads(DEVELOPMENT_STATE_PATH.read_text(encoding="utf-8"))
        except Exception:
            self.development_state = {"status": "final"}
        self.repository_state = str(self.development_state.get("status", "final"))

    def count(self, key: str, amount: int = 1) -> None:
        self.counts[key] = self.counts.get(key, 0) + amount

    def fail(self, message: str) -> None:
        self.errors.append(message)
        print("FAIL", message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)
        print("WARN", message)

    def require(self, condition: bool, message: str) -> None:
        if not condition:
            self.fail(message)

    def check_zip_bytes(self, data: bytes, label: str, depth: int = 0) -> None:
        if depth > 1:
            self.fail(f"nested ZIP depth exceeds one: {label}")
            return
        try:
            with zipfile.ZipFile(__import__("io").BytesIO(data)) as z:
                members = zip_files(z)
                bad = z.testzip()
                if bad:
                    self.fail(f"CRC failure in {label}: {bad}")
                for name, member in members.items():
                    if name.lower().endswith(".zip"):
                        self.check_zip_bytes(z.read(member), f"{label}!{name}", depth + 1)
                self.count("zip_archives")
        except Exception as exc:
            self.fail(f"cannot inspect ZIP {label}: {exc}")

    def check_zip_file(self, path: Path) -> None:
        self.check_zip_bytes(path.read_bytes(), path.relative_to(ROOT).as_posix())
        side = Path(str(path) + ".sha256")
        if not side.is_file():
            self.fail(f"missing ZIP sidecar: {path.relative_to(ROOT)}")
        else:
            expected = f"{sha256_path(path)}  {path.name}"
            actual = side.read_text(encoding="utf-8").strip()
            if actual != expected:
                self.fail(f"sidecar content mismatch: {path.relative_to(ROOT)}")

    def verify_exact_package(self, unit: Path) -> None:
        exact = unit / "PACKAGE_EXACT"
        download = unit / "DOWNLOAD"
        roots = [p for p in exact.iterdir() if p.is_dir()] if exact.is_dir() else []
        zips = list(download.glob("*.zip")) if download.is_dir() else []
        if len(roots) != 1 or len(zips) != 1:
            self.fail(f"package cardinality mismatch: {unit.relative_to(ROOT)}")
            return
        root, archive = roots[0], zips[0]
        try:
            with zipfile.ZipFile(archive) as z:
                file_members = list(zip_files(z))
                top = {PurePosixPath(n).parts[0] for n in file_members}
                if len(top) != 1:
                    self.fail(f"student ZIP must contain one root: {archive.relative_to(ROOT)}")
                    return
                prefix = next(iter(top)) + "/"
                if prefix != root.name + "/":
                    self.fail(f"ZIP root name differs from extracted package: {archive.relative_to(ROOT)}")
                zfiles = {n[len(prefix):]: sha256_bytes(z.read(n)) for n in file_members if n.startswith(prefix)}
            for path in root.rglob("*"):
                if path.is_symlink():
                    self.fail(f"symbolic link in extracted package: {path.relative_to(ROOT)}")
            dfiles = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*") if p.is_file()}
            if zfiles != dfiles:
                self.fail(f"PACKAGE_EXACT differs from DOWNLOAD ZIP: {unit.relative_to(ROOT)}")
            leaks = [name for name in zfiles if Path(name).name != "NO_TEACHER_ONLY_LEAKS.json" and STUDENT_LEAK.search(name)]
            if leaks:
                self.fail(f"teacher-only names in student package {unit.relative_to(ROOT)}: {leaks[:5]}")
            self.verify_internal_package(root)
            self.count("exact_packages")
        except Exception as exc:
            self.fail(f"exact-package verification failed for {unit.relative_to(ROOT)}: {exc}")

    def verify_internal_package(self, root: Path) -> None:
        # S02 v2.3+: immutable manifest plus a protected editable-path declaration.
        if (root / "90_AUDIT/IMMUTABLE_MANIFEST.sha256").is_file():
            audit = root / "90_AUDIT"
            manifest_path = audit / "IMMUTABLE_MANIFEST.sha256"
            mutable_file = audit / "MUTABLE_PATHS.txt"
            mutable = [line.strip() for line in mutable_file.read_text(encoding="utf-8").splitlines() if line.strip()]
            if len(mutable) != 1 or len(set(mutable)) != 1:
                self.fail(f"S02 must declare exactly one editable file: {root.name}")
            for relative in mutable:
                safe_relative(relative)
                if not relative.startswith("02_PROJECTS/") or not relative.endswith("/public/styles.css"):
                    self.fail(f"unexpected S02 editable file: {relative}")
                if not (root / relative).is_file():
                    self.fail(f"missing S02 editable file: {relative}")
            excluded = set(mutable) | {"90_AUDIT/IMMUTABLE_MANIFEST.sha256", "90_AUDIT/PACKAGE_ID.txt"}
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*")
                      if p.is_file() and p.relative_to(root).as_posix() not in excluded}
            if rows != actual:
                self.fail(f"internal immutable manifest mismatch: {root.name}")
            package_id = (audit / "PACKAGE_ID.txt").read_text(encoding="utf-8").strip()
            if not re.fullmatch(r"[0-9a-f]{64}", package_id) or package_id != sha256_path(manifest_path):
                self.fail(f"internal PACKAGE_ID mismatch: {root.name}")
            return
        # S01/C01 hardened packages.
        if (root / "90_AUDIT/PAYLOAD_SHA256SUMS.txt").is_file():
            audit = root / "90_AUDIT"
            manifest_path = audit / "PAYLOAD_SHA256SUMS.txt"
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {
                p.relative_to(root).as_posix(): sha256_path(p)
                for p in root.rglob("*")
                if p.is_file() and p not in {manifest_path, audit / "PACKAGE_ID.txt"}
            }
            if rows != actual:
                self.fail(f"internal payload manifest mismatch: {root.name}")
            pid = (audit / "PACKAGE_ID.txt").read_text(encoding="utf-8").strip()
            if pid != sha256_path(manifest_path):
                self.fail(f"internal PACKAGE_ID mismatch: {root.name}")
            return
        # S02 hardened packages.
        if (root / "05_AUDIT/SHA256SUMS.txt").is_file():
            audit = root / "05_AUDIT"
            manifest_path = audit / "SHA256SUMS.txt"
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*") if p.is_file() and p != manifest_path}
            if rows != actual:
                self.fail(f"internal S02 manifest mismatch: {root.name}")
            lines = []
            for p in sorted((p for p in root.rglob("*") if p.is_file() and not p.relative_to(root).as_posix().startswith("05_AUDIT/")), key=lambda x: x.relative_to(root).as_posix().casefold()):
                lines.append(f"{sha256_path(p)}  {p.relative_to(root).as_posix()}\n")
            calculated = sha256_bytes("".join(lines).encode())
            stored = (audit / "PACKAGE_ID.txt").read_text(encoding="utf-8").strip()
            if calculated != stored:
                self.fail(f"internal S02 PACKAGE_ID mismatch: {root.name}")
            return
        # C02: legacy case-folded identity and the explicitly declared RC ordinal contract.
        if (root / "06_AUDIT/SHA256SUMS.txt").is_file():
            audit = root / "06_AUDIT"
            manifest_path = audit / "SHA256SUMS.txt"
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*") if p.is_file() and p != manifest_path}
            if rows != actual:
                self.fail(f"internal C02 manifest mismatch: {root.name}")
            method_path = audit / "PACKAGE_ID_METHOD.txt"
            method = method_path.read_text(encoding="utf-8") if method_path.is_file() else ""
            ordinal = "sorted by exact ordinal relative path" in method
            identity_relative = "06_AUDIT/PACKAGE_ID.txt"
            if ordinal:
                ordered = sorted(rows)
                if list(rows) != ordered:
                    self.fail(f"internal C02 noncanonical ordinal manifest order: {root.name}")
                canonical = "".join(f"{rows[relative]}  {relative}\n" for relative in ordered).encode("utf-8")
                if manifest_path.read_bytes() != canonical:
                    self.fail(f"internal C02 noncanonical manifest bytes: {root.name}")
                if identity_relative not in rows:
                    self.fail(f"internal C02 PACKAGE_ID is not manifested: {root.name}")
                identity_bytes = (audit / "PACKAGE_ID.txt").read_bytes()
                if not re.fullmatch(rb"[0-9a-f]{64}\n", identity_bytes):
                    self.fail(f"internal C02 PACKAGE_ID format mismatch: {root.name}")
                # Every manifested hash has already been compared with the actual file.
                # Derive identity from the declared canonical order, excluding the ID.
                lines = [f"{rows[relative]}  {relative}\n" for relative in ordered if relative != identity_relative]
            else:
                # Existing FINAL editions used case-folded path order. Preserve that contract.
                paths = sorted((p for p in root.rglob("*") if p.is_file() and p not in {manifest_path, audit / "PACKAGE_ID.txt"}), key=lambda path: path.relative_to(root).as_posix().casefold())
                lines = [f"{sha256_path(path)}  {path.relative_to(root).as_posix()}\n" for path in paths]
            calculated = sha256_bytes("".join(lines).encode("utf-8"))
            stored = (audit / "PACKAGE_ID.txt").read_text(encoding="utf-8").strip()
            if calculated != stored:
                self.fail(f"internal C02 PACKAGE_ID mismatch: {root.name}")
            return
        # English-only environment packages.
        if (root / "SHA256SUMS.txt").is_file() and (root / "PACKAGE_ID.txt").is_file():
            manifest_path = root / "SHA256SUMS.txt"
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*") if p.is_file() and p not in {manifest_path, root / "PACKAGE_ID.txt"}}
            if rows != actual:
                self.fail(f"environment manifest mismatch: {root.name}")
            if (root / "PACKAGE_ID.txt").read_text(encoding="utf-8").strip() != sha256_path(manifest_path):
                self.fail(f"environment PACKAGE_ID mismatch: {root.name}")
            return
        self.fail(f"unknown internal package identity contract: {root.relative_to(ROOT)}")

    def check_local_links(self) -> None:
        md_rx = re.compile(r"!?(?:\[[^\]]*\])\(([^)]+)\)")
        for path in ROOT.rglob("*.md"):
            if not self.selected_path(path) or "PACKAGE_EXACT" in path.parts:
                continue
            for target in md_rx.findall(path.read_text(encoding="utf-8", errors="replace")):
                self.check_link(path, target)
        for path in ROOT.rglob("*.html"):
            if not self.selected_path(path) or "PACKAGE_EXACT" in path.parts:
                continue
            parser = HTMLLinks()
            parser.feed(path.read_text(encoding="utf-8", errors="replace"))
            for target in parser.links:
                self.check_link(path, target)

    def check_link(self, source: Path, target: str) -> None:
        clean = target.strip().split("#", 1)[0].split("?", 1)[0]
        if not clean or re.match(r"^[a-z]+://", clean, re.I) or clean.startswith("mailto:") or clean.startswith("data:"):
            return
        candidate = (source.parent / clean.replace("%20", " ")).resolve()
        try:
            candidate.relative_to(ROOT.resolve())
        except ValueError:
            self.fail(f"local link escapes repository: {source.relative_to(ROOT)} -> {target}")
            return
        if not candidate.exists():
            self.fail(f"broken local link: {source.relative_to(ROOT)} -> {target}")

    def check_action_lock(self) -> None:
        lock_path = ROOT / "metadata/github-actions-lock.json"
        try:
            lock = json.loads(lock_path.read_text(encoding="utf-8"))["actions"]
        except Exception as exc:
            self.fail(f"cannot parse action lock: {exc}")
            return
        found: dict[str, set[str]] = {}
        for workflow in (ROOT / ".github/workflows").glob("*.yml"):
            text = workflow.read_text(encoding="utf-8")
            for action, ref in re.findall(r"uses:\s*([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)@([0-9a-fA-F]{40})", text):
                found.setdefault(action, set()).add(ref.lower())
            for raw in re.findall(r"uses:\s*([^\s#]+)", text):
                if raw.startswith("actions/") and not re.fullmatch(r"actions/[A-Za-z0-9_.-]+@[0-9a-fA-F]{40}", raw):
                    self.fail(f"mutable or invalid GitHub Action ref in {workflow.relative_to(ROOT)}: {raw}")
        for action, meta in lock.items():
            expected = meta["sha"].lower()
            if found.get(action) != {expected}:
                self.fail(f"action lock mismatch for {action}: workflow={sorted(found.get(action,set()))}, lock={expected}")
        unexpected = sorted(set(found) - set(lock))
        if unexpected:
            self.fail(f"actions used but absent from lock: {unexpected}")


    def check_automation_policy(self) -> None:
        workflows = {
            "validate": ROOT / ".github/workflows/validate.yml",
            "pages": ROOT / ".github/workflows/pages.yml",
            "release": ROOT / ".github/workflows/release-week.yml",
        }
        if self.repository_state != "work-in-progress":
            return
        for label, path in workflows.items():
            text = path.read_text(encoding="utf-8")
            self.require("workflow_dispatch:" in text, f"{label} workflow is not manually dispatchable")
            for trigger in ("push:", "pull_request:", "schedule:"):
                if re.search(rf"^\s{{0,4}}{re.escape(trigger)}\s*$", text, re.M):
                    self.fail(f"automatic trigger {trigger[:-1]} remains enabled in {path.relative_to(ROOT)}")
        dependabot = (ROOT / ".github/dependabot.yml").read_text(encoding="utf-8")
        self.require("open-pull-requests-limit: 0" in dependabot, "Dependabot version updates are not paused")

    def check_alternatives(self) -> None:
        root = ROOT / "00_SETUP/ALTERNATIVES"
        self.require((root / "README.md").is_file(), "alternatives root README")
        self.require((root / "ALTERNATIVES_STATUS.json").is_file(), "alternatives status file")
        expected = {
            "WINDOWS": "TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip",
            "MACOS": "TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip",
            "LINUX": "TW2026_LINUX_ONEFILE_v1.0_RC1_WITH_GUIDE.zip",
        }
        for platform, archive_name in expected.items():
            platform_dir = root / platform
            archive = platform_dir / "DOWNLOAD" / archive_name
            guide = platform_dir / "GUIDE"
            self.require((platform_dir / "README.md").is_file(), f"{platform} alternative README")
            self.require(archive.is_file(), f"{platform} alternative archive")
            self.require((guide / "MIRROR_MANIFEST.json").is_file(), f"{platform} mirror manifest")
            if not archive.is_file() or not (guide / "MIRROR_MANIFEST.json").is_file():
                continue
            try:
                mirror = json.loads((guide / "MIRROR_MANIFEST.json").read_text(encoding="utf-8"))
                self.require(mirror.get("archive") == f"DOWNLOAD/{archive_name}", f"{platform} mirror archive path")
                self.require(mirror.get("archive_sha256") == sha256_path(archive), f"{platform} mirror archive hash")
                root_name = mirror.get("archive_root")
                with zipfile.ZipFile(archive) as z:
                    members = {i.filename: z.read(i) for i in z.infolist() if not i.is_dir()}
                for item in mirror.get("mirrored_files", []):
                    source = item.get("source_member")
                    target_rel = item.get("target")
                    target = platform_dir / str(target_rel)
                    self.require(source in members, f"{platform} missing mirrored source {source}")
                    self.require(target.is_file(), f"{platform} missing mirrored target {target_rel}")
                    if source in members and target.is_file():
                        self.require(target.read_bytes() == members[source], f"{platform} guide mirror differs: {target_rel}")
                        self.require(item.get("sha256") == sha256_bytes(members[source]), f"{platform} mirror hash differs: {target_rel}")
                for executable in mirror.get("executable_members_not_mirrored", []):
                    self.require(not (guide / Path(executable).name).exists(), f"{platform} executable duplicated outside ZIP")
                flat = root / archive_name
                flat_side = Path(str(flat) + ".sha256")
                if self.repository_state == "work-in-progress":
                    self.require(flat.is_file(), f"temporary flat alias missing: {archive_name}")
                    self.require(flat_side.is_file(), f"temporary flat alias sidecar missing: {archive_name}")
                    if flat.is_file():
                        self.require(flat.read_bytes() == archive.read_bytes(), f"temporary flat alias differs: {archive_name}")
                else:
                    self.require(not flat.exists() and not flat_side.exists(), f"temporary flat alternative alias remains in final state: {archive_name}")
                self.count("alternative_packages")
            except Exception as exc:
                self.fail(f"alternative package {platform}: {exc}")

    def check_metadata(self) -> None:
        try:
            cff_text = (ROOT / "CITATION.cff").read_text(encoding="utf-8")
            self.require(re.search(r"^cff-version:\s*1\.2\.0\s*$", cff_text, re.M) is not None, "CITATION.cff version")
            self.require(re.search(rf"^version:\s*[\"\']?{re.escape(VERSION)}[\"\']?\s*$", cff_text, re.M) is not None, "CITATION.cff repository version")
            self.require("family-names: Clim" in cff_text and "given-names: Antonio" in cff_text, "CITATION.cff author")
        except Exception as exc:
            self.fail(f"CITATION.cff: {exc}")
        try:
            cm = json.loads((ROOT / "codemeta.json").read_text(encoding="utf-8"))
            self.require(cm.get("name") == "WebTech_ASE", "CodeMeta identity")
            self.require(cm.get("version") == VERSION, "CodeMeta version")
            self.require(cm.get("developmentStatus") == "active", "CodeMeta development status")
        except Exception as exc:
            self.fail(f"codemeta.json: {exc}")
        try:
            meta_text = (ROOT / "metadata/repository-metadata.yml").read_text(encoding="utf-8")
            expected_status = "status: work-in-progress" if self.repository_state == "work-in-progress" else "status: final"
            for needle, label in [("owner: antonioclim", "repository owner"),("name: WebTech_ASE", "repository name"),(expected_status, "repository status"),("version: 2.0.1", "repository metadata version")]:
                self.require(needle in meta_text, label)
        except Exception as exc:
            self.fail(f"repository-metadata.yml: {exc}")
        try:
            course = json.loads((ROOT / "metadata/course-map.json").read_text(encoding="utf-8"))
            self.require(course.get("repository_version") == VERSION, "course-map repository version")
        except Exception as exc:
            self.fail(f"course-map.json: {exc}")
        try:
            png = ROOT / "assets/social-preview-1280x640.png"
            header = png.read_bytes()[:24]
            self.require(header[:8] == b"\x89PNG\r\n\x1a\n", "social preview format")
            width, height = struct.unpack(">II", header[16:24])
            self.require((width, height) == (1280, 640), f"social preview dimensions {width}x{height}")
            self.require(png.stat().st_size < 1024 * 1024, "social preview below 1 MB")
        except Exception as exc:
            self.fail(f"social preview: {exc}")

    def check_release_plan(self) -> None:
        try:
            plan = read_plan(ROOT)
            self.require(plan.get("repository_version") == VERSION, "release-plan repository version")
            selected = list(selection(plan, self.weeks, self.language))
            for week, language, entry, data in selected:
                validate_week(plan, week, entry)
                for key in ("bundle", "course", "seminar"):
                    path = repo_path(data[key], ROOT)
                    self.require(path.is_file(), f"missing release-plan {key}: {data[key]}")
                self.require(repo_path(entry["notes"], ROOT).is_file(), f"missing notes for week {week}")
                bundle = repo_path(data["bundle"], ROOT)
                side = Path(str(bundle) + ".sha256")
                self.require(side.is_file(), f"missing weekly sidecar: {data['bundle']}")
                if side.is_file() and bundle.is_file():
                    self.require(side.read_text(encoding="utf-8").strip() == f"{sha256_path(bundle)}  {bundle.name}", f"weekly sidecar mismatch: {data['bundle']}")
            command = [sys.executable, str(ROOT / "00_TOOLS/publishing/build_week_bundle.py"), "--verify-all"]
            if self.weeks:
                command.extend(["--weeks", self.weeks])
            if self.language:
                command.extend(["--language", self.language])
            cp = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=60)
            if cp.returncode:
                self.fail(f"weekly bundle verification failed: {cp.stdout} {cp.stderr}")
        except Exception as exc:
            self.fail(f"RELEASE_PLAN.json: {exc}")

    def check_current_objects(self) -> list[Path]:
        if self.registry is None:
            if self.weeks or self.language:
                self.fail("scoped distribution validation requires 90_RELEASES/CURRENT_OBJECTS.json")
            return []
        units = []
        try:
            registry = self.registry
            self.require(registry.get("schema") == "webtech-ase-current-objects-v1", "current-object registry schema")
            self.require(isinstance(registry.get("objects"), list), "current-object registry objects list")
            self.require(re.fullmatch(r"[0-9a-f]{40}", str(registry.get("source_commit", ""))) is not None, "registry needs an exact source commit")
            self.require(VERSION_RE.fullmatch(str(registry.get("distribution_version", ""))) is not None, "registry distribution version")
            objects = registry["objects"]
            selected = [item for item in objects if (not self.selected_weeks or item.get("week") in self.selected_weeks)
                        and (not self.language or item.get("language") == self.language)]
            if not selected:
                self.fail("current-object registry has no objects for the requested scope")
                return []
            seen = set()
            plan = read_plan(ROOT)
            for item in selected:
                week, unit, language = item["week"], item["unit"], item["language"]
                self.require(re.fullmatch(r"[0-9]{2}", week) is not None, f"invalid registry week: {week}")
                self.require(unit in (f"C{week}", f"S{week}"), f"invalid registry unit for week {week}: {unit}")
                identity = (week, unit, language)
                self.require(identity not in seen, f"duplicate current-object identity: {identity}")
                seen.add(identity)
                root = repo_path(item["path"], ROOT)
                archive = repo_path(item["zip"], ROOT)
                self.require(root.is_dir(), f"missing current package root: {item['path']}")
                self.require(archive.is_file(), f"missing current archive: {item['zip']}")
                self.require(root.name == item["package_root"] and archive.name == root.name + ".zip", f"registry root/archive mismatch: {unit}")
                self.require(root.parent.name == "PACKAGE_EXACT" and root.parent.parent.name == language, f"registry package route mismatch: {unit}")
                self.require(archive.parent == root.parent.parent / "DOWNLOAD", f"registry download route mismatch: {unit}")
                expected_unit = f"{unit}_{'COURSE' if unit.startswith('C') else 'SEMINAR'}"
                self.require(root.parent.parent.parent.name == expected_unit and root.parent.parent.parent.parent.name == f"WEEK_{week}", f"registry week/unit route mismatch: {unit}")
                version = item.get("version")
                version_matches = isinstance(version, str) and f"_v{version}_" in root.name
                candidate = re.fullmatch(r"([0-9]+\.[0-9]+\.[0-9]+)-rc\.([0-9]+)", str(version))
                if candidate:
                    version_matches = root.name.endswith(f"_v{candidate[1]}_RC{candidate[2]}")
                self.require(version_matches, f"registry package version mismatch: {unit}")
                self.require(item.get("status") == registry.get("status"), f"registry status mismatch: {unit}")
                self.require(isinstance(item.get("gates"), dict), f"registry gates must be a map: {unit}")
                if archive.is_file():
                    self.require(item["sha256"] == sha256_path(archive), f"registry archive hash mismatch: {unit}")
                identity_files = [root / folder / "PACKAGE_ID.txt" for folder in ("90_AUDIT", "06_AUDIT", "05_AUDIT")]
                identity_path = next((path for path in identity_files if path.is_file()), None)
                self.require(identity_path is not None, f"registry package identity missing: {unit}")
                self.require(re.fullmatch(r"[0-9a-f]{64}", str(item.get("package_id", ""))) is not None, f"registry invalid PACKAGE_ID: {unit}")
                if identity_path:
                    self.require(identity_path.read_text(encoding="utf-8").strip() == item.get("package_id"), f"registry PACKAGE_ID mismatch: {unit}")
                for key, value in item.get("entrypoints", {}).items():
                    targets = value if isinstance(value, list) else [value]
                    for relative in targets:
                        self.require(repo_path(relative, root).is_file(), f"missing registry entrypoint {unit}/{key}: {relative}")
                self.require(bool(item.get("entrypoints")), f"registry needs explicit entrypoints: {unit}")
                planned = plan["weeks"][week]["languages"][language]
                role = "course" if unit.startswith("C") else "seminar"
                self.require(planned[role] == item["zip"], f"release-plan and current registry disagree: {unit}")
                self.require(plan["weeks"][week]["version"] == registry.get("distribution_version"), f"registry and release distribution versions disagree: {week}")
                units.append(root.parent.parent)
            for week, language in {(item["week"], item["language"]) for item in selected}:
                expected = {(week, f"C{week}", language), (week, f"S{week}", language)}
                self.require(expected.issubset(seen), f"registry needs course and seminar for week {week}/{language}")
            if self.selected_weeks:
                self.require(self.selected_weeks.issubset({item["week"] for item in selected}), "registry omits a requested week")
            if isinstance(registry.get("languages"), list):
                self.require({item["language"] for item in objects}.issubset(set(registry["languages"])), "registry objects use an undeclared language")
            else:
                self.fail("registry languages must be a list")
        except Exception as exc:
            self.fail(f"current-object registry: {exc}")
        return units

    def selected_path(self, path: Path) -> bool:
        """Scope teaching objects, while retaining shared navigation and tooling checks."""
        if not self.weeks and not self.language:
            return True
        relative = path.relative_to(ROOT).as_posix()
        parts = path.relative_to(ROOT).parts
        if parts and parts[0] == "01_WEEKS":
            if len(parts) > 1 and parts[1].startswith("WEEK_"):
                if self.selected_weeks and parts[1][5:] not in self.selected_weeks:
                    return False
                if len(parts) > 3 and parts[3] in ("RO", "EN_GB") and self.language and parts[3] != self.language:
                    return False
            return True
        if parts and parts[0] == "00_SETUP":
            return False
        if len(parts) > 1 and parts[:2] == ("90_RELEASES", "assets"):
            try:
                return any(relative == data["bundle"] or relative == data["bundle"] + ".sha256"
                           for _, _, _, data in selection(read_plan(ROOT), self.weeks, self.language))
            except Exception:
                return False
        return not relative.startswith(".git/")

    def run_scoped(self) -> int:
        required = ("README.md", "index.html", "00_START_HERE/STUDENT_QUICK_START.md",
                    "00_START_HERE/DOWNLOAD_A_WEEK.md", "01_WEEKS/README.md",
                    "90_RELEASES/CURRENT_OBJECTS.json", "90_RELEASES/RELEASE_PLAN.json",
                    "metadata/development-state.json", ".github/workflows/validate.yml",
                    ".github/workflows/pages.yml", ".github/workflows/release-week.yml")
        for relative in required:
            self.require((ROOT / relative).is_file(), f"missing required shared path: {relative}")
        units = self.check_current_objects()
        for unit in units:
            self.require((unit / "README.md").is_file(), f"missing current unit README: {unit.relative_to(ROOT)}")
            self.require((unit.parent.parent / "README.md").is_file(), f"missing selected week README: {unit.parent.parent.relative_to(ROOT)}")
        for unit in dict.fromkeys(units):
            for archive in (unit / "DOWNLOAD").glob("*.zip"):
                self.check_zip_file(archive)
            self.verify_exact_package(unit)
        selected_files = [path for path in repository_files() if self.selected_path(path)]
        seen = set()
        for path in selected_files:
            relative = path.relative_to(ROOT).as_posix()
            key = normal_key(relative)
            self.require(key not in seen, f"case/Unicode duplicate in selected scope: {relative}")
            seen.add(key)
            self.require(not path.is_symlink(), f"symbolic link in selected scope: {relative}")
            self.require(len(relative) <= 220, f"selected path exceeds 220 characters: {relative}")
            self.require(path.stat().st_size <= 95 * 1024 * 1024, f"selected file approaches GitHub limit: {relative}")
            if FORBIDDEN_PUBLIC_PATHS.search(relative) and "PACKAGE_EXACT" not in path.parts:
                self.fail(f"private/teacher path in selected scope: {relative}")
            if path.suffix.lower() in TEXT_SUFFIXES:
                text = path.read_text(encoding="utf-8-sig", errors="replace")
                for label, pattern in STRONG_SECRET_PATTERNS.items():
                    if pattern.search(text):
                        self.fail(f"{label} detected in {relative}")
                if "PACKAGE_EXACT" not in path.parts and not relative.startswith(ROMANIAN_ALLOWED_PREFIXES) and ROMANIAN_MARKERS.search(text):
                    self.fail(f"Romanian text outside permitted objects: {relative}")
            if path.suffix == ".json" and "PACKAGE_EXACT" not in path.parts:
                try:
                    json.loads(path.read_text(encoding="utf-8-sig"))
                except Exception as exc:
                    self.fail(f"JSON parse failure {relative}: {exc}")
        self.check_local_links()
        for path in selected_files:
            if "PACKAGE_EXACT" in path.parts:
                continue
            command = None
            if path.suffix == ".sh":
                command = ["bash", "-n", str(path)]
            elif path.suffix in (".js", ".mjs", ".cjs"):
                command = ["node", "--check", str(path)]
            if command:
                cp = subprocess.run(command, capture_output=True, text=True, timeout=20)
                if cp.returncode:
                    self.fail(f"syntax failure {path.relative_to(ROOT)}: {cp.stderr.strip()}")
        self.check_metadata()
        self.check_action_lock()
        self.check_automation_policy()
        self.check_release_plan()
        self.check_repo_identity()
        if self.errors:
            print(f"VERDICT: FAIL_SCOPED_DISTRIBUTION_INTEGRITY ({len(self.errors)} findings)")
            return 2
        print(f"VERDICT: PASS_SCOPED_DISTRIBUTION_INTEGRITY (weeks={self.weeks or 'registry'}, language={self.language or 'declared'}, objects={len(units)}, files={len(selected_files)}; qualification is separate)")
        return 0

    def _identity_from_committed_tree(self, excluded: set[str]) -> dict[str, str] | None:
        """Hash committed Git blobs, avoiding checkout/export EOL conversion.

        GitHub Actions checks out files according to `.gitattributes`. Files such as
        `.cmd` may therefore use CRLF in the worktree although the committed blob and
        repository manifest use LF. `git ls-tree` plus `git cat-file --batch` reads
        the committed blob bytes directly and does not apply checkout or archive
        attributes.
        """
        if not (ROOT / ".git").exists():
            return None
        try:
            listing = subprocess.run(
                ["git", "ls-tree", "-r", "-z", "--full-tree", "HEAD"],
                cwd=ROOT, capture_output=True, timeout=60, check=False,
            )
            if listing.returncode != 0:
                self.warn("git ls-tree unavailable; repository identity uses worktree bytes")
                return None
            entries: list[tuple[str, str]] = []
            for record in listing.stdout.split(b"\0"):
                if not record:
                    continue
                meta, raw_path = record.split(b"\t", 1)
                _mode, obj_type, object_id = meta.split()
                if obj_type != b"blob":
                    continue
                rel = raw_path.decode("utf-8", "surrogateescape")
                if rel in excluded:
                    continue
                entries.append((rel, object_id.decode("ascii")))

            process = subprocess.Popen(
                ["git", "cat-file", "--batch"], cwd=ROOT,
                stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
            assert process.stdin is not None and process.stdout is not None
            for _rel, object_id in entries:
                process.stdin.write(object_id.encode("ascii") + b"\n")
            process.stdin.close()

            cache: dict[str, str] = {}
            actual: dict[str, str] = {}
            for rel, object_id in entries:
                header = process.stdout.readline().rstrip(b"\n")
                fields = header.split()
                if len(fields) != 3 or fields[1] != b"blob":
                    raise ValueError(f"unexpected git cat-file header for {rel}: {header!r}")
                size = int(fields[2])
                data = process.stdout.read(size)
                if len(data) != size:
                    raise ValueError(f"truncated git blob for {rel}")
                separator = process.stdout.read(1)
                if separator != b"\n":
                    raise ValueError(f"invalid git cat-file separator for {rel}")
                digest = cache.get(object_id)
                if digest is None:
                    digest = sha256_bytes(data)
                    cache[object_id] = digest
                actual[rel] = digest
            stderr = process.stderr.read() if process.stderr is not None else b""
            rc = process.wait(timeout=60)
            if rc != 0:
                raise ValueError(f"git cat-file failed ({rc}): {stderr.decode(errors='replace')}")
            self.count("repository_identity_git_blobs")
            return actual
        except Exception as exc:
            self.warn(f"raw Git blob validation unavailable; repository identity uses worktree bytes: {exc}")
            return None

    def check_repo_identity(self) -> None:
        manifest = ROOT / "REPOSITORY_SHA256SUMS.txt"
        pid = ROOT / "REPOSITORY_PACKAGE_ID.txt"
        method = ROOT / "REPOSITORY_PACKAGE_ID_METHOD.md"
        if not manifest.is_file() or not pid.is_file() or not method.is_file():
            self.fail("final repository identity files are missing")
            return
        rows = parse_hash_manifest(manifest.read_text(encoding="utf-8"))
        if pid.read_text(encoding="utf-8").strip() != sha256_path(manifest):
            self.fail("repository PACKAGE_ID mismatch")
        if self.repository_state == "work-in-progress":
            self.warn("repository tree identity is intentionally deferred while status is work-in-progress")
            self.count("repository_identity_deferred")
            return
        excluded = {manifest.name, pid.name, method.name}
        actual = self._identity_from_committed_tree(excluded)
        if actual is None:
            actual = {
                path.relative_to(ROOT).as_posix(): sha256_path(path)
                for path in repository_files()
                if path.relative_to(ROOT).as_posix() not in excluded
            }
        if rows != actual:
            unexpected = sorted(set(actual) - set(rows))[:5]
            absent = sorted(set(rows) - set(actual))[:5]
            mismatch = sorted(k for k in set(rows) & set(actual) if rows[k] != actual[k])[:5]
            self.fail(f"repository manifest mismatch: unexpected={unexpected}, absent={absent}, mismatch={mismatch}")

    def run(self) -> int:
        if self.weeks or self.language:
            return self.run_scoped()
        self.check_current_objects()
        required = [
            "README.md", "current-outline.md", "CHANGELOG.md", "COPYRIGHT.md",
            "CITATION.cff", "codemeta.json", "SECURITY.md", "SUPPORT.md",
            "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "index.html", "404.html",
            "metadata/github-actions-lock.json", "00_TOOLS/qa/requirements.txt",
            ".github/workflows/validate.yml", ".github/workflows/pages.yml",
            ".github/workflows/release-week.yml", ".github/dependabot.yml",
            "90_RELEASES/RELEASE_PLAN.json", "metadata/development-state.json",
            "00_SETUP/ALTERNATIVES/README.md", "REPOSITORY_SHA256SUMS.txt",
            "REPOSITORY_PACKAGE_ID.txt", "REPOSITORY_PACKAGE_ID_METHOD.md",
        ]
        for rel in required:
            self.require((ROOT / rel).exists(), f"missing required path: {rel}")
        all_paths = repository_files()
        normal_paths: set[str] = set()
        for path in all_paths:
            rel = path.relative_to(ROOT).as_posix()
            key = normal_key(rel)
            if key in normal_paths:
                self.fail(f"case/Unicode duplicate repository path: {rel}")
            normal_paths.add(key)
            if len(rel) > 220:
                self.fail(f"repository path exceeds 220 characters: {rel}")
            if path.stat().st_size > 95 * 1024 * 1024:
                self.fail(f"file approaches GitHub hard limit: {rel}")
            if path.is_symlink():
                self.fail(f"symbolic link in public repository: {rel}")
            if FORBIDDEN_PUBLIC_PATHS.search(rel) and "PACKAGE_EXACT" not in path.parts:
                self.fail(f"private/teacher path in public repository: {rel}")
            if path.suffix.lower() in TEXT_SUFFIXES and not rel.startswith(ROMANIAN_ALLOWED_PREFIXES) and "PACKAGE_EXACT" not in path.parts:
                try:
                    text = path.read_text(encoding="utf-8-sig")
                except Exception:
                    text = ""
                if ROMANIAN_MARKERS.search(text):
                    self.fail(f"Romanian text outside permitted objects: {rel}")
                for label, rx in STRONG_SECRET_PATTERNS.items():
                    if rx.search(text):
                        self.fail(f"{label} detected in {rel}")
        for archive in ROOT.rglob("*.zip"):
            self.check_zip_file(archive)
        for exact in ROOT.rglob("PACKAGE_EXACT"):
            if exact.is_dir():
                self.verify_exact_package(exact.parent)
        for path in ROOT.rglob("*.json"):
            if "PACKAGE_EXACT" in path.parts:
                continue
            try:
                json.loads(path.read_text(encoding="utf-8-sig"))
            except Exception as exc:
                self.fail(f"JSON parse failure {path.relative_to(ROOT)}: {exc}")
        for suffix in ("*.yml", "*.yaml", "*.cff"):
            for path in ROOT.rglob(suffix):
                if "PACKAGE_EXACT" in path.parts:
                    continue
                text = path.read_text(encoding="utf-8")
                if "\t" in text:
                    self.fail(f"tab character in YAML-like file {path.relative_to(ROOT)}")
                if not text.strip():
                    self.fail(f"empty YAML-like file {path.relative_to(ROOT)}")
        self.check_local_links()
        for path in ROOT.rglob("*.sh"):
            if "PACKAGE_EXACT" in path.parts:
                continue
            cp = subprocess.run(["bash", "-n", str(path)], capture_output=True, text=True, timeout=20)
            if cp.returncode:
                self.fail(f"Bash syntax failure {path.relative_to(ROOT)}: {cp.stderr.strip()}")
        for pattern in ("*.js", "*.mjs", "*.cjs"):
            for path in ROOT.rglob(pattern):
                if "PACKAGE_EXACT" in path.parts:
                    continue
                cp = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True, timeout=20)
                if cp.returncode:
                    self.fail(f"Node syntax failure {path.relative_to(ROOT)}: {cp.stderr.strip()}")
        self.check_metadata()
        self.check_action_lock()
        self.check_automation_policy()
        self.check_alternatives()
        self.check_release_plan()
        self.check_repo_identity()
        if self.errors:
            print(f"VERDICT: FAIL_PUBLIC_REPOSITORY ({len(self.errors)} findings)")
            return 2
        verdict = "PASS_PUBLIC_REPOSITORY_INTEGRITY_WIP" if self.repository_state == "work-in-progress" else "PASS_PUBLIC_REPOSITORY_INTEGRITY"
        print(
            f"VERDICT: {verdict} "
            f"(files={len(all_paths)}, zips={self.counts.get('zip_archives',0)}, exact_packages={self.counts.get('exact_packages',0)}, alternatives={self.counts.get('alternative_packages',0)}, warnings={len(self.warnings)})"
        )
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--weeks", help="Comma-separated current week numbers; checks shared navigation and the selected distribution")
    parser.add_argument("--language", help="Current distribution language, such as EN_GB")
    args = parser.parse_args()
    if args.weeks and (not re.fullmatch(r"[0-9]{1,2}(?:,[0-9]{1,2})*", args.weeks) or len(set(args.weeks.split(","))) != len(args.weeks.split(","))):
        parser.error("--weeks must list distinct week numbers, such as 01,02")
    return Audit(args.strict, args.weeks, args.language).run()


if __name__ == "__main__":
    raise SystemExit(main())
