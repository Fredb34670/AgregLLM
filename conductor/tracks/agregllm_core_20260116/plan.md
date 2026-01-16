# Plan d'Implémentation - Track "Construire le cœur d'AgregLLM"

Cette track vise à implémenter le Produit Minimum Viable (MVP) d'AgregLLM, comprenant l'extension de navigateur pour ChatGPT et l'application web de base pour la liste et la visualisation des conversations.

## Phase 1 : Extension de Navigateur pour ChatGPT

- [x] Task: Initialiser le projet d'extension (Manifest V3) [910f93e]
    - [ ] Écrire les tests pour la structure de base du Manifest V3.
    - [ ] Implémenter la structure de base du Manifest V3 (manifest.json, background.js).
- [x] Task: Détection et capture des URL de conversations ChatGPT [695a0ce]
    - [ ] Écrire les tests pour la détection d'URL de conversations ChatGPT.
    - [ ] Implémenter le script de détection d'URL.
- [x] Task: Interface utilisateur de confirmation et de capture [2549ac3]
    - [ ] Écrire les tests pour l'affichage du bouton de confirmation.
    - [ ] Implémenter l'injection du bouton de confirmation sur les pages ChatGPT.
    - [ ] Écrire les tests pour la capture des données de la conversation (titre, date, etc.).
    - [ ] Implémenter la logique de capture des données au clic sur le bouton.
- [x] Task: Communication de l'extension vers l'application web [5399d6e]
    - [ ] Écrire les tests pour l'envoi sécurisé des données capturées à l'application web.
    - [ ] Implémenter le mécanisme de communication (e.g., `chrome.runtime.sendMessage`).
- [ ] Task: Conductor - User Manual Verification 'Extension de Navigateur pour ChatGPT' (Protocol in workflow.md)

## Phase 2 : Application Web AgregLLM (Frontend de base)

- [ ] Task: Initialiser l'application web React avec TypeScript et Shadcn UI
    - [ ] Écrire les tests pour l'initialisation du projet React/TypeScript.
    - [ ] Implémenter la configuration de base du projet React avec Shadcn UI.
- [ ] Task: Routage et structure de page principale
    - [ ] Écrire les tests pour le routage de base (page d'accueil, liste des conversations).
    - [ ] Implémenter le routage et la mise en page de base avec Shadcn UI.
- [ ] Task: Stockage local des données (IndexedDB ou localStorage)
    - [ ] Écrire les tests pour l'ajout, la récupération et la suppression de conversations localement.
    - [ ] Implémenter la logique de stockage local pour les conversations.
- [ ] Task: Affichage de la liste des conversations
    - [ ] Écrire les tests pour l'affichage correct des conversations dans une liste paginée.
    - [ ] Implémenter le composant de liste des conversations avec pagination.
- [ ] Task: Visualisation d'une conversation (détail)
    - [ ] Écrire les tests pour l'affichage des détails d'une conversation (lien, titre, LLM, date).
    - [ ] Implémenter la vue de détail d'une conversation.
- [ ] Task: Recherche plein texte
    - [ ] Écrire les tests pour la fonctionnalité de recherche plein texte sur les titres et descriptions.
    - [ ] Implémenter le champ de recherche et la logique de filtrage.
- [ ] Task: Tri par date et par titre
    - [ ] Écrire les tests pour le tri des conversations.
    - [ ] Implémenter les options de tri par date et par titre.
- [ ] Task: Conductor - User Manual Verification 'Application Web AgregLLM (Frontend de base)' (Protocol in workflow.md)
