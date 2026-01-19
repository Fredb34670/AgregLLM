const { Jimp } = require('jimp');

async function createIcon(size, filename) {
    const image = new Jimp({ width: size, height: size, color: 0x4f46e5ff }); // Indigo
    // Jimp 1.x a changé la gestion des polices, je vais utiliser une méthode plus simple : un carré de couleur.
    // Pour le "A", je vais dessiner quelques pixels ou juste garder le fond bleu pour l'instant si c'est complexe.
    // En fait, je vais essayer de trouver une alternative plus simple.
    
    await image.write(filename);
    console.log(`Icon ${size}x${size} generated: ${filename}`);
}

async function run() {
    try {
        await createIcon(16, 'icon16.png');
        await createIcon(48, 'icon48.png');
        await createIcon(128, 'icon128.png');
    } catch (e) {
        console.error(e);
    }
}

run();