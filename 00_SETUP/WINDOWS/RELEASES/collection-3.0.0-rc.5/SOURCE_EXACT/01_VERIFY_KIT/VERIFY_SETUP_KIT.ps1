Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Manifest = Join-Path $Root 'SHA256SUMS.txt'
$PidFile = Join-Path $Root 'PACKAGE_ID.txt'
$errors = New-Object System.Collections.Generic.List[string]
if (-not (Test-Path -LiteralPath $Manifest)) { Write-Host 'VERDICT: FAIL - SHA256SUMS.txt missing'; exit 2 }
if (-not (Test-Path -LiteralPath $PidFile)) { Write-Host 'VERDICT: FAIL - PACKAGE_ID.txt missing'; exit 2 }
$expected = @{}
foreach ($line in [IO.File]::ReadAllLines($Manifest)) {
  if ([string]::IsNullOrWhiteSpace($line)) { continue }
  $parts = $line -split '  ',2
  if ($parts.Count -ne 2) { $errors.Add("malformed manifest line: $line") | Out-Null; continue }
  $expected[$parts[1].Replace('/','\')] = $parts[0].ToLowerInvariant()
}
$actual = @{}
foreach ($file in Get-ChildItem -LiteralPath $Root -Recurse -File) {
  $rel = $file.FullName.Substring($Root.Length).TrimStart('\','/')
  if ($rel -in @('SHA256SUMS.txt','PACKAGE_ID.txt')) { continue }
  $actual[$rel] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
}
foreach ($rel in $expected.Keys) {
  if (-not $actual.ContainsKey($rel)) { $errors.Add("missing: $rel") | Out-Null }
  elseif ($actual[$rel] -ne $expected[$rel]) { $errors.Add("hash mismatch: $rel") | Out-Null }
}
foreach ($rel in $actual.Keys) { if (-not $expected.ContainsKey($rel)) { $errors.Add("extra: $rel") | Out-Null } }
$manifestHash = (Get-FileHash -LiteralPath $Manifest -Algorithm SHA256).Hash.ToLowerInvariant()
$storedPid = ([IO.File]::ReadAllText($PidFile)).Trim().ToLowerInvariant()
if ($manifestHash -ne $storedPid) { $errors.Add('PACKAGE_ID mismatch') | Out-Null }
if ($errors.Count -gt 0) {
  Write-Host 'TW2026 SETUP KIT INTEGRITY'
  foreach ($e in $errors) { Write-Host "FAIL: $e" }
  Write-Host 'VERDICT: FAIL_PACKAGE_INTEGRITY'
  exit 2
}
Write-Host "FILES_VERIFIED: $($expected.Count)"
Write-Host "PACKAGE_ID: $storedPid"
Write-Host 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET'
exit 0
