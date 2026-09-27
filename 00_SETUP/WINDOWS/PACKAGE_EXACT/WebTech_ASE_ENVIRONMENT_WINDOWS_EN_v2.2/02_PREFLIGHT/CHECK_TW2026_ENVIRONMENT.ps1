Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Stage = 'DAY0'
$Format = 'human'
$VerboseMode = $false
$Redact = $false
$AckGitHub = $false
$AckGitHub2FA = $false
$AckGemini = $false
$AckReactDevTools = $false
$AckAlternativeHttpClient = $false
$Workspace = $null

function Show-Usage {
@'
Usage:
  CHECK_TW2026_ENVIRONMENT.ps1 [DAY0|S05|S06|S08] [options]

Options:
  --stage <DAY0|S05|S06|S08>
  --format <human|json>
  --verbose
  --redact
  --workspace <path>
  --ack-github
  --ack-github-2fa
  --ack-gemini
  --ack-react-devtools
  --ack-http-client-alternative
'@ | Write-Output
}

for ($i = 0; $i -lt $args.Count; $i++) {
  $arg = [string]$args[$i]
  $low = $arg.ToLowerInvariant()
  switch ($low) {
    '--stage' { if ($i + 1 -ge $args.Count) { Show-Usage; exit 64 }; $i++; $Stage = ([string]$args[$i]).ToUpperInvariant(); break }
    '--format' { if ($i + 1 -ge $args.Count) { Show-Usage; exit 64 }; $i++; $Format = ([string]$args[$i]).ToLowerInvariant(); break }
    '--workspace' { if ($i + 1 -ge $args.Count) { Show-Usage; exit 64 }; $i++; $Workspace = [string]$args[$i]; break }
    '--verbose' { $VerboseMode = $true; break }
    '--redact' { $Redact = $true; break }
    '--ack-github' { $AckGitHub = $true; break }
    '--ack-github-2fa' { $AckGitHub2FA = $true; break }
    '--ack-gemini' { $AckGemini = $true; break }
    '--ack-react-devtools' { $AckReactDevTools = $true; break }
    '--ack-http-client-alternative' { $AckAlternativeHttpClient = $true; break }
    '-h' { Show-Usage; exit 0 }
    '--help' { Show-Usage; exit 0 }
    default {
      if ($arg.ToUpperInvariant() -in @('DAY0','S05','S06','S08')) { $Stage = $arg.ToUpperInvariant() }
      else { Write-Error "Unknown argument: $arg"; Show-Usage; exit 64 }
    }
  }
}
if ($Stage -notin @('DAY0','S05','S06','S08')) { Show-Usage; exit 64 }
if ($Format -notin @('human','json')) { Show-Usage; exit 64 }

$RequiredNode = 'v24.21.0'
$RequiredNpm = '11.19.0'
$Results = New-Object System.Collections.Generic.List[object]
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptRoot
if (-not $Workspace) {
  $documents = [Environment]::GetFolderPath('MyDocuments')
  if ([string]::IsNullOrWhiteSpace($documents)) { $documents = $env:USERPROFILE }
  $Workspace = Join-Path $documents 'TW2026_WORKSPACE'
}

function Protect-Text([string]$Text) {
  if ($null -eq $Text) { return '' }
  $value = $Text
  if ($Redact) {
    foreach ($secret in @($env:USERPROFILE, $env:USERNAME, $env:COMPUTERNAME)) {
      if (-not [string]::IsNullOrWhiteSpace($secret)) { $value = $value.Replace($secret, '<REDACTED>') }
    }
  }
  return $value
}

function Add-Result {
  param([string]$Id,[string]$Status,[bool]$Blocking,[string]$Found,[string]$Required,[string]$Detail,[string]$Remediation)
  $Results.Add([PSCustomObject][ordered]@{
    id=$Id; status=$Status; blocking=$Blocking; found=(Protect-Text $Found); required=$Required;
    detail=(Protect-Text $Detail); remediation=$Remediation
  }) | Out-Null
}

