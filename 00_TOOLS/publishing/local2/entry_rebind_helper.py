"""Pure ENTRY rebinding for a classroom candidate with publication-neutral scope.

API: rebind_entry(source_text, object_id, old_ids, new_ids, metadata)
returns (candidate_text, audit). This module never reads or writes a file.

Identity maps are object_id -> lowercase SHA-256 strings. Metadata must contain
candidate_version and units[object_id], whose collection-relative paths are:
package_id_path, candidate_readme_path and candidate_derivation_path.
The qualification_verdict defaults to NOT_FINAL and cannot be promoted here.
Existing RC10 provenance links stay in place, explicitly labelled historical.
Import this helper or pass the API arguments as a JSON object on stdin.
"""

from __future__ import annotations

import hashlib
import html
from html.parser import HTMLParser
import json
import posixpath
import re
import sys
from typing import Any, Mapping

_HASH = re.compile(r"^[a-f0-9]{64}$")
_NOTICE = re.compile(r'<p class="notice">.*?</p>', re.DOTALL)
_LINK = re.compile(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)


def _hash(value: Any, label: str) -> str:
    if not isinstance(value, str) or not _HASH.fullmatch(value):
        raise ValueError(f"{label} must be a lowercase SHA-256 string")
    return value


def _relative_path(value: Any, label: str) -> str:
    if (not isinstance(value, str) or not value or value.startswith("/")
            or "\\" in value or ":" in value or "?" in value or "#" in value
            or any(part in ("", ".", "..") for part in value.split("/"))):
        raise ValueError(f"{label} must be a safe collection-relative file path")
    return posixpath.relpath(value, "ENTRY")


def _single(source: str, old: str, new: str, label: str) -> str:
    if source.count(old) != 1:
        raise ValueError(f"Expected exactly one {label}")
    return source.replace(old, new, 1)


def _route_links(source: str) -> list[str]:
    return [html.unescape(match.group(1)) for match in _LINK.finditer(source)
            if not any(token in match.group(1) for token in
                       ("PACKAGE_ID.txt", "RC10_README.md", "RC10_DERIVATION.json"))]


