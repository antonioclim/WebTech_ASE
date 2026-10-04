param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Audit = Join-Path $Root '90_AUDIT'
$ManifestPath = Join-Path $Audit 'IMMUTABLE_MANIFEST.sha256'
$IndexPath = Join-Path $Audit 'FILE_INDEX.csv'
$PackageIdPath = Join-Path $Audit 'PACKAGE_ID.txt'
$MutablePath = Join-Path $Audit 'MUTABLE_PATHS.txt'
function Fail([string]$Message) { Write-Error "STOP_PACKAGE_INTEGRITY $Message"; exit 3 }
function Hash-Bytes([byte[]]$Bytes) { $sha=[Security.Cryptography.SHA256]::Create(); try { (($sha.ComputeHash($Bytes) | ForEach-Object ToString x2) -join '') } finally { $sha.Dispose() } }
function Hash-File([string]$File) { (Get-FileHash -LiteralPath $File -Algorithm SHA256).Hash.ToLowerInvariant() }
$Files = Get-ChildItem -LiteralPath $Root -Recurse -Force -File
$Reparse = Get-ChildItem -LiteralPath $Root -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
if ($Reparse) { Fail "reparse point rejected: $($Reparse[0].FullName)" }
$Actual=@{}
$Case=@{}
$Unicode=@{}
foreach($File in $Files) {
  $Rel=$File.FullName.Substring($Root.Length).TrimStart('\').Replace('\','/')
  if ($Rel -match '(^|/)(\.\.?|CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])([./]|$)' -or $Rel.Split('/') | Where-Object { $_ -match '[ .]$' }) { Fail "unsafe path: $Rel" }
  $Fold=$Rel.ToLowerInvariant(); if($Case.ContainsKey($Fold) -and $Case[$Fold] -ne $Rel){Fail "case collision: $Rel"}; $Case[$Fold]=$Rel
  $Norm=$Rel.Normalize([Text.NormalizationForm]::FormC); if($Unicode.ContainsKey($Norm) -and $Unicode[$Norm] -ne $Rel){Fail "Unicode collision: $Rel"}; $Unicode[$Norm]=$Rel
  $Actual[$Rel]=$File.FullName
}
$Mutable=New-Object 'Collections.Generic.HashSet[string]'
Get-Content -LiteralPath $MutablePath | Where-Object { $_ } | ForEach-Object { [void]$Mutable.Add($_) }
foreach($Rel in $Mutable){if(-not $Actual.ContainsKey($Rel)){Fail "declared mutable path missing: $Rel"}}
$ManifestBytes=[IO.File]::ReadAllBytes($ManifestPath); $IndexBytes=[IO.File]::ReadAllBytes($IndexPath)
$Payload="TW2026-PACKAGE-ID-v2`nmanifest-sha256 $(Hash-Bytes $ManifestBytes)`nfile-index-sha256 $(Hash-Bytes $IndexBytes)`n"
$ExpectedId=Hash-Bytes ([Text.Encoding]::ASCII.GetBytes($Payload)); $RecordedId=(Get-Content -LiteralPath $PackageIdPath -Raw).Trim()
if($RecordedId -ne $ExpectedId){Fail "PACKAGE_ID mismatch expected=$ExpectedId actual=$RecordedId"}
$Manifest=@{}
Get-Content -LiteralPath $ManifestPath | Where-Object { $_ } | ForEach-Object { if($_ -notmatch '^([a-f0-9]{64})  (.+)$'){Fail "bad manifest line: $_"}; if($Manifest.ContainsKey($Matches[2])){Fail "duplicate manifest path: $($Matches[2])"}; $Manifest[$Matches[2]]=$Matches[1] }
$Special=@('90_AUDIT/IMMUTABLE_MANIFEST.sha256','90_AUDIT/FILE_INDEX.csv','90_AUDIT/PACKAGE_ID.txt')
$ExpectedImmutable=@($Actual.Keys | Where-Object { -not $Mutable.Contains($_) -and $_ -notin $Special })
if($Manifest.Count -ne $ExpectedImmutable.Count){Fail 'manifest path count mismatch'}
foreach($Rel in $ExpectedImmutable){if(-not $Manifest.ContainsKey($Rel)){Fail "manifest missing: $Rel"}; if((Hash-File $Actual[$Rel]) -ne $Manifest[$Rel]){Fail "immutable hash mismatch: $Rel"}}
$Index=Import-Csv -LiteralPath $IndexPath
$ExpectedIndex=@($Actual.Keys | Where-Object { $_ -notin @('90_AUDIT/FILE_INDEX.csv','90_AUDIT/PACKAGE_ID.txt') })
if($Index.Count -ne $ExpectedIndex.Count){Fail 'FILE_INDEX path count mismatch'}
$IndexByPath=@{}; foreach($Row in $Index){if($IndexByPath.ContainsKey($Row.path)){Fail "duplicate index path: $($Row.path)"}; $IndexByPath[$Row.path]=$Row}
foreach($Rel in $ExpectedIndex){if(-not $IndexByPath.ContainsKey($Rel)){Fail "FILE_INDEX missing: $Rel"}; $Row=$IndexByPath[$Rel]; $Class=if($Mutable.Contains($Rel)){'mutable'}elseif($Rel -eq '90_AUDIT/IMMUTABLE_MANIFEST.sha256'){'control'}else{'immutable'}; if($Row.classification -ne $Class){Fail "FILE_INDEX class mismatch: $Rel"}; if(-not $Mutable.Contains($Rel)){ $Info=Get-Item -LiteralPath $Actual[$Rel]; if([int64]$Row.bytes -ne $Info.Length -or $Row.sha256 -ne (Hash-File $Actual[$Rel])){Fail "FILE_INDEX metadata mismatch: $Rel"}}}
Write-Output "PASS_PACKAGE_INTEGRITY_EXACT_SET files=$($Actual.Count) immutable=$($Manifest.Count) mutable=$($Mutable.Count)"
Write-Output "PACKAGE_ID=$RecordedId"
exit 0