function Quote-CmdArg([string]$Value) {
  if ($Value -notmatch '[\s"]') { return $Value }
  return '"' + ($Value -replace '([\\]*)"','$1$1\"' -replace '(\\+)$','$1$1') + '"'
}

function Invoke-Tool {
  param([string]$File,[string[]]$Arguments=@(),[int]$TimeoutMs=10000)
  try {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $extension = [IO.Path]::GetExtension($File).ToLowerInvariant()
    if ($extension -in @('.cmd','.bat')) {
      $psi.FileName = $env:ComSpec
      $inner = '"' + $File + '"'
      foreach ($a in $Arguments) { $inner += ' ' + (Quote-CmdArg $a) }
      $psi.Arguments = '/d /s /c "' + $inner + '"'
    } else {
      $psi.FileName = $File
      $psi.Arguments = (($Arguments | ForEach-Object { Quote-CmdArg $_ }) -join ' ')
    }
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    if (-not $p.Start()) { return [PSCustomObject]@{ok=$false;exitCode=70;stdout='';stderr='start failed';timedOut=$false} }
    if (-not $p.WaitForExit($TimeoutMs)) {
      try { $p.Kill() } catch {}
      return [PSCustomObject]@{ok=$false;exitCode=124;stdout='';stderr='timeout';timedOut=$true}
    }
    $stdout = $p.StandardOutput.ReadToEnd().Trim()
    $stderr = $p.StandardError.ReadToEnd().Trim()
    return [PSCustomObject]@{ok=($p.ExitCode -eq 0);exitCode=$p.ExitCode;stdout=$stdout;stderr=$stderr;timedOut=$false}
  } catch {
    return [PSCustomObject]@{ok=$false;exitCode=70;stdout='';stderr=$_.Exception.Message;timedOut=$false}
  }
}

function Unique-Paths([string[]]$Paths) {
  $seen = @{}
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($p in $Paths) {
    if ([string]::IsNullOrWhiteSpace($p)) { continue }
    try { $full = [IO.Path]::GetFullPath($p) } catch { $full = $p }
    $key = $full.ToLowerInvariant()
    if (-not $seen.ContainsKey($key)) { $seen[$key] = $true; $list.Add($full) | Out-Null }
  }
  return @($list)
}

function Command-Paths([string]$Name) {
  $paths = @()
  try { $paths += @(Get-Command $Name -All -ErrorAction SilentlyContinue | ForEach-Object { $_.Source }) } catch {}
  try { $paths += @(& where.exe $Name 2>$null) } catch {}
  return @(Unique-Paths $paths)
}

function Add-RegistryAppPath([System.Collections.Generic.List[string]]$List,[string]$ExeName) {
  foreach ($base in @('HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths','HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths')) {
    try {
      $item = Get-ItemProperty -LiteralPath (Join-Path $base $ExeName) -ErrorAction Stop
      if ($item.'(default)') { $List.Add([string]$item.'(default)') | Out-Null }
      elseif ($item.PSObject.Properties['']) { $List.Add([string]$item.'') | Out-Null }
    } catch {}
  }
}

# OS and architecture.
try {
  $cv = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
  $build = [int]$cv.CurrentBuildNumber
  $product = [string]$cv.ProductName
  $installationType = [string]$cv.InstallationType
  if ($build -ge 10240 -and $installationType -eq 'Client') {
    Add-Result 'OS_SUPPORT' 'PASS' $false "$product build $build" 'Windows 10/11 client, 64-bit' 'Supported Windows client'
  } else {
    Add-Result 'OS_SUPPORT' 'UNSUPPORTED' $true "$product build $build / $installationType" 'Windows 10/11 client, 64-bit' 'OS-001'
  }
} catch {
  Add-Result 'OS_SUPPORT' 'NOT_CHECKABLE' $true '' 'Windows 10/11 client, 64-bit' 'OS-001'
}
$rawArch = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
$archMap = @{ 'AMD64'='x64'; 'ARM64'='arm64'; 'x86'='x86' }
$osArch = if ($archMap.ContainsKey($rawArch)) { $archMap[$rawArch] } else { $rawArch.ToLowerInvariant() }
if ($osArch -in @('x64','arm64')) { Add-Result 'OS_ARCH' 'PASS' $false $osArch 'x64 or arm64' 'Supported architecture' }
else { Add-Result 'OS_ARCH' 'UNSUPPORTED' $true $osArch 'x64 or arm64' 'ARCH-001' }

