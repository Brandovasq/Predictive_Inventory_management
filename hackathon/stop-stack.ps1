$ports = @(5001, 5173, 5174)
$killed = @()

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $port }

    foreach ($conn in $connections) {
        if ($killed -notcontains $conn.OwningProcess) {
            try {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
                $killed += $conn.OwningProcess
                Write-Output "Stopped PID $($conn.OwningProcess) on port $port"
            }
            catch {
                Write-Output "Could not stop PID $($conn.OwningProcess) on port $port"
            }
        }
    }
}

if ($killed.Count -eq 0) {
    Write-Output "No stack processes found on ports 5001/5173/5174"
}
