# Plan d'Implémentation : Persistance des Dossiers et Environnement Local

## Phase 1 : Configuration de l'Environnement Local
L'objectif est de s'assurer que l'application ne tente pas de se synchroniser avec des services externes durant les tests locaux.

- [ ] Task: Désactiver la synchronisation Google Drive dans `webapp/src/lib/storage.ts`.
- [ ] Task: Vérifier que `manifest.json` inclut bien `http://localhost/*` pour l'injection de `sync.js`.
- [ ] Task: Conductor - User Manual Verification 'Configuration de l'Environnement Local' (Protocol in workflow.md)

## Phase 2 : Correction du Bug de Persistance (TDD)
L'objectif est de corriger la perte du `folderId` et du statut `isFavorite` lors de la synchronisation entre l'extension et la Webapp.

- [ ] Task: Écrire un test échouant dans `extension/scripts/sync.test.js` simulant une mise à jour de conversation écrasant le dossier et le statut favori.
- [ ] Task: Modifier `extension/scripts/sync.js` pour préserver `folderId` et `isFavorite` (et autres métadonnées pertinentes) lors de la fusion des données.
- [ ] Task: Vérifier que les tests de synchronisation passent avec succès.
- [ ] Task: Conductor - User Manual Verification 'Correction du Bug de Persistance (TDD)' (Protocol in workflow.md)

## Phase 3 : Validation Finale et Nettoyage
L'objectif est de confirmer la résolution du bug dans l'environnement de développement réel.

- [ ] Task: Vérification manuelle de la persistance des dossiers sur `localhost:5173`.
- [ ] Task: Nettoyage des logs de débogage éventuels.
- [ ] Task: Conductor - User Manual Verification 'Validation Finale et Nettoyage' (Protocol in workflow.md)