# Extraction and path checks.
if ($KitRoot -like "$env:TEMP*") { Add-Result 'KIT_EXTRACTED' 'FAIL' $true $KitRoot 'normal extracted directory outside TEMP' 'KIT-001' }
else { Add-Result 'KIT_EXTRACTED' 'PASS' $false $KitRoot 'normal extracted directory' 'Kit path looks persistent' }
$pathLength = $KitRoot.Length
if ($pathLength -gt 220) { Add-Result 'KIT_PATH_LENGTH' 'FAIL' $true "$pathLength characters" '<= 220 characters' 'PATH-001' }
elseif ($pathLength -gt 180) { Add-Result 'KIT_PATH_LENGTH' 'WARN' $false "$pathLength characters" '<= 180 recommended' 'PATH-001' }
else { Add-Result 'KIT_PATH_LENGTH' 'PASS' $false "$pathLength characters" '<= 180 recommended' 'Path length is conservative' }
if ($KitRoot -match '(?i)\\OneDrive\\') { Add-Result 'SYNC_FOLDER' 'WARN' $false $KitRoot 'local non-synchronised folder recommended' 'PATH-001' }
else { Add-Result 'SYNC_FOLDER' 'PASS' $false $KitRoot 'local folder' 'No common sync folder detected' }
$special = @()
if ($KitRoot -match '\s') { $special += 'space' }
if ($KitRoot -match '#') { $special += '#' }
if ($KitRoot -match '[^\x00-\x7F]') { $special += 'non-ASCII' }
Add-Result 'PATH_SPECIAL_CHARACTERS' 'PASS' $false (($special -join ', ') -replace '^$','none') 'quoted-path support' 'Scripts use literal/quoted paths'

# Node and npm discovery.
$nodePaths = Command-Paths 'node.exe'
if ($nodePaths.Count -eq 0) { $nodePaths = Command-Paths 'node' }
$nodeActive = if ($nodePaths.Count -gt 0) { $nodePaths[0] } else { $null }
if ($nodeActive) {
  $r = Invoke-Tool $nodeActive @('--version')
  $nodeVersion = ($r.stdout -split "`r?`n")[0].Trim()
  if ($r.ok -and $nodeVersion -eq $RequiredNode) { Add-Result 'NODE_VERSION' 'PASS' $false $nodeVersion $RequiredNode 'Exact course runtime' }
  else { Add-Result 'NODE_VERSION' 'FAIL' $true $nodeVersion $RequiredNode 'NODE-001' }
  $ar = Invoke-Tool $nodeActive @('-p','process.arch')
  $nodeArch = ($ar.stdout -split "`r?`n")[0].Trim()
  if ($ar.ok -and $nodeArch -eq $osArch) { Add-Result 'NODE_ARCH' 'PASS' $false $nodeArch $osArch 'Node matches OS architecture' }
  elseif ($ar.ok) { Add-Result 'NODE_ARCH' 'FAIL' $true $nodeArch $osArch 'ARCH-001' }
  else { Add-Result 'NODE_ARCH' 'NOT_CHECKABLE' $true '' $osArch 'ARCH-001' }
} else {
  $nodeVersion = ''
  Add-Result 'NODE_VERSION' 'FAIL' $true '' $RequiredNode 'NODE-001'
  Add-Result 'NODE_ARCH' 'NOT_CHECKABLE' $true '' $osArch 'ARCH-001'
}
if ($nodePaths.Count -gt 1) { Add-Result 'NODE_MULTIPLE_INSTALLATIONS' 'WARN' $false ($nodePaths -join '; ') 'one active installation recommended' 'PATH-002' }
else { Add-Result 'NODE_MULTIPLE_INSTALLATIONS' 'PASS' $false ($nodePaths -join '; ') 'one active installation recommended' 'No competing node command found' }

