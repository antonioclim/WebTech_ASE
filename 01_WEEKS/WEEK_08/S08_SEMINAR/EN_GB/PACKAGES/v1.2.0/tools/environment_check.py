#!/usr/bin/env python3
"""Report declared requirements and local tool presence; optional explicit version-only probes."""
import argparse
import json
import platform
import shutil
import subprocess
import sys
from pathlib import Path

def probe(path):
    if path is None:
        return {'status': 'NOT_FOUND', 'raw': None, 'matches_declared_version': None}
    try:
        # Fixed version argument, no shell, no project working directory and no package install.
        result = subprocess.run([path, '--version'], cwd=str(Path.home()), shell=False, capture_output=True, text=True, timeout=8)
        if result.returncode != 0:
            return {'status': 'PROBE_FAILED', 'raw': result.stdout.strip(), 'matches_declared_version': None}
        return {'status': 'OBSERVED_VERSION_OUTPUT', 'raw': result.stdout.strip()}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {'status': 'PROBE_UNAVAILABLE', 'raw': None, 'reason': str(exc), 'matches_declared_version': None}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--probe-installed-versions', action='store_true', help='Explicit future version-only subprocesses; never a project command')
    args = parser.parse_args()
    if sys.version_info < (3, 9):
        print('STOP: an already installed Python 3.9 or later is required.', file=sys.stderr)
        return 2
    try:
        requirement_path = Path(__file__).absolute().parent / 'ENVIRONMENT_REQUIREMENTS.json'
        if requirement_path.is_symlink() or not requirement_path.is_file() or requirement_path.stat().st_size > 65536:
            raise ValueError('The local requirement file is missing, symbolic or oversized')
        requirements = json.loads(requirement_path.read_text(encoding='utf-8'))
        if not isinstance(requirements, dict) or requirements.get('version') != '1.2.0' or requirements.get('node_required') != '24.21.0' or requirements.get('npm_required') != '11.19.0' or requirements.get('canonical_runtime_executed_in_production') is not False or requirements.get('install_or_network_authorised_by_this_file') is not False:
            raise ValueError('Declared exact pins or execution boundaries are invalid')
    except (OSError, ValueError, UnicodeError) as exc:
        print('STOP: invalid declared requirement data: ' + str(exc), file=sys.stderr)
        return 2
    tools = {}
    for name, expected in [('node', '24.21.0'), ('npm', '11.19.0')]:
        path = shutil.which(name)
        observation = probe(path) if args.probe_installed_versions else {'status': 'PRESENCE_ONLY_VERSION_UNOBSERVED', 'raw': None, 'matches_declared_version': None}
        observation['path_found'] = path is not None
        if observation['status'] == 'OBSERVED_VERSION_OUTPUT':
            observation['matches_declared_version'] = observation['raw'] in ([expected, 'v' + expected] if name == 'node' else [expected])
        tools[name] = observation
    output = {
        'schema': 'tw2026.s08.environment-report.v1',
        'requirements': requirements,
        'python_observed': platform.python_version(),
        'operating_system_observed': platform.system(),
        'tools': tools,
        'explicit_version_probes_requested': args.probe_installed_versions,
        'project_commands_executed': 0,
        'installs_or_network_requested': 0,
        'browser_ui_observed': False,
        'result': 'REPORT_ONLY_NO_RUNTIME_ACCEPTANCE',
        'stop_rule': 'Stop before project execution if a required version is absent, unknown or different from its declared exact version. Preserve raw evidence and use the teacher exception route. Do not install or silently change versions.'
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    sys.exit(main())
