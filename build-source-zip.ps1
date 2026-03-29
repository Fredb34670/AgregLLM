$root = "f:\Projets en cours\AgregLLM"
$destZip = "f:\Projets en cours\AgregLLM\dist-extensions\agregllm-source.zip"
$tempDir = "f:\Projets en cours\AgregLLM\temp-source-bundle"

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Liste des dossiers et fichiers à inclure
$includes = @("extension", "webapp", "build-extension.ps1", "build-extension.sh", "SOURCE_CODE_README.md", "README.md", ".gitignore")

foreach ($item in $includes) {
    if (Test-Path "$root\$item") {
        if ($item -eq "webapp") {
            # Copier webapp en excluant node_modules and dist
            $destWebapp = "$tempDir\webapp"
            New-Item -ItemType Directory -Path $destWebapp | Out-Null
            Copy-Item "$root\webapp\*" "$destWebapp" -Recurse -Exclude "node_modules", "dist", "coverage", ".vite", ".next" -Force
        }
        elseif ($item -eq "SOURCE_CODE_README.md") {
            # Renommer en README.md pour le pack de source
            Copy-Item "$root\$item" "$tempDir\README_BUILD.md" -Force
        }
        else {
            Copy-Item "$root\$item" "$tempDir" -Recurse -Force
        }
    }
}

# Créer l'archive avec des slashs (/)
if (Test-Path $destZip) { Remove-Item $destZip }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipArchive = [System.IO.Compression.ZipFile]::Open($destZip, 'Create')

Get-ChildItem $tempDir -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $relPath = $_.FullName.Substring($tempDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $_.FullName, $relPath)
}

$zipArchive.Dispose()
Remove-Item $tempDir -Recurse -Force

Write-Host "Archive source créée : $destZip"
