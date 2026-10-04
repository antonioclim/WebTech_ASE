#!/usr/bin/env python3
"""S08 pure-data identity checker, authored in Phase 3; no project imports or execution."""
import argparse
import hashlib
import json
import os
import re
import stat
import sys
import unicodedata
from pathlib import Path, PurePosixPath

ASSESSED = frozenset({'projects/p01/student/src/App.jsx', 'projects/p03/student/src/SearchPanel.jsx'})
PREVIEW_COPIES = {
    'teaching/p01-preview/src/App.jsx': 'projects/p01/student/src/App.jsx',
    'teaching/p03-preview/src/SearchPanel.jsx': 'projects/p03/student/src/SearchPanel.jsx',
}
SOURCE_ROOTS = ('projects', 'optional', 'teaching')
GENERATED_NAMES = frozenset({'node_modules', 'dist', '.vite'})
ROW_KEYS = frozenset({'path', 'bytes', 'sha256', 'role'})
REGISTRY_KEYS = frozenset({'schema', 'version', 'phase', 'source_files', 'assessed_editable_paths', 'teaching_copy_policy', 'forbidden_canonical_execution', 'identity_is_runtime_qualification', 'protected_source_roots', 'generated_directory_exclusions'})
FIELD_IDS = ('student_identity', 'package_identity', 'actual_runtime', 'execution_class', 'environment_limit', 'p01_prediction', 'ownership_map', 'fixture', 'edit_boundary', 'p01_completion', 'transition_trace', 'persistence_trace', 'identity_trace', 'baseline_result', 'objective_result', 'regression_result', 'build_result', 'browser_result', 'p01_diff', 'p03_prediction', 'p03_diagnostic', 'p03_patch', 'p03_timeline', 'p03_guards', 'p03_errors', 'p03_checks', 'p03_limits', 'gemini_mode', 'gemini_prompt', 'gemini_claim', 'independent_check', 'verdict', 'correction', 'claim_limit', 'learning_transfer', 'pending_work', 'evidence_index', 'declaration', 'teacher_exception', 'pdf_status', 'seminar_date', 'operating_system', 'browser_tool_versions', 'privacy_check', 'upload_checklist', 'p01_action', 'p01_expected', 'p01_observed', 'p01_difference', 'p01_mechanism', 'p03_action', 'p03_expected', 'p03_observed', 'p03_difference', 'p03_mechanism')
MAX_JSON_BYTES = 2 * 1024 * 1024
MAX_SOURCE_BYTES = 32 * 1024 * 1024


def relative_name(name):
    """Reject unsafe/non-portable names before using them as hash keys or filesystem paths."""
    if not isinstance(name, str) or not name or len(name) > 1024:
        raise ValueError('Relative path must be a non-empty bounded string')
    if any(ord(c) < 32 or ord(c) == 127 for c in name) or any(c in name for c in '\\<>:"|?*'):
        raise ValueError('Unsafe relative path: ' + repr(name))
    rel = PurePosixPath(name)
    if rel.is_absolute() or str(rel) != name or unicodedata.normalize('NFC', name) != name:
        raise ValueError('Path must be canonical relative NFC text: ' + repr(name))
    for part in name.split('/'):
        if not part or part in ('.', '..') or part.endswith((' ', '.')):
            raise ValueError('Unsafe path segment: ' + repr(name))
        if re.fullmatch(r'(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?', part, re.I):
            raise ValueError('Reserved Windows path segment: ' + repr(name))
    return name


def is_symbolic(path):
    # Windows junction/reparse metadata is checked where the standard library exposes it.
    if path.is_symlink():
        return True
    try:
        attributes = path.lstat()
    except FileNotFoundError:
        return False
    return bool(getattr(attributes, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 0))


def safe_file(root, name):
    name = relative_name(name)
    path = root.joinpath(*PurePosixPath(name).parts)
    prefix = root
    if is_symbolic(root):
        raise ValueError('The selected root cannot be a symbolic link')
    for part in PurePosixPath(name).parts:
        prefix = prefix / part
        if is_symbolic(prefix):
            raise ValueError('Symbolic links are not accepted: ' + name)
    if not path.is_file() or not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Missing, non-regular or outside-root file: ' + name)
    return path


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON object key: ' + key)
        result[key] = value
    return result


