# Run this on a schedule (Task Scheduler, cron, etc.) for automatic backups
Set-Location ~\crypto-site
try {
  $res = Invoke-WebRequest -Uri "http://localhost:3001/api/backup" -Method POST -UseBasicParsing
  Write-Host " Backup ran: $($res.Content)"
} catch {
  Write-Host " Backup failed: $_"
}