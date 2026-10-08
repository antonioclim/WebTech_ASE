"""Reject missing, failed or inconsistent finite automated evidence.

These bounded receipts never promote the ten general qualification gates,
completed student work, native platform qualification or manual acceptance.
"""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import os
import re
import sys

HERE = Path(__file__).resolve().parent
REFERENCE = 'v24.21.0'
PLAYWRIGHT = '1.62.1'
REQUIRED_OUTCOMES = ('guard', 'python', 'node', 'npm', 'qa', 'classifier', 'fetch',
                     'browser_deps', 'browser_install', 'runtime', 'browser')
EXPECTED = {
    'inputs': ('PUBLIC_INPUTS.json', 'PASS_EXACT_PUBLISHED_INPUTS', 'webtech-local3-hosted-public-inputs/v1'),
    'runtime': ('runtime/runtime_report.json', 'PASS_FINITE_REFERENCE_RUNTIME_CHECKS', 'webtech-local3-reference-runtime-evidence/v1'),
    'browser': ('browser/BROWSER_CHECKS.json', 'PASS_FINITE_AUTOMATED_BROWSER_CHECKS', 'webtech-local3-automated-browser-checks/v1'),
}
FORM_CHECKS = {
    'initial_draft_and_unchecked_confirmations', 'incomplete_completed_print_refused',
    'draft_print_banner_and_full_print_tree', 'valid_file_import_retains_text_resets_confirmations',
    'completion_requires_renewed_manual_checks_and_no_grade', 'material_edit_invalidates_all_confirmations',
    'actual_json_download_matches_current_snapshot', 'exported_json_file_round_trip',
    'malformed_duplicate_key_import_is_nondestructive', 'oversized_import_is_nondestructive',
    'overlong_field_reports_error_and_preserves_input', 'no_page_errors_or_unexpected_network',
}
C02_CHECKS = {'single_active_slide_and_navigation', 'emergency_modal_focus_trap_and_escape_return',
              'actual_keyboard_native_control_activation', 'interactive_widget_feedback_and_narrow_render', 'no_page_errors_or_network'}
S02_CHECKS = {'direct_file_access_truthfully_blocked', 'starter_rendered_observations_320',
             'starter_rendered_observations_768', 'starter_rendered_observations_1280', 'no_unexpected_network_or_page_errors'}


def require(value, message):
    if not value:
        raise ValueError(message)


def safe_file(root, relative):
    require(isinstance(relative, str) and relative and not Path(relative).is_absolute()
            and '\\' not in relative and all(x not in ('', '.', '..') for x in relative.split('/')),
            'Unsafe report-relative path')
    base = root.resolve()
    path = base / relative
    require(path.resolve().is_relative_to(base) and not path.is_symlink() and path.is_file(),
            'Missing, nonregular or escaping evidence file: ' + relative)
    return path


def load(root, relative):
    path = safe_file(root, relative)
    require(path.stat().st_size <= 8_000_000, 'Evidence JSON exceeds bounded read: ' + relative)
    record = json.loads(path.read_text(encoding='utf-8'))
    require(isinstance(record, dict), 'Evidence JSON must be an object: ' + relative)
    return record


def digest(value):
    return isinstance(value, str) and re.fullmatch(r'[0-9a-f]{64}', value) is not None


def hash_map(record, count):
    require(len(record) == count and all(isinstance(k, str) and k and digest(v) for k, v in record.items()),
            'Source hash inventory count or digest differs')
    return record


def validate_inputs(record, config):
    require(record.get('attempts_per_url') == 1, 'One logical attempt per public URL was not recorded')
    rows, profiles = record.get('rows'), config['profiles']
    require(isinstance(rows, list) and len(rows) == len(profiles) == 2, 'Both exact published profiles are required')
    by_name = {row.get('name'): row for row in rows if isinstance(row, dict)}
    require(len(by_name) == len(rows), 'Duplicate or malformed public input rows')
    for profile in profiles:
        row = by_name.get(profile['name'], {})
        require(all(row.get(key) == profile[key] for key in ('name', 'bytes', 'sha256', 'files', 'package_id')),
                'Pinned archive identity differs: ' + profile['name'])
        require(row.get('zip_crc_pass') is True and isinstance(row.get('extracted_root'), str)
                and Path(row['extracted_root']).is_absolute(), 'ZIP CRC or extracted root receipt missing')
    return by_name[profiles[0]['name']]['extracted_root']


