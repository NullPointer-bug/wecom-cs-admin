$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverUrl = 'http://127.0.0.1:5173/'
$pageUrl = 'http://127.0.0.1:5173/#mass-tasks'
$serverScript = Join-Path $root 'dev_server.py'

function Test-PreviewServer {
  try {
    $response = Invoke-WebRequest -Uri $serverUrl -UseBasicParsing -TimeoutSec 1
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-PreviewServer)) {
  $pythonCandidates = @(
    (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\pythonw.exe'),
    (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe')
  )

  $python = $pythonCandidates |
    Where-Object { Test-Path -LiteralPath $_ } |
    Select-Object -First 1

  if (-not $python) {
    $pythonCommand = Get-Command py.exe, python.exe -ErrorAction SilentlyContinue |
      Where-Object { $_.Source -notlike '*WindowsApps*' } |
      Select-Object -First 1
    $python = $pythonCommand.Source
  }

  if (-not $python) {
    throw 'Python runtime was not found.'
  }

  $serverProcess = Start-Process `
    -FilePath $python `
    -ArgumentList @('dev_server.py') `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -PassThru

  $started = $false
  foreach ($attempt in 1..30) {
    Start-Sleep -Milliseconds 200
    if (Test-PreviewServer) {
      $started = $true
      break
    }
    if ($serverProcess.HasExited) {
      break
    }
  }

  if (-not $started) {
    if (-not $serverProcess.HasExited) {
      Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    throw 'Local preview server failed to start.'
  }
}

Start-Process $pageUrl
