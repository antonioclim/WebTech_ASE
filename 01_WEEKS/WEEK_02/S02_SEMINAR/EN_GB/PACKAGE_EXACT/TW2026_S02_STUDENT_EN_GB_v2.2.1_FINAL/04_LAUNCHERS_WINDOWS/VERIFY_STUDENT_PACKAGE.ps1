[CmdletBinding()]
param([switch]$Quiet,[switch]$AllowStudentWork)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd('\')
$ManifestRel='05_AUDIT/SHA256SUMS.txt'
$Manifest=Join-Path $Root ($ManifestRel -replace '/', '\')
$MutableRel='01_PROJECT/RESPONSIVE_CARD_GRID_CANONICAL/public/styles.css'
$AllowStudentWork=$AllowStudentWork.IsPresent

function Out-Line([string]$Kind,[string]$Text){if(-not $Quiet){$c=@{PASS='Green';FAIL='Red';INFO='Cyan'}[$Kind];Write-Host ("{0}  {1}" -f $Kind,$Text) -ForegroundColor $c}}
if(-not(Test-Path -LiteralPath $Manifest -PathType Leaf)){Out-Line FAIL "Missing manifest: $ManifestRel";exit 2}
$expected=@{};$failed=0
foreach($line in Get-Content -LiteralPath $Manifest -Encoding UTF8){if([string]::IsNullOrWhiteSpace($line)-or $line.StartsWith('#')){continue};if($line -notmatch '^([0-9a-fA-F]{64})  (.+)$'){Out-Line FAIL "Invalid manifest line: $line";$failed++;continue};$rel=$Matches[2].Replace('\','/');$expected[$rel]=$Matches[1].ToLowerInvariant()}
$actual=@{}
Get-ChildItem -LiteralPath $Root -Recurse -Force -File | ForEach-Object {$rel=$_.FullName.Substring($Root.Length).TrimStart([char[]]@('\','/')).Replace('\','/');$actual[$rel]=$_.FullName;if(($_.Attributes -band [IO.FileAttributes]::ReparsePoint)-ne 0){Out-Line FAIL "Reparse point forbidden: $rel";$script:failed++}}
$allowed=New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase);foreach($k in $expected.Keys){[void]$allowed.Add($k)};[void]$allowed.Add($ManifestRel)
foreach($k in $expected.Keys){if(-not $actual.ContainsKey($k)){Out-Line FAIL "Missing: $k";$failed++;continue};if($AllowStudentWork -and $k -eq $MutableRel){Out-Line INFO "MUTABLE: $k";continue};$hash=(Get-FileHash -LiteralPath $actual[$k] -Algorithm SHA256).Hash.ToLowerInvariant();if($hash -ne $expected[$k]){Out-Line FAIL "Hash mismatch: $k";$failed++}else{Out-Line PASS $k}}
foreach($k in $actual.Keys){if(-not $allowed.Contains($k)){Out-Line FAIL "EXTRA_FILE: $k";$failed++}}
if($actual.Count -ne $allowed.Count){Out-Line FAIL "Exact count failed: found $($actual.Count), expected $($allowed.Count)";$failed++}
if($failed -gt 0){if(-not $Quiet){Write-Host "`nVERDICT: FAIL_PACKAGE_INTEGRITY_EXACT_SET" -ForegroundColor Red};exit 1}
if(-not $Quiet){if($AllowStudentWork){Write-Host "`nVERDICT: PASS_IMMUTABLE_SET_WITH_STUDENT_WORK_ALLOWED" -ForegroundColor Green}else{Write-Host "`nVERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET" -ForegroundColor Green};Write-Host "Files: $($actual.Count)"}
exit 0
