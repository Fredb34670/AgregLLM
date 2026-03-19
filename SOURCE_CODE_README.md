# AgregLLM - Instructions de Build

## Prérequis

### Système d'exploitation
- Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 20.04+)

### Logiciels requis
- **Node.js** : Version 18.x ou 20.x
  - Téléchargement : https://nodejs.org/
  - Vérifier la version : `node --version`
- **npm** : Version 9.x ou 10.x (inclus avec Node.js)
  - Vérifier la version : `npm --version`
- **Git** (optionnel, pour cloner le dépôt)

---

## Structure du projet

```
AgregLLM/
├── extension/          # Code source de l'extension (JavaScript pur)
│   ├── background.js   # Script de fond (non minifié)
│   ├── popup.js        # Script de la popup (non minifié)
│   ├── popup.html
│   ├── scripts/
│   │   ├── content.js  # Script de contenu (non minifié)
│   │   ├── sync.js
│   │   └── url_detector.js
│   ├── vendor/
│   │   └── browser-polyfill.js  # Polyfill Mozilla (inchangé)
│   ├── manifest-firefox.json
│   └── ...
├── webapp/             # Application React (TypeScript, nécessite build)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── build-extension.ps1 # Script de build automatique
```

---

## Instructions de compilation

### Étape 1 : Installation des dépendances

```bash
cd webapp
npm install
```

**Durée estimée** : 1-3 minutes (selon la connexion internet)

### Étape 2 : Build de l'application webapp

```bash
npm run build
```

**Durée estimée** : 10-30 secondes

**Résultat** : Les fichiers compilés sont générés dans `webapp/dist/`

### Étape 3 : Build de l'extension Firefox

#### Sur Windows (PowerShell) :
```powershell
cd ..
.\build-extension.ps1
```

#### Sur macOS/Linux (Bash) :
```bash
cd ..
bash build-extension.sh
```

**Durée estimée** : 5-10 secondes

**Résultat** : 
- Dossier : `dist-extensions/firefox/`
- Package : `dist-extensions/agregllm-firefox.xpi`

---

## Vérification du build

### Comparer avec le fichier soumis

1. Extrayez le fichier `.xpi` soumis :
   ```bash
   unzip agregllm-firefox.xpi -d verification/
   ```

2. Comparez avec `dist-extensions/firefox/` :
   - Les fichiers JavaScript (`background.js`, `popup.js`, `scripts/*.js`) doivent être **identiques**
   - Les fichiers dans `assets/` peuvent différer légèrement (timestamps, ordre des minifications) mais contiennent le même code fonctionnel

### Vérifier les fichiers non minifiés

Les fichiers suivants sont du **JavaScript pur non minifié** :
- `extension/background.js`
- `extension/background-chrome.js`
- `extension/popup.js`
- `extension/scripts/content.js`
- `extension/scripts/sync.js`
- `extension/scripts/url_detector.js`

Ces fichiers sont **copiés tels quels** dans l'extension, sans transformation.

### Fichiers générés par Vite

Seuls les fichiers dans `extension/assets/` sont générés par Vite :
- `index-*.js` (application React bundlée)
- `index-*.css` (styles CSS bundlés)

**Sources** : `webapp/src/` (fichiers TypeScript/React lisibles)

---

## Versions des dépendances principales

Voir `webapp/package.json` pour la liste complète.

**Principales dépendances** :
- React : 18.2.0
- React Router : 6.20.1
- Vite : 5.0.8
- TypeScript : 5.2.2

**Build tools** :
- @vitejs/plugin-react : 4.2.1
- tailwindcss : 3.4.0

---

## Dépannage

### Erreur "command not found: npm"
- Node.js n'est pas installé ou pas dans le PATH
- Solution : Installer Node.js depuis https://nodejs.org/

### Erreur "Cannot find module"
- Les dépendances ne sont pas installées
- Solution : `cd webapp && npm install`

### Build échoue sur Windows
- PowerShell peut bloquer les scripts
- Solution : `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Différences dans les fichiers assets/
- Vite peut générer des hashes différents selon l'environnement
- Les fichiers sont fonctionnellement identiques
- Pour reproduire exactement : utilisez les mêmes versions Node.js et npm

---

## Support

Pour toute question :
- GitHub : https://github.com/fredb34670/AgregLLM
- Email : fbaranes@gmail.com

---

## Licence

Voir LICENSE dans le dépôt.
