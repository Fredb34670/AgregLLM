# Plan: Fix White Page on App Opening

## Phase 1: Investigation & Diagnostic (WebApp & SW) [checkpoint: c74f453]
- [x] Task: Analyser le contenu de `webapp/sw.js` (en particulier la ligne 17) pour comprendre l'échec d'interception. [checkpoint: c74f453]
- [x] Task: Vérifier `webapp/vite.config.ts` pour s'assurer que le `base` path est correctement configuré pour GitHub Pages (`/AgregLLM/`). [checkpoint: c74f453]
- [x] Task: Vérifier `webapp/src/service-worker-register.js` pour voir comment le SW est enregistré. [checkpoint: c74f453]
- [x] Task: Inspecter `webapp/index.html` pour confirmer le chemin d'importation des assets. [checkpoint: c74f453]
- [x] Task: Vérifier le contenu du dossier `docs/` (le dossier de déploiement GitHub Pages selon l'arborescence du projet) et comparer avec les erreurs de la console (asset `index-CK4z_FcM.js`). [checkpoint: c74f453]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Investigation & Diagnostic (WebApp & SW)' (Protocol in workflow.md)

## Phase 2: Correction & Tests [checkpoint: c74f453]
- [x] Task: Corriger la logique de cache ou de routage dans `sw.js` si nécessaire. [checkpoint: c74f453]
- [x] Task: Mettre à jour la configuration de build (Vite/manifest) si des chemins sont erronés. [checkpoint: c74f453]
- [x] Task: Tester en local (build + serveur statique) pour reproduire le comportement du SW. [checkpoint: c74f453]
- [x] Task: Vérifier que l'application se charge sans erreur console sur `localhost`. [checkpoint: c74f453]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Correction & Tests' (Protocol in workflow.md)

## Phase 3: Déploiement & Validation Extension [checkpoint: c74f453]
- [x] Task: Reconstruire l'application (`npm run build` dans `webapp`) et mettre à jour le dossier `docs/`. [checkpoint: c74f453]
- [x] Task: Vérifier le lien entre l'extension et la webapp (scripts de redirection). [checkpoint: c74f453]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Déploiement & Validation Extension' (Protocol in workflow.md)