$npmPaths = Command-Paths 'npm.cmd'
if ($npmPaths.Count -eq 0) { $npmPaths = Command-Paths 'npm' }
$npmActive = if ($npmPaths.Count -gt 0) { $npmPaths[0] } else { $null }
if ($npmActive) {
  $r = Invoke-Tool $npmActive @('--version')
  $npmVersion = ($r.stdout -split "`r?`n")[0].Trim()
  if ($r.ok -and $npmVersion -eq $RequiredNpm) { Add-Result 'NPM_VERSION' 'PASS' $false $npmVersion $RequiredNpm 'Exact course package manager' }
  else { Add-Result 'NPM_VERSION' 'FAIL' $true $npmVersion $RequiredNpm 'NPM-001' }
  if ($nodeActive -and ((Split-Path $nodeActive -Parent).ToLowerInvariant() -eq (Split-Path $npmActive -Parent).ToLowerInvariant())) {
    Add-Result 'NODE_NPM_SAME_ROOT' 'PASS' $false (Split-Path $nodeActive -Parent) 'same installation root' 'Node and npm resolve together'
  } else {
    Add-Result 'NODE_NPM_SAME_ROOT' 'FAIL' $true "$nodeActive | $npmActive" 'same installation root' 'PATH-002'
  }
  $cache = Invoke-Tool $npmActive @('config','get','cache')
  $cachePath = ($cache.stdout -split "`r?`n")[0].Trim()
  if ($cache.ok -and -not [string]::IsNullOrWhiteSpace($cachePath)) {
    Add-Result 'NPM_CACHE_PATH' 'PASS' $false $cachePath 'resolvable cache path' 'No network operation performed'
  } else { Add-Result 'NPM_CACHE_PATH' 'WARN' $false $cachePath 'resolvable cache path' 'CACHE-001' }
} else {
  Add-Result 'NPM_VERSION' 'FAIL' $true '' $RequiredNpm 'NPM-001'
  Add-Result 'NODE_NPM_SAME_ROOT' 'NOT_CHECKABLE' $true '' 'same installation root' 'PATH-002'
  Add-Result 'NPM_CACHE_PATH' 'NOT_CHECKABLE' $false '' 'resolvable cache path' 'CACHE-001'
}

# Ephemeral write and UTF-8/LF check.
$workspaceCreated = $false
$probeFile = $null
try {
  if (-not (Test-Path -LiteralPath $Workspace)) { New-Item -ItemType Directory -Path $Workspace -Force | Out-Null; $workspaceCreated = $true }
  $probeFile = Join-Path $Workspace ('proba_șț_' + [Guid]::NewGuid().ToString('N') + '.txt')
  $probeText = "Romania: ăîâșț €`nline-two`n"
  [IO.File]::WriteAllText($probeFile, $probeText, (New-Object Text.UTF8Encoding($false)))
  if (Test-Path -LiteralPath $probeFile) { Add-Result 'WORKSPACE_WRITE' 'PASS' $false $Workspace 'temporary create/delete' 'Ephemeral probe succeeded' }
  else { Add-Result 'WORKSPACE_WRITE' 'FAIL' $true $Workspace 'temporary create/delete' 'WRITE-001' }
  if ($nodeActive) {
    $utf = Invoke-Tool $nodeActive @((Join-Path $ScriptRoot 'PROBE_UTF8.mjs'),$probeFile,$probeText) 10000
    if ($utf.ok) { Add-Result 'UTF8_LF_ROUNDTRIP' 'PASS' $false 'UTF-8 no BOM; LF' 'UTF-8 and LF' 'Node roundtrip succeeded' }
    else { Add-Result 'UTF8_LF_ROUNDTRIP' 'FAIL' $true $utf.stderr 'UTF-8 and LF' 'UTF8-001' }
  } else { Add-Result 'UTF8_LF_ROUNDTRIP' 'NOT_CHECKABLE' $true '' 'UTF-8 and LF' 'NODE-001' }
} catch {
  Add-Result 'WORKSPACE_WRITE' 'FAIL' $true $Workspace 'temporary create/delete' 'WRITE-001'
  Add-Result 'UTF8_LF_ROUNDTRIP' 'NOT_CHECKABLE' $true $_.Exception.Message 'UTF-8 and LF' 'UTF8-001'
} finally {
  if ($probeFile -and (Test-Path -LiteralPath $probeFile)) { Remove-Item -LiteralPath $probeFile -Force -ErrorAction SilentlyContinue }
  if ($workspaceCreated -and (Test-Path -LiteralPath $Workspace)) { Remove-Item -LiteralPath $Workspace -Force -ErrorAction SilentlyContinue }
}