def load_json(root, name):
    path = safe_file(root, name)
    if path.stat().st_size > MAX_JSON_BYTES:
        raise ValueError('JSON input exceeds the 2 MiB limit: ' + name)
    data = path.read_bytes()
    if len(data) > MAX_JSON_BYTES:
        raise ValueError('JSON input exceeds the 2 MiB limit: ' + name)
    return json.loads(data.decode('utf-8'), object_pairs_hook=unique_object, parse_constant=lambda value: (_ for _ in ()).throw(ValueError('Non-finite JSON value: ' + value)))


def checked_ids(value, label):
    if not isinstance(value, list) or len(value) != 55:
        raise ValueError(label + ' must contain exactly 55 IDs')
    if any(not isinstance(item, str) or not re.fullmatch(r'[a-z][a-z0-9_]*', item) for item in value):
        raise ValueError(label + ' contains an invalid ID type or spelling')
    if len(set(value)) != 55:
        raise ValueError(label + ' contains duplicate IDs')
    return value


def schema_ids(schema):
    if not isinstance(schema, dict) or schema.get('version') != '1.2.0' or type(schema.get('field_count')) is not int or schema.get('field_count') != 55:
        raise ValueError('The form schema must declare version 1.2.0 and field_count 55')
    if 'fields' in schema and 'sections' in schema:
        raise ValueError('Ambiguous form schema layouts are not accepted')
    if 'fields' in schema:
        fields = schema['fields']
        if not isinstance(fields, list):
            raise ValueError('Schema fields must be a list')
    else:
        sections = schema.get('sections')
        if not isinstance(sections, list) or not sections:
            raise ValueError('Schema sections must be a non-empty list')
        fields, section_ids = [], set()
        for section in sections:
            if not isinstance(section, dict) or not isinstance(section.get('id'), str) or not section['id']:
                raise ValueError('Every section needs a string ID')
            if section['id'] in section_ids or not isinstance(section.get('fields'), list):
                raise ValueError('Duplicate section ID or invalid field list')
            section_ids.add(section['id'])
            fields.extend(section['fields'])
    if any(not isinstance(field, dict) or 'id' not in field for field in fields):
        raise ValueError('Every form field must be an object with an ID')
    return checked_ids([field['id'] for field in fields], 'Schema field IDs')


def protected_inventory(root, student_work=False):
    files, exclusions, portable_seen = set(), [], {}
    for source_root in SOURCE_ROOTS:
        base = root.joinpath(*source_root.split('/'))
        if is_symbolic(base) or not base.is_dir():
            raise ValueError('Missing or symbolic protected source root: ' + source_root)
        for current, dirs, names in os.walk(base, followlinks=False):
            current_path = Path(current)
            for part in dirs + names:
                path = current_path / part
                name = relative_name(path.relative_to(root).as_posix())
                if is_symbolic(path):
                    raise ValueError('Symbolic entry inside protected source tree: ' + name)
                portable = name.casefold()
                if portable in portable_seen and portable_seen[portable] != name:
                    raise ValueError('Portable filesystem collision: ' + name)
                portable_seen[portable] = name
                if part in names and not path.is_file():
                    raise ValueError('Non-regular source entry: ' + name)
            kept = []
            for part in dirs:
                if source_root != 'source_reference/v1.1.0' and part in GENERATED_NAMES:
                    if not student_work:
                        raise ValueError('Unexpected generated directory in exact-package mode: ' + (current_path / part).relative_to(root).as_posix())
                    exclusions.append((current_path / part).relative_to(root).as_posix())
                else:
                    kept.append(part)
            dirs[:] = kept
            files.update((current_path / part).relative_to(root).as_posix() for part in names)
    return files, sorted(exclusions)


