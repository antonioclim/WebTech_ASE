Set-StrictMode -Version 2.0
$ErrorActionPreference='Stop'
$Root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$node=(Get-Command node.exe -ErrorAction SilentlyContinue)
if (-not $node) { Write-Host 'VERDICT: FAIL - node.exe not found'; exit 2 }
& $node.Source (Join-Path $Root '02_PREFLIGHT\PROBE_LOCALHOST.mjs')
exit $LASTEXITCODE
