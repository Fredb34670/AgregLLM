# Guide de Déploiement AgregLLM

## 📝 Étape 1 : Configuration Git (si pas déjà fait)

```bash
git config --global user.email "votre.email@example.com"
git config --global user.name "BARANES Frédéric"
```

## 📦 Étape 2 : Commit des fichiers

Les fichiers sont déjà ajoutés avec `git add`. Il suffit de commit :

```bash
git commit -m "Add production builds and GitHub Pages deployment

- Added Firefox extension (.xpi ready)
- Added Chrome extension (Manifest V3 compatible)
- Built webapp for GitHub Pages in docs/
- Added automated build scripts
- Fixed extension synchronization
- Fixed basename routing for GitHub Pages"
```

## 🚀 Étape 3 : Push vers GitHub

```bash
git push
```

Si c'est la première fois, vous devrez peut-être configurer l'upstream :

```bash
git push --set-upstream origin main
```

## 🌐 Étape 4 : Activer GitHub Pages

1. **Allez sur GitHub.com** → Votre dépôt **AgregLLM**
2. **Settings** → **Pages** (dans le menu de gauche)
3. **Source** : Deploy from a branch
4. **Branch** : Sélectionnez `main` puis `/docs`
5. **Save**

⏱️ Attendez 1-2 minutes que le déploiement se termine.

## ✅ Étape 5 : Vérifier le déploiement

Votre application sera accessible à :
```
https://fredb34670.github.io/AgregLLM/
```

## 🔧 Étape 6 (Optionnel) : Mettre à jour l'extension

Si vous voulez que l'extension pointe vers GitHub Pages au lieu de localhost :

1. Ouvrez `extension/popup.js`
2. Ligne ~145, changez :
   ```javascript
   const webappUrl = "http://localhost:5173";
   ```
   en :
   ```javascript
   const webappUrl = "https://fredb34670.github.io/AgregLLM/";
   ```
3. Rebuild : `.\build-extension.ps1`
4. Rechargez l'extension dans le navigateur

## 📋 Résumé des commandes

```bash
# 1. Configurer Git (une seule fois)
git config --global user.email "votre.email@example.com"
git config --global user.name "BARANES Frédéric"

# 2. Commit (les fichiers sont déjà ajoutés)
git commit -m "Add production builds and GitHub Pages deployment"

# 3. Push
git push

# 4. Aller sur GitHub → Settings → Pages → Branch: main → /docs
```

## 🎉 C'est tout !

Votre application sera en ligne quelques minutes après le push.
