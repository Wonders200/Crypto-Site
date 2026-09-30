# Pre-warms every route so the first browser visit is instant.
# Run this AFTER `npm run dev` has started.
$ErrorActionPreference = "Continue"

$routes = @(
  "/",
  "/markets",
  "/trade/btc",
  "/dashboard",
  "/balance",
  "/earn",
  "/pricing",
  "/learn",
  "/news",
  "/kyc",
  "/login",
  "/signup",
  "/settings",
  "/about",
  "/admin",
  "/admin/login",
  "/admin/assets",
  "/admin/users",
  "/admin/kyc",
  "/admin/sessions",
  "/admin/holdings",
  "/admin/balance",
  "/admin/deposit-addresses",
  "/admin/transactions",
  "/admin/orders",
  "/admin/news",
  "/admin/testimonials",
  "/admin/learn",
  "/admin/earn",
  "/admin/earn-positions",
  "/admin/pricing",
  "/admin/settings",
  "/admin/audit",
  "/admin/activity",
  "/admin/debug"
)

Write-Host "Warming up $($routes.Count) routes" -ForegroundColor Cyan

$start = Get-Date
foreach ($route in $routes) {
  try {
    $url = "http://localhost:3001$route"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 | Out-Null
    $sw.Stop()
    Write-Host ("  {0,6}ms  {1}" -f [int]$sw.ElapsedMilliseconds, $route) -ForegroundColor Green
  } catch {
    Write-Host "  FAILED   $route" -ForegroundColor Red
  }
}

$total = ((Get-Date) - $start).TotalSeconds
Write-Host "`n Warmed up in $([int]$total)s  subsequent visits are instant" -ForegroundColor Cyan