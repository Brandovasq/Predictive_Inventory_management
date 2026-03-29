$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend1"
$frontendDir = Join-Path $root "frontend"
$frontend2Dir = Join-Path $root "frontend2"
$pythonExe = "c:/python314/python.exe"

function Start-StackProcess {
    param(
        [string]$Title,
        [string]$Command
    )

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "$Host.UI.RawUI.WindowTitle='$Title'; $Command"
    ) | Out-Null
}

Start-StackProcess -Title "Backend-5001" -Command "Set-Location '$backendDir'; $pythonExe app.py"
Start-StackProcess -Title "Frontend-5173" -Command "npm --prefix '$frontendDir' run dev -- --host --port 5173"
Start-StackProcess -Title "Frontend2-5174" -Command "npm --prefix '$frontend2Dir' run dev -- --host --port 5174"

Start-Sleep -Seconds 4

$checks = @(
    "http://127.0.0.1:5001/health",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
)

foreach ($url in $checks) {
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Output "$url -> $($resp.StatusCode)"
    }
    catch {
        Write-Output "$url -> DOWN"
    }
}
