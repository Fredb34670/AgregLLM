# Script de build complet (Webapp + Extensions)
Write-Host "=== AgregLLM Complete Build ===" -ForegroundColor Green
Write-Host ""

# Build Webapp
Write-Host "1. Building Webapp..." -ForegroundColor Cyan
Set-Location webapp
npm run build
Write-Host "✓ Webapp built in webapp/dist" -ForegroundColor Green
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
