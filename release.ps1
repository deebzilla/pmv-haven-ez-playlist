$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $projectRoot "dist"
$extensionZipPath = Join-Path $distDir "pmvhaven-playlist-helper-extension-v1.0.0.zip"
$sourceZipPath = Join-Path $distDir "pmvhaven-playlist-helper-source-v1.0.0.zip"

if (!(Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

foreach ($zipPath in @($extensionZipPath, $sourceZipPath)) {
  if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath
  }
}

$extensionFiles = @(
  "manifest.json",
  "background.js",
  "popup.html",
  "popup.js",
  "options.html",
  "options.js",
  "icon.png"
)

$sourceFiles = $extensionFiles + @(
  "README.md",
  "LICENSE",
  "PRIVACY.md",
  "STORE_LISTING.md",
  "SEND_TO_PMVHAVEN.md",
  "release.ps1"
)

$packages = @(
  @{ Name = "extension"; Zip = $extensionZipPath; Files = $extensionFiles },
  @{ Name = "source"; Zip = $sourceZipPath; Files = $sourceFiles }
)

foreach ($package in $packages) {
  $tempDir = Join-Path $distDir ("package-" + $package.Name)
  if (Test-Path $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $tempDir | Out-Null

  foreach ($file in $package.Files) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination (Join-Path $tempDir $file)
  }

  Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $package.Zip
  Remove-Item -LiteralPath $tempDir -Recurse -Force
}

Write-Host "Created $extensionZipPath"
Write-Host "Created $sourceZipPath"