# Git.
$gitPaths = Command-Paths 'git.exe'
if ($gitPaths.Count -eq 0) { $gitPaths = Command-Paths 'git' }
$gitActive = if ($gitPaths.Count -gt 0) { $gitPaths[0] } else { $null }
if ($gitActive) {
  $gr = Invoke-Tool $gitActive @('--version')
  if ($gr.ok) { Add-Result 'GIT' 'PASS' $false $gr.stdout 'maintained Git' 'Git command works' } else { Add-Result 'GIT' 'FAIL' $true $gr.stderr 'maintained Git' 'GIT-001' }
  $gn = Invoke-Tool $gitActive @('config','--global','--get','user.name')
  $ge = Invoke-Tool $gitActive @('config','--global','--get','user.email')
  $name = $gn.stdout.Trim(); $email = $ge.stdout.Trim()
  $validName = -not [string]::IsNullOrWhiteSpace($name) -and $name -notmatch '(?i)^prenume\s+nume$'
  $validEmail = $email -match '^[^\s@]+@[^\s@]+$' -and $email -notmatch '(?i)email-verificat|example\.com'
  if ($validName -and $validEmail) { Add-Result 'GIT_IDENTITY' 'PASS' $false "$name / [email configured]" 'real name and verified email' 'Identity is present' }
  else { Add-Result 'GIT_IDENTITY' 'FAIL' $true "$name / $email" 'real name and verified email' 'GIT-002' }
  $branch = (Invoke-Tool $gitActive @('config','--global','--get','init.defaultBranch')).stdout.Trim()
  if ($branch -eq 'main') { Add-Result 'GIT_DEFAULT_BRANCH' 'PASS' $false $branch 'main recommended' 'Recommended default' }
  elseif ([string]::IsNullOrWhiteSpace($branch)) { Add-Result 'GIT_DEFAULT_BRANCH' 'WARN' $false 'unset' 'main recommended' 'GIT-002' }
  else { Add-Result 'GIT_DEFAULT_BRANCH' 'WARN' $false $branch 'main recommended' 'GIT-002' }
  $autocrlf = (Invoke-Tool $gitActive @('config','--global','--get','core.autocrlf')).stdout.Trim()
  Add-Result 'GIT_GLOBAL_EOL' $(if ($autocrlf -eq 'true') {'WARN'} else {'PASS'}) $false ($autocrlf -replace '^$','unset') 'project .gitattributes controls TW2026' $(if ($autocrlf -eq 'true') {'Review local .gitattributes; no global change is made'} else {'No blocking global EOL setting detected'})
} else {
  Add-Result 'GIT' 'FAIL' $true '' 'maintained Git' 'GIT-001'
  Add-Result 'GIT_IDENTITY' 'NOT_CHECKABLE' $true '' 'real name and verified email' 'GIT-002'
  Add-Result 'GIT_DEFAULT_BRANCH' 'NOT_CHECKABLE' $false '' 'main recommended' 'GIT-002'
  Add-Result 'GIT_GLOBAL_EOL' 'NOT_CHECKABLE' $false '' 'project policy' 'GIT-002'
}

