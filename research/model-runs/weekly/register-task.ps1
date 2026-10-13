<#
.SYNOPSIS
  Registers (or removes) the Windows scheduled task that collects the weekly model wave.

.DESCRIPTION
  WHY THIS EXISTS. Collecting a wave means 581 or so local Ollama calls over several hours. Run inside a Claude session
  that work competes with the session for memory, and this host has stopped long runs twice for low memory
  (pilot-2026-10-03 deviations D1 and D2). So collection runs OUTSIDE any session, under the OS scheduler, once a day
  at 02:00. It does one job:

      node research\model-runs\bin\weekly-wave.mjs collect --latest

  That command is Ollama-only. It talks to localhost, and nothing else. It does not call Claude. It does not run
  git add, commit or push. It does not deploy and it does not write a score or any site file. It refuses to start
  unless the wave's plan is committed and unmodified, it checks free memory first and defers (exit 5) instead of
  risking a host stop, and it takes a lock so two runs never overlap. When nothing needs collecting it exits 0 at once.
  Failures land in <wave>\operations\collect-status.json, and the session runbook reads them with
  "weekly-wave.mjs status" before doing anything else.

  The task runs as the CURRENT user, NOT elevated, only while that user is logged on (Ollama runs in the user's session).
  StartWhenAvailable runs a missed 02:00 run when the machine is next available. A run is stopped after 6 hours.

  The founder runs this script. Nothing in the repository runs it.

.PARAMETER Unregister
  Removes the task instead of creating it.

.PARAMETER WhatIf
  Prints what would be done and changes nothing (standard PowerShell -WhatIf).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File research\model-runs\weekly\register-task.ps1 -WhatIf
  powershell -ExecutionPolicy Bypass -File research\model-runs\weekly\register-task.ps1
  powershell -ExecutionPolicy Bypass -File research\model-runs\weekly\register-task.ps1 -Unregister
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [switch]$Unregister
)

$ErrorActionPreference = 'Stop'
$TaskName = 'CompassionBenchmark-WeeklyCollect'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$Script = Join-Path $RepoRoot 'research\model-runs\bin\weekly-wave.mjs'
$User = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

if ($Unregister) {
  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if (-not $existing) {
    Write-Host "Task $TaskName is not registered; nothing to remove."
    return
  }
  if ($PSCmdlet.ShouldProcess($TaskName, 'Unregister scheduled task')) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed scheduled task $TaskName."
  }
  return
}

if (-not (Test-Path $Script)) {
  throw "Cannot find $Script. Run this script from a checkout that has research\model-runs\bin\weekly-wave.mjs."
}
$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node) {
  throw 'node.exe is not on PATH for this user. Install Node.js or fix PATH, then retry.'
}
$NodePath = $node.Source

$arguments = '"' + $Script + '" collect --latest'
$action = New-ScheduledTaskAction -Execute $NodePath -Argument $arguments -WorkingDirectory $RepoRoot
$trigger = New-ScheduledTaskTrigger -Daily -At '02:00'
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 6) `
  -MultipleInstances IgnoreNew `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType Interactive -RunLevel Limited

Write-Host "Task:              $TaskName"
Write-Host "Command:           $NodePath $arguments"
Write-Host "Working directory: $RepoRoot"
Write-Host "Schedule:          daily at 02:00, StartWhenAvailable, 6 hour limit"
Write-Host "Runs as:           $User (interactive logon, not elevated)"

if ($PSCmdlet.ShouldProcess($TaskName, 'Register scheduled task')) {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Collects the latest planned weekly model wave (Ollama only; never publishes, commits, pushes or deploys). See research/model-runs/weekly/ and .claude/commands/weekly-model-wave.md.' `
    -Force | Out-Null
  Write-Host "Registered $TaskName. Check it with: Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo"
}
