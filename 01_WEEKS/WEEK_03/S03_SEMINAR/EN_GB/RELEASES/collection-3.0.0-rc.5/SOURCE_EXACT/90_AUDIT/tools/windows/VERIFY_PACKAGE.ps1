[CmdletBinding()]param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference='Stop'; [Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath $Root).Path.TrimEnd('\\');$audit=Join-Path $Root '90_AUDIT';$manifest=Join-Path $audit 'IMMUTABLE_MANIFEST.sha256';$idfile=Join-Path $audit 'PACKAGE_ID.txt';$mutableFile=Join-Path $audit 'MUTABLE_PATHS.txt'
function Hash([string]$p){(Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLowerInvariant()}
if(!(Test-Path -LiteralPath $manifest) -or !(Test-Path -LiteralPath $idfile) -or !(Test-Path -LiteralPath $mutableFile)){Write-Error 'Package identity files are missing.';exit 2}
$expectedId=(Get-Content -LiteralPath $idfile -Raw).Trim();$actualId=Hash $manifest;if($expectedId -ne $actualId){Write-Error 'PACKAGE_ID mismatch.';exit 2}
$expected=@{};Get-Content -LiteralPath $manifest | ForEach-Object {if($_){if($_ -notmatch '^([0-9a-f]{64})  (.+)$'){Write-Error "Malformed manifest: $_";exit 2};$expected[$Matches[2]]=$Matches[1]}}
$mutable=@();Get-Content -LiteralPath $mutableFile | ForEach-Object {if($_.Trim()){$mutable+=$_.Trim()}}
$actual=@();Get-ChildItem -LiteralPath $Root -File -Recurse -Force | ForEach-Object {$rel=$_.FullName.Substring($Root.Length+1).Replace('\\','/');$actual+=$rel}
$special=@('90_AUDIT/IMMUTABLE_MANIFEST.sha256','90_AUDIT/PACKAGE_ID.txt');$allow=@($expected.Keys)+$mutable+$special
$bad=$false;foreach($rel in $expected.Keys){$p=Join-Path $Root ($rel.Replace('/','\\'));if(!(Test-Path -LiteralPath $p)){Write-Host "MISSING  $rel";$bad=$true}elseif((Hash $p) -ne $expected[$rel]){Write-Host "MODIFIED $rel";$bad=$true}}
foreach($rel in $actual){if($allow -notcontains $rel){Write-Host "EXTRA    $rel";$bad=$true}}
foreach($rel in $allow){if($actual -notcontains $rel){Write-Host "MISSING  $rel";$bad=$true}}
if($bad){Write-Host 'VERDICT: STOP_PACKAGE_INTEGRITY';exit 2};Write-Host "PACKAGE_ID: $expectedId";Write-Host 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET';exit 0
