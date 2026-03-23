# Specification: Fix White Page on App Opening

## Overview
L'application AgregLLM (webapp hébergée sur GitHub Pages) affiche une page blanche lorsqu'elle est ouverte via l'extension. L'erreur principale dans la console indique que le Service Worker (`sw.js`) échoue à intercepter et servir un module asset (`index-CK4z_FcM.js`), provoquant un échec du chargement du module principal de l'application.

## Functional Requirements
- L'application doit se charger correctement (sans page blanche) sur `https://fredb34670.github.io/AgregLLM/`.
- Le Service Worker ne doit pas bloquer le chargement des assets essentiels (JS/CSS).
- La redirection ou l'ouverture depuis l'extension doit aboutir à une interface fonctionnelle.

## Technical Analysis (Draft)
- Le `sw.js` intercepte les requêtes mais échoue sur les assets.
- Vérifier si les assets référencés dans `index.html` existent réellement dans le répertoire `dist/` (ou sur GitHub Pages).
- Vérifier la logique de mise en cache du Service Worker dans `sw.js` ou `service-worker-register.js`.
- Vérifier si le chemin des assets dans le `manifest.webmanifest` ou la configuration Vite est correct pour GitHub Pages (base path).

## Acceptance Criteria
- [ ] La webapp se charge complètement sur `https://fredb34670.github.io/AgregLLM/`.
- [ ] Aucune erreur fatale (rouge) dans la console concernant le Service Worker ou le chargement de modules.
- [ ] L'application est utilisable (accès aux conversations, paramètres).

## Out of Scope
- Ajout de nouvelles fonctionnalités.
- Refonte graphique de l'application.
- Résolution des problèmes spécifiques au portail développeur Firefox (sauf s'ils sont directement liés au code de l'extension).