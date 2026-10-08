[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$Root=(Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
$Verify=Join-Path $PSScriptRoot 'VERIFY_PACKAGE.ps1'
$Presentation=Join-Path $Root '01_PRESENTATION\COURSE_02_SEMANTIC_HTML_CSS_RESPONSIVE_UI_AND_ACCESSIBILITY_60_MIN_INTERACTIVE_v1.1_EN_GB.html'
& $Verify -Quiet
if ($LASTEXITCODE -ne 0) { Write-Host 'STOP  Package verification failed.' -ForegroundColor Red; exit 2 }
if (-not (Test-Path -LiteralPath $Presentation -PathType Leaf)) { Write-Host 'STOP  Presentation missing.' -ForegroundColor Red; exit 2 }
Start-Process -FilePath $Presentation | Out-Null
Write-Host 'PASS  Offline presentation opened.' -ForegroundColor Green
exit 0