def validate_runtime(root, record, input_root, file_count):
    runtime = record.get('runtime', {})
    require(runtime.get('expected') == runtime.get('actual') == REFERENCE, 'Actual runtime differs from the exact reference Node')
    require(all(runtime.get(key) is False for key in ('compatibility_enabled', 'process_version_overridden', 'reference_guards_modified')),
            'Runtime guard or compatibility scope differs')
    require(record.get('input_root') == input_root, 'Runtime used a different authenticated input root')
    cases = record.get('cases')
    require(isinstance(cases, list) and cases and all(isinstance(row, dict) and row.get('status') == 'PASS' for row in cases),
            'Runtime contains failed, absent or malformed finite cases')
    names = [row.get('name') for row in cases]
    require(all(isinstance(name, str) for name in names) and len(names) == len(set(names)), 'Missing or duplicate runtime case names')
    required = {'actual_reference_runtime', 'full_working_copy_matches_input', 'all_38_distinct_learner_targets',
                'all_40_declared_individual_projects_remain_required', 'original_input_collection_unchanged',
                'full_working_copy_restored_byte_for_byte', 'all_38_learner_targets_unchanged',
                'parallel_owned_distinct_ephemeral_ports', 'one_owned_stop_preserves_peer_servers',
                'unrelated_owned_sentinel_socket_preserved', 'parser_body_and_header_receive_deadlines',
                'parser_timeout_preserves_listener', 'parser_deadline_owned_cleanup'}
    required.update(f'S{i:02}_native_reference_boundary_initial' for i in range(1, 15))
    required.update(unit + '_' + label for unit in ('S01', 'S02', 'S04', 'S05', 'S07')
                    for label in ('server_ready', 'starter_HTTP', 'query_same_route', 'held_socket_repeated_signals_bounded_stop', 'owned_port_closed'))
    require(required.issubset(set(names)), 'Required runtime/source/HTTP/lifecycle cases were not all reported')
    require(type(record.get('tests_failed')) is int and record['tests_failed'] == 0
            and type(record.get('tests_passed')) is int and record['tests_passed'] == len(cases), 'Runtime counters differ')
    commands = record.get('commands')
    require(isinstance(commands, list) and commands and all(isinstance(row, dict) and row.get('timed_out') is False
            and row.get('spawn_error') is None and type(row.get('returncode')) is int and row['returncode'] >= 0 for row in commands),
            'Runtime command crashed, timed out or did not execute')
    versions = [row for row in commands if row.get('label') == 'actual_node_version']
    require(len(versions) == 1 and versions[0].get('stdout', '').strip() == REFERENCE and versions[0]['returncode'] == 0,
            'Actual Node version command receipt missing')
    lifecycle = record.get('server_lifecycle')
    require(isinstance(lifecycle, list) and len(lifecycle) >= 9 and all(isinstance(row, dict)
            and row.get('forced_owned_cleanup') is False and row.get('returncode') == 0 for row in lifecycle),
            'Owned process lifecycle is incomplete or required forced cleanup')
    before = hash_map(load(root, 'runtime/inventory.input.before.json'), file_count)
    after = hash_map(load(root, 'runtime/inventory.input.after.json'), file_count)
    copy_before = hash_map(load(root, 'runtime/inventory.copy.before.json'), file_count)
    copy_after = hash_map(load(root, 'runtime/inventory.copy.after.json'), file_count)
    require(before == after == copy_before == copy_after, 'Complete source or restored working copy changed')
    targets_before = hash_map(load(root, 'runtime/learner_targets.before.json'), 38)
    targets_after = hash_map(load(root, 'runtime/learner_targets.after.json'), 38)
    require(targets_before == targets_after and all(before.get(name) == value for name, value in targets_before.items()),
            'Learner target changed or was outside the original inventory')
    return after


