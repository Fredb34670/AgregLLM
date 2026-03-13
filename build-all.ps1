# Script de build complet (Webapp + Extensions)
Write-Host "=== AgregLLM Complete Build ===" -ForegroundColor Green
Write-Host ""

# Build Webapp
Write-Host "1. Building Webapp..." -ForegroundColor Cyan
Set-Location webapp
npm run build
Write-Host "✓ Webapp built in webapp/dist" -ForegroundColor Green

# Synchroniser les assets avec l'extension
Write-Host "Syncing assets to extension..." -ForegroundColor Yellow
$extAssets = "../extension/assets"
if (-not (Test-Path $extAssets)) { New-Item -ItemType Directory -Path $extAssets }
Remove-Item "$extAssets/index-*.js", "$extAssets/index-*.css" -ErrorAction SilentlyContinue
Copy-Item "dist/assets/index-*.js" $extAssets
Copy-Item "dist/assets/index-*.css" $extAssets

# Mettre à jour index.html de l'extension avec les nouveaux hashes
$distIndex = Get-Content "dist/index.html" -Raw
$jsHash = [regex]::Match($distIndex, 'index-[\w-]+\.js').Value
$cssHash = [regex]::Match($distIndex, 'index-[\w-]+\.css').Value

if ($jsHash -and $cssHash) {
    $extIndex = Get-Content "../extension/index.html" -Raw
    $extIndex = $extIndex -replace 'index-[\w-]+\.js', $jsHash
    $extIndex = $extIndex -replace 'index-[\w-]+\.css', $cssHash
    $extIndex | Set-Content "../extension/index.html"
    Write-Host "✓ Extension index.html updated with $jsHash and $cssHash" -ForegroundColor Green
}

Set-Location ..

# Build Webapp pour GitHub Pages
Write-Host ""
Write-Host "2. Building Webapp for GitHub Pages..." -ForegroundColor Cyan
Set-Location webapp
npm run build:github
if (Test-Path "../docs") {
    Remove-Item "../docs" -Recurse -Force
}
Copy-Item "dist" "../docs" -Recurse
Write-Host "✓ GitHub Pages build in docs/" -ForegroundColor Green
Set-Location ..

# Build Extensions
Write-Host ""
Write-Host "3. Building Extensions..." -ForegroundColor Cyan
.\build-extension.ps1

Write-Host ""
Write-Host "=== All Builds Complete ===" -ForegroundColor Green
Write-Host "Webapp local: webapp/dist"
Write-Host "Webapp GitHub: docs/"
Write-Host "Extensions: dist-extensions/"