# VS Code and extensions.
$vs = New-Object System.Collections.Generic.List[string]
foreach ($p in (Command-Paths 'code.cmd')) { $vs.Add($p) | Out-Null }
foreach ($p in (Command-Paths 'Code.exe')) { $vs.Add($p) | Out-Null }
foreach ($p in @(
  "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
  "$env:ProgramFiles\Microsoft VS Code\Code.exe",
  "${env:ProgramFiles(x86)}\Microsoft VS Code\Code.exe"
)) { if ($p -and (Test-Path -LiteralPath $p)) { $vs.Add($p) | Out-Null } }
Add-RegistryAppPath $vs 'Code.exe'
$vsPaths = Unique-Paths @($vs)
$vsActive = if ($vsPaths.Count -gt 0) { $vsPaths[0] } else { $null }
if ($vsActive) {
  $vr = Invoke-Tool $vsActive @('--version') 15000
  $vline = ($vr.stdout -split "`r?`n")[0].Trim()
  Add-Result 'VSCODE' 'PASS' $false "$vline / $vsActive" 'supported VS Code Stable' 'VS Code detected'
  if ((Split-Path $vsActive -Leaf).ToLowerInvariant() -eq 'code.cmd' -or $vsActive -match '(?i)\\bin\\code(?:\.cmd)?$') { Add-Result 'VSCODE_CLI' 'PASS' $false $vsActive 'code CLI' 'CLI is available' }
  else { Add-Result 'VSCODE_CLI' 'WARN' $false $vsActive 'code CLI recommended' 'VSC-001' }
  $er = Invoke-Tool $vsActive @('--list-extensions') 20000
  $exts = @()
  if ($er.ok) { $exts = @($er.stdout -split "`r?`n" | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ }) }
  $extDir = Join-Path $env:USERPROFILE '.vscode\extensions'
  $prettierFs = Test-Path -Path (Join-Path $extDir 'esbenp.prettier-vscode-*')
  $eslintFs = Test-Path -Path (Join-Path $extDir 'dbaeumer.vscode-eslint-*')
  if ($exts -contains 'esbenp.prettier-vscode' -or $prettierFs) { Add-Result 'PRETTIER_EXTENSION' 'PASS' $false 'esbenp.prettier-vscode' 'required extension' 'Extension detected' }
  else { Add-Result 'PRETTIER_EXTENSION' $(if ($er.ok) {'FAIL'} else {'NOT_CHECKABLE'}) $true $er.stderr 'required extension' 'VSC-002' }
  if ($exts -contains 'dbaeumer.vscode-eslint' -or $eslintFs) { Add-Result 'ESLINT_EXTENSION' 'PASS' $false 'dbaeumer.vscode-eslint' 'required extension' 'Extension detected' }
  else { Add-Result 'ESLINT_EXTENSION' $(if ($er.ok) {'FAIL'} else {'NOT_CHECKABLE'}) $true $er.stderr 'required extension' 'VSC-002' }
} else {
  Add-Result 'VSCODE' 'FAIL' $true '' 'supported VS Code Stable' 'VSC-001'
  Add-Result 'VSCODE_CLI' 'NOT_CHECKABLE' $false '' 'code CLI recommended' 'VSC-001'
  Add-Result 'PRETTIER_EXTENSION' 'NOT_CHECKABLE' $true '' 'required extension' 'VSC-002'
  Add-Result 'ESLINT_EXTENSION' 'NOT_CHECKABLE' $true '' 'required extension' 'VSC-002'
}
if ($vsPaths.Count -gt 1) { Add-Result 'VSCODE_MULTIPLE_INSTALLATIONS' 'WARN' $false ($vsPaths -join '; ') 'one active installation recommended' 'VSC-001' }
else { Add-Result 'VSCODE_MULTIPLE_INSTALLATIONS' 'PASS' $false ($vsPaths -join '; ') 'one active installation recommended' 'No competing VS Code path found' }

# Browser.
$browsers = New-Object System.Collections.Generic.List[string]
foreach ($p in @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)) { if ($p -and (Test-Path -LiteralPath $p)) { $browsers.Add($p) | Out-Null } }
Add-RegistryAppPath $browsers 'chrome.exe'; Add-RegistryAppPath $browsers 'msedge.exe'
$browserPaths = Unique-Paths @($browsers)
if ($browserPaths.Count -gt 0) {
  $bp = $browserPaths[0]
  try { $bv = (Get-Item -LiteralPath $bp).VersionInfo.ProductVersion } catch { $bv = '' }
  Add-Result 'BROWSER_CHROMIUM' 'PASS' $false "$bp / $bv" 'Chrome or Edge Stable' 'Supported browser detected'
} else { Add-Result 'BROWSER_CHROMIUM' 'FAIL' $true '' 'Chrome or Edge Stable' 'BROWSER-001' }

