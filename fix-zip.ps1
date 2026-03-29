$sourceFirefox = "f:\Projets en cours\AgregLLM\dist-extensions\firefox"
$destFirefox = "f:\Projets en cours\AgregLLM\dist-extensions\agregllm-firefox.xpi"

$sourceChrome = "f:\Projets en cours\AgregLLM\dist-extensions\chrome"
$destChrome = "f:\Projets en cours\AgregLLM\dist-extensions\agregllm-chrome.zip"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Create-Zip {
    param($source, $destination)
    if (Test-Path $destination) { Remove-Item $destination }
    
    $zipArchive = [System.IO.Compression.ZipFile]::Open($destination, 'Create')
    
    Get-ChildItem $source -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
        # Calculer le chemin relatif avec des slashs (/)
        $relPath = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $_.FullName, $relPath)
    }
    
    $zipArchive.Dispose()
    Write-Host "Archive créée : $destination avec des slashs (/) pour les chemins."
}

Create-Zip $sourceFirefox $destFirefox
Create-Zip $sourceChrome $destChrome
