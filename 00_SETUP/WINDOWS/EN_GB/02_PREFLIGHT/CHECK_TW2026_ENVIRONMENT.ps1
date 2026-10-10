Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Stage = 'DAY0'
$Profile = 'day0'
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
  --profile <day0|node|http|sqlite|npm>
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
    '--profile' { if ($i + 1 -ge $args.Count) { Show-Usage; exit 64 }; $i++; $Profile = [string]$args[$i]; break }
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
if ($Profile -notin @('day0','node','http','sqlite','npm')) { Show-Usage; exit 64 }
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

# Async bounded readers prevent a full stdout/stderr pipe from deadlocking.
# This helper kills only the process it started; no process-name/global cleanup.
Add-Type -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
public class TwEnvironmentResult {
 public bool ok; public int exitCode; public string stdout=""; public string stderr=""; public bool timedOut; public bool outputLimited;
}
public static class TwEnvironmentProcess {
 public static TwEnvironmentResult Run(string file,string args,int milliseconds,int maxBytes) {
  var r=new TwEnvironmentResult(); using(var p=new Process()) {
   p.StartInfo=new ProcessStartInfo(file,args) { UseShellExecute=false,RedirectStandardOutput=true,RedirectStandardError=true,CreateNoWindow=true };
   var output=new StringBuilder();var errors=new StringBuilder();int count=0;int limited=0;
   try {
    if(!p.Start()) {r.exitCode=70;r.stderr="start failed";return r;}
    Func<System.IO.StreamReader,StringBuilder,Task> pump=(reader,target)=>Task.Run(()=> {
     char[] b=new char[1024];int n;while((n=reader.Read(b,0,b.Length))>0) {
      if(Interlocked.Add(ref count,Encoding.UTF8.GetByteCount(b,0,n))>maxBytes) {Interlocked.Exchange(ref limited,1);try {p.Kill();}catch{};break;}
      target.Append(b,0,n);
     }
    });
    var a=pump(p.StandardOutput,output);var e=pump(p.StandardError,errors);
    if(!p.WaitForExit(milliseconds)) {r.timedOut=true;try {p.Kill();}catch{};p.WaitForExit(1000);}
    Task.WaitAll(new[]{a,e},1000);r.stdout=output.ToString().Trim();r.stderr=errors.ToString().Trim();r.outputLimited=limited!=0;
    r.exitCode=r.timedOut?124:r.outputLimited?125:p.HasExited?p.ExitCode:70;
    r.ok=r.exitCode==0&&!r.timedOut&&!r.outputLimited;return r;
   } catch(Exception ex) {r.exitCode=70;r.stderr=ex.Message;try {if(!p.HasExited)p.Kill();}catch{};return r;}
  }
 }
}
'@
function Invoke-Tool {
  param([string]$File,[string[]]$Arguments=@(),[int]$TimeoutMs=10000)
  $extension = [IO.Path]::GetExtension($File).ToLowerInvariant()
  if ($extension -in @('.cmd','.bat')) {
    # Fixed diagnostic arguments, quoted cmd carrier. No npm.ps1 or policy change.
    $inner = '"' + $File + '"'
    foreach ($a in $Arguments) { $inner += ' ' + (Quote-CmdArg $a) }
    $toolArgs = '/d /s /c "' + $inner + '"'; $toolFile=$env:ComSpec
  } else {
    $toolFile=$File; $toolArgs=(($Arguments | ForEach-Object { Quote-CmdArg $_ }) -join ' ')
  }
  return [TwEnvironmentProcess]::Run($toolFile,$toolArgs,$TimeoutMs,65536)
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
if ($KitRoot -like "$env:TEMP*") { Add-Result 'KIT_EXTRACTED' 'ENV_WARN' $false $KitRoot 'normal extracted directory outside TEMP' 'KIT-001' }
else { Add-Result 'KIT_EXTRACTED' 'PASS' $false $KitRoot 'normal extracted directory' 'Kit path looks persistent' }
$pathLength = $KitRoot.Length
if ($pathLength -gt 220) { Add-Result 'KIT_PATH_LENGTH' 'ENV_WARN' $false "$pathLength characters" '<= 220 characters' 'PATH-001' }
elseif ($pathLength -gt 180) { Add-Result 'KIT_PATH_LENGTH' 'WARN' $false "$pathLength characters" '<= 180 recommended' 'PATH-001' }
else { Add-Result 'KIT_PATH_LENGTH' 'PASS' $false "$pathLength characters" '<= 180 recommended' 'Path length is conservative' }
if ($KitRoot -match '(?i)\\OneDrive\\') { Add-Result 'SYNC_FOLDER' 'WARN' $false $KitRoot 'local non-synchronised folder recommended' 'PATH-001' }
else { Add-Result 'SYNC_FOLDER' 'PASS' $false $KitRoot 'local folder' 'No common sync folder detected' }
$special = @()
if ($KitRoot -match '\s') { $special += 'space' }
if ($KitRoot -match '#') { $special += '#' }
if ($KitRoot -match '[^\x00-\x7F]') { $special += 'non-ASCII' }
Add-Result 'PATH_SPECIAL_CHARACTERS' 'PASS' $false (($special -join ', ') -replace '^$','none') 'quoted-path support' 'Scripts use literal/quoted paths'

# Node is always assessed; npm is assessed only for the selected npm operation.
$nodePaths = @(Command-Paths 'node.exe')
if ($nodePaths.Count -eq 0) { $nodePaths = @(Command-Paths 'node') }
$nodeActive = if ($nodePaths.Count -gt 0) { $nodePaths[0] } else { $null }
$nodeVersion='';$nodeReady=$false
if ($nodeActive) {
  $r = Invoke-Tool $nodeActive @('--version')
  $nodeVersion=$r.stdout.Trim()
  $nodeReady=$r.ok -and $nodeVersion -match '^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$'
  if ($nodeReady) { Add-Result 'NODE_VERSION' $(if($nodeVersion -eq $RequiredNode){'ENV_OK'}else{'ENV_WARN'}) $false "$nodeVersion / $nodeActive" "$RequiredNode (unexecuted reference)" 'Numeric observed version; selected API probes decide compatibility' }
  else { Add-Result 'NODE_VERSION' 'ENV_BLOCKED' $true "$nodeVersion / $nodeActive; exit=$($r.exitCode)" 'successful valid Node version' 'Missing, failing or malformed version output' }
} else { Add-Result 'NODE_VERSION' 'ENV_BLOCKED' $true '' 'Node executable' 'node not found in PATH' }
if ($nodePaths.Count -gt 1) { Add-Result 'NODE_MULTIPLE_INSTALLATIONS' 'ENV_WARN' $false ($nodePaths -join '; ') 'record active executable' 'Multiple paths alone do not block' }
$npmActive=$null
if($Profile -eq 'npm') {
  $npmPaths=@(Command-Paths 'npm.cmd')
  if($npmPaths.Count -gt 0){$npmActive=$npmPaths[0]}
  if($npmActive){$nr=Invoke-Tool $npmActive @('--version');if($nr.ok -and $nr.stdout -match '^\d+\.\d+\.\d+$'){Add-Result 'NPM_VERSION' $(if($nr.stdout -eq $RequiredNpm){'ENV_OK'}else{'ENV_WARN'}) $false "$($nr.stdout) / $npmActive" "$RequiredNpm (unexecuted reference)" 'npm.cmd avoids npm.ps1 without changing ExecutionPolicy'}else{Add-Result 'NPM_VERSION' 'ENV_BLOCKED' $true $nr.stderr 'successful valid npm.cmd --version' 'npm command failed'}}
  else {Add-Result 'NPM_VERSION' 'ENV_BLOCKED' $true '' 'functional npm for npm operation' 'npm.cmd unavailable; Node-only activities remain independent'}
} else {Add-Result 'NPM_VERSION' 'NOT_REQUIRED' $false '' "$RequiredNpm (unexecuted reference)" 'Selected Node/HTTP/SQLite activity does not use npm'}
$EnvProfile=if($Profile -eq 'day0'){'http'}else{$Profile}
if($nodeReady){
  $er=Invoke-Tool $nodeActive @((Join-Path $ScriptRoot 'environment.mjs'),'--unit',$Stage,'--profile',$EnvProfile,'--json','--cwd',$KitRoot)
  if($er.ok){try{$environment=$er.stdout|ConvertFrom-Json;Add-Result 'ACTIVITY_PROFILE' $environment.status $false $er.stdout "$EnvProfile capability probes" "Operation=$EnvProfile; CWD=$KitRoot; rerun RUN_PREFLIGHT.cmd --profile $Profile"}catch{Add-Result 'ACTIVITY_PROFILE' 'ENV_BLOCKED' $true $er.stdout 'valid environment report' 'Malformed capability report'}}
  else{Add-Result 'ACTIVITY_PROFILE' 'ENV_BLOCKED' $true "$($er.stdout) $($er.stderr)" "$EnvProfile capability probes" 'Selected operation failed; other independent activities retain their own verdict'}
}else{Add-Result 'ACTIVITY_PROFILE' 'ENV_BLOCKED' $true '' "$EnvProfile capability probes" 'Node unavailable or version probe failed'}

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
  if ($workspaceCreated -and (Test-Path -LiteralPath $Workspace) -and @(Get-ChildItem -LiteralPath $Workspace -Force).Count -eq 0) { [IO.Directory]::Delete($Workspace,$false) }
}

