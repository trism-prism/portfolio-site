#requires -Version 7
# Deterministic "done" gate. fast: lint+types; quick: + unit tests; full: + production build (fails while placeholders remain).
param([ValidateSet('fast', 'quick', 'full')][string]$Tier = 'quick')
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
$failed = @()
function Step([string]$Name, [string[]]$Tiers, [scriptblock]$Run) {
    if ($Tiers -notcontains $script:Tier) { return }
    Write-Host "-> $Name" -ForegroundColor Cyan
    try { & $Run; if ($LASTEXITCODE) { throw "exit $LASTEXITCODE" } } catch { Write-Host "   FAILED: $Name ($_)" -ForegroundColor Red; $script:failed += $Name }
}
try {
    Step 'typecheck + lint' @('fast', 'quick', 'full') { npm run check --silent }
    Step 'unit tests' @('quick', 'full') { npm test --silent }
    Step 'production build' @('full') { npm run build --silent }
} finally { Pop-Location }
if ($failed.Count) { Write-Host "check ($Tier): FAILED -> $($failed -join ', ')" -ForegroundColor Red; exit 1 }
Write-Host "check ($Tier): OK" -ForegroundColor Green
