# Plan d'implémentation : Aide à la reconnexion (Account-linked Access)

## Phase 1 : Extension - Capture de l'e-mail du compte
**Objectif** : Identifier et sauvegarder l'e-mail du compte LLM lors de la capture d'une discussion.

- [x] Task: Étudier et implémenter la détection de l'e-mail utilisateur sur les pages ChatGPT (via DOM ou sélecteurs).
- [~] Task: Mettre à jour le script de contenu (`content.js`) pour inclure le champ `accountEmail` dans l'objet de discussion capturé.
- [x] Task: Adapter les tests de l'extension pour vérifier la capture du champ `accountEmail`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 : Webapp - Persistance et Synchronisation Cloud
**Objectif** : Assurer que l'e-mail capturé est stocké en local et synchronisé sur Google Drive.

- [ ] Task: Mettre à jour les types TypeScript (`Conversation`) dans la Webapp pour inclure `accountEmail`.
- [ ] Task: Adapter la logique de synchronisation dans `sync.js` (extension) et `google-drive.ts` (webapp) pour gérer ce nouveau champ.
- [ ] Task: Vérifier la persistance dans `localStorage` et la bonne remontée vers Google Drive via les outils de développement.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 : Extension - Détection d'Erreur et Affichage de la Modale
**Objectif** : Détecter l'échec d'accès et proposer la reconnexion au bon compte.

- [ ] Task: Implémenter la détection des pages d'erreur "404" ou "Lien non trouvé" dans le script de contenu de l'extension.
- [ ] Task: Créer le composant UI de la modale d'aide (HTML/CSS injecté).
- [ ] Task: Connecter la logique : si erreur détectée ET `accountEmail` connu pour cette URL -> Afficher la modale.
- [ ] Task: Écrire des tests d'intégration simulant une erreur de page pour valider l'apparition de la modale.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
