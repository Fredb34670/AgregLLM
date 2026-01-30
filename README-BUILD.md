# AgregLLM - Guide de Build et Déploiement

## 🚀 Quick Start

### Développement Local

**1. Lancer l'application webapp :**
```bash
cd webapp
npm install
npm run dev
```
➜ Ouvre `http://localhost:5173`

**2. Charger l'extension Firefox :**
- Ouvrez `about:debugging#/runtime/this-firefox`
- Cliquez sur "Load Temporary Add-on"
- Sélectionnez `extension/manifest.json`

**3. Charger l'extension Chrome :**
- Ouvrez `chrome://extensions`
- Activez "Mode développeur"
- Cliquez sur "Charger l'extension non empaquetée"
- Sélectionnez le dossier `extension/`

---

## 📦 Build de Production

### Option 1 : Build Automatique (Recommandé)

**Build complet (Webapp + Extensions) :**
```powershell
.\build-all.ps1
```

**Build uniquement les extensions :**
```powershell
.\build-extension.ps1
```

### Option 2 : Build Manuel

**Webapp (local) :**
```bash
cd webapp
npm run build
```
➜ Résultat dans `webapp/dist/`

**Webapp (GitHub Pages) :**
```bash
cd webapp
npm run build:github
```
➜ Résultat dans `webapp/dist/` avec basename `/AgregLLM`

**Extension Firefox (.xpi) :**
1. Créer un dossier avec les fichiers nécessaires
2. Compresser en .zip
3. Renommer en .xpi

**Extension Chrome (.zip) :**
1. Créer un dossier avec les fichiers nécessaires
2. Utiliser `manifest-chrome.json` et `background-chrome.js`
3. Compresser en .zip

---

## 🌐 Déploiement GitHub Pages

### Configuration Requise

**1. Activer GitHub Pages :**
- Allez dans Settings → Pages
- Source : Deploy from a branch
- Branch : `main` → `/docs`
- Save

**2. Push le build :**
```bash
# Build pour GitHub Pages
cd webapp
npm run build:github

# Copier dans docs/
cd ..
rm -rf docs
cp -r webapp/dist docs

# Commit et push
git add docs/
git commit -m "Deploy webapp to GitHub Pages"
git push
```

**3. URL de l'application :**
```
https://fredb34670.github.io/AgregLLM/
```

### Mise à jour de l'extension pour pointer vers GitHub Pages

Dans `extension/popup.js` et `extension/background.js`, remplacez :
```javascript
const webappUrl = "http://localhost:5173";
```
par :
```javascript
const webappUrl = "https://fredb34670.github.io/AgregLLM/";
```

---

## 🔧 Configuration Firefox pour Extensions Non Signées

**Firefox Developer Edition / Nightly :**
1. Ouvrez `about:config`
2. Paramètres à modifier :
   - `xpinstall.signatures.required` → `false`
   - `extensions.langpacks.signatures.required` → `false`
   - `extensions.experiments.enabled` → `true`

---

## 📂 Structure des Builds

```
dist-extensions/
├── firefox/                    # Extension Firefox (dossier)
├── chrome/                     # Extension Chrome (dossier)
├── agregllm-firefox.xpi       # Package Firefox (installable)
└── agregllm-chrome.zip        # Package Chrome (à décompresser)

webapp/dist/                    # Build local de la webapp
docs/                          # Build GitHub Pages de la webapp
```

---

## 🐛 Dépannage

### L'extension est grisée dans Firefox
- Vérifiez que `xpinstall.signatures.required` est à `false`
- Rechargez Firefox complètement

### La webapp affiche une page blanche sur GitHub Pages
- Vérifiez que le build utilise `npm run build:github`
- Vérifiez que le basename est bien configuré dans `main.tsx`

### Les conversations ne se synchronisent pas
- Vérifiez que la webapp est ouverte sur `http://localhost:5173` ou GitHub Pages
- Ouvrez la console (F12) et cherchez les erreurs

### Chrome : Service Worker ne démarre pas
- Utilisez `background-chrome.js` au lieu de `background.js`
- Vérifiez que le manifest est bien `manifest-chrome.json`

---

## 📝 Notes Importantes

- **Firefox** : Utilise Manifest V2 avec `browser.tabs.executeScript`
- **Chrome** : Utilise Manifest V3 avec `chrome.scripting.executeScript`
- **Webapp** : Le basename s'adapte automatiquement (localhost vs GitHub Pages)
- **Synchronisation** : Les extensions injectent les données dans le localStorage de la webapp

---

## 🎯 Prochaines Étapes

- [ ] Publier l'extension sur Firefox Add-ons
- [ ] Publier l'extension sur Chrome Web Store
- [ ] Configurer un workflow GitHub Actions pour build automatique
- [ ] Ajouter des tests E2E
