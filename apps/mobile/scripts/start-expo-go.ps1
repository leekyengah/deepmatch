# Start DeepMatch for Expo Go (phone)
# Forces apps/mobile as Metro root (not monorepo root).
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$env:EXPO_NO_TELEMETRY = "1"
$env:EXPO_NO_METRO_WORKSPACE_ROOT = "1"
Remove-Item Env:CI -ErrorAction SilentlyContinue

if (-not (Test-Path .env)) {
  Write-Error "Missing apps/mobile/.env"
}

Write-Host "Expo account:" -ForegroundColor Cyan
npx expo whoami

$wifi = (Get-NetIPConfiguration | Where-Object {
  $_.InterfaceAlias -match 'Wi-?Fi' -and $_.IPv4Address
} | Select-Object -First 1).IPv4Address.IPAddress

Write-Host @"

Metro will listen on LAN.
Same Wi-Fi → Expo Go → Enter URL:
  exp://$wifi`:8081

If phone cannot reach PC (AP isolation / guest Wi-Fi), run in another terminal:
  npx cloudflared tunnel --url http://127.0.0.1:8081
then in Expo Go use:
  exps://<subdomain>.trycloudflare.com:443

"@ -ForegroundColor Cyan

npx expo start --host lan --port 8081
