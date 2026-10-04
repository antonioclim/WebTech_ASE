[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')
$Manifest = Join-Path $Root '90_AUDIT\IMMUTABLE_MANIFEST.sha256'
$IdFile = Join-Path $Root '90_AUDIT\PACKAGE_ID.txt'
$MutableFile = Join-Path $Root '90_AUDIT\MUTABLE_PATHS.txt'
if (-not (Test-Path -LiteralPath $Manifest) -or -not (Test-Path -LiteralPath $IdFile) -or -not (Test-Path -LiteralPath $MutableFile)) {
  Write-Host 'STOP: package identity files are missing.' -ForegroundColor Red
  exit 2
}
$ExpectedId = (Get-Content -LiteralPath $IdFile -Raw).Trim()
$ActualId = (Get-FileHash -LiteralPath $Manifest -Algorithm SHA256).Hash.ToLowerInvariant()
if ($ExpectedId -ne $ActualId) { Write-Host 'STOP: PACKAGE_ID mismatch.' -ForegroundColor Red; exit 2 }
$Expected = @{}
foreach ($Line in Get-Content -LiteralPath $Manifest) {
  if ([string]::IsNullOrWhiteSpace($Line)) { continue }
  if ($Line -notmatch '^([0-9a-f]{64})  (.+)$') { Write-Host "STOP: malformed manifest line: $Line" -ForegroundColor Red; exit 2 }
  $Expected[$Matches[2]] = $Matches[1]
}
$Mutable = @(Get-Content -LiteralPath $MutableFile | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$Allowed = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($Path in $Expected.Keys) { [void]$Allowed.Add($Path) }
foreach ($Path in $Mutable) { [void]$Allowed.Add($Path) }
[void]$Allowed.Add('90_AUDIT/IMMUTABLE_MANIFEST.sha256')
[void]$Allowed.Add('90_AUDIT/PACKAGE_ID.txt')
$Failed = $false
foreach ($Path in $Expected.Keys) {
  $Full = Join-Path $Root ($Path -replace '/', '\')
  if (-not (Test-Path -LiteralPath $Full -PathType Leaf)) { Write-Host "MISSING  $Path" -ForegroundColor Red; $Failed=$true; continue }
  $Hash = (Get-FileHash -LiteralPath $Full -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($Hash -ne $Expected[$Path]) { Write-Host "MODIFIED $Path" -ForegroundColor Red; $Failed=$true }
}
$Actual = Get-ChildItem -LiteralPath $Root -Recurse -Force -File | ForEach-Object {
  $_.FullName.Substring($Root.Length + 1).Replace('\','/')
}
foreach ($Path in $Actual) { if (-not $Allowed.Contains($Path)) { Write-Host "EXTRA    $Path" -ForegroundColor Red; $Failed=$true } }
foreach ($Path in $Allowed) { if ($Actual -notcontains $Path) { Write-Host "MISSING  $Path" -ForegroundColor Red; $Failed=$true } }
$Reparse = Get-ChildItem -LiteralPath $Root -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
if ($Reparse) { $Reparse | ForEach-Object { Write-Host "REPARSE  $($_.FullName)" -ForegroundColor Red }; $Failed=$true }
if ($Failed) { Write-Host 'VERDICT: STOP_PACKAGE_INTEGRITY' -ForegroundColor Red; exit 2 }
Write-Host "PACKAGE_ID: $ExpectedId" -ForegroundColor Cyan
Write-Host 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET' -ForegroundColor Green
exit 0