def validate_registry(registry):
    if not isinstance(registry, dict) or set(registry) - REGISTRY_KEYS:
        raise ValueError('Registry must be an object with recognised top-level keys')
    if registry.get('schema') != 'tw2026.s08.source-bindings.v1' or registry.get('version') != '1.2.0' or registry.get('phase') not in ('2/4', '3/4', '4/4'):
        raise ValueError('Registry schema or version is invalid')
    if registry.get('forbidden_canonical_execution') is not True or registry.get('identity_is_runtime_qualification') is not False:
        raise ValueError('Registry execution/evidence boundary is invalid')
    editable = registry.get('assessed_editable_paths')
    if not isinstance(editable, list) or len(editable) != 2 or any(not isinstance(name, str) for name in editable) or set(editable) != ASSESSED:
        raise ValueError('Exactly the two assessed target paths are required')
    policy = registry.get('teaching_copy_policy')
    expected_pairs = [{'preview': preview, 'assessed': assessed} for preview, assessed in PREVIEW_COPIES.items()]
    if not isinstance(policy, dict) or set(policy) != {'package_mode', 'student_work_mode', 'pairs', 'reported_separately_from_assessed_edits', 'functional_qualification'}:
        raise ValueError('The labelled teaching-copy policy is malformed')
    if policy['package_mode'] != 'EXACT_DISTRIBUTED_STARTER' or policy['student_work_mode'] != 'ONLY_EXACT_ONE_WAY_COPY_OF_CURRENT_PAIRED_ASSESSED_TARGET' or policy['pairs'] != expected_pairs or policy['reported_separately_from_assessed_edits'] is not True or policy['functional_qualification'] is not False:
        raise ValueError('Teaching-copy pairs or evidence boundary differ from the fixed policy')
    if 'protected_source_roots' in registry and registry['protected_source_roots'] != list(SOURCE_ROOTS):
        raise ValueError('Protected source roots differ from the fixed boundary')
    if 'generated_directory_exclusions' in registry and registry['generated_directory_exclusions'] != sorted(GENERATED_NAMES):
        raise ValueError('Generated-directory exclusions differ from the fixed boundary')
    rows = registry.get('source_files')
    if not isinstance(rows, list) or not 1 <= len(rows) <= 4096:
        raise ValueError('Registry source_files must contain 1–4096 rows')
    seen, portable_seen = set(), set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != ROW_KEYS:
            raise ValueError('Each source row requires exactly path, bytes, sha256 and role')
        name = relative_name(row['path'])
        if name in seen or name.casefold() in portable_seen:
            raise ValueError('Duplicate or portable-colliding registry path: ' + name)
        if not any(name.startswith(prefix + '/') for prefix in SOURCE_ROOTS):
            raise ValueError('Bound source is outside the fixed protected source roots: ' + name)
        if not name.startswith('source_reference/v1.1.0/') and any(part in GENERATED_NAMES for part in name.split('/')[:-1]):
            raise ValueError('Generated-directory content must not be claimed as source: ' + name)
        expected_role = 'HISTORICAL_PUBLIC_SOURCE_EXACT' if name.startswith('source_reference/v1.1.0/') else 'ACTIVE_ASSESSED_OR_LABELLED_PREVIEW_SOURCE_EXACT'
        if type(row['bytes']) is not int or not 0 <= row['bytes'] <= MAX_SOURCE_BYTES:
            raise ValueError('Invalid bounded source byte count: ' + name)
        if not isinstance(row['sha256'], str) or not re.fullmatch(r'[0-9a-f]{64}', row['sha256']) or row['role'] != expected_role:
            raise ValueError('Invalid source hash or source role: ' + name)
        seen.add(name)
        portable_seen.add(name.casefold())
    if not (ASSESSED | set(PREVIEW_COPIES)).issubset(seen):
        raise ValueError('Both assessed targets and both paired preview targets must be bound')
    return rows, seen


def file_identity(path):
    if path.stat().st_size > MAX_SOURCE_BYTES:
        raise ValueError('Source file exceeds the 32 MiB limit: ' + str(path))
    data = path.read_bytes()
    if len(data) > MAX_SOURCE_BYTES:
        raise ValueError('Source file exceeds the 32 MiB limit: ' + str(path))
    return data, hashlib.sha256(data).hexdigest()


