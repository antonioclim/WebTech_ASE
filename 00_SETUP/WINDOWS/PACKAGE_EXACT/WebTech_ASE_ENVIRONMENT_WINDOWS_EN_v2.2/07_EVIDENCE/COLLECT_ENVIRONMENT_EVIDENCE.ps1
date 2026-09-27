Set-StrictMode -Version 2.0
$ErrorActionPreference='Stop'
$Root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Stage='DAY0';$OutputRoot=Join-Path $env:USERPROFILE 'TW2026_EVIDENCE';$KitsDir=$null
for($i=0;$i -lt $args.Count;$i++){
  $a=[string]$args[$i]
  if($a -eq '--stage' -and $i+1 -lt $args.Count){$i++;$Stage=([string]$args[$i]).ToUpperInvariant()}
  elseif($a -eq '--output' -and $i+1 -lt $args.Count){$i++;$OutputRoot=[string]$args[$i]}
  elseif($a -eq '--kits-dir' -and $i+1 -lt $args.Count){$i++;$KitsDir=[string]$args[$i]}
}
$stamp=Get-Date -Format 'yyyyMMdd_HHmmss'
$temp=Join-Path ([IO.Path]::GetTempPath()) "TW2026_ENV_$stamp"
New-Item -ItemType Directory -Path $temp -Force | Out-Null
New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
try {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root '01_VERIFY_KIT\VERIFY_SETUP_KIT.ps1') *>&1 | Out-File (Join-Path $temp 'kit_integrity.txt') -Encoding utf8
  $preArgs=@('--stage',$Stage,'--format','json','--redact')
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root '02_PREFLIGHT\CHECK_TW2026_ENVIRONMENT.ps1') @preArgs *>&1 | Out-File (Join-Path $temp 'preflight.json') -Encoding utf8
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root '03_DIAGNOSTICS\DIAGNOSE_PATH.ps1') *>&1 | ForEach-Object { $_ -replace [regex]::Escape($env:USERPROFILE),'<HOME>' -replace [regex]::Escape($env:USERNAME),'<USER>' } | Out-File (Join-Path $temp 'path_diagnostic.txt') -Encoding utf8
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root '03_DIAGNOSTICS\TEST_LOCALHOST.ps1') *>&1 | Out-File (Join-Path $temp 'localhost.txt') -Encoding utf8
  if($KitsDir){ & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root '08_WEEK01_02_COMPATIBILITY\CHECK_WEEK01_02_KITS.ps1') --kits-dir $KitsDir *>&1 | Out-File (Join-Path $temp 'week01_02_kits.txt') -Encoding utf8 }
  [ordered]@{schema='tw2026.environment.evidence.v2';collectedAt=(Get-Date).ToString('o');stage=$Stage;os=[Environment]::OSVersion.VersionString;architecture=$env:PROCESSOR_ARCHITECTURE;machine='<REDACTED>';user='<REDACTED>';privacy='No credentials or browser profiles collected.'} | ConvertTo-Json | Out-File (Join-Path $temp 'metadata.json') -Encoding utf8
  $zip=Join-Path $OutputRoot "TW2026_ENVIRONMENT_EVIDENCE_WINDOWS_$stamp.zip"
  Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $zip -Force
  Write-Host "Evidence ZIP: $zip"
} finally {
  if(Test-Path -LiteralPath $temp){Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue}
}
