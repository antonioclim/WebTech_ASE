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
    for number, line in enumerate(data.splitlines(), 1):
        if not line.strip():
            continue
        if "  " not in line:
            raise ValueError(f"line {number} does not use two spaces")
        digest, rel = line.split("  ", 1)
        if not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ValueError(f"line {number} has an invalid SHA-256")
        if rel in rows:
            raise ValueError(f"duplicate manifest path: {rel}")
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
    def __init__(self, strict: bool) -> None:
        self.strict = strict
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.counts: dict[str, int] = {}
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
                bad = z.testzip()
                if bad:
                    self.fail(f"CRC failure in {label}: {bad}")
                seen: set[str] = set()
                for info in z.infolist():
                    name = info.filename
                    pp = PurePosixPath(name)
                    key = normal_key(name)
                    if pp.is_absolute() or ".." in pp.parts or re.match(r"^[A-Za-z]:", name):
                        self.fail(f"unsafe ZIP member in {label}: {name}")
                    if key in seen:
                        self.fail(f"case/Unicode collision in {label}: {name}")
                    seen.add(key)
                    if info.flag_bits & 0x1:
                        self.fail(f"encrypted ZIP member in {label}: {name}")
                    mode = (info.external_attr >> 16) & 0xFFFF
                    if stat.S_ISLNK(mode):
                        self.fail(f"symbolic-link ZIP member in {label}: {name}")
                    if len(name) > 240:
                        self.fail(f"ZIP member path exceeds 240 characters in {label}: {name}")
                    if not info.is_dir() and name.lower().endswith(".zip"):
                        self.check_zip_bytes(z.read(info), f"{label}!{name}", depth + 1)
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
                file_members = [i.filename for i in z.infolist() if not i.is_dir()]
                top = {PurePosixPath(n).parts[0] for n in file_members}
                if len(top) != 1:
                    self.fail(f"student ZIP must contain one root: {archive.relative_to(ROOT)}")
                    return
                prefix = next(iter(top)) + "/"
                zfiles = {n[len(prefix):]: sha256_bytes(z.read(n)) for n in file_members if n.startswith(prefix)}
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
        # C02 hardened packages.
        if (root / "06_AUDIT/SHA256SUMS.txt").is_file():
            audit = root / "06_AUDIT"
            manifest_path = audit / "SHA256SUMS.txt"
            rows = parse_hash_manifest(manifest_path.read_text(encoding="utf-8"))
            actual = {p.relative_to(root).as_posix(): sha256_path(p) for p in root.rglob("*") if p.is_file() and p != manifest_path}
            if rows != actual:
                self.fail(f"internal C02 manifest mismatch: {root.name}")
            lines = []
            for p in sorted((p for p in root.rglob("*") if p.is_file() and p not in {manifest_path, audit / "PACKAGE_ID.txt"}), key=lambda x: x.relative_to(root).as_posix().casefold()):
                lines.append(f"{sha256_path(p)}  {p.relative_to(root).as_posix()}\n")
            calculated = sha256_bytes("".join(lines).encode())
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
            if "PACKAGE_EXACT" in path.parts:
                continue
            for target in md_rx.findall(path.read_text(encoding="utf-8", errors="replace")):
                self.check_link(path, target)
        for path in ROOT.rglob("*.html"):
            if "PACKAGE_EXACT" in path.parts:
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
            plan = json.loads((ROOT / "90_RELEASES/RELEASE_PLAN.json").read_text(encoding="utf-8"))
            self.require(plan.get("repository_version") == VERSION, "release-plan version")
            self.require(plan.get("status") == "final" and plan.get("prerelease") is False, "release plan final state")
            for week, item in plan["weeks"].items():
                self.require(item["tag"] == f"week-{week}-v2.0.0", f"final release tag for week {week}")
                for lang, data in item["languages"].items():
                    for key in ("bundle", "course", "seminar"):
                        p = ROOT / data[key]
                        self.require(p.is_file(), f"missing release-plan {key}: {data[key]}")
                    bundle = ROOT / data["bundle"]
                    side = Path(str(bundle) + ".sha256")
                    self.require(side.is_file(), f"missing weekly sidecar: {data['bundle']}")
                    if side.is_file():
                        self.require(side.read_text(encoding="utf-8").strip() == f"{sha256_path(bundle)}  {bundle.name}", f"weekly sidecar mismatch: {data['bundle']}")
            cp = subprocess.run([sys.executable, str(ROOT / "00_TOOLS/publishing/build_week_bundle.py"), "--verify-all"], cwd=ROOT, capture_output=True, text=True, timeout=60)
            if cp.returncode:
                self.fail(f"weekly bundle verification failed: {cp.stdout} {cp.stderr}")
        except Exception as exc:
            self.fail(f"RELEASE_PLAN.json: {exc}")

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
        verdict = "PASS_PUBLIC_REPOSITORY_WIP" if self.repository_state == "work-in-progress" else "PASS_PUBLIC_REPOSITORY_FINAL"
        print(
            f"VERDICT: {verdict} "
            f"(files={len(all_paths)}, zips={self.counts.get('zip_archives',0)}, exact_packages={self.counts.get('exact_packages',0)}, alternatives={self.counts.get('alternative_packages',0)}, warnings={len(self.warnings)})"
        )
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    return Audit(args.strict).run()


if __name__ == "__main__":
    raise SystemExit(main())
