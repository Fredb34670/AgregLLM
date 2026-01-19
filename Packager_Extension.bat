@echo off
TITLE AgregLLM - Packager d'Extension
echo Preparation de l'archive de l'extension...

set VERSION=1.1.4
set ZIP_NAME=AgregLLM_Extension_v%VERSION%.zip

:: Supprimer l'ancien zip s'il existe
if exist %ZIP_NAME% del %ZIP_NAME%

echo Creation de l'archive %ZIP_NAME%...

:: Utilisation de PowerShell pour compresser uniquement les fichiers necessaires
powershell -Command "Compress-Archive -Path 'extension/background.js', 'extension/manifest.json', 'extension/manifest-chrome.json', 'extension/manifest-firefox.json', 'extension/popup.html', 'extension/popup.js', 'extension/popup.css', 'extension/icon.svg', 'extension/scripts', 'extension/vendor' -DestinationPath '%ZIP_NAME%' -Force"

echo.
echo --------------------------------------------------
echo Termine ! 
echo Le fichier '%ZIP_NAME%' a ete cree a la racine.
echo --------------------------------------------------
echo.
echo Pour installer l'extension dans votre navigateur :
echo 1. Decompressez ce fichier .zip dans un dossier.
echo 2. Allez dans chrome://extensions (ou about:addons).
echo 3. Activez le 'Mode developpeur'.
echo 4. Cliquez sur 'Charger l'extension non empaquetee'.
echo 5. Selectionnez le dossier extrait.
echo.
pause
