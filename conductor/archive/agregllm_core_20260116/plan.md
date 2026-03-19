# Plan d'Implémentation - Track "Construire le cœur d'AgregLLM"

Cette track vise à implémenter le Produit Minimum Viable (MVP) d'AgregLLM, comprenant l'extension de navigateur pour ChatGPT et l'application web de base pour la liste et la visualisation des conversations.

## Phase 1 : Extension de Navigateur pour ChatGPT [checkpoint: 0d77f81]

- [x] Task: Initialiser le projet d'extension (Manifest V3) [910f93e]
    - [x] Écrire les tests pour la structure de base du Manifest V3.
    - [x] Implémenter la structure de base du Manifest V3 (manifest.json, background.js).
- [x] Task: Détection et capture des URL de conversations ChatGPT [695a0ce]
    - [x] Écrire les tests pour la détection d'URL de conversations ChatGPT.
    - [x] Implémenter le script de détection d'URL.
- [x] Task: Interface utilisateur de confirmation et de capture [2549ac3]
    - [x] Écrire les tests pour l'affichage du bouton de confirmation.
    - [x] Implémenter l'injection du bouton de confirmation sur les pages ChatGPT.
    - [x] Écrire les tests pour la capture des données de la conversation (titre, date, etc.).
    - [x] Implémenter la logique de capture des données au clic sur le bouton.
    - [x] Simplifier la capture : Ne plus capturer le contenu des messages, uniquement les métadonnées (Titre, URL, Date, LLM) et un résumé sommaire. (Mise à jour suite aux nouvelles directives de confidentialité).
- [x] Task: Communication de l'extension vers l'application web [5399d6e]
    - [x] Écrire les tests pour l'envoi sécurisé des données capturées à l'application web.
    - [x] Implémenter le mécanisme de communication (e.g., `chrome.runtime.sendMessage`).
- [x] Task: Conductor - User Manual Verification 'Extension de Navigateur pour ChatGPT' (Protocol in workflow.md) [0d77f81]

## Phase 2 : Application Web AgregLLM (Frontend de base) [checkpoint: d751d8a]

- [x] Task: Initialiser l'application web React avec TypeScript et Shadcn UI [968600a]
    - [x] Implémenter la configuration de base du projet React avec Shadcn UI.
- [x] Task: Routage et structure de page principale [a6f024c]
    - [x] Écrire les tests pour le routage de base (page d'accueil, liste des conversations).
    - [x] Implémenter le routage et la mise en page de base avec Shadcn UI.
- [x] Task: Stockage local des données (IndexedDB ou localStorage) [a6f024c]
    - [x] Écrire les tests pour l'ajout, la récupération et la suppression de conversations localement.
    - [x] Implémenter la logique de stockage local pour les conversations.
- [x] Task: Affichage de la liste des conversations [a6f024c]
    - [x] Écrire les tests pour l'affichage correct des conversations dans une liste paginée.
    - [x] Implémenter le composant de liste des conversations.
- [x] Task: Visualisation d'une conversation (détail) [a6f024c]
    - [x] Écrire les tests pour l'affichage des détails d'une conversation (lien, titre, LLM, date).
    - [x] Implémenter la vue de détail d'une conversation.
- [x] Task: Recherche plein texte [a6f024c]
    - [x] Écrire les tests pour la fonctionnalité de recherche plein texte sur les titres et descriptions.
    - [x] Implémenter le champ de recherche et la logique de filtrage.
- [x] Task: Tri par date et par titre [a6f024c]
    - [x] Écrire les tests pour le tri des conversations.
    - [x] Implémenter les options de tri par date et par titre.
- [x] Task: Conductor - User Manual Verification 'Application Web AgregLLM (Frontend de base)' (Protocol in workflow.md) [d751d8a]

## Phase 3 : Synchronisation Extension & Webapp [checkpoint: 988840c]

- [x] Task: Mécanisme de synchronisation via injection de script [a6f024c]
    - [x] Implémenter le script de synchronisation `sync.js`.
    - [x] Configurer le `manifest.json` pour autoriser l'injection sur la webapp.
- [x] Task: Notification temps réel [a6f024c]
    - [x] Implémenter la notification des onglets webapp depuis le background script.
    - [x] Mettre à jour la webapp pour réagir aux événements de synchronisation.
- [x] Task: Conductor - User Manual Verification 'Synchronisation Extension & Webapp' (Protocol in workflow.md) [988840c]