# Localhost loopback.
if ($nodeActive -and $nodeVersion -eq $RequiredNode) {
  $lr = Invoke-Tool $nodeActive @((Join-Path $ScriptRoot 'PROBE_LOCALHOST.mjs')) 10000
  if ($lr.ok) { Add-Result 'LOCALHOST_LOOPBACK' 'PASS' $false $lr.stdout 'ephemeral 127.0.0.1 HTTP probe' 'Server started, answered and closed' }
  else { Add-Result 'LOCALHOST_LOOPBACK' 'FAIL' $true $lr.stderr 'ephemeral 127.0.0.1 HTTP probe' 'LOCALHOST-001' }
} else { Add-Result 'LOCALHOST_LOOPBACK' 'NOT_CHECKABLE' $true '' 'exact Node runtime first' 'NODE-001' }

# Accounts.
if ($AckGitHub) { Add-Result 'GITHUB_ACCOUNT' 'PASS' $false 'acknowledged' 'account accessible; email verified' 'Manual confirmation recorded' }
else { Add-Result 'GITHUB_ACCOUNT' 'MANUAL_PENDING' $true '' 'account accessible; email verified' 'ACCOUNT-001' }
if ($AckGitHub2FA) { Add-Result 'GITHUB_2FA' 'PASS' $false 'acknowledged' '2FA enabled and recovery method stored' 'Manual confirmation recorded' }
else { Add-Result 'GITHUB_2FA' 'MANUAL_PENDING' $true '' '2FA enabled and recovery method stored' 'ACCOUNT-001' }
if ($AckGemini) { Add-Result 'GEMINI_ACCESS' 'PASS' $false 'acknowledged' 'Gemini web accessible in supported browser' 'Manual confirmation recorded' }
else { Add-Result 'GEMINI_ACCESS' 'MANUAL_PENDING' $true '' 'Gemini web accessible in supported browser' 'ACCOUNT-002' }

# Stage-specific tools.
if ($Stage -in @('S05','S06','S08')) {
  $postman = New-Object System.Collections.Generic.List[string]
  foreach ($p in @("$env:LOCALAPPDATA\Postman\Postman.exe","$env:LOCALAPPDATA\Programs\Postman\Postman.exe","$env:ProgramFiles\Postman\Postman.exe")) { if ($p -and (Test-Path -LiteralPath $p)) { $postman.Add($p) | Out-Null } }
  Add-RegistryAppPath $postman 'Postman.exe'
  $pp = Unique-Paths @($postman)
  if ($pp.Count -gt 0) { Add-Result 'POSTMAN' 'PASS' $false $pp[0] 'Postman Desktop from S05' 'Application detected' }
  elseif ($AckAlternativeHttpClient) { Add-Result 'POSTMAN' 'WARN' $false 'approved alternative acknowledged' 'Postman or approved alternative' 'POSTMAN-001' }
  else { Add-Result 'POSTMAN' 'FAIL' $true '' 'Postman Desktop from S05' 'POSTMAN-001' }
} else { Add-Result 'POSTMAN' 'NOT_REQUIRED' $false '' 'required from S05' 'Not evaluated at DAY0' }
if ($Stage -in @('S06','S08')) {
  $sqlite = Command-Paths 'sqlite3.exe'
  if ($sqlite.Count -eq 0) { $sqlite = Command-Paths 'sqlite3' }
  if ($sqlite.Count -gt 0) {
    $sr = Invoke-Tool $sqlite[0] @('--version')
    if ($sr.ok) { Add-Result 'SQLITE' 'PASS' $false $sr.stdout 'sqlite3 from S06' 'CLI works' }
    else { Add-Result 'SQLITE' 'FAIL' $true $sr.stderr 'sqlite3 from S06' 'SQLITE-001' }
  } else { Add-Result 'SQLITE' 'FAIL' $true '' 'sqlite3 from S06' 'SQLITE-001' }
} else { Add-Result 'SQLITE' 'NOT_REQUIRED' $false '' 'required from S06' 'Not evaluated yet' }
if ($Stage -eq 'S08') {
  if ($AckReactDevTools) { Add-Result 'REACT_DEVTOOLS' 'PASS' $false 'acknowledged' 'recommended from S08' 'Manual confirmation recorded' }
  else { Add-Result 'REACT_DEVTOOLS' 'WARN' $false '' 'recommended from S08' 'Install or acknowledge later' }
} else { Add-Result 'REACT_DEVTOOLS' 'NOT_REQUIRED' $false '' 'recommended from S08' 'Not evaluated yet' }
if ($npmActive) {
  $globalRoot = (Invoke-Tool $npmActive @('root','-g')).stdout.Trim()
  if ($globalRoot -and (Test-Path -LiteralPath (Join-Path $globalRoot 'vite'))) { Add-Result 'GLOBAL_VITE' 'WARN' $false (Join-Path $globalRoot 'vite') 'Vite local to projects' 'Remove only if it causes command confusion' }
  else { Add-Result 'GLOBAL_VITE' 'PASS' $false 'not detected' 'Vite local to projects' 'No global Vite detected' }
} else { Add-Result 'GLOBAL_VITE' 'NOT_CHECKABLE' $false '' 'Vite local to projects' 'NPM-001' }