# Git.
$gitPaths = @(Command-Paths 'git.exe')
if ($gitPaths.Count -eq 0) { $gitPaths = @(Command-Paths 'git') }
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
$vsPaths = @(Unique-Paths @($vs))
$vsActive = if ($vsPaths.Count -gt 0) { $vsPaths[0] } else { $null }
if ($vsActive) {
  $vr = Invoke-Tool $vsActive @('--version') 15000
  $vline = ($vr.stdout -split "`r?`n")[0].Trim()
  $codeReady=$vr.ok -and $vline -match '^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$'
  Add-Result 'VSCODE' $(if($codeReady){'ENV_OK'}else{'ENV_BLOCKED'}) (-not $codeReady) "$vline / $vsActive; exit=$($vr.exitCode); $($vr.stderr)" 'successful valid code --version' $(if($codeReady){'Functional CLI passed; GUI not exercised'}else{'Launcher exists but its functional version probe failed'})
  if ($codeReady -and ((Split-Path $vsActive -Leaf).ToLowerInvariant() -eq 'code.cmd' -or $vsActive -match '(?i)\\bin\\code(?:\.cmd)?$')) { Add-Result 'VSCODE_CLI' 'ENV_OK' $false $vsActive 'code CLI' 'CLI is available' }
  else { Add-Result 'VSCODE_CLI' $(if($codeReady){'ENV_WARN'}else{'ENV_BLOCKED'}) (-not $codeReady) $vsActive 'functional code CLI' 'No successful CLI probe; source Node activity remains independent' }
  $er = Invoke-Tool $vsActive @('--list-extensions') 20000
  $exts = @()
  if ($er.ok) { $exts = @($er.stdout -split "`r?`n" | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ }) }
  $extDir = Join-Path $env:USERPROFILE '.vscode\extensions'
  $prettierFs = Test-Path -Path (Join-Path $extDir 'esbenp.prettier-vscode-*')
  $eslintFs = Test-Path -Path (Join-Path $extDir 'dbaeumer.vscode-eslint-*')
  if ($exts -contains 'esbenp.prettier-vscode' -or $prettierFs) { Add-Result 'PRETTIER_EXTENSION' 'PASS' $false 'esbenp.prettier-vscode' 'recommended editor extension' 'Extension detected' }
  else { Add-Result 'PRETTIER_EXTENSION' 'ENV_WARN' $false $er.stderr 'recommended editor extension' 'VSC-002' }
  if ($exts -contains 'dbaeumer.vscode-eslint' -or $eslintFs) { Add-Result 'ESLINT_EXTENSION' 'PASS' $false 'dbaeumer.vscode-eslint' 'recommended editor extension' 'Extension detected' }
  else { Add-Result 'ESLINT_EXTENSION' 'ENV_WARN' $false $er.stderr 'recommended editor extension' 'VSC-002' }
} else {
  Add-Result 'VSCODE' 'FAIL' $true '' 'supported VS Code Stable' 'VSC-001'
  Add-Result 'VSCODE_CLI' 'NOT_CHECKABLE' $false '' 'code CLI recommended' 'VSC-001'
  Add-Result 'PRETTIER_EXTENSION' 'NOT_CHECKABLE' $true '' 'recommended editor extension' 'VSC-002'
  Add-Result 'ESLINT_EXTENSION' 'NOT_CHECKABLE' $true '' 'recommended editor extension' 'VSC-002'
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
$browserPaths = @(Unique-Paths @($browsers))
if ($browserPaths.Count -gt 0) {
  $bp = $browserPaths[0]
  try { $bv = (Get-Item -LiteralPath $bp).VersionInfo.ProductVersion } catch { $bv = '' }
  Add-Result 'BROWSER_CHROMIUM' 'PASS' $false "$bp / $bv" 'Chrome or Edge Stable' 'Supported browser detected'
} else { Add-Result 'BROWSER_CHROMIUM' 'FAIL' $true '' 'Chrome or Edge Stable' 'BROWSER-001' }

# Localhost loopback.
if ($nodeReady -and $Profile -in @('day0','http')) {
  $lr = Invoke-Tool $nodeActive @((Join-Path $ScriptRoot 'PROBE_LOCALHOST.mjs')) 10000
  if ($lr.ok) { Add-Result 'LOCALHOST_LOOPBACK' 'PASS' $false $lr.stdout 'ephemeral 127.0.0.1 HTTP probe' 'Server started, answered and closed' }
  else { Add-Result 'LOCALHOST_LOOPBACK' 'FAIL' $true $lr.stderr 'ephemeral 127.0.0.1 HTTP probe' 'LOCALHOST-001' }
} elseif($Profile -in @('day0','http')) { Add-Result 'LOCALHOST_LOOPBACK' 'ENV_BLOCKED' $true '' 'functional Node HTTP APIs' 'Node unavailable' } else {Add-Result 'LOCALHOST_LOOPBACK' 'NOT_REQUIRED' $false '' 'HTTP profile only' 'Selected operation does not use HTTP'}

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
  $pp = @(Unique-Paths @($postman))
  if ($pp.Count -gt 0) { Add-Result 'POSTMAN' 'PASS' $false $pp[0] 'Postman Desktop from S05' 'Application detected' }
  elseif ($AckAlternativeHttpClient) { Add-Result 'POSTMAN' 'WARN' $false 'approved alternative acknowledged' 'Postman or approved alternative' 'POSTMAN-001' }
  else { Add-Result 'POSTMAN' 'ENV_BLOCKED' $false '' 'Postman Desktop from S05' 'POSTMAN-001' }
} else { Add-Result 'POSTMAN' 'NOT_REQUIRED' $false '' 'required from S05' 'Not evaluated at DAY0' }
if ($Stage -in @('S06','S08')) {
  $sqlite = @(Command-Paths 'sqlite3.exe')
  if ($sqlite.Count -eq 0) { $sqlite = @(Command-Paths 'sqlite3') }
  if ($sqlite.Count -gt 0) {
    $sr = Invoke-Tool $sqlite[0] @('--version')
    if ($sr.ok) { Add-Result 'SQLITE' 'PASS' $false $sr.stdout 'sqlite3 from S06' 'CLI works' }
    else { Add-Result 'SQLITE' 'ENV_BLOCKED' $false $sr.stderr 'sqlite3 from S06' 'SQLITE-001' }
  } else { Add-Result 'SQLITE' 'ENV_BLOCKED' $false '' 'sqlite3 from S06' 'SQLITE-001' }
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

$unsupported=0
$relevant=@($Results | Where-Object { $Profile -eq 'day0' -or $_.id -in @('NODE_VERSION','ACTIVITY_PROFILE') -or ($Profile -eq 'npm' -and $_.id -eq 'NPM_VERSION') -or ($Profile -eq 'http' -and $_.id -eq 'LOCALHOST_LOOPBACK') })
$technicalBlocking=@($relevant | Where-Object { $_.blocking -and $_.status -in @('FAIL','NOT_CHECKABLE','ENV_BLOCKED') }).Count
$manualPending=@($Results | Where-Object { $_.status -eq 'MANUAL_PENDING' }).Count
$warnings=@($Results | Where-Object { $_.status -in @('WARN','ENV_WARN','UNSUPPORTED') }).Count
if($technicalBlocking -gt 0){$Verdict='ENV_BLOCKED';$ExitCode=2}elseif($warnings -gt 0 -or $manualPending -gt 0){$Verdict='ENV_WARN';$ExitCode=0}else{$Verdict='ENV_OK';$ExitCode=0}

$payload = [PSCustomObject][ordered]@{
  schema='tw2026.environment.preflight.v2'; generatedAt=(Get-Date).ToString('o'); platform='windows'; stage=$Stage;
  kitVersion='2.2.1'; requiredNode=$RequiredNode; requiredNpm=$RequiredNpm; workspace=(Protect-Text $Workspace);
  profile=$Profile; verdict=$Verdict; exitCode=$ExitCode; counts=[PSCustomObject][ordered]@{unsupported=$unsupported;technicalBlocking=$technicalBlocking;manualPending=$manualPending;warnings=$warnings};
  results=$Results.ToArray()
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