def rebind_entry(source_text: str, object_id: str,
                 old_ids: Mapping[str, str], new_ids: Mapping[str, str],
                 metadata: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    """Rebind current identity while preserving instructional entry routes.

    Reject unexpected source shapes rather than using a broad RC10 or hash
    replacement. New descriptor files are the caller's responsibility.
    """
    if not isinstance(source_text, str) or not source_text:
        raise ValueError("source_text must be non-empty HTML text")
    if object_id not in old_ids or object_id not in new_ids:
        raise ValueError(f"Missing identity map entry for {object_id}")
    old_id = _hash(old_ids[object_id], "old unit identity")
    new_id = _hash(new_ids[object_id], "new unit identity")
    version = metadata.get("candidate_version")
    if not isinstance(version, str) or not version or "local" not in version:
        raise ValueError("candidate_version must explicitly identify a local candidate")
    if metadata.get("qualification_verdict", "NOT_FINAL") != "NOT_FINAL":
        raise ValueError("ENTRY rebinding cannot promote qualification")
    unit = metadata.get("units", {}).get(object_id)
    if not isinstance(unit, Mapping):
        raise ValueError(f"Missing units metadata for {object_id}")
    id_href = _relative_path(unit.get("package_id_path"), "package_id_path")
    readme_href = _relative_path(unit.get("candidate_readme_path"), "candidate_readme_path")
    derivation_href = _relative_path(unit.get("candidate_derivation_path"), "candidate_derivation_path")
    if len({id_href, readme_href, derivation_href}) != 3:
        raise ValueError("Current identity and two descriptor paths must be distinct")

    old_identity = f"<pre>{old_id}</pre>"
    new_identity = f'<pre data-identity-scope="current-local-candidate">{new_id}</pre>'
    result = _single(source_text, old_identity, new_identity, "displayed unit identity")
    identity_matches = [m for m in _LINK.finditer(result) if m.group(1).endswith("PACKAGE_ID.txt")]
    if len(identity_matches) != 1:
        raise ValueError("Expected exactly one current PACKAGE_ID.txt link")
    identity_link = identity_matches[0].group(0)
    result = _single(result, identity_link,
                     f'<a href="{html.escape(id_href, quote=True)}">Read this local unit PACKAGE_ID.txt</a>',
                     "current unit identity link")
    result = _single(result, "<h2>Package identity</h2>",
                     "<h2>Current local package identity</h2>", "identity heading")

    notices = _NOTICE.findall(result)
    if len(notices) != 1:
        raise ValueError("Expected exactly one ENTRY candidate notice")
    notice = (f'<p class="notice">Candidate {html.escape(version)}. '
              'General qualification remains NOT_FINAL. Build metadata records derivation, not deployment. When publication has occurred, use the owner’s publication receipt to identify the bytes actually published. Work individually and report actual observations. '
              'Published RC10 evidence applies only to the historical bytes for which it was recorded.</p>')
    result = _single(result, notices[0], notice, "candidate notice")

    historical_links = []
    for match in list(_LINK.finditer(result)):
        href = match.group(1)
        if href.endswith("/RC10_README.md"):
            label = "Read preserved historical RC10 provenance"
        elif href.endswith("/RC10_DERIVATION.json"):
            label = "Inspect the preserved historical RC10 derivation"
        else:
            continue
        result = _single(result, match.group(0),
                         f'<a href="{html.escape(html.unescape(href), quote=True)}">{label}</a>',
                         "historical provenance link")
        historical_links.append(html.unescape(href))

    local_scope = (f'<p id="local-candidate-identity-scope"><a href="{html.escape(readme_href, quote=True)}">'
                   'Read the current local candidate scope</a> · '
                   f'<a href="{html.escape(derivation_href, quote=True)}">Inspect the current local derivation</a>. '
                   'Use the current local unit identity above for this candidate. '
                   'Preserved RC10 identities describe earlier bytes and do not qualify these changes.</p>')
    result = _single(result, new_identity, new_identity + local_scope, "local identity insertion point")

    # Exclude the added current descriptor links when checking the original
    # instructional routes. Existing tutorial, form and package start links
    # must remain byte-identical href values in their original order.
    if _route_links(result.replace(local_scope, "", 1)) != _route_links(source_text):
        raise ValueError("An instructional ENTRY route changed unexpectedly")
    for tag in ("title", "h1"):
        pattern = re.compile(rf"<{tag}[^>]*>.*?</{tag}>", re.DOTALL)
        if pattern.findall(result) != pattern.findall(source_text):
            raise ValueError(f"The instructional {tag} changed unexpectedly")
    if old_id != new_id and old_id in result:
        raise ValueError("The old unit hash remains in a current ENTRY page")

    return result, {
        "schema": "webtech-local-entry-rebind/v1",
        "object_id": object_id,
        "candidate_version": version,
        "publication_status": "PUBLICATION_NOT_ASSERTED",
        "qualificationVerdict": "NOT_FINAL",
        "old_unit_package_id": old_id,
        "current_unit_package_id": new_id,
        "identity_changed": old_id != new_id,
        "current_package_id_href": id_href,
        "current_candidate_readme_href": readme_href,
        "current_candidate_derivation_href": derivation_href,
        "historical_provenance_hrefs": historical_links,
        "instructional_routes_preserved": True,
        "title_and_h1_preserved": True,
        "source_sha256": hashlib.sha256(source_text.encode("utf-8")).hexdigest(),
        "candidate_sha256": hashlib.sha256(result.encode("utf-8")).hexdigest(),
        "descriptor_existence_checked": False,
        "current_id_file_contents_checked": False,
        "source_or_candidate_files_written": False,
    }


class _RouteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[dict[str, Any]] = []
        self.table: dict[str, Any] | None = None
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "table":
            if self.table is not None:
                raise ValueError("Nested tables are not supported in route snapshots")
            self.table = {"rows": [], "entry_hrefs": []}
        elif self.table is not None:
            if tag == "tr":
                self.row = []
            elif tag in ("td", "th"):
                self.cell = []
            elif tag == "a" and (values.get("href") or "").startswith("ENTRY/"):
                self.table["entry_hrefs"].append(values["href"])

    def handle_data(self, data: str) -> None:
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in ("td", "th") and self.cell is not None:
            if self.row is not None:
                self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.table is not None:
                self.table["rows"].append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            if self.table["entry_hrefs"]:
                self.tables.append(self.table)
            self.table = None


def route_snapshot(source_text: str) -> list[dict[str, Any]]:
    """Capture table topics and ENTRY routes without publication notices."""
    parser = _RouteParser()
    parser.feed(source_text)
    parser.close()
    return parser.tables


if __name__ == "__main__":
    arguments = json.load(sys.stdin)
    rendered, audit = rebind_entry(**arguments)
    json.dump({"html": rendered, "audit": audit}, sys.stdout, indent=2)
    sys.stdout.write("\n")
