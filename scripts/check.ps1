# Workspace check entry point (first-party repo): ./scripts/check.ps1 fast|quick|full
#   fast  : lint + content integrity tests
#   quick : typecheck + lint + all unit tests
#   full  : quick + both static builds + Playwright/axe browser tests
param([ValidateSet('fast', 'quick', 'full')][string]$Tier = 'quick')
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    npm run "check:$Tier"
    if ($LASTEXITCODE -ne 0) { throw "check:$Tier failed (exit $LASTEXITCODE)" }
    Write-Host ("check:{0} passed in {1:n1}s" -f $Tier, $sw.Elapsed.TotalSeconds)
} finally {
    Pop-Location
}
