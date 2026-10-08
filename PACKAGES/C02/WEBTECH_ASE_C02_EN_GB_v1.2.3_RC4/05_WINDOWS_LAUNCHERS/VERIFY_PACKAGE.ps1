[CmdletBinding()]
param([switch]$Quiet)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd('\')
$ManifestRel='06_AUDIT/SHA256SUMS.txt'
$IdRel='06_AUDIT/PACKAGE_ID.txt'
$Manifest=Join-Path $Root $ManifestRel
function Fail([string]$Reason,[int]$Code=1){if(-not $Quiet){Write-Host ('VERDICT: FAIL_'+$Reason) -ForegroundColor Red};exit $Code}
if(-not(Test-Path -LiteralPath $Manifest -PathType Leaf)){Fail 'MANIFEST_MISSING' 2}
$ManifestBytes=[IO.File]::ReadAllBytes($Manifest)
if($ManifestBytes.Length -eq 0 -or $ManifestBytes[$ManifestBytes.Length-1] -ne 10){Fail 'MANIFEST_FINAL_LF'}
$IdPath=Join-Path $Root $IdRel
if(-not(Test-Path -LiteralPath $IdPath -PathType Leaf)){Fail 'PACKAGE_ID_MISSING' 2}
$Expected=New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
$Seen=New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$Paths=New-Object 'System.Collections.Generic.List[string]'
foreach($Line in Get-Content -LiteralPath $Manifest -Encoding UTF8){
  if($Line -cnotmatch '^([0-9a-f]{64})  (.+)$'){Fail 'MANIFEST_FORMAT'}
  $Hash=$Matches[1];$Rel=$Matches[2]
  if($Rel.StartsWith('/') -or $Rel.EndsWith('/') -or $Rel.Contains('\') -or $Rel.Contains(':') -or $Rel -match '(^|/)\.\.?(/|$)'){Fail 'UNSAFE_MANIFEST_PATH'}
  if($Rel -ceq $ManifestRel){Fail 'MANIFEST_SELF_ENTRY'}
  if(-not $Seen.Add($Rel)){Fail 'DUPLICATE_OR_CASE_COLLISION'}
  $Expected.Add($Rel,$Hash);$Paths.Add($Rel)
}
if($Paths.Count -eq 0){Fail 'MANIFEST_EMPTY'}
$Sorted=$Paths.ToArray();[Array]::Sort($Sorted,[StringComparer]::Ordinal)
for($I=0;$I -lt $Sorted.Length;$I++){if($Sorted[$I] -cne $Paths[$I]){Fail 'NONCANONICAL_MANIFEST_ORDER'}}
$ManifestCanonical=New-Object Text.StringBuilder
foreach($Rel in $Sorted){[void]$ManifestCanonical.Append($Expected[$Rel]+'  '+$Rel+"`n")}
if([Text.Encoding]::UTF8.GetString($ManifestBytes) -cne $ManifestCanonical.ToString()){Fail 'MANIFEST_CANONICAL_BYTES'}
if(-not $Expected.ContainsKey($IdRel)){Fail 'PACKAGE_ID_NOT_MANIFESTED'}
$IdBytes=[IO.File]::ReadAllBytes($IdPath)
$IdText=[Text.Encoding]::UTF8.GetString($IdBytes)
if($IdBytes.Length -ne 65 -or $IdText -cnotmatch '^[0-9a-f]{64}\n$'){Fail 'PACKAGE_ID_FORMAT'}
$Canonical=New-Object Text.StringBuilder
foreach($Rel in $Sorted){if($Rel -cne $IdRel){[void]$Canonical.Append($Expected[$Rel]+'  '+$Rel+"`n")}}
$Sha=[Security.Cryptography.SHA256]::Create()
try{$Derived=([BitConverter]::ToString($Sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Canonical.ToString())))).Replace('-','').ToLowerInvariant()}finally{$Sha.Dispose()}
if($Derived -cne $IdText.TrimEnd("`n")){Fail 'PACKAGE_ID_DERIVATION'}
$Actual=New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
foreach($Item in Get-ChildItem -LiteralPath $Root -Recurse -Force){
  if(($Item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0){Fail 'REPARSE_ENTRY'}
  if(-not $Item.PSIsContainer){$Rel=$Item.FullName.Substring($Root.Length).TrimStart([char[]]@('\','/')).Replace('\','/');$Actual.Add($Rel,$Item.FullName)}
}
if($Actual.Count -ne $Expected.Count+1){Fail 'EXACT_FILE_SET'}
foreach($Rel in $Actual.Keys){if($Rel -cne $ManifestRel -and -not $Expected.ContainsKey($Rel)){Fail 'EXTRA_OR_WRONG_CASE_FILE'}}
foreach($Rel in $Expected.Keys){
  if(-not $Actual.ContainsKey($Rel)){Fail 'MISSING_OR_WRONG_CASE_FILE'}
  if((Get-FileHash -LiteralPath $Actual[$Rel] -Algorithm SHA256).Hash.ToLowerInvariant() -cne $Expected[$Rel]){if(-not $Quiet){Write-Host ('FAIL hash: '+$Rel)};Fail 'PACKAGE_HASH'}
}
if(-not $Quiet){Write-Host 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET_AND_ID' -ForegroundColor Green}
exit 0
