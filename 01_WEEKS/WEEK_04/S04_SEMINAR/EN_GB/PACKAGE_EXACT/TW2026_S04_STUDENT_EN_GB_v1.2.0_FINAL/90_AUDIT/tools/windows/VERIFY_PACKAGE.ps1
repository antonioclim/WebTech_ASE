[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$Root)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')
$Audit = Join-Path $Root '90_AUDIT'
$Manifest = Join-Path $Audit 'IMMUTABLE_MANIFEST.sha256'
$IdFile = Join-Path $Audit 'PACKAGE_ID.txt'
$Mutable = Join-Path $Audit 'MUTABLE_PATHS.txt'

foreach ($required in @($Manifest, $IdFile, $Mutable)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
    Write-Error "STOP: required identity file is missing: $required"
    exit 2
  }
}

$sha = [Security.Cryptography.SHA256]::Create()
try {
  $manifestBytes = [IO.File]::ReadAllBytes($Manifest)
  $calculatedId = ([BitConverter]::ToString($sha.ComputeHash($manifestBytes))).Replace('-', '').ToLowerInvariant()
} finally {
  $sha.Dispose()
}
$expectedId = (Get-Content -LiteralPath $IdFile -Raw).Trim()
if ($calculatedId -ne $expectedId) {
  [ordered]@{ verdict = 'STOP_PACKAGE_ID'; expected = $expectedId; actual = $calculatedId } | ConvertTo-Json
  exit 2
}

$expected = @{}
Get-Content -LiteralPath $Manifest | ForEach-Object {
  if ($_ -match '^([0-9a-f]{64})  (.+)$') { $expected[$Matches[2]] = $Matches[1] }
  elseif ($_.Trim()) { throw "Malformed manifest line: $_" }
}
$mutableSet = @{}
Get-Content -LiteralPath $Mutable | ForEach-Object {
  if ($_.Trim()) { $mutableSet[$_.Trim()] = $true }
}
$special = @{
  '90_AUDIT/IMMUTABLE_MANIFEST.sha256' = $true
  '90_AUDIT/PACKAGE_ID.txt' = $true
}

$actual = @{}
$reparsePoints = @()
Get-ChildItem -LiteralPath $Root -Force -Recurse | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
  if (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $reparsePoints += $rel }
  if (-not $_.PSIsContainer) { $actual[$rel] = $_.FullName }
}

$extra = @($actual.Keys | Where-Object {
  (-not $expected.ContainsKey($_)) -and (-not $mutableSet.ContainsKey($_)) -and (-not $special.ContainsKey($_))
})
$requiredPaths = @($expected.Keys) + @($mutableSet.Keys) + @($special.Keys)
$missing = @($requiredPaths | Where-Object { -not $actual.ContainsKey($_) })
$modified = @()
foreach ($rel in $expected.Keys) {
  if ($actual.ContainsKey($rel)) {
    $actualHash = (Get-FileHash -LiteralPath $actual[$rel] -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $expected[$rel]) { $modified += $rel }
  }
}

if ($extra.Count -or $missing.Count -or $modified.Count -or $reparsePoints.Count) {
  [ordered]@{
    verdict = 'STOP_PACKAGE_INTEGRITY'
    extra = @($extra | Sort-Object)
    missing = @($missing | Sort-Object)
    modified = @($modified | Sort-Object)
    reparsePoints = @($reparsePoints | Sort-Object)
  } | ConvertTo-Json -Depth 5
  exit 2
}

[ordered]@{
  verdict = 'PASS_PACKAGE_INTEGRITY_EXACT_SET'
  packageId = $expectedId
  immutableFiles = $expected.Count
  mutableFiles = $mutableSet.Count
  actualFiles = $actual.Count
} | ConvertTo-Json
exit 0