$unsupported = @($Results | Where-Object { $_.Status -eq 'UNSUPPORTED' }).Count
$technicalBlocking = @($Results | Where-Object { $_.blocking -and $_.Status -in @('FAIL','NOT_CHECKABLE') }).Count
$manualPending = @($Results | Where-Object { $_.blocking -and $_.Status -eq 'MANUAL_PENDING' }).Count
$warnings = @($Results | Where-Object { $_.Status -eq 'WARN' }).Count
if ($unsupported -gt 0) { $Verdict = 'UNSUPPORTED_SYSTEM'; $ExitCode = 4 }
elseif ($technicalBlocking -gt 0) { $Verdict = 'NOT_READY'; $ExitCode = 2 }
elseif ($manualPending -gt 0) { $Verdict = 'TECHNICALLY_READY_ACCOUNT_CHECKS_PENDING'; $ExitCode = 3 }
elseif ($warnings -gt 0) { $Verdict = 'READY_WITH_WARNINGS'; $ExitCode = 1 }
else { $Verdict = 'READY_FOR_TW2026'; $ExitCode = 0 }

$payload = [PSCustomObject][ordered]@{
  schema='tw2026.environment.preflight.v2'; generatedAt=(Get-Date).ToString('o'); platform='windows'; stage=$Stage;
  kitVersion='2.0_RC'; requiredNode=$RequiredNode; requiredNpm=$RequiredNpm; workspace=(Protect-Text $Workspace);
  verdict=$Verdict; exitCode=$ExitCode; counts=[PSCustomObject][ordered]@{unsupported=$unsupported;technicalBlocking=$technicalBlocking;manualPending=$manualPending;warnings=$warnings};
  results=@($Results)
}
if ($Format -eq 'json') {
  $payload | ConvertTo-Json -Depth 8
} else {
  Write-Host ''
  Write-Host "TW2026 ENVIRONMENT PREFLIGHT v2.2 FINAL - $Stage"
  Write-Host ('=' * 110)
  foreach ($item in $Results) {
    $detail = if ($VerboseMode) { "$($item.found) | $($item.detail) | remediation=$($item.remediation)" } else { if ($item.detail) { $item.detail } else { $item.found } }
    Write-Host ('{0,-32} {1,-18} {2}' -f $item.id,$item.status,$detail)
  }
  Write-Host ('=' * 110)
  Write-Host "VERDICT: $Verdict"
  Write-Host "EXIT_CODE: $ExitCode"
  Write-Host 'The preflight installs nothing and changes no persistent settings. It creates and removes only temporary probes.'
}
exit $ExitCode
