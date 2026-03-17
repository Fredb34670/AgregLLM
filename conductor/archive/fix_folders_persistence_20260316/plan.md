# Plan d'Implémentation : Persistance des Dossiers et Environnement Local

## Phase 1 : Configuration de l'Environnement Local
L'objectif est de s'assurer que l'application ne tente pas de se synchroniser avec des services externes durant les tests locaux.

- [x] Task: Désactiver la synchronisation Google Drive dans `webapp/src/lib/storage.ts`.
- [x] Task: Vérifier que `manifest.json` inclut bien `http://localhost/*` pour l'injection de `sync.js`.
- [x] Task: Conductor - User Manual Verification 'Configuration de l'Environnement Local' (Protocol in workflow.md) [8d104ae]

## Phase 2 : Correction du Bug de Persistance (TDD)
L'objectif est de corriger la perte du `folderId` et du statut `isFavorite` lors de la synchronisation entre l'extension et la Webapp.

- [x] Task: Écrire un test échouant dans `extension/scripts/sync.test.js` simulant une mise à jour de conversation écrasant le dossier et le statut favori.
- [x] Task: Modifier `extension/scripts/sync.js` pour préserver `folderId` et `isFavorite` (et autres métadonnées pertinentes) lors de la fusion des données.
- [x] Task: Vérifier que les tests de synchronisation passent avec succès.
- [x] Task: Conductor - User Manual Verification 'Correction du Bug de Persistance (TDD)' (Protocol in workflow.md) [9e2bd6b]

## Phase 3 : Validation Finale et Nettoyage
L'objectif est de confirmer la résolution du bug dans l'environnement de développement réel.

- [x] Task: Vérification manuelle de la persistance des dossiers sur `localhost:5173`.
- [x] Task: Nettoyage des logs de débogage éventuels.
- [x] Task: Conductor - User Manual Verification 'Validation Finale et Nettoyage' (Protocol in workflow.md)
