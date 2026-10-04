#!/usr/bin/env python3
"""Resolve assets locally; this command never publishes or starts a workflow."""
from __future__ import annotations

import argparse
import zipfile
from pathlib import Path

from build_week_bundle import verify
from release_contract import ROOT, read_plan, repo_path, selection, sha, state, validate_week


def emit(path: Path, key: str, value: str) -> None:
    if '\n' in value or '\r' in value:
        raise ValueError(f'Unsafe multiline GitHub output: {key}')
    with path.open('a', encoding='utf-8') as stream:
        stream.write(f'{key}={value}\n')


def gate_passes(value) -> bool:
    return value is True or value == 'pass' or (isinstance(value, dict) and value.get('status') == 'pass')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--week', required=True)
    parser.add_argument('--language', help='Select one language; default: all languages declared for this week')
    parser.add_argument('--github-output', type=Path, required=True)
    parser.add_argument('--allow-preview', action='store_true', help='Resolve preview assets for review, retaining pending gates and draft/prerelease status')
    args = parser.parse_args()
    try:
        plan = read_plan()
        selected = list(selection(plan, args.week, args.language))
        week, _, entry, _ = selected[0]
        validate_week(plan, week, entry)
        qualification = state(plan, entry)
        required = qualification['required_gates'] or []
        gates = qualification['gates'] or {}
        if not isinstance(required, list) or not isinstance(gates, dict):
            raise ValueError('required_gates must be a list and gates a map')
        pending = [str(name) for name in required if not gate_passes(gates.get(name))]
        preview = qualification['status'] != 'final' or qualification['draft'] is True or qualification['prerelease'] is True
        if pending and qualification['status'] == 'final':
            raise ValueError(f'A final release cannot have pending required gates: {pending}; --allow-preview cannot bypass this inconsistency')
        if args.allow_preview and pending and qualification['draft'] is not True:
            raise ValueError(f'A preview with pending gates must explicitly declare draft: true: {pending}')
        if not args.allow_preview and (preview or pending):
            raise ValueError(f'Release is not publication-qualified: status={qualification["status"]}, pending gates={pending}. --allow-preview resolves assets only for review.')
        assets = []
        for _, language, _, item in selected:
            verify(week, language, item, plan, entry)
            package = repo_path(item['bundle'])
            side = Path(str(package) + '.sha256')
            if sha(package) not in side.read_text(encoding='utf-8'):
                raise ValueError(f'Sidecar mismatch: {package}')
            for path in (package, side):
                rel = path.relative_to(ROOT).as_posix()
                if any(c.isspace() for c in rel):
                    raise ValueError('Release asset paths cannot contain whitespace')
                assets.append(rel)
        notes = repo_path(entry['notes'])
        if not notes.is_file():
            raise ValueError(f'Missing release notes: {entry["notes"]}')
        # All checks finish before writing any workflow output.
        outputs = {'tag': entry['tag'], 'title': entry['title'], 'notes': entry['notes'],
                   'assets': ' '.join(assets), 'draft': str(bool(qualification['draft'])).lower(),
                   'prerelease': str(bool(qualification['prerelease'])).lower(),
                   'status': str(qualification['status']), 'pending_gates': ','.join(pending)}
        for key, value in outputs.items():
            emit(args.github_output, key, value)
        print(f'RESOLVED_ASSETS: {entry["tag"]}; status={qualification["status"]}; pending_gates={pending}; no publication performed')
        return 0
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as exc:
        parser.exit(2, f'FAIL_RELEASE_RESOLUTION: {exc}\n')


if __name__ == '__main__':
    raise SystemExit(main())
