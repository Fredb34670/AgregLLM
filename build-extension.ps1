# Script de build des extensions Firefox et Chrome
Write-Host "=== AgregLLM Extension Builder ===" -ForegroundColor Green
Write-Host ""

# Créer le dossier de sortie
$outputDir = "dist-extensions"
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Fichiers à inclure dans l'extension
$files = @(
    "background.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "icon-192.png",
    "icon-512.png",
    "icon.svg",
    "manifest.json"
)

$folders = @(
    "vendor",
    "scripts",
    "assets"
)

# === BUILD FIREFOX ===
Write-Host "Building Firefox extension..." -ForegroundColor Cyan
$firefoxDir = "$outputDir/firefox"
New-Item -ItemType Directory -Path $firefoxDir | Out-Null

# Copier manifest Firefox
Copy-Item "extension/manifest-firefox.json" "$firefoxDir/manifest.json"

# Copier les fichiers
foreach ($file in $files) {
    if ($file -ne "manifest.json" -and (Test-Path "extension/$file")) {
        Copy-Item "extension/$file" "$firefoxDir/$file"
    }
}

# Copier les dossiers
foreach ($folder in $folders) {
    if (Test-Path "extension/$folder") {
        Copy-Item "extension/$folder" "$firefoxDir/$folder" -Recurse
    }
}

Write-Host "✓ Firefox extension built in $firefoxDir" -ForegroundColor Green

# Créer le .xpi (ZIP renommé)
Write-Host "Creating Firefox .xpi package..." -ForegroundColor Cyan
Compress-Archive -Path "$firefoxDir/*" -DestinationPath "$outputDir/agregllm-firefox.zip" -Force
Move-Item "$outputDir/agregllm-firefox.zip" "$outputDir/agregllm-firefox.xpi" -Force
Write-Host "✓ Firefox package: $outputDir/agregllm-firefox.xpi" -ForegroundColor Green

# === BUILD CHROME ===
Write-Host ""
Write-Host "Building Chrome extension..." -ForegroundColor Cyan
$chromeDir = "$outputDir/chrome"
New-Item -ItemType Directory -Path $chromeDir | Out-Null

# Copier manifest Chrome avec background-chrome.js
Copy-Item "extension/manifest-chrome.json" "$chromeDir/manifest.json"

# Modifier le manifest pour utiliser background-chrome.js
$manifest = Get-Content "$chromeDir/manifest.json" | ConvertFrom-Json
$manifest.background.service_worker = "background-chrome.js"
$manifest | ConvertTo-Json -Depth 10 | Set-Content "$chromeDir/manifest.json"

# Copier background-chrome.js
Copy-Item "extension/background-chrome.js" "$chromeDir/background.js"

# Copier les autres fichiers
foreach ($file in $files) {
    if ($file -ne "manifest.json" -and $file -ne "background.js" -and (Test-Path "extension/$file")) {
        Copy-Item "extension/$file" "$chromeDir/$file"
    }
}

# Copier les dossiers (Chrome n'a pas besoin du polyfill dans le background)
foreach ($folder in $folders) {
    if (Test-Path "extension/$folder") {
        Copy-Item "extension/$folder" "$chromeDir/$folder" -Recurse
    }
}

Write-Host "✓ Chrome extension built in $chromeDir" -ForegroundColor Green

# Créer le .zip pour Chrome
Write-Host "Creating Chrome .zip package..." -ForegroundColor Cyan
Compress-Archive -Path "$chromeDir/*" -DestinationPath "$outputDir/agregllm-chrome.zip" -Force
Write-Host "✓ Chrome package: $outputDir/agregllm-chrome.zip" -ForegroundColor Green

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "Firefox: $outputDir/agregllm-firefox.xpi"
Write-Host "Chrome: $outputDir/agregllm-chrome.zip"
Write-Host ""
Write-Host "Installation:" -ForegroundColor Yellow
Write-Host "- Firefox: about:addons -> Install Add-on From File -> Select agregllm-firefox.xpi"
Write-Host "- Chrome: chrome://extensions -> Enable Developer Mode -> Load unpacked -> Select chrome folder"
