# Founder one-shot: Expo login + EAS iOS preview → TestFlight
# Prereq: Apple Developer Program; optional EXPO_TOKEN for CI
# Usage:  pwsh scripts/eas-testflight.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\apps\mobile")

if (-not (Test-Path .env)) {
  Write-Error "Missing apps/mobile/.env — copy from .env.example and fill Supabase keys"
}

if ($env:EXPO_TOKEN) {
  Write-Host "Using EXPO_TOKEN"
} else {
  Write-Host "Interactive login required…"
  npx eas-cli login
}

npx eas-cli init --id --non-interactive 2>$null
if ($LASTEXITCODE -ne 0) {
  npx eas-cli init
}

Write-Host "Building iOS preview (TestFlight distribution)…"
npx eas-cli build --platform ios --profile preview --non-interactive

Write-Host @"

Next in App Store Connect:
1. Create app com.datingvn.deepmatch if missing
2. Subscription product premium_monthly
3. ASN V2 → https://datingvn.com/api/v1/payments/apple/notifications
4. After build finishes: Process → TestFlight → Internal testing
5. When ready for prod: npx eas-cli build -p ios --profile production && npx eas-cli submit -p ios

"@
