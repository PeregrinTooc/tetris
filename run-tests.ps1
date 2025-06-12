$npmCmd = (Get-Command npm.cmd).Source

if (-not $npmCmd) {
    Write-Error "npm.cmd not found in PATH"
    exit 1
}

try {
    Write-Host "Starting Vite server..."
    $viteProcess = Start-Process -FilePath $npmCmd -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    
    # Wait for Vite server to be ready
    $maxAttempts = 10
    $attempt = 0
    $serverReady = $false
    
    while (-not $serverReady -and $attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method HEAD -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                Write-Host "Vite server is ready"
            }
        }
        catch {
            Write-Host "Waiting for Vite server... Attempt $($attempt + 1) of $maxAttempts"
            Start-Sleep -Seconds 1
            $attempt++
        }
    }
    
    if (-not $serverReady) {
        throw "Vite server failed to start after $maxAttempts attempts"
    }
    
    Write-Host "Running unit tests..."
    & $npmCmd run test:unit
    
    Write-Host "Running E2E tests..."
    & $npmCmd run test:e2e
} 
catch {
    Write-Error $_.Exception.Message
    exit 1
} 
finally {
    if ($viteProcess) {
        Write-Host "Shutting down Vite server..."
        Stop-Process -Id $viteProcess.Id -Force -ErrorAction SilentlyContinue
    }
}