$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$zipPath = Join-Path $distDir "pmvhaven-playlist-helper-v1.0.0.zip"

if (!(Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath
}

$files = @(
  "manifest.json",
  "background.js",
  "popup.html",
  "popup.js",
  "options.html",
  "options.js",
  "icon.png",
  "README.md",
  "LICENSE",
  "PRIVACY.md",
  "STORE_LISTING.md",
  "SEND_TO_PMVHAVEN.md"
)

$tempDir = Join-Path $distDir "package"
if (Test-Path $tempDir) {
  Remove-Item -LiteralPath $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination (Join-Path $tempDir $file)
}

Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath
Remove-Item -LiteralPath $tempDir -Recurse -Force

Write-Host "Created $zipPath"
