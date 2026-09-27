[CmdletBinding()]
param([switch]$Quiet)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd('\')
$ManifestRel='06_AUDIT/SHA256SUMS.txt'
$Manifest=Join-Path $Root ($ManifestRel -replace '/', '\')
function Out-State([string]$Kind,[string]$Text){ if(-not $Quiet){$Colour=@{PASS='Green';FAIL='Red'}[$Kind];Write-Host ("{0}  {1}" -f $Kind,$Text) -ForegroundColor $Colour}}
if(-not(Test-Path -LiteralPath $Manifest -PathType Leaf)){Out-State 'FAIL' 'Manifest missing';exit 2}
$Expected=@{};$Failed=0
foreach($Line in Get-Content -LiteralPath $Manifest -Encoding UTF8){if([string]::IsNullOrWhiteSpace($Line)-or $Line.StartsWith('#')){continue};if($Line -notmatch '^([0-9a-fA-F]{64})  (.+)$'){Out-State 'FAIL' ('Invalid line: '+$Line);$Failed++;continue};$Expected[$Matches[2].Replace('\','/')]=$Matches[1].ToLowerInvariant()}
$Actual=@{}
Get-ChildItem -LiteralPath $Root -Recurse -Force -File|ForEach-Object{$Rel=$_.FullName.Substring($Root.Length).TrimStart([char[]]@('\','/')).Replace('\','/');$Actual[$Rel]=$_.FullName}
$Allowed=New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase);foreach($Key in $Expected.Keys){[void]$Allowed.Add($Key)};[void]$Allowed.Add($ManifestRel)
foreach($Key in $Expected.Keys){if(-not $Actual.ContainsKey($Key)){Out-State 'FAIL' ('Missing: '+$Key);$Failed++;continue};$Hash=(Get-FileHash -LiteralPath $Actual[$Key] -Algorithm SHA256).Hash.ToLowerInvariant();if($Hash -ne $Expected[$Key]){Out-State 'FAIL' ('Wrong hash: '+$Key);$Failed++}else{Out-State 'PASS' $Key}}
foreach($Key in $Actual.Keys){if(-not $Allowed.Contains($Key)){Out-State 'FAIL' ('EXTRA_FILE: '+$Key);$Failed++}}
if($Failed -gt 0){if(-not $Quiet){Write-Host "`nVERDICT: FAIL_PACKAGE_INTEGRITY_EXACT_SET" -ForegroundColor Red};exit 1}
if(-not $Quiet){Write-Host "`nVERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET" -ForegroundColor Green}
exit 0
