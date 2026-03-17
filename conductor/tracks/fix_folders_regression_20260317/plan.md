# Plan d'Implémentation : Correction de la Régression de Persistance des Dossiers

## Phase 1 : Mise à jour de `background.js` (Extension)
L'objectif est d'arrêter l'écrasement aveugle du `localStorage` de la Webapp depuis l'arrière-plan de l'extension.

- [ ] Task: Retirer le bloc d'injection `localStorage.setItem` dans `background.js`.
- [ ] Task: À la place, envoyer un message `{ action: "sync" }` à tous les onglets Webapp ouverts après une sauvegarde réussie.
- [ ] Task: Conductor - User Manual Verification 'Mise à jour de background.js' (Protocol in workflow.md)

## Phase 2 : Amélioration de `sync.js` (Extension/Scripts)
L'objectif est de s'assurer que `sync.js` traite correctement les nouveaux messages de synchronisation et fusionne les données sans perte.

- [ ] Task: Écrire un test échouant dans `extension/scripts/sync.test.js` simulant un message de synchronisation qui écraserait par erreur un dossier existant (pour vérifier le comportement de fusion).
- [ ] Task: Modifier `extension/scripts/sync.js` pour traiter plus agressivement les mises à jour de contenu (messages, résumé) tout en préservant systématiquement `folderId`, `isFavorite` et `tags` manuels.
- [ ] Task: S'assurer que `sync.js` répond correctement à `browser.runtime.onMessage` pour l'action `sync`.
- [ ] Task: Conductor - User Manual Verification 'Amélioration de sync.js' (Protocol in workflow.md)

## Phase 3 : Validation Finale
L'objectif est de confirmer la résolution du bug de régression dans l'environnement local.

- [ ] Task: Vérification manuelle : Classer un lien, capturer une mise à jour via l'extension, vérifier que le lien reste dans le dossier sur `localhost:5173`.
- [ ] Task: Nettoyage et commit final.
- [ ] Task: Conductor - User Manual Verification 'Validation Finale' (Protocol in workflow.md)
