#!/bin/bash
# Script de build des extensions Firefox et Chrome (Linux/macOS)

echo "=== AgregLLM Extension Builder ==="
echo ""

# Créer le dossier de sortie
outputDir="dist-extensions"
if [ -d "$outputDir" ]; then
    rm -rf "$outputDir"
fi
mkdir -p "$outputDir"

# Fichiers à inclure
files=(
    "background.js"
    "popup.html"
    "popup.css"
    "popup.js"
    "icon-192.png"
    "icon-512.png"
    "icon.svg"
    "manifest.json"
)

folders=(
    "vendor"
    "scripts"
    "assets"
)

# === BUILD FIREFOX ===
echo "Building Firefox extension..."
firefoxDir="$outputDir/firefox"
mkdir -p "$firefoxDir"

# Copier manifest Firefox
cp "extension/manifest-firefox.json" "$firefoxDir/manifest.json"

# Copier les fichiers
for file in "${files[@]}"; do
    if [ "$file" != "manifest.json" ] && [ -f "extension/$file" ]; then
        cp "extension/$file" "$firefoxDir/$file"
    fi
done

# Copier les dossiers
for folder in "${folders[@]}"; do
    if [ -d "extension/$folder" ]; then
        cp -r "extension/$folder" "$firefoxDir/$folder"
    fi
done

echo "✓ Firefox extension built in $firefoxDir"

# Créer le .xpi
echo "Creating Firefox .xpi package..."
cd "$firefoxDir"
zip -r "../agregllm-firefox.xpi" ./* > /dev/null
cd ../..
echo "✓ Firefox package: $outputDir/agregllm-firefox.xpi"

# === BUILD CHROME ===
echo ""
echo "Building Chrome extension..."
chromeDir="$outputDir/chrome"
mkdir -p "$chromeDir"

# Copier manifest Chrome
cp "extension/manifest-chrome.json" "$chromeDir/manifest.json"

# Copier background-chrome.js
cp "extension/background-chrome.js" "$chromeDir/background-chrome.js"

# Copier les autres fichiers
for file in "${files[@]}"; do
    if [ "$file" != "manifest.json" ] && [ "$file" != "background.js" ] && [ -f "extension/$file" ]; then
        cp "extension/$file" "$chromeDir/$file"
    fi
done

# Copier les dossiers
for folder in "${folders[@]}"; do
    if [ -d "extension/$folder" ]; then
        cp -r "extension/$folder" "$chromeDir/$folder"
    fi
done

echo "✓ Chrome extension built in $chromeDir"

# Créer le .zip pour Chrome
echo "Creating Chrome .zip package..."
cd "$chromeDir"
zip -r "../agregllm-chrome.zip" ./* > /dev/null
cd ../..
echo "✓ Chrome package: $outputDir/agregllm-chrome.zip"

echo ""
echo "=== Build Complete ==="
echo "Firefox: $outputDir/agregllm-firefox.xpi"
echo "Chrome: $outputDir/agregllm-chrome.zip"
