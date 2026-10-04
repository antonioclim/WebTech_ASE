Set-StrictMode -Version 2.0
$ErrorActionPreference='SilentlyContinue'
function Paths([string]$name) {
  $items=@()
  $items += @(Get-Command $name -All -ErrorAction SilentlyContinue | ForEach-Object {$_.Source})
  $items += @(& where.exe $name 2>$null)
  $items | Where-Object {$_} | Select-Object -Unique
}
Write-Host 'TW2026 PATH DIAGNOSTIC'
Write-Host ('='*72)
foreach ($name in @('node.exe','npm.cmd','git.exe','code.cmd','chrome.exe','msedge.exe','sqlite3.exe')) {
  Write-Host "[$name]"
  $paths=@(Paths $name)
  if ($paths.Count -eq 0) { Write-Host '  NOT FOUND' } else { foreach ($p in $paths) { Write-Host "  $p" } }
}
Write-Host '[PATH]'
$env:Path -split ';' | ForEach-Object { if ($_){ Write-Host "  $_" } }
