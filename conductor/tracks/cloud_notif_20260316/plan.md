# Implementation Plan: Cloud Connection Notification

## Phase 1: Authentication State Detection Logic
L'objectif est de s'assurer que l'application détecte correctement l'état de connexion cloud/Google de l'utilisateur.

- [ ] Task: Créer un hook ou utilitaire `useCloudStatus` pour vérifier l'état de synchronisation cloud via Supabase ou Google Drive.
- [ ] Task: Ajouter des tests unitaires pour `useCloudStatus` (états connectés et non connectés).
- [ ] Task: Conductor - User Manual Verification 'Authentication State Detection Logic' (Protocol in workflow.md)

## Phase 2: UI Component: Cloud Notification Banner
L'objectif est de créer le composant visuel de l'alerte informative.

- [ ] Task: Développer le composant `CloudNotificationBanner` avec le message synthétisé et le bouton de connexion.
- [ ] Task: Ajouter des tests unitaires pour `CloudNotificationBanner` (affichage correct, interaction avec le bouton).
- [ ] Task: Conductor - User Manual Verification 'UI Component: Cloud Notification Banner' (Protocol in workflow.md)

## Phase 3: Integration and Visibility Logic
L'objectif est d'intégrer le bandeau dans la liste principale des conversations.

- [ ] Task: Insérer `CloudNotificationBanner` dans `ConversationsList.tsx` au-dessus des filtres.
- [ ] Task: Ajouter des tests d'intégration pour vérifier l'apparition/disparition du bandeau selon l'état de connexion.
- [ ] Task: Conductor - User Manual Verification 'Integration and Visibility Logic' (Protocol in workflow.md)