def validate_browser(root, record, input_root, input_inventory, file_count):
    require(record.get('actualNode') == record.get('expectedNode') == REFERENCE
            and record.get('actualPlaywright') == record.get('expectedPlaywright') == PLAYWRIGHT,
            'Browser stage actual Node or Playwright version differs')
    require(record.get('inputRoot') == input_root and record.get('exitCode') == 0 and record.get('failures') == [],
            'Browser input, exit status or infrastructure failures differ')
    require(record.get('nativePlatformsQualified') is False and record.get('manualBrowserQualified') is False,
            'Automated browser report asserted native/manual qualification')
    browsers = record.get('browsers')
    require(isinstance(browsers, list) and len(browsers) == 2 and {row.get('name') for row in browsers} == {'chromium', 'firefox'}
            and all(row.get('launched') is True and isinstance(row.get('version'), str) and row['version'] for row in browsers),
            'Both real browser launch/version receipts are required')
    results = record.get('results')
    require(isinstance(results, list) and len(results) == 32, 'Exactly 32 browser cases are required')
    seen, total = set(), 0
    for result in results:
        require(isinstance(result, dict) and result.get('browser') in {'chromium', 'firefox'}, 'Malformed browser result')
        kind = result.get('kind')
        if kind == 'FORM_UI':
            unit = result.get('seminar')
            require(unit in {f'S{i:02}' for i in range(1, 15)}, 'Unknown form seminar')
            expected_checks, expected_status = FORM_CHECKS, 'PASS_FINITE_FORM_UI_CHECKS'
            require(result.get('evidenceClass') == 'SYNTHETIC_AUTOMATED_UI_TEST_NOT_STUDENT_EVIDENCE', 'Form test is not synthetic')
            if result['browser'] == 'chromium':
                pdf = result.get('pdf', {})
                require(pdf.get('evidenceClass') == 'CHROMIUM_HEADLESS_PRINT_LAYOUT_ONLY'
                        and pdf.get('nativeSaveAsDialogueTested') is False and pdf.get('humanLegibilityReview') is False,
                        'Headless PDF receipt or scope differs')
                pdf_path = safe_file(root, 'browser/' + str(pdf.get('path', '')))
                data = pdf_path.read_bytes()
                require(data.startswith(b'%PDF-') and hashlib.sha256(data).hexdigest() == pdf.get('sha256'), 'Headless PDF absent or changed')
        elif kind == 'C02_PRESENTATION_UI':
            unit, expected_checks, expected_status = 'C02', C02_CHECKS, 'PASS_FINITE_C02_UI_CHECKS'
        elif kind == 'S02_STARTER_BROWSER_OBSERVATIONS':
            unit, expected_checks, expected_status = 'S02_OBSERVATIONS', S02_CHECKS, 'PASS_FINITE_S02_STARTER_CHECKS'
        else:
            raise ValueError('Unexpected browser case kind')
        key = (result['browser'], kind, unit)
        require(key not in seen, 'Duplicate browser case')
        seen.add(key)
        checks = result.get('checks')
        require(result.get('status') == expected_status and isinstance(checks, list) and len(checks) == len(expected_checks)
                and {row.get('id') for row in checks} == expected_checks and all(row.get('status') == 'PASS' for row in checks),
                'Failed or omitted browser probes')
        total += len(checks)
    require(type(record.get('failedChecks')) is int and record['failedChecks'] == 0
            and type(record.get('passedChecks')) is int and record['passedChecks'] == total == 356, 'Browser counters differ')
    before = load(root, 'browser/INPUT_INVENTORY_BEFORE.json')
    after = load(root, 'browser/INPUT_INVENTORY_AFTER.json')
    require(before == after and before.get('fileCount') == file_count, 'Browser input inventory changed or missing')
    rows = before.get('rows')
    require(isinstance(rows, list) and len(rows) == file_count and all(isinstance(row, dict) and digest(row.get('sha256'))
            and isinstance(row.get('path'), str) and type(row.get('bytes')) is int and row['bytes'] >= 0 for row in rows),
            'Browser inventory rows malformed')
    mapping = {row['path']: row['sha256'] for row in rows}
    require(len(mapping) == file_count and mapping == input_inventory, 'Browser source differs from authenticated runtime source')
    computed = hashlib.sha256(json.dumps(rows, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    preservation = record.get('inputPreservation', {})
    require(before.get('digest') == computed and preservation.get('beforeDigest') == computed
            and preservation.get('afterDigest') == computed and preservation.get('fileCount') == file_count
            and preservation.get('exact') is True, 'Browser inventory digest or preservation receipt differs')
    owned = load(root, 'browser/S02_OWNED_SERVER.json')
    require(owned.get('actualNode') == REFERENCE and owned.get('startupReady') is True and owned.get('stoppedNormally') is True
            and owned.get('ended') is True and owned.get('outcome', {}).get('code') == 0, 'S02 browser listener lifecycle incomplete')


def validate_controls(root):
    context = load(root, 'WORKFLOW_CONTEXT.json')
    require(context.get('GITHUB_REPOSITORY') == 'antonioclim/WebTech_ASE'
            and context.get('GITHUB_ACTOR') == context.get('GITHUB_TRIGGERING_ACTOR') == 'antonioclim'
            and context.get('GITHUB_REF') == 'refs/heads/main'
            and isinstance(context.get('GITHUB_SHA'), str)
            and context.get('EXPECTED_SOURCE_SHA') == context.get('GITHUB_SHA')
            and re.fullmatch(r'[0-9a-f]{40}', context['GITHUB_SHA']) is not None,
            'Guard context is missing or outside the owner/main scope')
    if os.environ.get('GITHUB_SHA'):
        require(context['GITHUB_SHA'] == os.environ['GITHUB_SHA'], 'Workflow context SHA differs from this summary invocation')
    qa = load(root, 'SOURCE_QA.json')
    require(qa.get('schema') == 'webtech-whole-source-validation/v2'
            and qa.get('status') == 'PASS_STRICT_LOCAL_INTEGRITY_ONLY'
            and qa.get('release_qualified') is False and qa.get('native_acceptance') is False
            and qa.get('actions_dispatched') == 0, 'Strict source QA receipt is missing or exceeded its qualification scope')
    for name, expected in [('NODE_VERSION.txt', REFERENCE), ('NPM_VERSION.txt', '11.19.0')]:
        path = safe_file(root, name)
        require(path.stat().st_size < 100 and path.read_text(encoding='utf-8').strip() == expected,
                'Actual version receipt differs: ' + name)
    package = load(root, 'RESOLVED_PACKAGE.json')
    require(package.get('private') is True and package.get('dependencies') == {'playwright': PLAYWRIGHT},
            'Resolved initial package differs from the single pinned browser dependency')
    lock = load(root, 'RESOLVED_PACKAGE_LOCK.json')
    require(lock.get('lockfileVersion') == 3 and isinstance(lock.get('packages'), dict), 'Generated npm lock receipt is missing')
    require(lock['packages'].get('', {}).get('dependencies') == {'playwright': PLAYWRIGHT}, 'Generated lock root dependency differs')
    for name in ('playwright', 'playwright-core'):
        row = lock['packages'].get('node_modules/' + name, {})
        require(row.get('version') == PLAYWRIGHT
                and row.get('resolved') == f'https://registry.npmjs.org/{name}/-/{name}-{PLAYWRIGHT}.tgz'
                and isinstance(row.get('integrity'), str) and re.fullmatch(r'sha512-[A-Za-z0-9+/]+={0,2}', row['integrity']) is not None,
                'Generated browser lock package identity is missing: ' + name)


def aggregate(root, outcomes):
    stages, records = {}, {}
    try:
        config = json.loads((HERE / 'PUBLISHED_INPUTS.json').read_text(encoding='utf-8'))
        file_count = config['profiles'][0]['files']
    except Exception as error:
        config, file_count = None, None
        stages['configuration'] = {'status': 'INVALID_PINNED_INPUT_CONFIGURATION', 'passed': False, 'error': str(error)}
    for name, (relative, passing_status, schema) in EXPECTED.items():
        try:
            record = load(root, relative)
            qualification = record.get('qualificationVerdict') if name != 'browser' else record.get('qualification')
            require(record.get('schema') == schema and record.get('status') == passing_status, 'Required schema or status differs')
            require(qualification == 'NOT_FINAL' and record.get('qualificationGatesUpdated') is False, 'Qualification scope differs')
            records[name] = record
            stages[name] = {'status': record['status'], 'path': relative, 'passed': True}
        except Exception as error:
            stages[name] = {'status': 'MISSING_FAILED_OR_INVALID_REQUIRED_REPORT', 'path': relative, 'passed': False, 'error': str(error)}
    if config and all(name in records for name in EXPECTED):
        try:
            input_root = validate_inputs(records['inputs'], config)
            stages['inputs']['identity_validation'] = 'PASS'
        except Exception as error:
            input_root = None
            stages['inputs'].update(passed=False, error=str(error), identity_validation='FAIL')
        if input_root:
            try:
                inventory = validate_runtime(root, records['runtime'], input_root, file_count)
                stages['runtime']['receipt_validation'] = 'PASS'
            except Exception as error:
                inventory = None
                stages['runtime'].update(passed=False, error=str(error), receipt_validation='FAIL')
            if inventory:
                try:
                    validate_browser(root, records['browser'], input_root, inventory, file_count)
                    stages['browser']['receipt_validation'] = 'PASS'
                except Exception as error:
                    stages['browser'].update(passed=False, error=str(error), receipt_validation='FAIL')
            else:
                stages['browser'].update(passed=False, error='No authenticated runtime inventory available for browser closure')
        else:
            for name in ('runtime', 'browser'):
                stages[name].update(passed=False, error='No authenticated input identity available')
    if not isinstance(outcomes, dict):
        outcomes = {}
    for name in REQUIRED_OUTCOMES:
        value = outcomes.get(name, 'MISSING_REQUIRED_STEP_OUTCOME')
        stages['workflow_' + name] = {'status': value, 'passed': value == 'success'}
    unknown = set(outcomes) - set(REQUIRED_OUTCOMES)
    if unknown:
        stages['workflow_unknown_outcomes'] = {'status': 'UNEXPECTED_STEP_OUTCOME_KEYS', 'passed': False, 'keys': sorted(unknown)}
    try:
        validate_controls(root)
        stages['workflow_control_receipts'] = {'status': 'PASS_REQUIRED_GUARD_QA_AND_VERSION_RECEIPTS', 'passed': True}
    except Exception as error:
        stages['workflow_control_receipts'] = {'status': 'MISSING_FAILED_OR_INCONSISTENT_CONTROL_RECEIPTS', 'passed': False, 'error': str(error)}
    success = all(row['passed'] for row in stages.values()) and len(stages) == len(EXPECTED) + len(REQUIRED_OUTCOMES) + 1
    return {'schema': 'webtech-local3-hosted-evidence-summary/v1',
            'recorded_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'status': 'PASS_FINITE_HOSTED_EVIDENCE' if success else 'FAIL_OR_INCOMPLETE_HOSTED_EVIDENCE',
            'stages': stages, 'qualificationVerdict': 'NOT_FINAL', 'all_ten_general_gates': 'pending', 'qualificationGatesUpdated': False,
            'limitations': ['Expected unfinished starter assertions are control outcomes, not completed student work.',
                            'Headless PDF output is not a native Save as PDF dialogue, Word or Moodle acceptance.',
                            'Hosted Linux is not native student Windows/macOS, a learner pilot or owner acceptance.'],
            'source_sha': os.environ.get('GITHUB_SHA'), 'run_id': os.environ.get('GITHUB_RUN_ID'), 'run_attempt': os.environ.get('GITHUB_RUN_ATTEMPT')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reports', type=Path, required=True)
    args = parser.parse_args()
    require(args.reports.is_absolute(), '--reports must be absolute')
    args.reports.mkdir(parents=True, exist_ok=True)
    try:
        outcomes = json.loads(os.environ.get('WEBTECH_STAGE_OUTCOMES', '{}'))
    except ValueError:
        outcomes = {}
    record = aggregate(args.reports, outcomes)
    (args.reports / 'SUMMARY.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    lines = ['# LOCAL3 finite hosted evidence', '', record['status'], '',
             'General qualification: **NOT_FINAL**. All ten broad gates remain pending.', '', '| Stage | Status |', '| --- | --- |']
    lines.extend('| ' + name + ' | ' + str(row['status']) + ' |' for name, row in record['stages'].items())
    lines.extend(['', 'Read the retained stage reports and logs before interpreting the result. Expected learner TODO assertions are not solved projects.'])
    markdown = '\n'.join(lines) + '\n'
    (args.reports / 'SUMMARY.md').write_text(markdown, encoding='utf-8')
    step_summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if step_summary:
        with open(step_summary, 'a', encoding='utf-8') as out:
            out.write(markdown)
    print(record['status'])
    return 0 if record['status'] == 'PASS_FINITE_HOSTED_EVIDENCE' else 1


if __name__ == '__main__':
    sys.exit(main())
