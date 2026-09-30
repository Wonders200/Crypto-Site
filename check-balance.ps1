Set-Location ~\crypto-site
$bad = 0
Get-ChildItem "app","components" -Recurse -File -Include *.tsx | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName)
  $ob = ([regex]::Matches($c, '\{')).Count
  $cb = ([regex]::Matches($c, '\}')).Count
  $op = ([regex]::Matches($c, '\(')).Count
  $cp = ([regex]::Matches($c, '\)')).Count
  if ($ob -ne $cb -or $op -ne $cp) {
    $rel = $_.FullName.Substring((Join-Path $PWD "").Length)
    Write-Host "   $rel  braces $ob/$cb parens $op/$cp" -ForegroundColor Red
    $bad++
  }
}
if ($bad -eq 0) { Write-Host "   All files balanced" -ForegroundColor Green }
else { Write-Host "   $bad file(s) need attention" -ForegroundColor Yellow }