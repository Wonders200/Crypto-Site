# Checks all .tsx files for the generic arrow function bug
Set-Location ~\crypto-site
$pattern = '<([A-Z][a-zA-Z0-9_]*(?:\s+extends\s+[^>,]+)?)>(\s*\()'
$issues = 0
Get-ChildItem "app","components" -Recurse -File -Include *.tsx,*.ts | ForEach-Object {
  $src = [System.IO.File]::ReadAllText($_.FullName)
  $m = [regex]::Matches($src, $pattern)
  if ($m.Count -gt 0) {
    Write-Host "   $($_.Name)  $($m.Count) unescaped generic(s)" -ForegroundColor Yellow
    $issues += $m.Count
  }
}
if ($issues -eq 0) { Write-Host "   No generic arrow function issues" -ForegroundColor Green }