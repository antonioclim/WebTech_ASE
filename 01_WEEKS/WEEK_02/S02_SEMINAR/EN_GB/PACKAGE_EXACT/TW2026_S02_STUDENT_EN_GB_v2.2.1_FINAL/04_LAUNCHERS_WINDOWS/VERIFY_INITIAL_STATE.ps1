[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
$Project=Join-Path $Root '01_PROJECT\RESPONSIVE_CARD_GRID_CANONICAL'
function Require-ExactRuntime {
  $Node=Get-Command node -ErrorAction SilentlyContinue
  if($null -eq $Node){Write-Host 'STOP  Node.js v24.21.0 is required.' -ForegroundColor Red;exit 2}
  $NodeVersion=(& $Node.Source --version | Select-Object -First 1).Trim()
  if($NodeVersion -ne 'v24.21.0'){Write-Host "STOP  Node $NodeVersion; required v24.21.0." -ForegroundColor Red;exit 2}
  $Npm=Get-Command npm.cmd -ErrorAction SilentlyContinue
  if($null -eq $Npm){$Npm=Get-Command npm -ErrorAction SilentlyContinue}
  if($null -eq $Npm){Write-Host 'STOP  npm 11.19.0 is required.' -ForegroundColor Red;exit 2}
  $NpmVersion=(& $Npm.Source --version | Select-Object -First 1).Trim()
  if($NpmVersion -ne '11.19.0'){Write-Host "STOP  npm $NpmVersion; required 11.19.0." -ForegroundColor Red;exit 2}
  return $Node.Source
}
$NodePath=Require-ExactRuntime
Push-Location $Project
try {
  & $NodePath --test --test-reporter=tap tests/baseline.test.js
  if($LASTEXITCODE -ne 0){exit 3}
  $out=& $NodePath --test --test-reporter=tap tests/objective.test.js 2>&1
  $rc=$LASTEXITCODE
  $out|ForEach-Object{Write-Host $_}
  $txt=($out|Out-String)
  $count=[regex]::Matches($txt,'(?m)^not ok\s+\d+').Count
  if($rc -eq 0 -or $count -ne 3){Write-Host "STOP  Objective signature mismatch: exit=$rc failures=$count expected=3." -ForegroundColor Red;exit 5}
  & $NodePath --test --test-reporter=tap tests/regression.test.js
  if($LASTEXITCODE -ne 0){exit 4}
  Write-Host 'VERDICT: PASS_INITIAL_STATE' -ForegroundColor Green
  exit 0
} finally {Pop-Location}
