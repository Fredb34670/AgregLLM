# Implementation Plan: Automatic Synchronization and Tooltip

## Phase 1: Automation Logic
L'objectif est de rendre la synchronisation bidirectionnelle automatique.

- [x] Task: Réactiver l'appel à `gdrive.autoSync` dans `webapp/src/lib/storage.ts` et s'assurer qu'il est appelé après chaque action de modification. [d89df9b]
- [x] Task: Modifier `webapp/src/App.tsx` ou un hook global pour déclencher un chargement automatique (`autoLoad`) immédiatement après une authentification réussie. [d89df9b]
- [x] Task: Ajouter des tests unitaires pour vérifier que `triggerAutoSync` appelle bien le service Google Drive. [d89df9b]
- [x] Task: Conductor - User Manual Verification 'Automation Logic' (Protocol in workflow.md) [d89df9b]

## Phase 2: UI Enhancements (Tooltip)
L'objectif est d'améliorer l'UX avec une info-bulle sur le bouton de synchronisation.

- [ ] Task: Installer et configurer le composant `Tooltip` de Shadcn UI si nécessaire.
- [ ] Task: Ajouter le `Tooltip` au bouton "Sync" dans `webapp/src/components/Settings.tsx` avec le message spécifié.
- [ ] Task: Ajouter des tests unitaires pour vérifier la présence du Tooltip.
- [ ] Task: Conductor - User Manual Verification 'UI Enhancements (Tooltip)' (Protocol in workflow.md)
