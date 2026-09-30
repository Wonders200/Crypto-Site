# Safer auto-repair: only adds REAL lucide icons that aren't already defined elsewhere
$ErrorActionPreference = "Stop"
Set-Location ~\crypto-site

# Full list of REAL lucide icons (extend if you use new ones)
$knownIcons = @(
  "Activity","AlertCircle","AlertTriangle","ArrowDown","ArrowDownToLine","ArrowLeft",
  "ArrowLeftRight","ArrowRight","ArrowUp","ArrowUpFromLine","ArrowUpRight","Award",
  "BadgeCheck","BarChart2","BarChart3","Bell","Bitcoin","BookOpen","Building","Building2",
  "Calculator","Calendar","Camera","Check","CheckCircle","CheckCircle2","ChevronDown",
  "ChevronLeft","ChevronRight","ChevronUp","CircleDollarSign","Clock","Coins","Copy",
  "CreditCard","Database","DollarSign","Download","Edit","Edit2","Edit3","ExternalLink",
  "Eye","EyeOff","Facebook","FileDown","FileJson","FileSpreadsheet","FileText",
  "Flag","Globe","GraduationCap","Hash","HelpCircle","Image","ImageIcon","Info",
  "Instagram","Key","Layers","LayoutDashboard","LifeBuoy","Link2","Linkedin",
  "ListOrdered","Loader","Loader2","Lock","LogIn","LogOut","Mail","MapPin","Menu",
  "MessageCircle","MessageSquare","Minus","Monitor","Moon","MoreHorizontal","MoreVertical",
  "Newspaper","Package","Percent","PieChart","Pin","PinOff","Play","Plus","PlusCircle",
  "Power","Printer","QrCode","Quote","RefreshCw","Receipt","RotateCw","Search","Send",
  "Settings2","Share","Share2","Shield","ShieldAlert","ShieldCheck","ShoppingBag",
  "ShoppingCart","Sliders","SlidersHorizontal","Sparkles","Star","Sun","Tag","Thermometer",
  "Trash","Trash2","TrendingDown","TrendingUp","Twitter","Upload","UploadCloud","User",
  "UserCircle","UserCircle2","UserPlus","Wallet","X","XCircle","Zap","ZoomIn","ZoomOut"
)

$files = Get-ChildItem "app" -Recurse -File -Include *.tsx
$files += Get-ChildItem "components" -Recurse -File -Include *.tsx
$fixed = 0

foreach ($f in $files) {
  $src = [System.IO.File]::ReadAllText($f.FullName)
  $m = [regex]::Match($src, 'import\s*\{([^}]+)\}\s*from\s*"lucide-react";')
  if (!$m.Success) { continue }
  $current = $m.Groups[1].Value.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

  # Names provided by the lucide import (respecting `as` aliases)
  $provided = @{}
  foreach ($item in $current) {
    if ($item -match '^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$') { $provided[$Matches[2]] = $true }
    else { $provided[$item] = $true }
  }

  # Names defined elsewhere in the file (imports from other modules, local vars)
  $definedElsewhere = @{}
  [regex]::Matches($src, 'import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+"(?!lucide-react)') | ForEach-Object {
    $definedElsewhere[$_.Groups[1].Value] = $true
  }
  [regex]::Matches($src, 'import\s*\{([^}]+)\}\s*from\s+"(?!lucide-react)') | ForEach-Object {
    $_.Groups[1].Value.Split(",") | ForEach-Object {
      $name = $_.Trim()
      if ($name -match '^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$') { $name = $Matches[2] }
      if ($name -and $name -match '^[A-Z]') { $definedElsewhere[$name] = $true }
    }
  }
  [regex]::Matches($src, '(?:const|function|let|var)\s+([A-Z][A-Za-z0-9_]*)') | ForEach-Object {
    $definedElsewhere[$_.Groups[1].Value] = $true
  }
  [regex]::Matches($src, 'icon:\s*([A-Z][A-Za-z0-9_]*)') | ForEach-Object {
    $definedElsewhere[$_.Groups[1].Value] = $true
  }

  # Find missing real icons
  $missing = @()
  foreach ($icon in $knownIcons) {
    if ($provided.ContainsKey($icon)) { continue }
    if ($definedElsewhere.ContainsKey($icon)) { continue }
    if ($src -match "<$icon(\s|/|>)") { $missing += $icon }
  }
  if ($missing.Count -eq 0) { continue }

  $allIcons = @($current) + $missing | Select-Object -Unique
  $newImport = 'import { ' + ($allIcons -join ', ') + ' } from "lucide-react";'
  $src = $src.Replace($m.Value, $newImport)
  [System.IO.File]::WriteAllText($f.FullName, $src, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  + $($f.Name)  added: $($missing -join ', ')" -ForegroundColor Green
  $fixed++
}
Write-Host "Done. Fixed $fixed file(s)." -ForegroundColor Green