def verify(root, student_work=False):
    errors, accepted_edits, accepted_preview_copies, checks = [], [], [], []
    try:
        if not isinstance(root, Path) or is_symbolic(root) or not root.is_dir():
            raise ValueError('Root must be an existing non-symbolic directory')
        registry = load_json(root, 'SOURCE_BINDINGS_v1.2.0.json')
        rows, seen = validate_registry(registry)
        actual_source_files, excluded = protected_inventory(root, student_work)
        if seen != actual_source_files:
            errors.extend('Unbound unexpected protected source file: ' + name for name in sorted(actual_source_files - seen))
            errors.extend('Missing protected source file: ' + name for name in sorted(seen - actual_source_files))
        for row in rows:
            name = row['path']
            data, digest = file_identity(safe_file(root, name))
            same = len(data) == row['bytes'] and digest == row['sha256']
            if not same:
                if student_work and name in ASSESSED:
                    accepted_edits.append(name)
                elif student_work and name in PREVIEW_COPIES:
                    paired = PREVIEW_COPIES[name]
                    paired_data, _ = file_identity(safe_file(root, paired))
                    if data == paired_data:
                        accepted_preview_copies.append({'preview_path': name, 'assessed_source_path': paired, 'result': 'EXACT_PAIRED_SOURCE_COPY_ONLY_NO_FUNCTIONAL_PASS'})
                    else:
                        errors.append('Changed preview target is not byte-equal to its saved assessed source: ' + name)
                else:
                    errors.append('Source identity mismatch: ' + name)
        checks.append({'check': 'source_registry_and_protected_tree_coverage', 'bound_files': len(rows), 'generated_directories_excluded_without_validation': excluded, 'accepted_assessed_edits': accepted_edits, 'accepted_preview_copies': accepted_preview_copies})
        expected = load_json(root, 'tools/FORM_FIELD_CONTRACT_v1.2.0.json')
        if not isinstance(expected, dict) or expected.get('version') != '1.2.0' or type(expected.get('field_count')) is not int or expected.get('field_count') != 55 or expected.get('authenticates_answers') is not False:
            raise ValueError('The supplied field contract has an invalid version/count/evidence boundary')
        expected_ids = checked_ids(expected.get('field_ids'), 'Contract field IDs')
        if expected_ids != list(FIELD_IDS):
            raise ValueError('The supplied field contract differs from the fixed normative 55 IDs')
        ids = schema_ids(load_json(root, 'assets/form-schema.json'))
        exact_ids = set(ids) == set(expected_ids)
        if not exact_ids:
            errors.append('Form IDs differ from the exact 55-field contract')
        checks.append({'check': 'form_field_identity', 'field_count': len(ids), 'exact_ID_set_match': exact_ids})
        requirements = load_json(root, 'tools/ENVIRONMENT_REQUIREMENTS.json')
        if not isinstance(requirements, dict) or requirements.get('node_required') != '24.21.0' or requirements.get('npm_required') != '11.19.0' or requirements.get('canonical_runtime_executed_in_production') is not False:
            errors.append('Declared exact toolchain pins or runtime evidence boundary differ from the contract')
        checks.append({'check': 'declared_toolchain_contract', 'observed_runtime': False})
    except (ValueError, KeyError, TypeError, AttributeError, OSError, UnicodeError, RecursionError) as exc:
        errors.append(str(exc))
    return {
        'schema': 'tw2026.s08.data-verification.v1', 'version': '1.2.0',
        'mode': 'STUDENT_WORK_BOUNDARY' if student_work else 'EXACT_PACKAGE',
        'result': 'PASS_DATA_IDENTITY_AND_BOUNDARY_ONLY' if not errors else 'FAIL_DATA_VERIFICATION',
        'checks': checks, 'errors': errors,
        'accepted_assessed_edits': accepted_edits, 'accepted_preview_copies': accepted_preview_copies,
        'limitations': [
            'Hashes, supplied registry and expected-ID file do not authenticate an author or publisher',
            'Bound bytes and protected source-tree coverage are checked; new unbound root/assets files require the separate package manifest',
            'Exact-package mode rejects generated directories; student-work mode excludes unvalidated active node_modules, dist and .vite directories; historical source_reference has no exclusions',
            'No project, JSX parser, React, tests, browser, Gemini, Moodle or PDF-content validation is executed',
            'Accepted assessed edits or paired preview copies do not prove correctness, execution, authenticity or a mark',
            'HTML and DOCX parity requires the separately documented static audit',
            'This is a local bounded file check, not a defence against concurrent filesystem mutation'
        ], 'canonical_code_executed': False, 'network_used': False
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).absolute().parents[1])
    parser.add_argument('--student-work', action='store_true', help='Permit two assessed edits and exact paired preview copies only; no functional PASS')
    args = parser.parse_args()
    if sys.version_info < (3, 9):
        print(json.dumps({'result': 'FAIL_DATA_VERIFICATION', 'errors': ['STOP: an already installed Python 3.9 or later is required'], 'canonical_code_executed': False, 'network_used': False}))
        return 2
    result = verify(args.root.absolute(), args.student_work)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not result['errors'] else 1


if __name__ == '__main__':
    sys.exit(main())
