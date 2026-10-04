#!/usr/bin/env python3
"""Deferred explicit local runtime route; never executed during production."""
import argparse
import shutil
import stat
import subprocess
import sys
from pathlib import Path

def stop(message):
    print('STOP: ' + message, file=sys.stderr)
    return 2

def version_only(path):
    try:
        result = subprocess.run([path, '--version'], cwd=str(Path.home()), shell=False, capture_output=True, text=True, timeout=8)
        return result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None

def is_symbolic(path):
    # Windows junction/reparse metadata is checked where the standard library exposes it.
    if path.is_symlink():
        return True
    try:
        attributes = path.lstat()
    except FileNotFoundError:
        return False
    return bool(getattr(attributes, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 0))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['start', 'test'])
    parser.add_argument('project', choices=['p01', 'p03'], nargs='?')
    parser.add_argument('--authorised-runtime', action='store_true', help='Explicitly identify the separately authorised future runtime route; this flag cannot grant permission')
    args = parser.parse_args()
    if sys.version_info < (3, 9):
        return stop('An already installed Python 3.9 or later is required. No install will run.')
    if not args.project or not args.authorised_runtime:
        return stop('Prepared future route only. After separate runtime authorisation use START or TEST with p01/p03 and --authorised-runtime. No action is requested now.')
    root = Path(__file__).resolve().parents[1]
    project = root / 'projects' / args.project / 'student'
    prefix = root
    for segment in ('projects', args.project, 'student'):
        prefix = prefix / segment
        if is_symbolic(prefix) or not prefix.is_dir():
            return stop('The selected student root is missing or contains a symbolic link. Preserve the error; no repair will run.')
    if not project.resolve().is_relative_to(root.resolve()):
        return stop('The selected student root must remain inside the extracted package.')
    node = shutil.which('node')
    npm = shutil.which('npm')
    if not node or not npm:
        return stop('Installed Node/npm are required. No install or download will run.')
    node_version, npm_version = version_only(node), version_only(npm)
    if not node_version or node_version not in ('24.21.0', 'v24.21.0'):
        return stop('Observed Node --version is absent, unavailable or different from exactly 24.21.0: ' + str(node_version))
    if not npm_version or npm_version != '11.19.0':
        return stop('Observed npm --version is absent, unavailable or different from exactly 11.19.0: ' + str(npm_version))
    entry = project / ('node_modules/vite/bin/vite.js' if args.action == 'start' else 'node_modules/vitest/vitest.mjs')
    if not project.is_dir() or not entry.is_file():
        return stop('The selected project or its already provisioned local tool is missing. No npm, npx or install command will run.')
    prefix = project
    for segment in entry.relative_to(project).parts:
        prefix = prefix / segment
        if is_symbolic(prefix):
            return stop('Local tool entry points and their directories must not be symbolic links.')
    if not entry.resolve().is_relative_to(project.resolve()):
        return stop('Local tool entry points must remain inside the selected project.')
    if args.action == 'start':
        command = [node, str(entry), '--host', '127.0.0.1', '--port', '5173', '--strictPort']
        print('Prepared runtime route: ' + args.project + ' student root. Open only the local URL actually printed. A start is not a functional PASS. Use Ctrl+C to stop.')
    else:
        command = [node, str(entry), 'run']
        print('Prepared runtime route: ' + args.project + ' canonical tests. Preserve actual output, expected objective RED at an incomplete starter and execution limits. No result is predeclared.')
    try:
        return subprocess.run(command, cwd=project, shell=False).returncode
    except OSError as exc:
        return stop(str(exc))

if __name__ == '__main__':
    sys.exit(main())
