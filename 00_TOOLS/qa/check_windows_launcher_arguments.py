#!/usr/bin/env python3
"""Portable regression model for the S02 cmd-to-PowerShell root argument.

This models documented Microsoft backslash/quote rules and checks the selected
launcher. It does not execute cmd.exe or PowerShell and cannot qualify Windows.
"""
from pathlib import Path
import json
import ntpath
import re

ROOT = Path(__file__).resolve().parents[2]
REFERENCE = 'https://learn.microsoft.com/en-us/cpp/c-language/parsing-c-command-line-arguments?view=msvc-170'


def arguments(text: str) -> list[str]:
    """Parse ordinary arguments after argv[0], using Microsoft's quote rules."""
    result = []
    position = 0
    while position < len(text):
        while position < len(text) and text[position] in ' \t':
            position += 1
        if position == len(text):
            break
        quoted = False
        value = []
        while position < len(text):
            if text[position] in ' \t' and not quoted:
                break
            backslashes = 0
            while position < len(text) and text[position] == '\\':
                backslashes += 1
                position += 1
            if position < len(text) and text[position] == '"':
                value.extend('\\' * (backslashes // 2))
                if backslashes % 2:
                    value.append('"')
                    position += 1
                elif quoted and position + 1 < len(text) and text[position + 1] == '"':
                    value.append('"')
                    position += 2
                else:
                    quoted = not quoted
                    position += 1
            else:
                value.extend('\\' * backslashes)
                if position < len(text):
                    if text[position] in ' \t' and not quoted:
                        break
                    value.append(text[position])
                    position += 1
        result.append(''.join(value))
    return result


def check(launcher: bytes) -> dict:
    rows = []
    examples = [
        ('"a b c" d e', ['a b c', 'd', 'e']),
        ('"ab\\"c" "\\\\" d', ['ab"c', '\\', 'd']),
        ('a\\\\\\b d"e f"g h', ['a\\\\\\b', 'de fg', 'h']),
        ('a\\\\\\"b c d', ['a\\"b', 'c', 'd']),
        ('a\\\\\\\\"b c" d e', ['a\\\\b c', 'd', 'e']),
        ('a"b"" c d', ['ab" c d']),
    ]
    for command, expected in examples:
        assert arguments(command) == expected, (command, arguments(command), expected)
        rows.append({'case': 'Microsoft documented parser example', 'pass': True})
    roots = [
        'D:\\#course-space\\Downloads\\Acceptance kit RC2\\STUDENT_MATERIALS\\PACKAGES\\S02\\',
        'C:\\Users\\Student Name\\Web course\\S02\\',
        'D:\\#cohort\\S02\\',
        'C:\\Users\\Étudiant\\Web\\S02\\',
        'D:\\',
    ]
    text = launcher.decode('ascii')
    matches = re.findall(r'-Root\s+"([^"\r\n]+)"', text)
    assert matches == ['%~dp0.'], 'Selected launcher must use the reviewed terminal-dot root argument'
    assert b'\n' not in launcher.replace(b'\r\n', b''), 'Preserve CRLF in Windows launcher'
    for root in roots:
        broken = arguments('-Root "' + root + '"')
        fixed = arguments('-Root "' + matches[0].replace('%~dp0', root) + '"')
        assert broken == ['-Root', root[:-1] + '"'], broken
        assert fixed == ['-Root', root + '.'], fixed
        assert '"' not in fixed[1]
        assert ntpath.normpath(fixed[1]) == ntpath.normpath(root)
        rows.append({'case': 'Old argument reproduces terminal quote; new argument preserves and normalises directory', 'pass': True})
    assert 'Resolve-Path' not in text
    assert 'exit /b %errorlevel%' in text.lower()
    rows.append({'case': 'Launcher preserves child exit code', 'pass': True})
    return {'schema': 'webtech-ase-windows-argument-model-qa-v1',
            'verdict': 'PASS_PORTABLE_ARGUMENT_MODEL', 'cases_passed': len(rows),
            'reference': REFERENCE, 'checks': rows,
            'native_windows_executed': False, 'qualification_gates_closed': 0,
            'limit': 'A documented argument model and source check do not prove actual PowerShell or cmd.exe operation.'}


if __name__ == '__main__':
    registry = json.loads((ROOT / '90_RELEASES/CURRENT_OBJECTS.json').read_text())
    obj = next(row for row in registry['objects'] if row['id'] == 'S02')
    print(json.dumps(check((ROOT / obj['path'] / 'VERIFY_PACKAGE.cmd').read_bytes()), indent=2))
