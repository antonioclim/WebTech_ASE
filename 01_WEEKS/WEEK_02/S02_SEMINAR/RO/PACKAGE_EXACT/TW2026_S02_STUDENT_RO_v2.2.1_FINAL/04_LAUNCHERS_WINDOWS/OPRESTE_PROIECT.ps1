[CmdletBinding()]
param([switch]$NonInteractive)
$ErrorActionPreference='Stop';[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd('\')
$TeacherId=Join-Path $Root '08_AUDIT\PACKAGE_ID.txt';$StudentId=Join-Path $Root '05_AUDIT\PACKAGE_ID.txt'
if(Test-Path -LiteralPath $TeacherId){$Id=(Get-Content -LiteralPath $TeacherId -Raw).Trim()}elseif(Test-Path -LiteralPath $StudentId){$Id=(Get-Content -LiteralPath $StudentId -Raw).Trim()}else{Write-Host 'STOP  Missing PACKAGE_ID.txt.' -ForegroundColor Red;exit 2}
$Runtime=Join-Path $env:TEMP ('TW_S02_'+$Id.Substring(0,16));$Control=Join-Path $Runtime 'control.json'
if(-not(Test-Path -LiteralPath $Control)){if(-not $NonInteractive){Write-Host 'No controlled process.'};exit 0}
try{$c=Get-Content -LiteralPath $Control -Raw|ConvertFrom-Json}catch{exit 2}
if(([string]$c.pid)-notmatch '^\d+$'){exit 2}
$p=Get-Process -Id ([int]$c.pid) -ErrorAction SilentlyContinue;if($null -eq $p){Remove-Item $Control -Force -ErrorAction SilentlyContinue;exit 0}
$stop=Join-Path $Runtime ('stop-'+[string]$c.token+'.request');[string]$c.token|Set-Content -LiteralPath $stop -Encoding ASCII
try{Wait-Process -Id ([int]$c.pid) -Timeout 8 -ErrorAction Stop}catch{Write-Host 'STOP  Controlled process did not exit cooperatively.' -ForegroundColor Red;exit 3}
Remove-Item -LiteralPath $Control,(Join-Path $Runtime 'ready.json'),$stop -Force -ErrorAction SilentlyContinue
if(-not $NonInteractive){Write-Host 'PASS  Controlled process stopped.' -ForegroundColor Green}
exit 0
